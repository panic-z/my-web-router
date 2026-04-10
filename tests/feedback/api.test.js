const test = require("node:test");
const assert = require("node:assert/strict");

const handler = require("../../api/feedback");

function createRes() {
  return {
    statusCode: null,
    headers: {},
    body: null,
    ended: false,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

function parseBody(res) {
  return JSON.parse(res.body);
}

test("returns a controlled 400 response when the request body cannot be read", async () => {
  const previousFetch = global.fetch;
  const previousSupabaseUrl = process.env.SUPABASE_URL;
  const previousSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const req = { method: "POST", headers: {}, socket: {} };
  const res = createRes();

  Object.defineProperty(req, "body", {
    enumerable: true,
    get() {
      throw new Error("malformed body");
    },
  });

  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  global.fetch = () => {
    throw new Error("fetch should not be called");
  };

  try {
    await handler(req, res);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(parseBody(res), {
      error: "Invalid request body.",
    });
  } finally {
    global.fetch = previousFetch;
    process.env.SUPABASE_URL = previousSupabaseUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = previousSupabaseKey;
  }
});

test("returns a controlled 502 response when Supabase fetch fails", async () => {
  const previousFetch = global.fetch;
  const previousSupabaseUrl = process.env.SUPABASE_URL;
  const previousSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const req = {
    method: "POST",
    headers: {},
    socket: {},
    body: {
      feedbackType: "feature",
      title: "Add export presets",
      product: "resume-maker",
      currentProblem: "Manual formatting takes time",
      proposal: "Preset layouts",
      useCase: "Different resumes for different roles",
      honeypot: "",
    },
  };
  const res = createRes();

  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  global.fetch = async () => {
    throw new Error("network down");
  };

  try {
    await handler(req, res);

    assert.equal(res.statusCode, 502);
    assert.deepEqual(parseBody(res), {
      error: "Failed to store feedback.",
      detail: "Network error contacting storage.",
    });
  } finally {
    global.fetch = previousFetch;
    process.env.SUPABASE_URL = previousSupabaseUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = previousSupabaseKey;
  }
});
