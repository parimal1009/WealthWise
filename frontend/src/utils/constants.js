// Update this URL to match your Django backend
export const API_BASE_URL = "http://localhost:8000/api";

export const APP_NAME = "WealthWise";

export const LIMITS = {
  currentSalary: { min: 0, max: 10000000 }, // ₹0 – ₹1Cr
  yearsOfService: { min: 0, max: 100 }, // 0 – 100 years
  pensionBalance: { min: 0, max: 10000000000 }, // ₹0 – ₹100Cr
  employerContribution: { min: 0, max: 1000000 }, // ₹0 – ₹10L per month
};
