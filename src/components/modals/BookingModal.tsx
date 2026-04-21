import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, CheckCircle2, Sun, Sunset, Moon } from "lucide-react";
import Modal from "../ui/Modal";
import type { Consultory } from "../../data/consultories";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultory: Consultory;
}

type Period = "morning" | "afternoon" | "evening";

const periods: { id: Period; label: string; time: string; icon: React.ReactNode }[] = [
  { id: "morning", label: "Manhã", time: "8h – 12h", icon: <Sun size={18} /> },
  { id: "afternoon", label: "Tarde", time: "13h – 17h", icon: <Sunset size={18} /> },
  { id: "evening", label: "Noite", time: "18h – 22h", icon: <Moon size={18} /> },
];

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Dates booked (mock)
const BOOKED_DATES = ["2026-04-17", "2026-04-22", "2026-04-25"];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function BookingModal({ isOpen, onClose, consultory }: BookingModalProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [step, setStep] = useState<"pick" | "confirm" | "success">("pick");

  const days = getCalendarDays(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const isBooked = (day: number) => BOOKED_DATES.includes(toDateStr(viewYear, viewMonth, day));

  const handleDayClick = (day: number) => {
    if (isPast(day) || isBooked(day)) return;
    setSelectedDate(toDateStr(viewYear, viewMonth, day));
    setSelectedPeriod(null);
  };

  const handleConfirm = () => setStep("confirm");
  const handleBook = () => setStep("success");

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep("pick"); setSelectedDate(null); setSelectedPeriod(null); }, 300);
  };

  const availablePeriods = periods.filter(p => consultory.periods[p.id]);

  if (step === "success") {
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
            Reserva solicitada!
          </h3>
          <p className="text-neutral-500 text-sm mb-6">
            Sua solicitação foi enviada para o proprietário. Você receberá a confirmação em breve.
          </p>
          <div className="bg-neutral-50 rounded-xl p-4 text-left text-sm mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500">Consultório</span>
              <span className="font-medium text-neutral-800">{consultory.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Data</span>
              <span className="font-medium text-neutral-800">{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Período</span>
              <span className="font-medium text-neutral-800">
                {periods.find(p => p.id === selectedPeriod)?.label}
              </span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-2 mt-2">
              <span className="text-neutral-500">Total</span>
              <span className="font-bold text-primary-500">
                R$ {consultory.pricePerPeriod}
              </span>
            </div>
          </div>
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

  if (step === "confirm") {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Confirmar reserva" maxWidth="sm">
        <div className="p-6 space-y-4">
          <div className="bg-neutral-50 rounded-xl overflow-hidden">
            <img
              src={consultory.images[0]}
              alt={consultory.name}
              className="w-full h-36 object-cover"
            />
            <div className="p-4 space-y-2 text-sm">
              <p className="font-display font-bold text-neutral-900">{consultory.name}</p>
              <div className="flex justify-between text-neutral-500">
                <span>Data</span>
                <span className="font-medium text-neutral-800">{selectedDate}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Período</span>
                <span className="font-medium text-neutral-800">
                  {periods.find(p => p.id === selectedPeriod)?.label}{" "}
                  ({periods.find(p => p.id === selectedPeriod)?.time})
                </span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold">
                <span>Total</span>
                <span className="text-primary-500">R$ {consultory.pricePerPeriod}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral-400 text-center">
            Ao confirmar, o proprietário receberá sua solicitação para aprovação.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setStep("pick")}
              className="flex-1 border border-neutral-200 text-neutral-600 rounded-xl py-3 text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleBook}
              className="flex-1 bg-primary-500 text-white rounded-xl py-3 text-sm font-display font-semibold hover:bg-primary-600 transition-colors"
            >
              Confirmar reserva
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agendar consultório" maxWidth="md">
      <div className="p-6 space-y-6">
        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
              <ChevronLeft size={18} className="text-neutral-500" />
            </button>
            <span className="font-display font-semibold text-neutral-800">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
              <ChevronRight size={18} className="text-neutral-500" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs text-neutral-400 font-medium py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const dateStr = toDateStr(viewYear, viewMonth, day);
              const past = isPast(day);
              const booked = isBooked(day);
              const selected = selectedDate === dateStr;
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  disabled={past || booked}
                  className={`h-9 w-full rounded-xl text-sm font-medium transition-colors ${
                    selected
                      ? "bg-primary-500 text-white"
                      : booked
                      ? "bg-neutral-100 text-neutral-300 cursor-not-allowed line-through"
                      : past
                      ? "text-neutral-300 cursor-not-allowed"
                      : "hover:bg-primary-50 text-neutral-700 hover:text-primary-600"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Period */}
        {selectedDate && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-medium text-neutral-700 mb-3">Selecione o período</p>
            <div className="grid grid-cols-3 gap-3">
              {availablePeriods.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPeriod(p.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
                    selectedPeriod === p.id
                      ? "border-primary-500 bg-primary-50 text-primary-600"
                      : "border-neutral-200 text-neutral-600 hover:border-primary-300"
                  }`}
                >
                  {p.icon}
                  <span className="text-xs font-display font-semibold">{p.label}</span>
                  <span className="text-xs text-neutral-400">{p.time}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
          <div>
            <span className="text-xs text-neutral-400">Valor por período</span>
            <p className="font-display font-bold text-xl text-primary-500">
              R$ {consultory.pricePerPeriod}
            </p>
          </div>
          <button
            disabled={!selectedDate || !selectedPeriod}
            onClick={handleConfirm}
            className="bg-primary-500 text-white rounded-xl px-6 py-3 font-display font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    </Modal>
  );
}
