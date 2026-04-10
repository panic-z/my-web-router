const { FEEDBACK_TYPES, PRODUCTS, FIELD_LIMITS } = require("./constants");

function cleanString(value, limit) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, limit);
}

function invalid(message) {
  return {
    ok: false,
    error: new Error(message),
  };
}

function validateFeedbackSubmission(input) {
  const feedbackType = cleanString(input.feedbackType, 20);
  const product = cleanString(input.product, 30);
  const title = cleanString(input.title, FIELD_LIMITS.title);
  const contact = cleanString(input.contact, FIELD_LIMITS.contact);
  const honeypot = cleanString(input.honeypot, 20);

  if (honeypot.length > 0) {
    return invalid("Spam detected.");
  }

  if (!FEEDBACK_TYPES.includes(feedbackType)) {
    return invalid("Unsupported feedback type.");
  }

  if (!PRODUCTS.includes(product)) {
    return invalid("Unsupported product.");
  }

  if (!title) {
    return invalid("Title is required.");
  }

  const base = {
    feedbackType,
    product,
    title,
    contact,
    pageUrl: cleanString(input.pageUrl, FIELD_LIMITS.pageUrl),
    sourcePath: cleanString(input.sourcePath, FIELD_LIMITS.pageUrl),
    referrer: cleanString(input.referrer, FIELD_LIMITS.referrer),
    userAgent: cleanString(input.userAgent, FIELD_LIMITS.userAgent),
    locale: cleanString(input.locale, FIELD_LIMITS.locale),
  };

  if (feedbackType === "bug") {
    const steps = cleanString(input.steps, FIELD_LIMITS.steps);
    const expectedResult = cleanString(input.expectedResult, FIELD_LIMITS.expectedResult);
    const actualResult = cleanString(input.actualResult, FIELD_LIMITS.actualResult);

    if (!base.pageUrl || !steps || !expectedResult || !actualResult) {
      return invalid("Bug submissions require pageUrl, steps, expectedResult, and actualResult.");
    }

    return {
      ok: true,
      value: {
        ...base,
        steps,
        expectedResult,
        actualResult,
        currentProblem: "",
        proposal: "",
        useCase: "",
      },
    };
  }

  const currentProblem = cleanString(input.currentProblem, FIELD_LIMITS.currentProblem);
  const proposal = cleanString(input.proposal, FIELD_LIMITS.proposal);
  const useCase = cleanString(input.useCase, FIELD_LIMITS.useCase);

  if (!currentProblem || !proposal || !useCase) {
    return invalid("Feature submissions require currentProblem, proposal, and useCase.");
  }

  return {
    ok: true,
    value: {
      ...base,
      steps: "",
      expectedResult: "",
      actualResult: "",
      currentProblem,
      proposal,
      useCase,
    },
  };
}

module.exports = {
  validateFeedbackSubmission,
};
