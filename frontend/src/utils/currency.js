// Tripzy shows every amount in Indian rupees, e.g. formatRupees(125000) -> "₹1,25,000"
export const formatRupees = (amount) =>
  `₹${Math.round(Number(amount) || 0).toLocaleString('en-IN')}`;
