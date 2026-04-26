const FEEDBACK_TYPES = ["bug", "feature"];

const PRODUCTS = ["portal", "ai-info", "resume-maker", "top-or-flop"];

const FIELD_LIMITS = {
  title: 120,
  contact: 160,
  pageUrl: 500,
  currentProblem: 2000,
  proposal: 2000,
  useCase: 2000,
  steps: 3000,
  expectedResult: 2000,
  actualResult: 2000,
  userAgent: 500,
  referrer: 500,
  locale: 35,
  honeypot: 0,
};

module.exports = {
  FEEDBACK_TYPES,
  PRODUCTS,
  FIELD_LIMITS,
};
