import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Star,
  CalendarDays,
  Sun,
  Sunset,
  Moon,
  Zap,
} from "lucide-react";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import BookingModal from "../components/modals/BookingModal";
import StarRating from "../components/ui/StarRating";
import { consultories } from "../data/consultories";
import { reviews } from "../data/reviews";

const periodIcons = {
  morning: <Sun size={15} className="text-accent-500" />,
  afternoon: <Sunset size={15} className="text-accent-500" />,
  evening: <Moon size={15} className="text-accent-500" />,
};
const periodLabels = {
  morning: "Manhã (8h–12h)",
  afternoon: "Tarde (13h–17h)",
  evening: "Noite (18h–22h)",
};

export default function ConsultoryDetail() {
  const { id } = useParams<{ id: string }>();
  const consultory = consultories.find((c) => c.id === id);
  const [currentImage, setCurrentImage] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);

  if (!consultory) {
    return (
      <section className="pt-28 pb-20">
        <Container className="text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">
            Consultório não encontrado
          </h1>
          <Link to="/consultorios" className="text-primary-500 hover:underline">
            Voltar para consultórios
          </Link>
        </Container>
      </section>
    );
  }

  const others = consultories.filter((c) => c.id !== consultory.id).slice(0, 3);
  const consultoryReviews = reviews.filter(r => r.type === "tenant-to-owner");

  const nextImage = () =>
    setCurrentImage((prev) => (prev + 1) % consultory.images.length);
  const prevImage = () =>
    setCurrentImage(
      (prev) => (prev - 1 + consultory.images.length) % consultory.images.length
    );

  const availablePeriods = (Object.keys(consultory.periods) as Array<keyof typeof consultory.periods>).filter(
    p => consultory.periods[p]
  );

  return (
    <section className="pt-28 pb-20 lg:pt-36 lg:pb-30">
      <Container>
        <Link
          to="/consultorios"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Voltar para consultórios
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Images */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative rounded-3xl overflow-hidden aspect-4/3 mb-4"
            >
              <motion.img
                key={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={consultory.images[currentImage]}
                alt={`${consultory.name} - Foto ${currentImage + 1}`}
                className="w-full h-full object-cover"
              />
              {consultory.isPremium && (
                <div className="absolute top-4 left-4 flex items-center gap-1 bg-accent-400 text-neutral-900 text-xs font-display font-bold px-3 py-1.5 rounded-full">
                  <Zap size={12} />
                  Destaque Premium
                </div>
              )}
              {consultory.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {consultory.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          idx === currentImage ? "bg-white" : "bg-white/50"
                        }`}
                        aria-label={`Ir para foto ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {consultory.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                    idx === currentImage ? "border-primary-500" : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Reviews section */}
            {consultoryReviews.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-5">
                  <h3 className="font-display font-bold text-lg text-neutral-800">
                    Avaliações
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <StarRating value={Math.round(consultory.rating)} readonly size={16} />
                    <span className="font-display font-bold text-neutral-800">
                      {consultory.rating}
                    </span>
                    <span className="text-sm text-neutral-400">
                      ({consultory.totalReviews})
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {consultoryReviews.slice(0, 3).map(review => (
                    <div
                      key={review.id}
                      className="bg-neutral-50 rounded-2xl p-5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-display font-bold text-xs">
                            {review.fromUserName.split(" ").slice(0, 2).map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-800">
                              {review.fromUserName}
                            </p>
                            <p className="text-xs text-neutral-400">{review.date}</p>
                          </div>
                        </div>
                        <StarRating value={review.rating} readonly size={14} />
                      </div>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                {consultory.name}
              </h1>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1 text-neutral-500 text-sm">
                  <MapPin size={16} />
                  {consultory.neighborhood}, {consultory.city}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <StarRating value={Math.round(consultory.rating)} readonly size={15} />
                <span className="text-sm font-medium text-neutral-700">
                  {consultory.rating}
                </span>
                <span className="text-sm text-neutral-400">
                  · {consultory.totalReviews} avaliações
                </span>
              </div>

              <div className="bg-primary-50 rounded-2xl p-6 mb-6">
                <span className="text-sm text-neutral-500">Valor por período</span>
                <p className="font-display font-bold text-4xl text-primary-500">
                  R$ {consultory.pricePerPeriod}
                </p>
              </div>

              <p className="text-neutral-600 leading-relaxed mb-6">
                {consultory.description}
              </p>

              {/* Available periods */}
              <div className="mb-6">
                <h3 className="font-display font-bold text-sm text-neutral-700 mb-3">
                  Períodos disponíveis
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availablePeriods.map(p => (
                    <div
                      key={p}
                      className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs text-neutral-600"
                    >
                      {periodIcons[p]}
                      {periodLabels[p]}
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div className="mb-8">
                <h3 className="font-display font-bold text-lg text-neutral-800 mb-4">
                  Equipamentos inclusos
                </h3>
                <div className="flex flex-wrap gap-2">
                  {consultory.equipment.map((eq) => (
                    <Badge key={eq}>{eq}</Badge>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setBookingOpen(true)}
                className="w-full bg-primary-500 text-white rounded-xl py-4 font-display font-semibold text-lg flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors shadow-[0_4px_24px_rgba(0,102,204,0.2)]"
              >
                <CalendarDays size={20} />
                Agendar consultório
              </motion.button>

              <p className="text-center text-xs text-neutral-400 mt-3">
                Confirme a disponibilidade antes do atendimento
              </p>
            </motion.div>
          </div>
        </div>

        {/* Other consultories */}
        {others.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-neutral-900 mb-8">
              Outros consultórios que podem te interessar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {others.map((c) => (
                <Link key={c.id} to={`/consultorios/${c.id}`}>
                  <Card>
                    <div className="aspect-4/3 overflow-hidden">
                      <img
                        src={c.images[0]}
                        alt={c.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-display font-bold text-neutral-800">
                          {c.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-neutral-500 shrink-0">
                          <Star size={11} className="text-accent-400 fill-accent-400" />
                          {c.rating}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-500 text-sm mb-3">
                        <MapPin size={14} />
                        {c.neighborhood}
                      </div>
                      <p className="font-display font-bold text-primary-500">
                        R$ {c.pricePerPeriod}
                        <span className="text-sm font-normal text-neutral-400"> / período</span>
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 lg:hidden z-40">
        <Button
          href="#"
          onClick={(e) => { e.preventDefault(); setBookingOpen(true); }}
          size="lg"
          className="w-full"
        >
          <CalendarDays size={20} />
          Agendar consultório
        </Button>
      </div>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        consultory={consultory}
      />
    </section>
  );
}
