import { useState } from "react";
import { CheckCircle2, Camera, CheckCheck, AlertTriangle, XCircle } from "lucide-react";
import { motion } from "motion/react";
import Modal from "../ui/Modal";
import type { Booking } from "../../data/bookings";

interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  type: "check-in" | "check-out";
}

type ItemStatus = "ok" | "damaged" | "missing" | null;

interface InspectionItem {
  id: string;
  label: string;
  status: ItemStatus;
  notes: string;
}

const DEFAULT_ITEMS: InspectionItem[] = [
  { id: "equipo", label: "Equipo odontológico", status: null, notes: "" },
  { id: "autoclave", label: "Autoclave", status: null, notes: "" },
  { id: "compressor", label: "Compressor", status: null, notes: "" },
  { id: "ar-cond", label: "Ar-condicionado", status: null, notes: "" },
  { id: "bancada", label: "Bancada e armários", status: null, notes: "" },
  { id: "piso", label: "Piso e revestimentos", status: null, notes: "" },
  { id: "descartaveis", label: "Descartáveis repostos", status: null, notes: "" },
  { id: "limpeza", label: "Limpeza geral", status: null, notes: "" },
];

const statusConfig: Record<
  Exclude<ItemStatus, null>,
  { label: string; color: string; icon: React.ReactNode }
> = {
  ok: {
    label: "OK",
    color: "border-green-500 bg-green-50 text-green-600",
    icon: <CheckCheck size={14} />,
  },
  damaged: {
    label: "Danificado",
    color: "border-accent-400 bg-accent-50 text-accent-600",
    icon: <AlertTriangle size={14} />,
  },
  missing: {
    label: "Ausente",
    color: "border-red-400 bg-red-50 text-red-500",
    icon: <XCircle size={14} />,
  },
};

export default function InspectionModal({
  isOpen,
  onClose,
  booking,
  type,
}: InspectionModalProps) {
  const [items, setItems] = useState<InspectionItem[]>(DEFAULT_ITEMS);
  const [submitted, setSubmitted] = useState(false);

  const setStatus = (id: string, status: ItemStatus) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, status } : item))
    );
  };

  const setNotes = (id: string, notes: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, notes } : item))
    );
  };

  const allFilled = items.every(item => item.status !== null);
  const issueCount = items.filter(i => i.status === "damaged" || i.status === "missing").length;

  const handleSubmit = () => {
    if (!allFilled) return;
    setSubmitted(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setSubmitted(false); setItems(DEFAULT_ITEMS); }, 300);
  };

  if (submitted) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} maxWidth="sm">
        <div className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 size={36} className="text-green-500" />
          </motion.div>
          <h3 className="font-display font-bold text-xl text-neutral-900 mb-2">
            Vistoria registrada!
          </h3>
          {issueCount > 0 ? (
            <p className="text-neutral-500 text-sm mb-6">
              {issueCount} item(s) com ocorrência registrados. O proprietário será notificado.
            </p>
          ) : (
            <p className="text-neutral-500 text-sm mb-6">
              Tudo em ordem! Check-{type === "check-in" ? "in" : "out"} concluído com sucesso.
            </p>
          )}
          <button
            onClick={handleClose}
            className="w-full bg-primary-500 text-white rounded-xl py-3 font-display font-semibold hover:bg-primary-600 transition-colors"
          >
            Fechar
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={type === "check-in" ? "Vistoria de Entrada (Check-in)" : "Vistoria de Saída (Check-out)"}
      maxWidth="lg"
    >
      <div className="p-6 space-y-4">
        <div className="bg-neutral-50 rounded-xl p-3 text-sm">
          <p className="font-medium text-neutral-800">{booking.consultoryName}</p>
          <p className="text-neutral-500">{booking.date}</p>
        </div>

        <p className="text-sm text-neutral-500">
          Marque o estado de cada item antes de {type === "check-in" ? "iniciar" : "finalizar"} o atendimento.
        </p>

        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="border border-neutral-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-800">{item.label}</span>
                <div className="flex gap-2">
                  {(["ok", "damaged", "missing"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(item.id, s)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                        item.status === s
                          ? statusConfig[s].color
                          : "border-neutral-200 text-neutral-400 hover:border-neutral-300"
                      }`}
                    >
                      {statusConfig[s].icon}
                      {statusConfig[s].label}
                    </button>
                  ))}
                </div>
              </div>
              {(item.status === "damaged" || item.status === "missing") && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <input
                    type="text"
                    placeholder="Descreva a ocorrência..."
                    value={item.notes}
                    onChange={e => setNotes(item.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Photo upload area (mock) */}
        <div className="border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center">
          <Camera size={24} className="text-neutral-300 mx-auto mb-2" />
          <p className="text-sm text-neutral-400">Adicionar fotos da vistoria</p>
          <p className="text-xs text-neutral-300 mt-1">Clique ou arraste as imagens</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-neutral-400">
            {items.filter(i => i.status !== null).length}/{items.length} itens avaliados
          </p>
          <button
            disabled={!allFilled}
            onClick={handleSubmit}
            className="bg-primary-500 text-white rounded-xl px-6 py-3 font-display font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
          >
            Registrar vistoria
          </button>
        </div>
      </div>
    </Modal>
  );
}
