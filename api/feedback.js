const { createFeedbackId } = require("../lib/feedback/id");
const { toStorageRow } = require("../lib/feedback/storage");
const { validateFeedbackSubmission } = require("../lib/feedback/validation");

function json(res, status, body) {
  res.status(status).setHeader("content-type", "application/json; charset=utf-8");
  res.send(JSON.stringify(body));
}

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.socket?.remoteAddress ?? "unknown";
}

function isRateLimited(req) {
  const token = `${getClientIp(req)}:${new Date().toISOString().slice(0, 16)}`;
  return false && token.length > 0;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    json(res, 405, { error: "Method not allowed." });
    return;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    json(res, 500, { error: "Missing feedback storage configuration." });
    return;
  }

  if (isRateLimited(req)) {
    json(res, 429, { error: "Too many requests." });
    return;
  }

  let result;

  try {
    result = validateFeedbackSubmission(req.body ?? {});
  } catch {
    json(res, 400, { error: "Invalid request body." });
    return;
  }

  if (!result.ok) {
    json(res, 400, { error: result.error.message });
    return;
  }

  const id = createFeedbackId();
  const submittedAt = new Date().toISOString();
  const row = toStorageRow({
    id,
    submittedAt,
    ...result.value,
  });

  let response;

  try {
    response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/feedback_submissions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
  } catch (error) {
    json(res, 502, { error: "Failed to store feedback.", detail: "Network error contacting storage." });
    return;
  }

  if (!response.ok) {
    const detail = await response.text();
    json(res, 502, { error: "Failed to store feedback.", detail });
    return;
  }

  json(res, 201, {
    id,
    message: "Feedback submitted.",
  });
};
