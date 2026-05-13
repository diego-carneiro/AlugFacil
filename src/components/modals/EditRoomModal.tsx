import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { updateRoom } from "../../lib/api/rooms";
import type { Room } from "../../types/room";

const EQUIPMENT_OPTIONS = [
  "Cadeira odontológica",
  "Raio-X",
  "Autoclave",
  "Compressor",
  "Fotopolimerizador",
  "Motor endodôntico",
  "Amalgamador",
  "Ultrassom",
];

interface EditRoomModalProps {
  room: Room;
  onClose: () => void;
  onUpdated: (room: Room) => void;
}

export default function EditRoomModal({ room, onClose, onUpdated }: EditRoomModalProps) {
  const [name, setName] = useState(room.name);
  const [description, setDescription] = useState(room.description ?? "");
  const [pricePerPeriod, setPricePerPeriod] = useState(String(room.pricePerPeriod));
  const [equipment, setEquipment] = useState<string[]>(room.equipment);
  const [periodMorning, setPeriodMorning] = useState(room.periods.morning);
  const [periodAfternoon, setPeriodAfternoon] = useState(room.periods.afternoon);
  const [periodEvening, setPeriodEvening] = useState(room.periods.evening);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Informe o nome da sala.");
      return;
    }
    const price = parseFloat(pricePerPeriod.replace(",", "."));
    if (!price || price <= 0) {
      setError("Informe um valor válido por período.");
      return;
    }
    if (!periodMorning && !periodAfternoon && !periodEvening) {
      setError("Selecione ao menos um período disponível.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await updateRoom(room.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        pricePerPeriod: price,
        equipment,
        periodMorning,
        periodAfternoon,
        periodEvening,
      });
      onUpdated({
        ...room,
        name: name.trim(),
        description: description.trim() || undefined,
        pricePerPeriod: price,
        equipment,
        periods: { morning: periodMorning, afternoon: periodAfternoon, evening: periodEvening },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar a sala.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b border-neutral-100">
            <h2 className="font-display font-bold text-lg text-neutral-800">Editar Sala</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            className="p-6 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Nome da sala <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Sala 1, Sala de Radiologia"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva os detalhes da sala..."
                rows={3}
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Valor por período (R$) <span className="text-red-500">*</span>
              </label>
              <input
                value={pricePerPeriod}
                onChange={(e) => setPricePerPeriod(e.target.value)}
                placeholder="Ex: 150,00"
                inputMode="decimal"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-700 mb-2">
                Períodos disponíveis <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-3">
                {[
                  { label: "Manhã", value: periodMorning, set: setPeriodMorning },
                  { label: "Tarde", value: periodAfternoon, set: setPeriodAfternoon },
                  { label: "Noite", value: periodEvening, set: setPeriodEvening },
                ].map(({ label, value, set }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => set(!value)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      value
                        ? "bg-primary-50 border-primary-300 text-primary-700"
                        : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-700 mb-2">Equipamentos</p>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleEquipment(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      equipment.includes(item)
                        ? "bg-primary-50 border-primary-300 text-primary-700"
                        : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
