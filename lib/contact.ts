// Single source of truth for the public WhatsApp / phone contact number.
// Digits only, country code included (wa.me format).
export const WHATSAPP_NUMBER = '919354859197';

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

// "+91 9354859197" — human-readable form for link text.
export const WHATSAPP_DISPLAY = `+${WHATSAPP_NUMBER.slice(0, 2)} ${WHATSAPP_NUMBER.slice(2)}`;

// "+91-9354859197" — form used in schema.org ContactPoint.telephone.
export const CONTACT_TELEPHONE = `+${WHATSAPP_NUMBER.slice(0, 2)}-${WHATSAPP_NUMBER.slice(2)}`;
