function createFeedbackId(date = new Date(), randomSeed = Math.random().toString(36).slice(2, 8)) {
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const suffix = String(randomSeed).replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase();

  return `${year}${month}${day}-${suffix}`;
}

module.exports = {
  createFeedbackId,
};
