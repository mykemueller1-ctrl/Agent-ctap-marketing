import "./styles.css";
import {
  buildInsights,
  displayWindow,
  firstName,
  formatPrettyDate,
  parseWideScheduleCsv,
  type Assignment,
  type ParsedSchedule,
  type ShiftInsight,
} from "./parseSchedule";

const STATION_ORDER = ["BAR SIDE", "BAR SERVER", "WAITRESS", "PIZZA SIDE"];

const TIMES = [
  "Open",
  "7:30 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "2:00 PM",
  "4:00 PM",
  "5:00 PM",
  "10:00 PM",
  "11:00 PM",
  "12:00 AM",
  "Close",
  "RO",
];

let parsed: ParsedSchedule;
let selectedDate = "";
let extra: Assignment[] = [];
let toast = "";

function allAssignments(): Assignment[] {
  return [...parsed.assignments, ...extra];
}

function currentDay(): Assignment[] {
  return allAssignments().filter(a => a.date === selectedDate);
}

function render(): void {
  const app = document.querySelector("#app");
  if (!app) return;
  const dayAssignments = currentDay();
  const insights = buildInsights({
    ...parsed,
    assignments: allAssignments(),
  });
  const dayInsights = insights.filter(i => i.date === selectedDate);
  const next = insights[0];

  app.innerHTML = `
    <header class="topbar">
      <div>
        <div class="mark">Never 86<span>'d</span></div>
        <div class="meta">Community Tap & Pizza · Fort Dodge</div>
      </div>
      <div class="seat-pill"><span class="dot"></span> Owner seat · <b>Myke Mueller</b></div>
    </header>

    <section class="hero">
      <div class="kicker">First seat in action — Shift</div>
      <h1>${next ? next.title : "This week's floor is posted."}</h1>
      <p>${
        next
          ? next.detail + " Pulled from the live CTAP BAR SCHEDULE sheet in Drive — no 7shifts, no HotSchedules."
          : "Bar crew week is loaded from Google Drive."
      }</p>
    </section>

    <nav class="seats">
      <button class="seat active" data-seat="shift">
        <div class="label">Seat 01</div>
        <div class="name">Shift</div>
        <div class="state">Live</div>
      </button>
      <button class="seat soon" disabled>
        <div class="label">Seat 02</div>
        <div class="name">Sales</div>
        <div class="state">Next — PDQ Z</div>
      </button>
      <button class="seat soon" disabled>
        <div class="label">Seat 03</div>
        <div class="name">Buy</div>
        <div class="state">Next — liquor sheet</div>
      </button>
      <button class="seat soon" disabled>
        <div class="label">Seat 04</div>
        <div class="name">Invoices</div>
        <div class="state">Next — Humes / PFS</div>
      </button>
    </nav>

    <div class="layout">
      <aside class="panel">
        <h2>Next action</h2>
        ${
          dayInsights.length
            ? dayInsights.map(insightCard).join("")
            : `<div class="insight"><b>Floor looks covered</b><span>No holes on ${formatPrettyDate(selectedDate)}.</span></div>`
        }
        <h2 style="margin-top:18px">This week</h2>
        <div class="meta">${parsed.weekStart} → ${parsed.weekEnd} · ${parsed.employees.length} people · Bar Crew</div>
        ${insights.slice(0, 6).map(insightCard).join("")}
      </aside>
      <section class="panel">
        <h2>Posted week</h2>
        <div class="days">
          ${parsed.dates
            .map(
              date =>
                `<button class="day-btn ${date === selectedDate ? "active" : ""}" data-date="${date}">${formatPrettyDate(date)}</button>`
            )
            .join("")}
        </div>
        <div class="board">
          ${STATION_ORDER.map(stationCol).join("")}
          ${unassignedCol(dayAssignments)}
        </div>
        <div class="actions">
          <label class="file-btn">Upload week CSV
            <input id="csv" type="file" accept=".csv,text/csv" hidden />
          </label>
          <button id="copy-sun">Copy Sunday onto Monday</button>
        </div>
        <h2>Quick assign</h2>
        <div class="quick">
          <select id="qa-name">${parsed.employees.map(e => `<option>${e}</option>`).join("")}</select>
          <select id="qa-station">${STATION_ORDER.map(s => `<option>${s}</option>`).join("")}</select>
          <select id="qa-start">${TIMES.map(t => `<option>${t}</option>`).join("")}</select>
          <select id="qa-end">${TIMES.map(t => `<option ${t === "Close" ? "selected" : ""}>${t}</option>`).join("")}</select>
          <button class="primary" id="qa-save">Save</button>
        </div>
        ${toast ? `<div class="toast">${toast}</div>` : ""}
      </section>
    </div>
  `;

  app.querySelectorAll<HTMLButtonElement>(".day-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedDate = btn.dataset.date ?? selectedDate;
      toast = "";
      render();
    });
  });

  const file = app.querySelector<HTMLInputElement>("#csv");
  file?.addEventListener("change", async () => {
    const picked = file.files?.[0];
    if (!picked) return;
    const text = await picked.text();
    parsed = parseWideScheduleCsv(text, "Bar Crew");
    extra = [];
    selectedDate = parsed.dates[0] ?? selectedDate;
    toast = `Loaded ${picked.name} · ${parsed.assignments.length} assignments`;
    render();
  });

  app.querySelector("#copy-sun")?.addEventListener("click", () => {
    const source = parsed.dates[0];
    const target = parsed.dates[1];
    if (!source || !target) return;
    const copies = allAssignments()
      .filter(a => a.date === source && !a.flags.requestedOff)
      .map(a => ({ ...a, date: target }));
    extra = extra.concat(copies);
    selectedDate = target;
    toast = `Copied ${copies.length} Sunday shifts onto Monday.`;
    render();
  });

  app.querySelector("#qa-save")?.addEventListener("click", () => {
    const employee = value("#qa-name");
    const station = value("#qa-station");
    const startRaw = value("#qa-start");
    const endRaw = value("#qa-end");
    const row = `${employee},${isoToSlash(selectedDate)},${startRaw},${endRaw},${station}`;
    const header =
      "employee,date,start time,end time,station";
    const oneDay = parseWideScheduleCsv(`${header}\n${row}`, parsed.department);
    extra = extra.concat(oneDay.assignments);
    toast = `Posted ${firstName(employee)} ${startRaw}–${endRaw} on ${station}.`;
    render();
  });
}

function insightCard(insight: ShiftInsight): string {
  return `<div class="insight ${insight.kind}"><b>${insight.title}</b><span>${insight.detail}</span></div>`;
}

function stationCol(station: string): string {
  const cards = currentDay().filter(a => a.station === station);
  return `<div class="station"><h3>${station}</h3>${
    cards.length ? cards.map(shiftCard).join("") : `<div class="empty">Nobody posted</div>`
  }</div>`;
}

function unassignedCol(day: Assignment[]): string {
  const cards = day.filter(a => !a.station);
  if (!cards.length) return "";
  return `<div class="station"><h3>UNASSIGNED</h3>${cards.map(shiftCard).join("")}</div>`;
}

function shiftCard(a: Assignment): string {
  const flags = [
    a.flags.opens ? "Open" : "",
    a.flags.firstCut ? "First cut" : "",
    a.flags.closes ? "Close" : "",
    a.flags.requestedOff ? "RO" : "",
    a.incomplete ? "Needs times" : "",
    a.hours ? `${a.hours}h` : "",
  ].filter(Boolean);
  return `<article class="card"><div class="who">${a.employee}</div><div class="when">${displayWindow(a)}</div><div class="flags">${flags
    .map(f => `<span class="flag">${f}</span>`)
    .join("")}</div></article>`;
}

function value(sel: string): string {
  return (document.querySelector(sel) as HTMLSelectElement).value;
}

function isoToSlash(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}/${y}`;
}

async function boot(): Promise<void> {
  const csv = await fetch("/data/ctap-bar-schedule.csv").then(r => r.text());
  parsed = parseWideScheduleCsv(csv, "Bar Crew");
  selectedDate = parsed.dates[0] ?? "";
  render();
}

void boot();
