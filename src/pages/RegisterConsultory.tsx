import { useState, type ChangeEvent } from "react";
import { motion } from "motion/react";
import { Building2, CheckCircle2 } from "lucide-react";
import Container from "../components/ui/Container";
import { fadeInUp, viewportConfig } from "../hooks/useScrollReveal";
import { createConsultory } from "../lib/api/consultories";
import { useAuth } from "../context/AuthContext";
import { uploadConsultoryImages } from "../lib/storage/media";

const equipmentOptions = [
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

export default function RegisterConsultory() {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    neighborhood: "",
    city: "",
    state: "",
    equipment: [] as string[],
    description: "",
    price: "",
    periodMorning: false,
    periodAfternoon: false,
    periodEvening: false,
  });

  const handleEquipmentToggle = (eq: string) => {
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(eq)
        ? prev.equipment.filter((e) => e !== eq)
        : [...prev.equipment, eq],
    }));
  };

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    setImageFiles(selectedFiles.slice(0, MAX_CONSULTORY_IMAGES));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentUser?.id) {
      setError("Você precisa estar autenticado para cadastrar um consultório.");
      return;
    }

    if (!form.periodMorning && !form.periodAfternoon && !form.periodEvening) {
      setError("Selecione pelo menos um período disponível.");
      return;
    }

    const price = Number(form.price);
    if (Number.isNaN(price) || price <= 0) {
      setError("Informe um valor válido para o preço por período.");
      return;
    }

    setIsSubmitting(true);

    try {
      const imageKeys =
        imageFiles.length > 0 ? await uploadConsultoryImages(currentUser.id, imageFiles) : [];

      await createConsultory({
        name: form.name,
        description: form.description,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
        address: form.address,
        equipment: form.equipment,
        pricePerPeriod: price,
        whatsappNumber: form.phone,
        ownerId: currentUser.id,
        periodMorning: form.periodMorning,
        periodAfternoon: form.periodAfternoon,
        periodEvening: form.periodEvening,
        imageKeys,
      });

      setIsSuccess(true);
      setForm({
        name: "",
        phone: "",
        address: "",
        neighborhood: "",
        city: "",
        state: "",
        equipment: [],
        description: "",
        price: "",
        periodMorning: false,
        periodAfternoon: false,
        periodEvening: false,
      });
      setImageFiles([]);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Não foi possível cadastrar o consultório.";
      setError(message);
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-sm";

  return (
    <section className="pt-28 pb-20 lg:pt-36 lg:pb-30 bg-neutral-50">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="text-primary-500" size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Cadastre seu consultório
            </h1>
            <p className="text-lg text-neutral-500">
              Preencha os dados para criar seu consultório diretamente na plataforma.
            </p>
          </div>

          <motion.form
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,102,204,0.08)] space-y-6"
          >
            {isSuccess && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle2 size={16} />
                Consultório cadastrado com sucesso.
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-neutral-700 mb-1">
                  Nome do consultório
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                  placeholder="Consultório Jardim Central"
                />
              </div>
              <div>
                <label htmlFor="reg-phone" className="block text-sm font-medium text-neutral-700 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                  placeholder="(12) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-address" className="block text-sm font-medium text-neutral-700 mb-1">
                Endereço
              </label>
              <input
                id="reg-address"
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className={inputClass}
                placeholder="Rua, número, complemento"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="reg-neighborhood" className="block text-sm font-medium text-neutral-700 mb-1">
                  Bairro
                </label>
                <input
                  id="reg-neighborhood"
                  type="text"
                  required
                  value={form.neighborhood}
                  onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="reg-city" className="block text-sm font-medium text-neutral-700 mb-1">
                  Cidade
                </label>
                <input
                  id="reg-city"
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="reg-state" className="block text-sm font-medium text-neutral-700 mb-1">
                  Estado
                </label>
                <input
                  id="reg-state"
                  type="text"
                  required
                  maxLength={2}
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                  className={inputClass}
                  placeholder="SP"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Equipamentos disponíveis
              </label>
              <div className="flex flex-wrap gap-2">
                {equipmentOptions.map((eq) => (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => handleEquipmentToggle(eq)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                      form.equipment.includes(eq)
                        ? "bg-primary-500 text-white border-primary-500"
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-primary-300"
                    }`}
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="reg-description" className="block text-sm font-medium text-neutral-700 mb-1">
                Descrição
              </label>
              <textarea
                id="reg-description"
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${inputClass} resize-none`}
                rows={3}
                placeholder="Descreva diferenciais e estrutura do consultório"
              />
            </div>

            <div>
              <label htmlFor="reg-images" className="block text-sm font-medium text-neutral-700 mb-1">
                Fotos do consultório (opcional)
              </label>
              <input
                id="reg-images"
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
              <label htmlFor="reg-price" className="block text-sm font-medium text-neutral-700 mb-1">
                Valor por período (R$)
              </label>
              <input
                id="reg-price"
                type="number"
                min="1"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={inputClass}
                placeholder="250"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-500 text-white rounded-xl py-4 font-display font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Cadastrando..." : "Cadastrar consultório"}
            </button>
          </motion.form>
        </motion.div>
      </Container>
    </section>
  );
}
