import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  MapPin,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import {
  consultories,
  buildWhatsAppLink,
} from "../data/consultories";

export default function ConsultoryDetail() {
  const { id } = useParams<{ id: string }>();
  const consultory = consultories.find((c) => c.id === id);
  const [currentImage, setCurrentImage] = useState(0);

  if (!consultory) {
    return (
      <section className="pt-28 pb-20">
        <Container className="text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">
            Consultório não encontrado
          </h1>
          <Link
            to="/consultorios"
            className="text-primary-500 hover:underline"
          >
            Voltar para consultórios
          </Link>
        </Container>
      </section>
    );
  }

  const others = consultories
    .filter((c) => c.id !== consultory.id)
    .slice(0, 3);

  const nextImage = () =>
    setCurrentImage((prev) => (prev + 1) % consultory.images.length);
  const prevImage = () =>
    setCurrentImage(
      (prev) =>
        (prev - 1 + consultory.images.length) % consultory.images.length
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
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative rounded-3xl overflow-hidden aspect-[4/3] mb-4"
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
                          idx === currentImage
                            ? "bg-white"
                            : "bg-white/50"
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
                    idx === currentImage
                      ? "border-primary-500"
                      : "border-transparent"
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
          </div>

          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
                {consultory.name}
              </h1>
              <div className="flex items-center gap-1 text-neutral-500 mb-6">
                <MapPin size={16} />
                {consultory.neighborhood}, {consultory.city}
              </div>

              <div className="bg-primary-50 rounded-2xl p-6 mb-6">
                <span className="text-sm text-neutral-500">
                  Valor por período
                </span>
                <p className="font-display font-bold text-4xl text-primary-500">
                  R$ {consultory.pricePerPeriod}
                </p>
              </div>

              <p className="text-neutral-600 leading-relaxed mb-8">
                {consultory.description}
              </p>

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

              <Button
                href={buildWhatsAppLink(
                  consultory.whatsappNumber,
                  `Olá! Vi o ${consultory.name} no site AlugFácil e tenho interesse em alugar. Podemos conversar?`
                )}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                className="w-full"
              >
                <MessageCircle size={20} />
                Falar no WhatsApp para reservar
              </Button>
            </motion.div>
          </div>
        </div>

        {others.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-neutral-900 mb-8">
              Outros consultórios que podem te interessar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {others.map((c) => (
                <Link key={c.id} to={`/consultorios/${c.id}`}>
                  <Card>
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={c.images[0]}
                        alt={c.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-bold text-neutral-800 mb-1">
                        {c.name}
                      </h3>
                      <div className="flex items-center gap-1 text-neutral-500 text-sm mb-3">
                        <MapPin size={14} />
                        {c.neighborhood}
                      </div>
                      <p className="font-display font-bold text-primary-500">
                        R$ {c.pricePerPeriod}
                        <span className="text-sm font-normal text-neutral-400">
                          {" "}/ período
                        </span>
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 lg:hidden z-40">
        <Button
          href={buildWhatsAppLink(
            consultory.whatsappNumber,
            `Olá! Vi o ${consultory.name} no AlugFácil e tenho interesse em alugar.`
          )}
          target="_blank"
          rel="noopener noreferrer"
          size="lg"
          className="w-full"
        >
          <MessageCircle size={20} />
          Falar no WhatsApp para reservar
        </Button>
      </div>
    </section>
  );
}
