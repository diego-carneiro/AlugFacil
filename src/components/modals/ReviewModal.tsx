import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import Modal from "../ui/Modal";
import StarRating from "../ui/StarRating";
import type { Booking } from "../../data/bookings";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  reviewerRole: "tenant" | "owner";
}

export default function ReviewModal({
  isOpen,
  onClose,
  booking,
  reviewerRole,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const targetName =
    reviewerRole === "tenant" ? booking.ownerName : booking.tenantName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitted(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setSubmitted(false); setRating(0); setComment(""); }, 300);
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
            Avaliação enviada!
          </h3>
          <p className="text-neutral-500 text-sm mb-6">
            Obrigado por contribuir com a comunidade AlugFácil.
          </p>
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Avaliar locação" maxWidth="sm">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="bg-neutral-50 rounded-xl p-4 text-sm space-y-1">
          <p className="font-medium text-neutral-800">{booking.consultoryName}</p>
          <p className="text-neutral-500">{booking.date}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Como foi sua experiência com{" "}
            <span className="text-primary-600">{targetName}</span>?
          </label>
          <div className="flex justify-center">
            <StarRating value={rating} onChange={setRating} size={36} />
          </div>
          {rating > 0 && (
            <p className="text-center text-xs text-neutral-400 mt-2">
              {["", "Muito ruim", "Ruim", "Regular", "Bom", "Excelente"][rating]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="review-comment"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Comentário <span className="text-neutral-400">(opcional)</span>
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={400}
            placeholder="Descreva sua experiência..."
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm resize-none"
          />
          <p className="text-right text-xs text-neutral-400 mt-1">
            {comment.length}/400
          </p>
        </div>

        <button
          type="submit"
          disabled={rating === 0}
          className="w-full bg-primary-500 text-white rounded-xl py-3 font-display font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
        >
          Enviar avaliação
        </button>
      </form>
    </Modal>
  );
}
