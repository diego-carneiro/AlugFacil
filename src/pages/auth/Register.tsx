import { useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Stethoscope, Building2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../types/user";
import { createConsultory } from "../../lib/api/consultories";
import { uploadConsultoryImages } from "../../lib/storage/media";

type Step = 1 | 2 | 3;

interface FormData {
  role: UserRole | null;
  name: string;
  email: string;
  phone: string;
  password: string;
  cro: string;
  specialty: string;
  cnpj: string;
  consultoryName: string;
  consultoryPhone: string;
  consultoryAddress: string;
  consultoryNeighborhood: string;
  consultoryCity: string;
  consultoryState: string;
  consultoryZipCode: string;
  consultoryEquipment: string[];
  consultoryDescription: string;
  consultoryPrice: string;
  periodMorning: boolean;
  periodAfternoon: boolean;
  periodEvening: boolean;
}

const SPECIALTIES = [
  "Clínica Geral",
  "Ortodontia",
  "Implantodontia",
  "Endodontia",
  "Periodontia",
  "Cirurgia Bucomaxilofacial",
  "Odontopediatria",
  "Prótese Dentária",
];

const EQUIPMENT_OPTIONS = [
  "Equipo completo",
  "Compressor",
  "Bomba a vácuo",
  "Autoclave",
  "Raio-x",
  "Ultrassom",
  "Fotopolimerizador",
  "Ar-condicionado",
  "Wi-Fi",
  "Sala de espera",
  "Estacionamento",
  "Recepção equipada",
];

const MAX_CONSULTORY_IMAGES = 8;

const STEP_LABELS: Record<Step, string> = {
  1: "Tipo de conta",
  2: "Dados pessoais",
  3: "Dados finais",
};

function isPasswordValid(password: string): boolean {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export default function Register() {
  const { currentUser, register, login, logout } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [form, setForm] = useState<FormData>({
    role: null,
    name: "",
    email: "",
    phone: "",
    password: "",
    cro: "",
    specialty: "",
    cnpj: "",
    consultoryName: "",
    consultoryPhone: "",
    consultoryAddress: "",
    consultoryNeighborhood: "",
    consultoryCity: "",
    consultoryState: "",
    consultoryZipCode: "",
    consultoryEquipment: [],
    consultoryDescription: "",
    consultoryPrice: "",
    periodMorning: false,
    periodAfternoon: false,
    periodEvening: false,
  });

  const set = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleEquipmentToggle = (equipment: string) => {
    setForm((prev) => ({
      ...prev,
      consultoryEquipment: prev.consultoryEquipment.includes(equipment)
        ? prev.consultoryEquipment.filter((item) => item !== equipment)
        : [...prev.consultoryEquipment, equipment],
    }));
  };

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    setImageFiles(selectedFiles.slice(0, MAX_CONSULTORY_IMAGES));
  };

  const canProceed = () => {
    if (step === 1) return form.role !== null;
    if (step === 2) return form.name && form.email && form.phone && isPasswordValid(form.password);

    if (form.role === "owner") {
      const consultoryPrice = Number(form.consultoryPrice);
      return Boolean(
        form.cnpj &&
          form.consultoryName &&
          form.consultoryPhone &&
          form.consultoryAddress &&
          form.consultoryNeighborhood &&
          form.consultoryCity &&
          form.consultoryState &&
          form.consultoryDescription &&
          (form.periodMorning || form.periodAfternoon || form.periodEvening) &&
          !Number.isNaN(consultoryPrice) &&
          consultoryPrice > 0
      );
    }

    return true;
  };

  const handleNext = async () => {
    setError("");

    if (step < 3) {
      setStep((s) => (s + 1) as Step);
      return;
    }

    if (!form.role || form.role === "admin" || isSubmitting) {
      return;
    }

    if (!isPasswordValid(form.password)) {
      setError("A senha deve ter no mínimo 8 caracteres, com pelo menos 1 letra minúscula, 1 número e 1 símbolo.");
      setStep(2);
      return;
    }

    const consultoryPrice = Number(form.consultoryPrice);
    if (
      form.role === "owner" &&
      (!form.periodMorning && !form.periodAfternoon && !form.periodEvening)
    ) {
      setError("Selecione pelo menos um período disponível para o consultório.");
      return;
    }

    if (form.role === "owner" && (Number.isNaN(consultoryPrice) || consultoryPrice <= 0)) {
      setError("Informe um valor válido para o preço por período.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        role: form.role,
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        taxId: form.cnpj,
        cro: form.cro,
        specialty: form.specialty,
        cnpj: form.cnpj,
      });

      if (form.role === "owner") {
        try {
          let user;
          try {
            user = await login({ email: form.email, password: form.password });
          } catch (loginError) {
            const lowerMessage =
              loginError instanceof Error ? loginError.message.toLowerCase() : "";
            const isAlreadySignedInError = lowerMessage.includes("already a signed in user");

            if (!isAlreadySignedInError) {
              throw loginError;
            }

            const isCurrentUserTheSameAccount =
              currentUser?.email?.toLowerCase() === form.email.trim().toLowerCase();
            if (isCurrentUserTheSameAccount && currentUser) {
              user = currentUser;
            } else {
              await logout();
              user = await login({ email: form.email, password: form.password });
            }
          }

          try {
            const imageKeys =
              imageFiles.length > 0 ? await uploadConsultoryImages(user.id, imageFiles) : [];

            await createConsultory({
              name: form.consultoryName,
              description: form.consultoryDescription,
              neighborhood: form.consultoryNeighborhood,
              city: form.consultoryCity,
              state: form.consultoryState,
              address: form.consultoryAddress,
              zipCode: form.consultoryZipCode || undefined,
              equipment: form.consultoryEquipment,
              pricePerPeriod: consultoryPrice,
              whatsappNumber: form.consultoryPhone,
              ownerId: user.id,
              periodMorning: form.periodMorning,
              periodAfternoon: form.periodAfternoon,
              periodEvening: form.periodEvening,
              imageKeys,
            });
          } finally {
            await logout();
          }
        } catch (ownerError) {
          const ownerMessage =
            ownerError instanceof Error ? ownerError.message : "Falha ao concluir o cadastro da sala.";
          setError(
            `Sua conta foi criada, mas não foi possível concluir o cadastro da sala agora. ${ownerMessage}`
          );
          return;
        }
      }

      try {
        await logout();
      } catch {
        // ignore when there is no active session
      }
      navigate("/entrar", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao foi possivel concluir o cadastro.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm";
  const compactInputClass =
    "w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm";

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-start p-6 pt-16 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <Link to="/" className="flex items-center gap-2 mb-8">
          <span className="text-2xl">🦷</span>
          <span className="font-display font-bold text-xl text-primary-500">AlugFácil</span>
        </Link>

        <div className="flex items-center gap-2 mb-10">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold shrink-0 transition-colors ${
                  s < step
                    ? "bg-primary-500 text-white"
                    : s === step
                    ? "bg-primary-500 text-white ring-4 ring-primary-100"
                    : "bg-neutral-200 text-neutral-400"
                }`}
              >
                {s < step ? <Check size={14} /> : s}
              </div>
              <div className="flex-1">
                <p className={`text-xs font-medium hidden sm:block ${s === step ? "text-primary-600" : "text-neutral-400"}`}>
                  {STEP_LABELS[s]}
                </p>
              </div>
              {s < 3 && (
                <div className={`h-0.5 flex-1 mx-1 rounded ${s < step ? "bg-primary-500" : "bg-neutral-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                  Como você quer usar a plataforma?
                </h2>
                <p className="text-neutral-500 text-sm mb-8">
                  Escolha o perfil que melhor descreve você.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      role: "tenant" as UserRole,
                      icon: <Stethoscope size={32} />,
                      title: "Dentista",
                      desc: "Quero alugar espaços para atender meus pacientes",
                    },
                    {
                      role: "owner" as UserRole,
                      icon: <Building2 size={32} />,
                      title: "Proprietário",
                      desc: "Tenho consultório e quero disponibilizar horários",
                    },
                  ].map((opt) => (
                    <motion.button
                      key={opt.role}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => set("role", opt.role)}
                      className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-colors text-center ${
                        form.role === opt.role
                          ? "border-primary-500 bg-primary-50"
                          : "border-neutral-200 hover:border-primary-300"
                      }`}
                    >
                      <span className={form.role === opt.role ? "text-primary-500" : "text-neutral-400"}>
                        {opt.icon}
                      </span>
                      <div>
                        <p className="font-display font-bold text-neutral-900">{opt.title}</p>
                        <p className="text-xs text-neutral-500 mt-1">{opt.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3 max-w-md mx-auto"
              >
                <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                  Seus dados pessoais
                </h2>
                <p className="text-neutral-500 text-sm mb-6">
                  Preencha as informações básicas da sua conta.
                </p>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className={compactInputClass}
                    placeholder="Dr(a). Seu Nome"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={compactInputClass}
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => {
                      const nextPhone = e.target.value;
                      set("phone", nextPhone);
                      if (!form.consultoryPhone) {
                        set("consultoryPhone", nextPhone);
                      }
                    }}
                    className={compactInputClass}
                    placeholder="(12) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      className={`${compactInputClass} pr-11`}
                      placeholder="Mínimo 8 caracteres, com minúscula, número e símbolo"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                  {form.role === "tenant" ? "Dados profissionais" : "Dados do consultório"}
                </h2>
                <p className="text-neutral-500 text-sm mb-6">
                  {form.role === "tenant"
                    ? "Informe seu CRO para validarmos seu cadastro."
                    : "Preencha os dados iniciais do consultório para publicar sua primeira sala."}
                </p>

                {form.role === "tenant" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        CRO
                      </label>
                      <input
                        type="text"
                        value={form.cro}
                        onChange={(e) => set("cro", e.target.value)}
                        className={inputClass}
                        placeholder="CRO-SP 00000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Especialidade principal
                      </label>
                      <select
                        value={form.specialty}
                        onChange={(e) => set("specialty", e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Selecione...</option>
                        {SPECIALTIES.map((specialty) => (
                          <option key={specialty} value={specialty}>
                            {specialty}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        CNPJ ou CPF
                      </label>
                      <input
                        type="text"
                        value={form.cnpj}
                        onChange={(e) => set("cnpj", e.target.value)}
                        className={inputClass}
                        placeholder="00.000.000/0001-00"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Nome do consultório
                        </label>
                        <input
                          type="text"
                          required
                          value={form.consultoryName}
                          onChange={(e) => set("consultoryName", e.target.value)}
                          className={inputClass}
                          placeholder="Consultório Jardim Central"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Telefone / WhatsApp do consultório
                        </label>
                        <input
                          type="tel"
                          required
                          value={form.consultoryPhone}
                          onChange={(e) => set("consultoryPhone", e.target.value)}
                          className={inputClass}
                          placeholder="(12) 99999-9999"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Endereço
                      </label>
                      <input
                        type="text"
                        required
                        value={form.consultoryAddress}
                        onChange={(e) => set("consultoryAddress", e.target.value)}
                        className={inputClass}
                        placeholder="Rua, número, complemento"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Bairro
                        </label>
                        <input
                          type="text"
                          required
                          value={form.consultoryNeighborhood}
                          onChange={(e) => set("consultoryNeighborhood", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Cidade
                        </label>
                        <input
                          type="text"
                          required
                          value={form.consultoryCity}
                          onChange={(e) => set("consultoryCity", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Estado
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={2}
                          value={form.consultoryState}
                          onChange={(e) => set("consultoryState", e.target.value.toUpperCase())}
                          className={inputClass}
                          placeholder="SP"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        CEP (opcional)
                      </label>
                      <input
                        type="text"
                        value={form.consultoryZipCode}
                        onChange={(e) => set("consultoryZipCode", e.target.value)}
                        className={inputClass}
                        placeholder="12245-000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-3">
                        Equipamentos disponíveis
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {EQUIPMENT_OPTIONS.map((equipment) => (
                          <button
                            key={equipment}
                            type="button"
                            onClick={() => handleEquipmentToggle(equipment)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                              form.consultoryEquipment.includes(equipment)
                                ? "bg-primary-500 text-white border-primary-500"
                                : "bg-white text-neutral-600 border-neutral-200 hover:border-primary-300"
                            }`}
                          >
                            {equipment}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        required
                        value={form.consultoryDescription}
                        onChange={(e) => set("consultoryDescription", e.target.value)}
                        className={`${inputClass} resize-none`}
                        rows={3}
                        placeholder="Descreva diferenciais e estrutura do consultório"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Fotos do consultório (opcional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelection}
                        className={inputClass}
                      />
                      <p className="mt-1 text-xs text-neutral-500">
                        Até {MAX_CONSULTORY_IMAGES} imagens. Se não enviar, o sistema usa imagem padrão.
                      </p>
                      {imageFiles.length > 0 && (
                        <p className="mt-1 text-xs text-primary-600">{imageFiles.length} imagem(ns) selecionada(s).</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Períodos disponíveis</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <label className="flex items-center gap-2 text-sm text-neutral-600">
                          <input
                            type="checkbox"
                            checked={form.periodMorning}
                            onChange={(e) => setForm({ ...form, periodMorning: e.target.checked })}
                          />
                          Manhã
                        </label>
                        <label className="flex items-center gap-2 text-sm text-neutral-600">
                          <input
                            type="checkbox"
                            checked={form.periodAfternoon}
                            onChange={(e) => setForm({ ...form, periodAfternoon: e.target.checked })}
                          />
                          Tarde
                        </label>
                        <label className="flex items-center gap-2 text-sm text-neutral-600">
                          <input
                            type="checkbox"
                            checked={form.periodEvening}
                            onChange={(e) => setForm({ ...form, periodEvening: e.target.checked })}
                          />
                          Noite
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Valor por período (R$)
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        value={form.consultoryPrice}
                        onChange={(e) => set("consultoryPrice", e.target.value)}
                        className={inputClass}
                        placeholder="250"
                      />
                    </div>
                  </>
                )}

                <div className="bg-primary-50 rounded-xl p-4 text-sm text-primary-700 flex gap-3">
                  <Check size={16} className="shrink-0 mt-0.5 text-primary-500" />
                  <span>
                    Seus dados são protegidos e utilizados apenas para validação do cadastro.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                <ArrowLeft size={16} />
                Voltar
              </button>
            ) : (
              <Link
                to="/entrar"
                className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                Já tenho conta
              </Link>
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center gap-2 bg-primary-500 text-white rounded-xl px-6 py-3 text-sm font-display font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
            >
              {step === 3 ? (isSubmitting ? "Criando..." : "Criar conta") : "Continuar"}
              <ArrowRight size={16} />
            </motion.button>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-500">{error}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
