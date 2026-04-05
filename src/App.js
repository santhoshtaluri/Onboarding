import { useState, useRef } from "react";

const API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const HUBSPOT_MCP = { type: "url", url: "https://mcp.hubspot.com/anthropic", name: "hubspot" };

// ─── Call Type Config ───────────────────────────────────────────────────────
const CALL_TYPES = {
  first_demo: { label: "First Demo", icon: "◈", color: "#f97316" },
  onboarding: { label: "Onboarding", icon: "◉", color: "#22d3ee" },
  followup:   { label: "Followup",   icon: "◎", color: "#a78bfa" },
};

// ─── Prompts ─────────────────────────────────────────────────────────────────
const FIRST_DEMO_PROMPT = `You are a CRM assistant for a Solution Engineer at SuperOps analyzing a First Demo call transcript.
Return ONLY a valid JSON object — no markdown, no backticks, no preamble:
{
  "callDate": "YYYY-MM-DD extracted from transcript, or today if not found",
  "attendees": ["names from transcript"],
  "painPoints": ["customer pain points mentioned"],
  "solutionAndWorkarounds": ["solutions or workarounds offered by SE"],
  "positives": ["positive signals, buying indicators, things customer liked"],
  "featuresRequested": ["specific features or capabilities customer asked for"],
  "technicalClosureDetails": "A paragraph describing feature gaps, missing integrations, or workflow blockers that are integral to the customer's operations and could cause deal loss. Be specific.",
  "technicalClosureModules": ["Pick ONLY the decisive top-level modules from this list that were discussed as deal-makers or blockers: Integrations, Ticketing, Scheduling, Client Portal, Notifications, Mobile, Dashboard & Reports, Projects, Time Tracking, Service Catalogue, Quoting, Invoicing, Contracts, Profitability, Network Monitoring, Patch Management, Alert Management, Software Management, Asset Management, Scripting, Security, AI, UX/UI, IT Documentation, Compliance, Admin, Chat, Search, CRM, Non Product experience"],
  "technicalClosureSubModules": ["Pick ONLY the decisive sub-modules that were specifically discussed. Use exact values from the provided list. Only include ones directly mentioned or strongly implied."]
}
Sub-module options (use exact strings): Integration - IT glue, Integration - Anydesk, Integration - Axcient, Integration - Acronis, Integration - Bitdefender, Integration - Cynet, Integration - Domotz, Integration - DUO, Integration - ESET, Integration - Google Calendar, Integration - Ironscales, Integration - Keeper, Integration - Miradore, Integration - OKTA, Integration - Quickbooks, Integration - Scalepad, Integration - Screenconnect, Integration - Splashtop, Integration - TeamViewer, Integration - Threatdown, Integration - Webroot, Integration - Xero, Integration - Zapier, Integration - Slack, Integration - Stripe, Integration - Huntress, Integration - NInjaone, Integration - Office265, Integration - Microsoft teams, Integration - M365, Integration - Sophos, Integration - CW PSA, Integration - Other RMMs, Integration - Bitwarden, Integration - Veeam, Integration - CrowdStrike, Integration - Salesforce, Integration - Zendesk, Integration - MYOB, Integration - Zoho books, Integration - Sage accounting, Integration - Azure, Integration - Google workspace, Integration - SentinelOne, Integration - Autotask, Ticketing-Converting tickets into projects, Ticketing-KBase for technicians, Ticketing-ITIL Alignment, Ticketing-Broadcast message on Outage, Ticketing-Standalone Tasks, Ticketing-Automation based on triggers, Ticketing-Whatsapp ticket creation, Ticketing-Slack ticket creation, Ticketing-Teams ticket creation, Ticketing - ITIL Change Management, Ticketing - approval workflow, Scheduling-Built-in Calendar, Scheduling - Conflict Management, Scheduling - Setting up recurring visits, Scheduling - Client-Book meetings directly, Client Portal - Kbase for customers, Client Portal - SSO for requesters, Client Portal - client portal branding, Client Portal - Dashboard on portal, Notifications - Alert notification, Notifications - Proactive Outage Notification, Notifications - Patch failure notification, Dashboard & Reports - Hardware inventory report, Dashboard & Reports - CSAT dashboard, Dashboard & Reports - Profitability report, Projects - Gantt view for projects, Projects - Convert quotes to projects, Time Tracking - Multiple active timers - for technicians, Quote - Quotes to contracts, Invoicing - Group by Service category, Invoicing - Invoice credits and Refunds, Contracts - User group-based billing, Contracts - Multiple contracts per client, Profitability - Cost framework, Profitability - Contract profitability, Network Monitoring - Topology mapping, Network Monitoring - SNMP walk, Patch Management - Vulnerability patching, Patch Management - Zero day patching, Patch Management - Linux Patching, Alert Management - Multiple/nested conditions, Alert Management - Custom alert templates, Software Management - Mac 3rd party Software Patching, Software Management - Adhoc Software Install/Uninstall/Update, Asset Management - MDM, Asset Management - VM Host monitor, Scripting - Conditional scripts, AI - response suggester, AI- Script generator, AI - Kbase builder, UX/UI - Slowness, UX/UI - Product felt non intutive, Compliance - FedRamp, Compliance - CMMC, IT Documentation - Password Manager, IT Documentation - MFA, Admin - Webhooks, Chat - Chat without ticket`;

const ONBOARDING_PROMPT = `You are a CRM assistant for a Solution Engineer at SuperOps analyzing an Onboarding call transcript.

First, determine customer type: "MSP" if they are a Managed Service Provider, "InternalIT" if they are an internal IT team.

For MSP customers, answer these 25 questions:
1. Which plan of MSP Edition are they using?
2. What are the modes of ticket creation?
3. How does ticket assignment to technician happen?
4. Is the SLA defined? If so, how?
5. Are technicians assigned tasks regularly?
6. Do they have a co-managed setup?
7. What sort of automation rules are preferred?
8. Are they going to use SuperOps project management?
9. What types of Contracts do they have with customers?
10. Do they sell licenses? If yes, how are they managed?
11. How often are invoices sent? Is it automated?
12. How do they process payments?
13. What accounting tool are they using?
14. What Payment gateway do they use?
15. Are there any anticipated challenges or blockers for the customer in achieving their workflows within PSA?
16. How many devices do they monitor? Any insights on Windows/Mac/VMWare/Servers?
17. Which part of the policies were set up during trial/onboarding?
18. Which policy model is recommended? And why?
19. What AV is used? Do we integrate with it or are they using scripts?
20. Are there any anticipated challenges or blockers for the customer in achieving their workflows within RMM?
21. Did we help with data migration?
22. Feature Requests/Nice to haves if any.
23. What goals do they want to achieve with Superops?
24. Have they stopped using their previous tool?
25. What is the expected go-live date for the customer's operations within SuperOps?

For Internal IT customers, answer these 14 questions:
1. What are the modes of ticket creation?
2. How does ticket assignment to technician happen?
3. Are technicians assigned tasks regularly?
4. Is the SLA defined? If so, how?
5. What sort of automation rules are preferred?
6. Are they going to use SuperOps project management?
7. How many devices do they monitor? Any insights on Windows/Mac/VMWare/Servers?
8. Which policy model is recommended? And why?
9. Which part of the policies were set up during trial/onboarding?
10. What AV is used? Do we integrate with it or are they using scripts?
11. Did we help with data migration?
12. Feature Requests/Nice to haves if any.
13. What goals do they want to achieve with Superops?
14. Have they stopped using their previous tool?

Return ONLY a valid JSON object — no markdown, no backticks, no preamble:
{
  "customerType": "MSP" or "InternalIT",
  "attendees": ["names"],
  "answers": [
    { "question": "exact question text", "answer": "answer from transcript, or 'Not discussed' if not mentioned" }
  ],
  "itemsConfigured": ["specific items configured during this session"]
}`;

const FOLLOWUP_PROMPT = `You are a CRM assistant for a Solution Engineer at SuperOps analyzing a Followup call transcript.
Only capture technical discussion items. If there were genuinely no technical items, set hasTechnicalItems to false.
Return ONLY a valid JSON object — no markdown, no backticks, no preamble:
{
  "attendees": ["names"],
  "hasTechnicalItems": true or false,
  "technicalDiscussionItems": ["specific technical topics, issues, questions, or integrations discussed"]
}`;

// ─── Note Builders ────────────────────────────────────────────────────────────
function buildFirstDemoNote(s) {
  const date = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
  const lines = [`[FIRST DEMO — ${date}]`];
  if (s.attendees?.length) lines.push(`Attendees: ${s.attendees.join(", ")}`);
  lines.push("");
  if (s.painPoints?.length) { lines.push("PAIN POINTS"); s.painPoints.forEach(p => lines.push(`• ${p}`)); lines.push(""); }
  if (s.solutionAndWorkarounds?.length) { lines.push("SOLUTION & WORKAROUNDS OFFERED"); s.solutionAndWorkarounds.forEach(p => lines.push(`• ${p}`)); lines.push(""); }
  if (s.positives?.length) { lines.push("POSITIVES"); s.positives.forEach(p => lines.push(`• ${p}`)); lines.push(""); }
  if (s.featuresRequested?.length) { lines.push("FEATURES REQUESTED"); s.featuresRequested.forEach(p => lines.push(`• ${p}`)); }
  return lines.join("\n").trim();
}

function buildOnboardingNote(s) {
  const date = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
  const lines = [`[ONBOARDING — ${date}]`];
  if (s.attendees?.length) lines.push(`Attendees: ${s.attendees.join(", ")}`);
  lines.push(`Customer Type: ${s.customerType === "MSP" ? "MSP Edition" : "Internal IT"}`);
  lines.push("");
  if (s.itemsConfigured?.length) { lines.push("ITEMS CONFIGURED"); s.itemsConfigured.forEach(i => lines.push(`• ${i}`)); }
  return lines.join("\n").trim();
}

function buildOnboardingObjectText(s) {
  const lines = [`ONBOARDING OBJECT — ${s.customerType === "MSP" ? "MSP Edition" : "Internal IT"}`, ""];
  (s.answers || []).forEach((qa, i) => {
    lines.push(`${i + 1}. ${qa.question}`);
    lines.push(`   → ${qa.answer}`);
    lines.push("");
  });
  return lines.join("\n").trim();
}

function buildFollowupNote(s) {
  const date = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
  const lines = [`[FOLLOWUP — ${date}]`];
  if (s.attendees?.length) lines.push(`Attendees: ${s.attendees.join(", ")}`);
  lines.push("");
  if (s.hasTechnicalItems && s.technicalDiscussionItems?.length) {
    lines.push("TECHNICAL DISCUSSION ITEMS");
    s.technicalDiscussionItems.forEach(t => lines.push(`• ${t}`));
  } else {
    lines.push("No technical discussion items in this call.");
  }
  return lines.join("\n").trim();
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #080a0f;
  --surface: #0e1117;
  --border: #181d28;
  --border2: #222736;
  --text: #c8d3e8;
  --muted: #4a5568;
  --dim: #2d3547;
  --orange: #f97316;
  --cyan: #22d3ee;
  --violet: #a78bfa;
  --green: #34d399;
  --red: #f87171;
}

body { background: var(--bg); }

.app {
  min-height: 100vh;
  background: var(--bg);
  font-family: 'DM Mono', monospace;
  color: var(--text);
  padding: 36px 16px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* header */
.hdr { width: 100%; max-width: 700px; margin-bottom: 28px; }
.hdr-eye { font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--orange); margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
.hdr-eye::before, .hdr-eye::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, var(--orange), transparent); }
.hdr h1 { font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 700; color: #eef2ff; letter-spacing: -.02em; text-align: center; }
.hdr p { font-size: 12px; color: var(--muted); text-align: center; margin-top: 6px; }

/* progress */
.progress { display: flex; align-items: center; width: 100%; max-width: 700px; margin-bottom: 24px; }
.prog-step { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
.prog-dot { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border2); background: var(--surface); display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--muted); transition: all .3s; }
.prog-dot.active { border-color: var(--orange); color: var(--orange); background: rgba(249,115,22,.1); }
.prog-dot.done { border-color: var(--green); color: var(--green); background: rgba(52,211,153,.1); }
.prog-label { font-size: 9px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
.prog-line { flex: 1; height: 1px; background: var(--border2); margin: 0 4px; margin-bottom: 16px; transition: background .3s; }
.prog-line.done { background: var(--green); }

/* card */
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; width: 100%; max-width: 700px; overflow: hidden; }
.card-body { padding: 28px; }

/* fields */
.field { margin-bottom: 20px; }
.field label { display: block; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
.field input { width: 100%; background: var(--bg); border: 1px solid var(--border2); border-radius: 7px; padding: 12px 14px; color: var(--text); font-family: 'DM Mono', monospace; font-size: 13px; outline: none; transition: border .2s; }
.field input:focus { border-color: var(--orange); }
.field input::placeholder { color: var(--dim); }

/* call type grid */
.type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.type-btn { background: var(--bg); border: 1px solid var(--border2); border-radius: 8px; padding: 16px 10px 14px; cursor: pointer; transition: all .2s; text-align: center; }
.type-btn:hover { border-color: var(--dim); transform: translateY(-1px); }
.type-btn.active { border-color: var(--tc, #f97316); background: color-mix(in srgb, var(--tc, #f97316) 8%, transparent); }
.type-icon { font-size: 22px; margin-bottom: 6px; transition: color .2s; }
.type-label { font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 500; color: var(--muted); transition: color .2s; }
.type-btn.active .type-label { color: var(--tc, #f97316); }

/* upload */
.upload-zone { border: 1.5px dashed var(--border2); border-radius: 8px; padding: 28px; text-align: center; cursor: pointer; transition: all .2s; background: var(--bg); position: relative; overflow: hidden; }
.upload-zone::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(249,115,22,.04), transparent 70%); pointer-events: none; }
.upload-zone:hover { border-color: var(--orange); }
.upload-zone.filled { border-color: var(--green); border-style: solid; }
.upload-zone .uz-icon { font-size: 28px; margin-bottom: 8px; }
.upload-zone .uz-text { font-size: 12px; color: var(--muted); }
.upload-zone .uz-name { font-size: 12px; color: var(--green); margin-top: 4px; }

/* buttons */
.btn { width: 100%; padding: 13px 20px; border: none; border-radius: 8px; font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .2s; letter-spacing: .02em; }
.btn-orange { background: var(--orange); color: #080a0f; }
.btn-orange:hover:not(:disabled) { background: #fb923c; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(249,115,22,.3); }
.btn-orange:disabled { opacity: .3; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-green { background: #065f46; color: var(--green); border: 1px solid var(--green); }
.btn-green:hover:not(:disabled) { background: #047857; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(52,211,153,.2); }
.btn-green:disabled { opacity: .3; cursor: not-allowed; }
.btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border2); margin-top: 10px; }
.btn-ghost:hover { border-color: var(--dim); color: var(--text); }

/* error */
.error-box { background: rgba(248,113,113,.08); border: 1px solid rgba(248,113,113,.2); border-radius: 7px; padding: 10px 14px; font-size: 12px; color: var(--red); margin-bottom: 16px; }

/* loading */
.loading { text-align: center; padding: 48px 20px; }
.spinner { width: 36px; height: 36px; border: 2px solid var(--border2); border-top-color: var(--tc, #f97316); border-radius: 50%; animation: spin .7s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-msg { font-size: 12px; color: var(--muted); }
.loading-sub { font-size: 11px; color: var(--dim); margin-top: 6px; }

/* summary chips */
.section-block { margin-bottom: 20px; }
.section-title { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--tc, #f97316); margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { background: var(--bg); border: 1px solid var(--border2); border-radius: 4px; padding: 4px 10px; font-size: 11px; color: var(--muted); line-height: 1.5; }
.chip.empty { color: var(--dim); font-style: italic; }
.attendee-tag { background: color-mix(in srgb, var(--tc, #f97316) 12%, transparent); border: 1px solid color-mix(in srgb, var(--tc, #f97316) 25%, transparent); border-radius: 20px; padding: 3px 12px; font-size: 11px; color: var(--tc, #f97316); }
.attendees-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }

/* note textarea */
.note-area { width: 100%; background: var(--bg); border: 1px solid var(--border2); border-radius: 7px; padding: 14px; font-size: 12px; line-height: 1.8; color: var(--muted); white-space: pre-wrap; font-family: 'DM Mono', monospace; resize: vertical; outline: none; transition: border .2s; min-height: 140px; }
.note-area:focus { border-color: var(--orange); }

/* copy block */
.copy-block { position: relative; }
.copy-area { width: 100%; background: var(--bg); border: 1px solid var(--border2); border-radius: 7px; padding: 14px 14px 40px; font-size: 11px; line-height: 1.9; color: var(--muted); white-space: pre-wrap; font-family: 'DM Mono', monospace; resize: vertical; outline: none; transition: border .2s; min-height: 200px; }
.copy-btn { position: absolute; bottom: 8px; right: 8px; background: var(--border2); border: none; border-radius: 5px; padding: 5px 12px; font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted); cursor: pointer; transition: all .2s; }
.copy-btn:hover { background: var(--dim); color: var(--text); }
.copy-btn.copied { background: rgba(52,211,153,.15); color: var(--green); }

/* push targets */
.push-row { display: flex; gap: 8px; margin-bottom: 20px; }
.push-target { flex: 1; background: var(--bg); border: 1px solid var(--border2); border-radius: 7px; padding: 10px 8px; text-align: center; }
.push-target .pt-icon { font-size: 18px; display: block; margin-bottom: 4px; }
.push-target .pt-label { font-size: 10px; color: var(--dim); }

/* result */
.result-box { background: rgba(52,211,153,.04); border: 1px solid rgba(52,211,153,.2); border-radius: 7px; padding: 14px; font-size: 12px; color: #6ee7b7; line-height: 1.8; white-space: pre-wrap; margin-bottom: 20px; max-height: 220px; overflow-y: auto; }

/* done */
.done-icon { font-size: 40px; text-align: center; margin-bottom: 10px; }
.done-title { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 600; color: var(--green); text-align: center; }
.done-sub { font-size: 11px; color: var(--dim); text-align: center; margin-top: 4px; margin-bottom: 20px; }

.divider { height: 1px; background: var(--border); margin: 20px 0; }
.fade-in { animation: fi .35s ease; }
@keyframes fi { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.ctype-badge { display: inline-block; background: color-mix(in srgb, var(--tc, #f97316) 12%, transparent); border: 1px solid color-mix(in srgb, var(--tc, #f97316) 25%, transparent); border-radius: 4px; padding: 2px 8px; font-size: 10px; color: var(--tc, #f97316); margin-left: 8px; vertical-align: middle; }
.section-note { font-size: 11px; color: var(--dim); font-style: italic; margin-bottom: 8px; }
`;

export default function App() {
  const [step, setStep] = useState("input");
  const [callType, setCallType] = useState("first_demo");
  const [email, setEmail] = useState("");
  const [fileName, setFileName] = useState("");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [onboardingText, setOnboardingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [loadingSub, setLoadingSub] = useState("");
  const [error, setError] = useState("");
  const [pushResult, setPushResult] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef();

  const tc = CALL_TYPES[callType].color;
  const stepIndex = { input:0, processing:1, review:1, pushing:2, done:2 }[step] ?? 0;

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFileName(f.name);
    const r = new FileReader();
    r.onload = ev => setTranscript(ev.target.result);
    r.readAsText(f);
  };

  const canProcess = email.trim().includes("@") && transcript.trim().length > 50;

  const processTranscript = async () => {
    setError(""); setLoading(true); setStep("processing");
    const prompts = { first_demo: FIRST_DEMO_PROMPT, onboarding: ONBOARDING_PROMPT, followup: FOLLOWUP_PROMPT };
    setLoadingMsg("Reading transcript"); setLoadingSub("Extracting insights with Claude…");
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL, max_tokens: 1000,
          messages: [{ role: "user", content: `${prompts[callType]}\n\nTranscript:\n${transcript}` }]
        })
      });
      const data = await res.json();
      const raw = data.content?.map(b => b.text||"").join("").replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(raw);
      setSummary(parsed);

      if (callType === "first_demo") setNoteText(buildFirstDemoNote(parsed));
      else if (callType === "onboarding") {
        setNoteText(buildOnboardingNote(parsed));
        setOnboardingText(buildOnboardingObjectText(parsed));
      }
      else setNoteText(buildFollowupNote(parsed));

      setStep("review");
    } catch(e) {
      setError("Could not process transcript. Please check the file and try again.");
      setStep("input");
    } finally { setLoading(false); }
  };

  const pushToHubspot = async () => {
    setLoading(true); setStep("pushing");
    setLoadingMsg("Updating HubSpot");
    setLoadingSub("Finding contact → company → latest deal…");

    let instruction = "";
    if (callType === "first_demo") {
      const mods = summary?.technicalClosureModules?.join(";") || "";
      const submods = summary?.technicalClosureSubModules?.join(";") || "";
      instruction = `Using HubSpot tools, do the following in order:
1. Search for the contact with email "${email}"
2. Find their associated company
3. Find all deals associated with that contact — pick the most recently updated one
4. Create a note with this EXACT content on all three (contact, company, and deal):
${noteText}
5. Update the deal with these fields:
   - first_demo_date: ${summary?.callDate || new Date().toISOString().split("T")[0]}
   - technical_closure_module: ${mods}
   - technical_closure_sub_module: ${submods}
   - technical_closure_details: ${summary?.technicalClosureDetails || ""}
After completing, confirm: contact name, company name, deal name, note IDs, and deal fields updated.`;
    } else if (callType === "onboarding") {
      instruction = `Using HubSpot tools, do the following in order:
1. Search for the contact with email "${email}"
2. Find their associated company
3. Find all deals associated with that contact — pick the most recently updated one
4. Create a note with this EXACT content on all three (contact, company, and deal):
${noteText}
After completing, confirm: contact name, company name, deal name, and note IDs.`;
    } else {
      if (!summary?.hasTechnicalItems) {
        setPushResult("No technical items found — note not pushed as there was nothing to record.");
        setStep("done");
        setLoading(false);
        return;
      }
      instruction = `Using HubSpot tools, do the following in order:
1. Search for the contact with email "${email}"
2. Find their associated company
3. Find all deals associated with that contact — pick the most recently updated one
4. Create a note with this EXACT content on all three (contact, company, and deal):
${noteText}
After completing, confirm: contact name, company name, deal name, and note IDs.`;
    }

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL, max_tokens: 1000,
          messages: [{ role: "user", content: instruction }],
          mcp_servers: [HUBSPOT_MCP]
        })
      });
      const data = await res.json();
      const txt = data.content?.filter(b=>b.type==="text").map(b=>b.text).join("\n");
      setPushResult(txt || "Done! HubSpot updated successfully.");
      setStep("done");
    } catch(e) {
      setError("HubSpot push failed: " + e.message);
      setStep("review");
    } finally { setLoading(false); }
  };

  const copyOnboarding = () => {
    navigator.clipboard.writeText(onboardingText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setStep("input"); setSummary(null); setNoteText(""); setOnboardingText("");
    setEmail(""); setFileName(""); setTranscript(""); setPushResult(""); setError(""); setCopied(false);
  };

  const steps = ["Setup", "Review", "Done"];

  const SectionChips = ({ title, items, color, emptyMsg }) => (
    <div className="section-block" style={{"--tc": color}}>
      <div className="section-title">{title}</div>
      <div className="chips">
        {items?.length ? items.map((it,i)=><span key={i} className="chip">{it}</span>) : <span className="chip empty">{emptyMsg||"None found"}</span>}
      </div>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* Header */}
        <div className="hdr">
          <div className="hdr-eye">SuperOps CRM Automation</div>
          <h1>Clari → HubSpot</h1>
          <p>Paste a transcript. Get notes, dates, and deal fields updated — zero HubSpot visits.</p>
        </div>

        {/* Progress */}
        <div className="progress">
          {steps.map((s, i) => (
            <>
              <div className="prog-step" key={s}>
                <div className={`prog-dot ${i < stepIndex ? "done" : i === stepIndex ? "active" : ""}`}>
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                <div className="prog-label">{s}</div>
              </div>
              {i < steps.length - 1 && <div className={`prog-line ${i < stepIndex ? "done" : ""}`} key={`line-${i}`} />}
            </>
          ))}
        </div>

        <div className="card">
          <div className="card-body">

            {/* ── INPUT ── */}
            {step === "input" && (
              <div className="fade-in">
                {error && <div className="error-box">{error}</div>}

                <div className="field">
                  <label>Call Type</label>
                  <div className="type-grid">
                    {Object.entries(CALL_TYPES).map(([key, ct]) => (
                      <button key={key} className={`type-btn ${callType===key?"active":""}`}
                        style={{"--tc": ct.color}} onClick={() => setCallType(key)}>
                        <div className="type-icon" style={{color: callType===key ? ct.color : "var(--dim)"}}>{ct.icon}</div>
                        <div className="type-label">{ct.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label>Contact Email</label>
                  <input type="email" placeholder="customer@company.com" value={email} onChange={e=>setEmail(e.target.value)} />
                </div>

                <div className="field">
                  <label>Clari Transcript (.txt)</label>
                  <input type="file" accept=".txt" ref={fileRef} style={{display:"none"}} onChange={handleFile} />
                  <div className={`upload-zone ${fileName?"filled":""}`} onClick={()=>fileRef.current.click()}>
                    <div className="uz-icon">{fileName ? "✓" : "↑"}</div>
                    <div className="uz-text" style={{color: fileName ? "var(--green)" : "var(--muted)"}}>
                      {fileName ? "Transcript loaded" : "Click to upload .txt file"}
                    </div>
                    {fileName && <div className="uz-name">{fileName}</div>}
                    {!fileName && <div className="uz-text" style={{marginTop:4, fontSize:11}}>Download TXT from Clari and drop here</div>}
                  </div>
                </div>

                <button className="btn btn-orange" disabled={!canProcess} onClick={processTranscript}>
                  Process Transcript →
                </button>
              </div>
            )}

            {/* ── LOADING ── */}
            {(step==="processing"||step==="pushing") && (
              <div className="loading fade-in">
                <div className="spinner" style={{"--tc": tc}}></div>
                <div className="loading-msg">{loadingMsg}<span style={{animation:"dots 1.5s steps(4,end) infinite"}}></span></div>
                <div className="loading-sub">{loadingSub}</div>
                <style>{`@keyframes dots{0%,20%{content:'.'}40%{content:'..'}60%{content:'...'}80%,100%{content:''}}`}</style>
              </div>
            )}

            {/* ── REVIEW ── */}
            {step==="review" && summary && (
              <div className="fade-in">
                {error && <div className="error-box">{error}</div>}

                <div style={{display:"flex", alignItems:"center", marginBottom:16}}>
                  <span style={{fontFamily:"Outfit",fontSize:14,fontWeight:600,color:"#eef2ff"}}>
                    {CALL_TYPES[callType].label}
                  </span>
                  {callType==="onboarding" && summary.customerType && (
                    <span className="ctype-badge" style={{"--tc": "var(--cyan)"}}>
                      {summary.customerType==="MSP" ? "MSP Edition" : "Internal IT"}
                    </span>
                  )}
                </div>

                {summary.attendees?.length > 0 && (
                  <div className="attendees-row">
                    {summary.attendees.map((a,i) => <span key={i} className="attendee-tag" style={{"--tc":tc}}>{a}</span>)}
                  </div>
                )}

                {/* First Demo sections */}
                {callType==="first_demo" && <>
                  <SectionChips title="Pain Points" items={summary.painPoints} color="#f87171" />
                  <SectionChips title="Solution & Workarounds Offered" items={summary.solutionAndWorkarounds} color="#fb923c" />
                  <SectionChips title="Positives" items={summary.positives} color="#34d399" />
                  <SectionChips title="Features Requested" items={summary.featuresRequested} color="#60a5fa" />
                  <SectionChips title="Technical Closure Modules" items={summary.technicalClosureModules} color="#f97316" emptyMsg="None identified" />
                  <SectionChips title="Technical Closure Sub-Modules" items={summary.technicalClosureSubModules} color="#fb923c" emptyMsg="None identified" />
                  {summary.technicalClosureDetails && (
                    <div className="section-block">
                      <div className="section-title" style={{color:"#f97316"}}>Technical Closure Details</div>
                      <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.7,background:"var(--bg)",padding:"10px 12px",borderRadius:6,border:"1px solid var(--border2)"}}>{summary.technicalClosureDetails}</div>
                    </div>
                  )}
                  {summary.callDate && (
                    <div style={{fontSize:11,color:"var(--dim)",marginBottom:16}}>📅 First Demo Date to set: <span style={{color:"var(--orange)"}}>{summary.callDate}</span></div>
                  )}
                </>}

                {/* Onboarding sections */}
                {callType==="onboarding" && <>
                  <SectionChips title="Items Configured" items={summary.itemsConfigured} color="var(--cyan)" emptyMsg="None recorded" />
                  <div className="divider" />
                  <div className="section-block">
                    <div className="section-title" style={{color:"var(--cyan)"}}>Onboarding Object — Copy & Paste into HubSpot</div>
                    <div className="section-note">Claude has answered all {summary.customerType==="MSP"?"25":"14"} questions from the transcript. Copy and paste into the card.</div>
                    <div className="copy-block">
                      <textarea className="copy-area" value={onboardingText} onChange={e=>setOnboardingText(e.target.value)} rows={14} readOnly />
                      <button className={`copy-btn ${copied?"copied":""}`} onClick={copyOnboarding}>
                        {copied ? "✓ Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                </>}

                {/* Followup sections */}
                {callType==="followup" && (
                  summary.hasTechnicalItems
                    ? <SectionChips title="Technical Discussion Items" items={summary.technicalDiscussionItems} color="var(--violet)" />
                    : <div style={{fontSize:12,color:"var(--dim)",padding:"12px 0"}}>No technical items discussed in this call. Note will not be pushed.</div>
                )}

                <div className="divider" />

                <div className="field">
                  <label>Note Preview — Edit Before Pushing</label>
                  <textarea className="note-area" value={noteText} onChange={e=>setNoteText(e.target.value)} rows={callType==="onboarding"?6:9} />
                </div>

                <div className="push-row">
                  {[["👤","Contact"],["🏢","Company"],["💼","Latest Deal"]].map(([icon,label])=>(
                    <div key={label} className="push-target">
                      <span className="pt-icon">{icon}</span>
                      <span className="pt-label">{label}</span>
                    </div>
                  ))}
                  {callType==="first_demo" && (
                    <div className="push-target">
                      <span className="pt-icon">📅</span>
                      <span className="pt-label">Demo Date</span>
                    </div>
                  )}
                </div>

                <button className="btn btn-green" onClick={pushToHubspot}
                  disabled={callType==="followup" && !summary?.hasTechnicalItems}>
                  {callType==="followup" && !summary?.hasTechnicalItems ? "Nothing to Push" : "Push to HubSpot →"}
                </button>
                <button className="btn btn-ghost" onClick={reset}>← Start Over</button>
              </div>
            )}

            {/* ── DONE ── */}
            {step==="done" && (
              <div className="fade-in">
                <div className="done-icon">✓</div>
                <div className="done-title">HubSpot Updated</div>
                <div className="done-sub">Contact · Company · Latest Deal — all updated</div>
                <div className="result-box">{pushResult}</div>
                {callType==="onboarding" && onboardingText && (
                  <>
                    <div style={{fontSize:11,color:"var(--dim)",marginBottom:8}}>Don't forget to paste the Onboarding Object answers into HubSpot:</div>
                    <div className="copy-block" style={{marginBottom:16}}>
                      <textarea className="copy-area" value={onboardingText} readOnly rows={8} />
                      <button className={`copy-btn ${copied?"copied":""}`} onClick={copyOnboarding}>
                        {copied ? "✓ Copied!" : "Copy"}
                      </button>
                    </div>
                  </>
                )}
                <button className="btn btn-orange" onClick={reset}>Log Another Call →</button>
              </div>
            )}

          </div>
        </div>

        <div style={{marginTop:20,fontSize:10,color:"var(--border2)",letterSpacing:".1em"}}>
          POWERED BY {MODEL.toUpperCase()} · HUBSPOT MCP
        </div>
      </div>
    </>
  );
}
