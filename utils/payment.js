function buildUpiLink({ upiId, shopName, amount, orderId }) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: shopName,
    am: String(amount),
    cu: 'INR',
    tn: `Xerox order ${orderId}`,
  });
  return `upi://pay?${params.toString()}`;
}

function buildWhatsAppLink(number, message) {
  const cleanedNumber = String(number || '').replace(/\D/g, '');
  return `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(message)}`;
}

module.exports = { buildUpiLink, buildWhatsAppLink };
