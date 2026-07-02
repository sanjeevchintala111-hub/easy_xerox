function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function getRatePerPage(options, settings) {
  if (options.printColor === 'color') return Number(settings.colorRate || 0);

  if (options.xeroxType === 'double') return Number(settings.doubleSideRate || 0);
  if (options.xeroxType === 'fourInOne') return Number(settings.fourInOneRate || 0);
  return Number(settings.singleSideRate || 0);
}

function calculatePrice(files, options, settings) {
  const copies = Math.max(parseInt(options.copies || 1, 10), 1);
  const totalPages = files.reduce((sum, file) => sum + Number(file.pages || 0), 0);
  const effectivePages = totalPages * copies;
  const ratePerPage = getRatePerPage(options, settings);
  const subtotal = roundMoney(effectivePages * ratePerPage);

  const eligiblePdfCount = files.filter((file) => {
    const type = String(file.fileType || '').toLowerCase();
    return type === 'pdf' && Number(file.pages || 0) >= Number(settings.discountMinPagesPerPdf || 50);
  }).length;

  const discountApplied = eligiblePdfCount >= Number(settings.discountMinPdfs || 10);
  const discountPercentage = discountApplied ? Number(settings.discountPercentage || 0) : 0;
  const discountAmount = roundMoney((subtotal * discountPercentage) / 100);
  const afterDiscount = roundMoney(subtotal - discountAmount);
  const minimumOrderAmount = Number(settings.minimumOrderAmount || 0);
  const minimumOrderAdjustment = afterDiscount < minimumOrderAmount ? roundMoney(minimumOrderAmount - afterDiscount) : 0;
  const totalAmount = roundMoney(afterDiscount + minimumOrderAdjustment);

  return {
    totalPages,
    effectivePages,
    ratePerPage,
    subtotal,
    discountApplied,
    discountPercentage,
    discountAmount,
    minimumOrderAdjustment,
    totalAmount,
  };
}

module.exports = { calculatePrice, roundMoney };
