const { app } = require("@azure/functions");
const { TableClient } = require("@azure/data-tables");

const TABLE = "Respuestas";
const COLS = ["Fecha","Encuesta","Audiencia","Ubicacion","Idioma","App","Q1","Q2","Q3","Q4","Q5","Q5B","Q6","Q7"];
const ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const cors = { "Access-Control-Allow-Origin": ORIGIN, "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };

let client;
function table() {
  if (!client) {
    client = TableClient.fromConnectionString(process.env.AzureWebJobsStorage, TABLE);
  }
  return client;
}

// POST /api/respuestas  — the survey app sends one JSON body per submission (as text/plain to avoid CORS preflight)
app.http("respuestas", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "respuestas",
  handler: async (req, ctx) => {
    if (req.method === "OPTIONS") return { status: 204, headers: cors };
    let body;
    try { body = JSON.parse(new TextDecoder("utf-8").decode(await req.arrayBuffer())); } catch { return { status: 400, headers: cors, jsonBody: { ok: false, error: "invalid JSON" } }; }
    const row = body && body.row;
    if (!row || typeof row !== "object" || !body.survey) return { status: 400, headers: cors, jsonBody: { ok: false, error: "missing row" } };

    const now = new Date();
    const entity = {
      partitionKey: String(body.survey).slice(0, 20),
      rowKey: `${now.toISOString()}_${Math.random().toString(36).slice(2, 8)}`,
      Answers: JSON.stringify(body.answers || []).slice(0, 30000)
    };
    for (const c of COLS) entity[c] = row[c] == null ? "" : String(row[c]).slice(0, 4000);
    if (!entity.Fecha) entity.Fecha = now.toISOString();

    try {
      const t = table();
      await t.createTable().catch(() => {});
      await t.createEntity(entity);
    } catch (e) {
      ctx.error("table write failed", e);
      return { status: 500, headers: cors, jsonBody: { ok: false, error: "storage" } };
    }
    return { status: 200, headers: cors, jsonBody: { ok: true } };
  }
});

// GET /api/export?code=<function key>  — all responses as CSV (UTF-8 with BOM so Excel reads accents)
app.http("export", {
  methods: ["GET"],
  authLevel: "function",
  route: "export",
  handler: async (req, ctx) => {
    const survey = req.query.get("survey");
    const rows = [];
    try {
      const t = table();
      const iter = survey ? t.listEntities({ queryOptions: { filter: `PartitionKey eq '${survey.replace(/'/g, "''")}'` } }) : t.listEntities();
      for await (const e of iter) rows.push(e);
    } catch (e) {
      ctx.error("table read failed", e);
      return { status: 500, body: "storage error" };
    }
    rows.sort((a, b) => (a.Fecha > b.Fecha ? 1 : -1));
    const q = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
    const header = ["Id", ...COLS].map(q).join(",");
    const lines = rows.map(r => [r.rowKey, ...COLS.map(c => r[c])].map(q).join(","));
    return {
      status: 200,
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "inline; filename=respuestas-sju.csv" },
      body: Buffer.from("﻿" + [header, ...lines].join("
"), "utf8")
"), "utf8")
    };
  }
});
