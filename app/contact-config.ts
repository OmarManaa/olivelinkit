export const businessContact = {
  email: "omar.manaa@gmail.com",
  phone: "+61 401 117 746",
  whatsappNumber: "61401117746",
  location: "Doncaster East, Melbourne, VIC 3109",
  address: {
    street: "Doncaster East",
    city: "Melbourne",
    state: "VIC",
    postcode: "3109",
    country: "Australia"
  }
};

export function supportEmailHref(subject = "IT Support Request", body = "", toEmail = businessContact.email) {
  const params = new URLSearchParams({ subject });
  if (body) params.set("body", body);
  return `mailto:${toEmail}?${params.toString()}`;
}

export function phoneHref(phone = businessContact.phone) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : "";
}

export function whatsappHref(message: string, whatsappNumber = businessContact.whatsappNumber) {
  if (!whatsappNumber) return null;
  const digits = whatsappNumber.replace(/\D/g, "");
  const normalizedNumber = digits.startsWith("0") ? `61${digits.slice(1)}` : digits;
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
