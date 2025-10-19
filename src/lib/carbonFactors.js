// Spend-based emission factors (kgCO2e per USD). Demo-only, plausible ranges.
export const SPEND_FACTORS = {
  Restaurant: 0.80,
  Grocery: 0.45,
  Fashion: 1.60,
  Electronics: 0.70,
  Transport: 2.50,
  Travel: 3.20,
  Entertainment: 0.55,
  Utilities: 0.30,
  General: 0.35,
};

// MCC → Category (use if transaction has an MCC)
export const MCC_TO_CATEGORY = {
  "5812": "Restaurant",
  "5411": "Grocery",
  "5651": "Fashion",
  "5732": "Electronics",
  "4111": "Transport",
  "4511": "Travel",
  "7999": "Entertainment",
  "4900": "Utilities",
};