export const calculateEMI = (principal, annualRate, months) => {
  if (!principal || !months) return 0;
  const r = (annualRate / 12) / 100;
  if (r === 0) return principal / months;
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return Math.round(emi);
};

export const defaultRate = (loanType) => {
  const rates = {
    personal: 14,
    home: 9,
    education: 11,
    business: 13,
  };
  return rates[loanType] || 12;
};

export const formatINR = (n) => {
  if (n == null || isNaN(n)) return '—';
  return '₹' + Number(n).toLocaleString('en-IN');
};