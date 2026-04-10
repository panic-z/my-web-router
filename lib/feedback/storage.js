function toStorageRow(submission) {
  return {
    id: submission.id,
    feedback_type: submission.feedbackType,
    title: submission.title,
    product: submission.product,
    page_url: submission.pageUrl,
    source_path: submission.sourcePath,
    current_problem: submission.currentProblem,
    proposal: submission.proposal,
    use_case: submission.useCase,
    steps: submission.steps,
    expected_result: submission.expectedResult,
    actual_result: submission.actualResult,
    contact: submission.contact,
    referrer: submission.referrer,
    user_agent: submission.userAgent,
    locale: submission.locale,
    submitted_at: submission.submittedAt,
    status: "new",
  };
}

module.exports = {
  toStorageRow,
};
