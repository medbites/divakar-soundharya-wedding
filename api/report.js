// Backend for /report: checks the report password, then reads Vercel Web Analytics
// for this project with a server-side token. Needs two environment variables:
//   REPORT_PASSWORD         the password typed on /report
//   VERCEL_ANALYTICS_TOKEN  a Vercel access token with access to the team
const crypto = require("crypto");

const PROJECT_ID = "prj_ZHOlBt8OTHjnjbPgKWW8n05mPHAb";
const TEAM_ID = "team_gcGirlZynr6FBS6KsZ7AouNa";
const DIMENSIONS = new Set([
  "hour", "day", "week", "month", "country", "deviceType", "requestPath",
  "referrerHostname", "osName", "browserName",
]);

function samePassword(given, expected) {
  const a = crypto.createHash("sha256").update(String(given)).digest();
  const b = crypto.createHash("sha256").update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

function fail(res, status, code, message) {
  res.status(status).json({ error: { code, message } });
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");

  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  const password = process.env.REPORT_PASSWORD;
  if (!password) {
    return fail(res, 500, "not_configured", "Set REPORT_PASSWORD in the Vercel project settings, then redeploy.");
  }

  const auth = req.headers.authorization || "";
  const given = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!given || !samePassword(given, password)) {
    return fail(res, 401, "unauthorized", "Wrong password.");
  }

  if (!token) {
    return fail(res, 503, "token_missing", "Add VERCEL_ANALYTICS_TOKEN in the Vercel project settings, then redeploy.");
  }

  const q = req.query || {};
  const kind = q.kind === "count" || q.kind === "aggregate" ? q.kind : null;
  if (!kind) return fail(res, 400, "bad_request", "kind must be count or aggregate.");

  const since = String(q.since || ""), until = String(q.until || "");
  if (isNaN(Date.parse(since)) || isNaN(Date.parse(until))) {
    return fail(res, 400, "bad_request", "since and until must be dates.");
  }

  const params = new URLSearchParams({ projectId: PROJECT_ID, teamId: TEAM_ID, since, until });
  if (kind === "aggregate") {
    const by = [].concat(q.by || []).map(String);
    if (!by.length || by.length > 2 || !by.every((d) => DIMENSIONS.has(d))) {
      return fail(res, 400, "bad_request", "by must name one or two supported dimensions.");
    }
    by.forEach((d) => params.append("by", d));
    const limit = Math.min(100, Math.max(1, parseInt(q.limit, 10) || 10));
    params.set("limit", String(limit));
  }
  if (q.path) {
    const path = String(q.path).slice(0, 200);
    params.set("filter", `requestPath eq '${path.replace(/'/g, "''")}'`);
  }

  try {
    const r = await fetch(`https://api.vercel.com/v1/query/web-analytics/visits/${kind}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await r.text();
    res.status(r.status).setHeader("Content-Type", "application/json");
    res.send(body);
  } catch (e) {
    fail(res, 502, "upstream_unreachable", "Could not reach Vercel.");
  }
};
