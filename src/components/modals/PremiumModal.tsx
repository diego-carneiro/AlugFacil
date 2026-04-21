import { CheckCircle2, Zap, TrendingUp, Eye, Star } from "lucide-react";
import { motion } from "motion/react";
import Modal from "../ui/Modal";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultoryName: string;
}

const benefits = [
  { icon: <TrendingUp size={16} />, text: "Aparece no topo dos resultados de busca" },
  { icon: <Eye size={16} />, text: "Badge de destaque nas listagens" },
  { icon: <Star size={16} />, text: "Destaque na seção de featured da Home" },
  { icon: <Zap size={16} />, text: "Prioridade nas notificações para dentistas" },
];

const plans = [
  { id: "monthly", label: "Mensal", price: 89, period: "mês", badge: null },
  { id: "quarterly", label: "Trimestral", price: 69, period: "mês", badge: "Mais popular", save: "R$ 60" },
  { id: "yearly", label: "Anual", price: 49, period: "mês", badge: "Melhor valor", save: "R$ 240" },
];

export default function PremiumModal({
  isOpen,
  onClose,
  consultoryName,
}: PremiumModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Zap size={28} className="text-accent-500" />
          </div>
          <h2 className="font-display font-bold text-xl text-neutral-900 mb-1">
            Destaque Premium
          </h2>
          <p className="text-sm text-neutral-500">
            Dê mais visibilidade para{" "}
            <span className="font-medium text-neutral-800">{consultoryName}</span>
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-primary-50 rounded-xl p-4 mb-5 space-y-2.5">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-primary-700">
              <span className="shrink-0 text-primary-500">{b.icon}</span>
              {b.text}
            </div>
          ))}
        </div>

        {/* Plans */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {plans.map((plan, i) => (
            <motion.button
              key={plan.id}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-colors ${
                i === 1
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200 hover:border-primary-300"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-display font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {plan.badge}
                </span>
              )}
              <span className="text-xs text-neutral-500 mb-1">{plan.label}</span>
              <span className="font-display font-bold text-xl text-neutral-900">
                R$ {plan.price}
              </span>
              <span className="text-xs text-neutral-400">/{plan.period}</span>
              {plan.save && (
                <span className="mt-1 text-xs text-green-600 font-medium">
                  Economize {plan.save}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        <button className="w-full bg-accent-400 text-neutral-900 rounded-xl py-3 font-display font-bold hover:bg-accent-500 transition-colors flex items-center justify-center gap-2">
          <Zap size={18} />
          Ativar Destaque Premium
        </button>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
          <CheckCircle2 size={12} className="text-green-500" />
          Cancele a qualquer momento
        </div>
      </div>
    </Modal>
  );
}
