export const PHONE_LENGTH = 10;

export const isValidPhone = (value: string) => /^[6-9]\d{9}$/.test(value);

export function normalizePhone(input: string) {
  let digits = input.replace(/\D/g, '');
  if (digits.length === PHONE_LENGTH + 2 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === PHONE_LENGTH + 1 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, PHONE_LENGTH);
}

export function getPhoneError(phone: string, touched: boolean) {
  if (!touched || phone.length === 0 || isValidPhone(phone)) {
    return null;
  }
  return phone.length < PHONE_LENGTH
    ? 'Enter a valid 10-digit mobile number'
    : 'Mobile numbers start with 6, 7, 8 or 9';
}

export const formatPhone = (phone: string) =>
  `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
