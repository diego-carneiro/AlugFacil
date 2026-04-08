import { useState } from "react";
import { motion } from "motion/react";
import { Send, Building2 } from "lucide-react";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import { buildWhatsAppLink, WHATSAPP_DEFAULT } from "../data/consultories";
import { fadeInUp, viewportConfig } from "../hooks/useScrollReveal";

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

export default function RegisterConsultory() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    neighborhood: "",
    equipment: [] as string[],
    availability: "",
    price: "",
    observations: "",
  });

  const handleEquipmentToggle = (eq: string) => {
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(eq)
        ? prev.equipment.filter((e) => e !== eq)
        : [...prev.equipment, eq],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Olá! Quero cadastrar meu consultório na AlugFácil.

*Dados do consultório:*
- Nome: ${form.name}
- Telefone: ${form.phone}
- Endereço: ${form.address}
- Bairro: ${form.neighborhood}
- Equipamentos: ${form.equipment.join(", ")}
- Disponibilidade: ${form.availability}
- Valor pretendido: R$ ${form.price}/período
- Observações: ${form.observations}`;

    window.open(buildWhatsAppLink(WHATSAPP_DEFAULT, message), "_blank");
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
              Preencha o formulário abaixo e envie via WhatsApp. Entraremos em
              contato para finalizar o cadastro.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-neutral-700 mb-1">
                  Seu nome
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label htmlFor="reg-phone" className="block text-sm font-medium text-neutral-700 mb-1">
                  Telefone
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
                Endereço do consultório
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

            <div>
              <label htmlFor="reg-neighborhood" className="block text-sm font-medium text-neutral-700 mb-1">
                Bairro
              </label>
              <input
                id="reg-neighborhood"
                type="text"
                required
                value={form.neighborhood}
                onChange={(e) =>
                  setForm({ ...form, neighborhood: e.target.value })
                }
                className={inputClass}
                placeholder="Ex: Jardim Aquarius"
              />
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
              <label htmlFor="reg-availability" className="block text-sm font-medium text-neutral-700 mb-1">
                Horários disponíveis
              </label>
              <textarea
                id="reg-availability"
                required
                value={form.availability}
                onChange={(e) =>
                  setForm({ ...form, availability: e.target.value })
                }
                className={`${inputClass} resize-none`}
                rows={3}
                placeholder="Ex: Segunda a sexta, manhãs (8h-12h)"
              />
            </div>

            <div>
              <label htmlFor="reg-price" className="block text-sm font-medium text-neutral-700 mb-1">
                Valor pretendido (R$ / período)
              </label>
              <input
                id="reg-price"
                type="text"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={inputClass}
                placeholder="Ex: 250"
              />
            </div>

            <div>
              <label htmlFor="reg-obs" className="block text-sm font-medium text-neutral-700 mb-1">
                Observações adicionais
              </label>
              <textarea
                id="reg-obs"
                value={form.observations}
                onChange={(e) =>
                  setForm({ ...form, observations: e.target.value })
                }
                className={`${inputClass} resize-none`}
                rows={3}
                placeholder="Informações adicionais sobre o consultório..."
              />
            </div>

            <Button
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              size="lg"
              className="w-full"
            >
              <Send size={18} />
              Enviar cadastro via WhatsApp
            </Button>
          </motion.form>
        </motion.div>
      </Container>
    </section>
  );
}
