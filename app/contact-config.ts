export const businessContact = {
  email: "omar.manaa@gmail.com",
  location: "Melbourne, Victoria",
  whatsappNumber: "61401117746",
};

export function supportEmailHref(subject = "IT Support Request", body = "", toEmail = businessContact.email) {
  const params = new URLSearchParams({ subject });
  if (body) params.set("body", body);
  return `mailto:${toEmail}?${params.toString()}`;
}

export function whatsappHref(message: string, whatsappNumber = businessContact.whatsappNumber) {
  if (!whatsappNumber) return null;
  const digits = whatsappNumber.replace(/\D/g, "");
  const normalizedNumber = digits.startsWith("0") ? `61${digits.slice(1)}` : digits;
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
