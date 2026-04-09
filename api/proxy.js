const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function getPath(req) {
  const rawPath = req.query.path;

  if (Array.isArray(rawPath)) {
    return `/${rawPath.join("/")}`.replace(/\/+/g, "/");
  }

  if (typeof rawPath === "string" && rawPath.length > 0) {
    return `/${rawPath}`.replace(/\/+/g, "/");
  }

  return "/";
}

function getOrigin(pathname) {
  if (pathname === "/resume-maker" || pathname.startsWith("/resume-maker/")) {
    return process.env.RESUME_MAKER_ORIGIN;
  }

  return process.env.AI_INFO_ORIGIN;
}

function getUpstreamPath(pathname) {
  if (pathname === "/resume-maker") {
    return "/";
  }

  if (pathname.startsWith("/resume-maker/")) {
    const strippedPath = pathname.slice("/resume-maker".length);
    return strippedPath.length > 0 ? strippedPath : "/";
  }

  return pathname;
}

function buildTargetUrl(req, pathname, origin) {
  const upstreamPath = getUpstreamPath(pathname);
  const targetUrl = new URL(upstreamPath, origin.endsWith("/") ? origin : `${origin}/`);

  for (const [key, value] of Object.entries(req.query)) {
    if (key === "path") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        targetUrl.searchParams.append(key, item);
      }
      continue;
    }

    if (typeof value === "string") {
      targetUrl.searchParams.set(key, value);
    }
  }

  return targetUrl;
}

function copyRequestHeaders(req, targetUrl) {
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      continue;
    }

    if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
      continue;
    }

    headers.set(key, value);
  }

  headers.set("x-forwarded-host", req.headers.host ?? "");
  headers.set("x-forwarded-proto", "https");
  headers.set("host", targetUrl.host);

  return headers;
}

function copyResponseHeaders(upstream, res) {
  upstream.headers.forEach((value, key) => {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      return;
    }

    res.setHeader(key, value);
  });
}

module.exports = async (req, res) => {
  const pathname = getPath(req);
  const origin = getOrigin(pathname);

  if (!origin) {
    res.status(500).json({
      error: "Missing upstream origin",
      pathname,
      requiredEnv:
        pathname === "/resume-maker" || pathname.startsWith("/resume-maker/")
          ? "RESUME_MAKER_ORIGIN"
          : "AI_INFO_ORIGIN",
    });
    return;
  }

  const targetUrl = buildTargetUrl(req, pathname, origin);
  const method = req.method ?? "GET";
  const hasBody = method !== "GET" && method !== "HEAD";

  const upstream = await fetch(targetUrl, {
    method,
    headers: copyRequestHeaders(req, targetUrl),
    body: hasBody ? req : undefined,
    duplex: hasBody ? "half" : undefined,
    redirect: "manual",
  });

  copyResponseHeaders(upstream, res);
  res.status(upstream.status);

  if (!upstream.body) {
    res.end();
    return;
  }

  const buffer = Buffer.from(await upstream.arrayBuffer());
  res.send(buffer);
};
