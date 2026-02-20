export const getLocalDate = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  // Forzamos el uso de la zona horaria UTC-3 (America/Argentina/Buenos_Aires)
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
};