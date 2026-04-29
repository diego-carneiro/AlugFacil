export const WHATSAPP_DEFAULT = "5512999999999";

export const buildWhatsAppLink = (phone: string, message: string): string =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
