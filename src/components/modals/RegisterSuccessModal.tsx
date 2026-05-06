import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import Modal from "../ui/Modal";

interface RegisterSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrimaryAction: () => void;
}

export default function RegisterSuccessModal({
  isOpen,
  onClose,
  onPrimaryAction,
}: RegisterSuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 220 }}
          className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 size={36} className="text-green-500" />
        </motion.div>

        <h3 className="font-display font-bold text-xl text-neutral-900 mb-2">
          Cadastro realizado com sucesso!
        </h3>

        <p className="text-neutral-500 text-sm mb-1">
          Sua conta foi criada com sucesso.
        </p>
        <p className="text-neutral-500 text-sm mb-6">
          Agora voce ja pode entrar na plataforma com seu email e senha.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onPrimaryAction}
            className="w-full rounded-xl bg-primary-500 py-3 font-display font-semibold text-white transition-colors hover:bg-primary-600"
          >
            Ir para o login
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-neutral-200 py-3 font-display font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}
