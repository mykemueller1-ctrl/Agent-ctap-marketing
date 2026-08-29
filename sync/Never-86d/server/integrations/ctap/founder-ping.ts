/**
 * Standing autonomy for Community Tap & Pizza / Never 86'd.
 *
 * Agents use every connected tool. They do not ask Myke Mueller for permission
 * to work. They ping him only when the next move is founder judgment or
 * vertical restaurant expertise that is not already locked in this tree.
 *
 * Access holes (Gmail OAuth, Render key, Document AI, Cloud Chrome ≠ laptop)
 * are setup actions — not founder questions. Do not dress them up as "does
 * this night look right."
 */

export const FOUNDER = {
  id: "myke",
  name: 'Mychael "Myke" Mueller',
  title: "Founder / owner-operator",
  mailbox: "communitypizza2026@gmail.com",
  productMailbox: "myke@n86.app",
} as const;

export type AgentClass = "autonomous" | "ping_founder" | "access_block";

export type AgentTopic = {
  id: string;
  class: AgentClass;
  title: string;
  do: string;
  cannot: string;
};

/** Work the agent finishes without pinging Myke. */
export const AUTONOMOUS_WORK: AgentTopic[] = [
  {
    id: "parse_z",
    class: "autonomous",
    title: "Parse the PDQ Z we already have",
    do: "pdq-z-report-v2 + npm run close. Large Pizza rolls into Food.",
    cannot: "Invent a Z for a date Drive does not have.",
  },
  {
    id: "nightly_loop",
    class: "autonomous",
    title: "Run the nightly loop",
    do: "npm run nightly. Write the close card. Leave Kenzy out-front / Tom back.",
    cannot: "Make Connect Gmail the next human.",
  },
  {
    id: "portal_build_test",
    class: "autonomous",
    title: "Owner portal, tests, build",
    do: "npm test · npm run portal · npm run build. Bind 0.0.0.0:5173.",
    cannot: "Claim a public Render URL without HTTP 200.",
  },
  {
    id: "drive_read",
    class: "autonomous",
    title: "Read communitypizza Drive",
    do: "Sheets, HEICs, menus, schedules that are already there.",
    cannot: "Dump liquor unit prices into git.",
  },
  {
    id: "kenzy_hyvee_path",
    class: "autonomous",
    title: "Kenzy one-tap Hy-Vee path",
    do: "Qty + SEND on the sheet. Myke stays out of the liquor email loop.",
    cannot: "Invent Config B1 if it is blank. Re-send the 8/24 order.",
  },
  {
    id: "catalog_evidence",
    class: "autonomous",
    title: "Catalog invoice photos and Zs that exist",
    do: "Wire Drive file IDs. Book Sun–Sat week windows only.",
    cannot: "OCR totals without Document AI. Invent handwritten dollars.",
  },
  {
    id: "locked_library",
    class: "autonomous",
    title: "Apply the locked specials library",
    do: "Tuesday Smash $11.99 BOGO. Thursday medium pizza $17.99 — GOES UP Thursday, never Wednesday.",
    cannot: "Change those prices. Invent Tom food or a football promo.",
  },
  {
    id: "use_tools",
    class: "autonomous",
    title: "Use every connected tool",
    do: "Drive, Render, computer on THIS Cloud VM, git, tests. Standing permission.",
    cannot: "Treat laptop Chrome as this VM's Chrome. Commit secrets.",
  },
];

/** Only these are a ping to Myke. Human logic + vertical expertise. */
export const FOUNDER_PINGS: AgentTopic[] = [
  {
    id: "two_house_or_prime",
    class: "ping_founder",
    title: "Two-house or prime close",
    do: "Food + beer/liquor both missing, or more than one rail moved. That is Myke's book.",
    cannot: "Hand Kenzy and Tom competing verdicts for one night.",
  },
  {
    id: "invent_operator_fact",
    class: "ping_founder",
    title: "A fact that is not in Drive or this tree",
    do: "Tom's food special, football promo dollars, kitchen/driver TIMES, new crew on/off floor, Hy-Vee Wine email if Config B1 is blank.",
    cannot: "Invent it so the calendar or order guide looks finished.",
  },
  {
    id: "change_locked_rails",
    class: "ping_founder",
    title: "Change a locked rail or locked special",
    do: "Food <30% · Beer <21% · Liquor <20% · Labor <28%. Smash $11.99. Thursday pizza $17.99.",
    cannot: "Rewrite rails or specials from one night or a proposed menu doc.",
  },
  {
    id: "outbound_send",
    class: "ping_founder",
    title: "A send that is not Kenzy's one-tap",
    do: "Humes / PFG / customer / Gronk replies still need a human approve. Kenzy SEND on the sheet is her tap, not Myke's.",
    cannot: "Auto-send vendor or hunter mail. Re-send the 8/24 mailbox switches.",
  },
  {
    id: "never86_product",
    class: "ping_founder",
    title: "Never 86'd product or ICP judgment",
    do: "What we sell, what we charge, who we hunt. 1–3 unit owner-operator. Beat MarginEdge on next action.",
    cannot: "Invent a second brand or a Command pitch for a 1-unit store.",
  },
  {
    id: "verbal_yes",
    class: "ping_founder",
    title: "Someone said the night looks right",
    do: "Verbal yes does not close. Need a Z, invoice, or deposit.",
    cannot: "Close a ticket because it sounded fine.",
  },
];

/** Machine holes. Request setup. Do not ping as founder expertise. */
export const ACCESS_BLOCKS: AgentTopic[] = [
  {
    id: "gmail_mcp",
    class: "access_block",
    title: "Gmail MCP",
    do: "Connect as communitypizza2026@gmail.com in Cursor Desktop. Nightly PDQ / PFG / Humes live there.",
    cannot: "Stall the loop waiting. Use the Z already on disk.",
  },
  {
    id: "render_key",
    class: "access_block",
    title: "Render workspace / API key",
    do: "RENDER_API_KEY or Blueprint while logged into dashboard.render.com. This VM Chrome is not laptop Chrome.",
    cannot: "Claim ctap-owner-portal.onrender.com is live on a 404.",
  },
  {
    id: "document_ai",
    class: "access_block",
    title: "Document AI processor",
    do: "DOCUMENT_AI_PROJECT_ID · LOCATION · PROCESSOR_ID. Until then 32 HEICs stay photo chips.",
    cannot: "Type invoice totals from memory.",
  },
  {
    id: "cloud_chrome",
    class: "access_block",
    title: "Cloud Agent Chrome vs laptop Chrome",
    do: "Sign into Google / Render / GitHub in the Chrome this agent controls, or paste keys.",
    cannot: "Assume a laptop login landed on this VM.",
  },
];

const ALL_TOPICS: AgentTopic[] = [
  ...AUTONOMOUS_WORK,
  ...FOUNDER_PINGS,
  ...ACCESS_BLOCKS,
];

const ALIASES: Record<string, string> = {
  z: "parse_z",
  close: "parse_z",
  nightly: "nightly_loop",
  portal: "portal_build_test",
  drive: "drive_read",
  hyvee: "kenzy_hyvee_path",
  liquor: "kenzy_hyvee_path",
  invoices: "catalog_evidence",
  smash: "locked_library",
  pizza: "locked_library",
  tools: "use_tools",
  computer: "use_tools",
  prime: "two_house_or_prime",
  "two-house": "two_house_or_prime",
  tom_food: "invent_operator_fact",
  football: "invent_operator_fact",
  kitchen_times: "invent_operator_fact",
  config_b1: "invent_operator_fact",
  rails: "change_locked_rails",
  send: "outbound_send",
  humes: "outbound_send",
  icp: "never86_product",
  verbal: "verbal_yes",
  gmail: "gmail_mcp",
  render: "render_key",
  ocr: "document_ai",
  chrome: "cloud_chrome",
};

export function topicById(id: string): AgentTopic | undefined {
  const key = ALIASES[id] ?? id;
  return ALL_TOPICS.find(t => t.id === key);
}

export function classifyAgentAsk(id: string): AgentClass {
  const topic = topicById(id);
  if (!topic) {
    // Unknown operator fact → ping. Unknown tooling → try first, then access.
    return "ping_founder";
  }
  return topic.class;
}

export function shouldPingFounder(id: string): boolean {
  return classifyAgentAsk(id) === "ping_founder";
}

export function founderPingCard(): string {
  return [
    `${FOUNDER.name} — ping only for founder judgment.`,
    "Autonomous: parse, nightly, portal, Drive, Kenzy path, catalog evidence, locked library, use tools.",
    "Ping: two-house/prime, invent a missing operator fact, change rails/specials, non-Kenzy sends, Never 86'd product, verbal yes.",
    "Access (not a founder question): Gmail MCP, Render key, Document AI, this VM's Chrome.",
    "Do not invent Tom food, football promos, kitchen/driver times, or Config B1. Do not dump liquor unit prices into git.",
  ].join("\n");
}

export function founderRuleLine(): string {
  return "Agents keep working. Ping Myke Mueller only for founder judgment or a send he must approve.";
}
