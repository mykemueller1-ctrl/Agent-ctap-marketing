import "./styles.css";
import {
  buildInvoiceInsights,
  driveFileUrl,
  photoFilenames,
  sheetRowsForWeek,
  type InvoiceWeekSeed,
} from "./invoiceWeek";
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
import {
  buildBuyInsights,
  combinedTotal,
  withActions,
  type BuyInsight,
  type BuyLine,
  type BuySeed,
} from "./buyWeek";
import {
  buildCalendarInsights,
  smashBurger,
  thursdayPizza,
  type CalendarInsight,
  type CalendarSeed,
} from "./calendarMonth";
import { buildNightlyReport } from "../../sync/Never-86d/server/ctap-loop/nightly";
import { buildMenuInsights, type MenuSeed } from "./menuMove";
import {
  buildSalesInsights,
  money,
  pctLabel,
  rollup,
  type SalesInsight,
  type SalesSeed,
  type ZDay,
} from "./salesWeek";

type DeptId = "bar" | "kitchen" | "drivers";
type SeatId = "shift" | "sales" | "buy" | "invoices" | "calendar";

const STATION_ORDER: Record<DeptId, string[]> = {
  bar: ["BAR SIDE", "BAR SERVER", "WAITRESS", "PIZZA SIDE"],
  kitchen: ["FRY LINE", "PIZZA MAKER", "DISH", "PREP"],
  drivers: ["DRIVER"],
};

const DEPT_LABEL: Record<DeptId, string> = {
  bar: "Bar Crew",
  kitchen: "Kitchen",
  drivers: "Drivers",
};

let barWeek: ParsedSchedule;
let kitchenWeek: ParsedSchedule;
let driverWeek: ParsedSchedule;
let invoiceWeek: InvoiceWeekSeed;
let sales: SalesSeed;
let buy: BuySeed;
let calendar: CalendarSeed;
let menu: MenuSeed;
let selectedDate = "";
let selectedZ = "";
let extra: Assignment[] = [];
let toast = "";
let seat: SeatId = "buy";
let dept: DeptId = "bar";

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

function currentWeek(): ParsedSchedule {
  if (dept === "kitchen") return kitchenWeek;
  if (dept === "drivers") return driverWeek;
  return barWeek;
}

function allAssignments(): Assignment[] {
  const week = currentWeek();
  if (dept !== "bar") return week.assignments;
  return [...week.assignments, ...extra];
}

function currentDay(): Assignment[] {
  return allAssignments().filter(a => a.date === selectedDate);
}

function currentZ(): ZDay | undefined {
  return (
    sales.recentZ.find(d => d.date === selectedZ) ??
    sales.lastCompleteWeek.days.find(d => d.date === selectedZ)
  );
}

function render(): void {
  const app = document.querySelector("#app");
  if (!app) return;

  const shiftInsights = buildInsights({
    ...currentWeek(),
    assignments: allAssignments(),
  });
  const invoiceInsights = buildInvoiceInsights(invoiceWeek, sales.invoiceWeekHasZ);
  const salesInsights = buildSalesInsights(sales);
  const menuInsights = buildMenuInsights(menu);
  const buyInsights = buildBuyInsights(buy);
  const calendarInsights = buildCalendarInsights(calendar);
  const hero = heroCopy(
    shiftInsights[0],
    invoiceInsights[0],
    salesInsights[0],
    buyInsights[0],
    calendarInsights[0]
  );

  app.innerHTML = `
    <header class="topbar">
      <div>
        <div class="mark">Never 86<span>'d</span></div>
        <div class="meta">Community Tap & Pizza · Fort Dodge</div>
      </div>
      <div class="seat-pill"><span class="dot"></span> Owner seat · <b>Myke Mueller</b></div>
    </header>
    ${loopStrip()}

    <section class="hero">
      <div class="kicker">${hero.kicker}</div>
      <h1>${hero.title}</h1>
      <p>${hero.detail}</p>
    </section>

    <nav class="seats">
      ${seatButton("shift", "Seat 01", "Shift", dept === "bar" ? "Live" : "Stale template")}
      ${seatButton("sales", "Seat 02", "Sales", sales.invoiceWeekHasZ ? "Live" : "Z hole · menu proposed")}
      ${seatButton("buy", "Seat 03", "Buy", "Kenzy one-tap")}
      ${seatButton("invoices", "Seat 04", "Invoices", "32 Drive links")}
      ${seatButton("calendar", "Seat 05", "Calendar", "Smash $11.99 · Thu pizza")}
    </nav>

    ${seat === "shift" ? shiftLayout(shiftInsights) : ""}
    ${seat === "sales" ? salesLayout(salesInsights, menuInsights) : ""}
    ${seat === "buy" ? buyLayout(buyInsights) : ""}
    ${seat === "invoices" ? invoicesLayout(invoiceInsights) : ""}
    ${seat === "calendar" ? calendarLayout(calendarInsights) : ""}
  `;

  bindNav();
  if (seat === "shift") bindShift();
  if (seat === "sales") bindSales();
}

function heroCopy(
  shiftNext: ShiftInsight | undefined,
  invoiceNext: ReturnType<typeof buildInvoiceInsights>[0] | undefined,
  salesNext: SalesInsight | undefined,
  buyNext: BuyInsight | undefined,
  calendarNext: CalendarInsight | undefined
) {
  if (seat === "buy") {
    return {
      kicker: "Kenzy one-tap · Myke out",
      title: buyNext?.title ?? "Kenzy one-tap Hy-Vee. Myke is out of the loop.",
      detail:
        "8/23 Drive sheet. Names, par, qty only. Unit costs stay in Drive. Kenzy checks SEND. I am not emailing Hy-Vee the par-fill.",
    };
  }
  if (seat === "calendar") {
    const smash = smashBurger(calendar);
    const pizza = thursdayPizza(calendar);
    return {
      kicker: "September 2026 — Calendar",
      title: calendarNext?.title ?? "Draft month. Humes stays unsent.",
      detail: `Smash Burger $${smash?.price ?? "11.99"} Tuesday. ${pizza?.name ?? "Any Medium Pizza"} GOES UP Thursday. Kenzy drink · Tom food. Only Myke can release Humes.`,
    };
  }
  if (seat === "invoices") {
    return {
      kicker: "Remembered from last week — Invoices",
      title: invoiceNext?.title ?? "Last week's invoice photos are in Drive.",
      detail:
        "Food order list is the 32 HEICs. Each chip opens Drive. No Sysco/NL standing guide. Photos stay photo_ocr — Document AI is not live.",
    };
  }
  if (seat === "sales") {
    return {
      kicker: "Remembered from last week — Sales",
      title: salesNext?.title ?? "Sales denominator is the Z-report.",
      detail:
        "Drive still has no Aug 16–22 Z-reports. Menu price move is PROPOSED, not in POS. Showing 7/15–7/16/2026 and the Sept 2025 week.",
    };
  }
  const week = currentWeek();
  return {
    kicker: `Shift — ${DEPT_LABEL[dept]}`,
    title: shiftNext ? shiftNext.title : "This week's floor is posted.",
    detail: shiftNext
      ? shiftNext.detail
      : `${week.employees.length} people loaded from Google Drive.`,
  };
}

function seatButton(
  id: SeatId,
  label: string,
  name: string,
  state: string,
  disabled = false
): string {
  const active = id === seat;
  return `<button class="seat ${active ? "active" : ""} ${disabled ? "soon" : ""}" data-seat="${id}" ${
    disabled ? "disabled" : ""
  }>
      <div class="label">${label}</div>
      <div class="name">${name}</div>
      <div class="state">${state}</div>
    </button>`;
}

function bindNav(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-seat]").forEach(btn => {
    if (btn.disabled) return;
    btn.addEventListener("click", () => {
      const next = btn.dataset.seat as SeatId;
      if (
        next === "shift" ||
        next === "sales" ||
        next === "buy" ||
        next === "invoices" ||
        next === "calendar"
      ) {
        seat = next;
        toast = "";
        render();
      }
    });
  });
}

function shiftLayout(insights: ShiftInsight[]): string {
  const week = currentWeek();
  const dayAssignments = currentDay();
  const dayInsights = insights.filter(i => i.date === selectedDate);
  const stations = STATION_ORDER[dept];
  return `<div class="layout">
      <aside class="panel">
        <h2>Next action</h2>
        ${
          dayInsights.length
            ? dayInsights.map(insightCard).join("")
            : `<div class="insight"><b>Floor looks covered</b><span>No holes on ${formatPrettyDate(selectedDate)}.</span></div>`
        }
        <h2 style="margin-top:18px">This week</h2>
        <div class="meta">${week.weekStart} → ${week.weekEnd} · ${week.employees.length} people · ${DEPT_LABEL[dept]}</div>
        ${insights.slice(0, 6).map(insightCard).join("")}
      </aside>
      <section class="panel">
        <h2>Posted week</h2>
        <div class="days">
          ${(["bar", "kitchen", "drivers"] as DeptId[])
            .map(
              id =>
                `<button class="day-btn ${id === dept ? "active" : ""}" data-dept="${id}">${DEPT_LABEL[id]}</button>`
            )
            .join("")}
        </div>
        <div class="days">
          ${week.dates
            .map(
              date =>
                `<button class="day-btn ${date === selectedDate ? "active" : ""}" data-date="${date}">${formatPrettyDate(date)}</button>`
            )
            .join("")}
        </div>
        <div class="board">
          ${stations.map(stationCol).join("")}
          ${unassignedCol(dayAssignments)}
          ${
            dayAssignments.length === 0
              ? `<div class="station"><h3>ROSTER</h3>${week.employees
                  .map(e => `<article class="card"><div class="who">${e}</div><div class="when">No times posted</div></article>`)
                  .join("")}</div>`
              : ""
          }
        </div>
        <div class="actions">
          <label class="file-btn">Upload week CSV
            <input id="csv" type="file" accept=".csv,text/csv" hidden />
          </label>
          <button id="copy-sun">Copy Sunday onto Monday</button>
        </div>
        <h2>Quick assign</h2>
        <div class="quick">
          <select id="qa-name">${week.employees.map(e => `<option>${e}</option>`).join("")}</select>
          <select id="qa-station">${stations.map(s => `<option>${s}</option>`).join("")}</select>
          <select id="qa-start">${TIMES.map(t => `<option>${t}</option>`).join("")}</select>
          <select id="qa-end">${TIMES.map(t => `<option ${t === "Close" ? "selected" : ""}>${t}</option>`).join("")}</select>
          <button class="primary" id="qa-save">Save</button>
        </div>
        ${toast ? `<div class="toast">${toast}</div>` : ""}
      </section>
    </div>`;
}

function invoicesLayout(
  insights: ReturnType<typeof buildInvoiceInsights>
): string {
  const rows = sheetRowsForWeek(invoiceWeek.weekStart, invoiceWeek.invoiceSheet);
  return `<div class="layout">
      <aside class="panel">
        <h2>Next action</h2>
        ${insights.map(invoiceInsightCard).join("")}
        <h2 style="margin-top:18px">OCR route</h2>
        <div class="meta">sourceKind ${invoiceWeek.sourceKind} · HEIC → Document AI · not live</div>
        <div class="insight"><b>SOPs stay in Drive</b><span>Invoice Sheet for the week · HOW TO INPUT WEEKLY SCHEDULES · CTAP BAR ORDERING DOCS. Portal obeys them; we do not copy the docs into git.</span></div>
      </aside>
      <section class="panel">
        <h2>Invoice sheet cadence · ${invoiceWeek.weekStart} → ${invoiceWeek.weekEnd}</h2>
        <div class="meta">Sunday is the week start. The Drive SOP fills Mon–Fri. Blanks are still blank — photos are the fill.</div>
        <div class="cadence">
          ${rows
            .map(
              row => `<article class="card">
                <div class="who">${row.weekday} · ${row.date}</div>
                <div class="when">${row.vendors.join(" · ")}</div>
              </article>`
            )
            .join("")}
        </div>
        <h2>Photo drop · ${invoiceWeek.driveFolderTitle}</h2>
        <div class="meta">${invoiceWeek.photoCount} files · uploaded ${invoiceWeek.uploadedAt.slice(0, 10)} · ${invoiceWeek.mimeType}</div>
        <div class="photos">${(invoiceWeek.photos.length
          ? invoiceWeek.photos
          : photoFilenames(invoiceWeek.firstPhoto, invoiceWeek.lastPhoto).map(
              name => ({ name, fileId: "" })
            )
        )
          .map(photo =>
            photo.fileId
              ? `<a class="chip" href="${driveFileUrl(photo.fileId)}" target="_blank" rel="noreferrer">${photo.name}</a>`
              : `<span class="chip">${photo.name}</span>`
          )
          .join("")}</div>
        <h2>Out of the book</h2>
        <ul class="sop-list">${invoiceWeek.outOfBook.map(item => `<li>${item}</li>`).join("")}</ul>
      </section>
    </div>`;
}

function salesLayout(
  insights: SalesInsight[],
  menuInsights: ReturnType<typeof buildMenuInsights>
): string {
  const day = currentZ();
  const week = rollup(sales.lastCompleteWeek.days);
  const zDays = [...sales.recentZ, ...sales.lastCompleteWeek.days];
  return `<div class="layout">
      <aside class="panel">
        <h2>Next action</h2>
        ${insights.map(salesInsightCard).join("")}
        ${menuInsights.map(i => `<div class="insight ${i.kind}"><b>${i.title}</b><span>${i.detail}</span></div>`).join("")}
        <h2 style="margin-top:18px">Targets</h2>
        <div class="meta">Labor &lt;28% of sales (from Z). Food &lt;30% · beer &lt;21% · liquor &lt;20% need invoice OCR — cannot close 8/16–8/22 yet.</div>
      </aside>
      <section class="panel">
        <h2>Z nights in Drive</h2>
        <div class="days">
          ${zDays
            .map(
              d =>
                `<button class="day-btn ${d.date === selectedZ ? "active" : ""}" data-z="${d.date}">${d.label}</button>`
            )
            .join("")}
        </div>
        ${day ? zDayPanel(day) : ""}
        <h2>Last complete weekly folder</h2>
        <div class="meta">${sales.lastCompleteWeek.folder} · ${money(week.grandTotal)} sales · labor ${pctLabel(week.labor, week.grandTotal)}</div>
        <div class="metrics">
          <div class="metric"><span>Food sales mix</span><b>${pctLabel(week.foodSales, week.grandTotal)}</b></div>
          <div class="metric"><span>Beer sales mix</span><b>${pctLabel(week.beerSales, week.grandTotal)}</b></div>
          <div class="metric"><span>Liquor sales mix</span><b>${pctLabel(week.liquorSales, week.grandTotal)}</b></div>
          <div class="metric"><span>Labor / sales</span><b>${pctLabel(week.labor, week.grandTotal)}</b></div>
        </div>
        <p class="fine">Sales mix is not cost %. Cost % waits on the 32 photos being OCR'd plus Aug Z-reports.</p>
        <h2>Proposed menu move</h2>
        <div class="meta">${menu.driveTitle} · ${menu.status} · not in POS · effective date blank</div>
        <div class="week-grid">
          ${menu.collisions
            .map(
              item => `<article class="week-day">
                <div class="when">${item.name}</div>
                <div class="who">$${item.current.toFixed(2)} → $${item.proposed.toFixed(2)}</div>
                <div class="flags"><span class="flag">${item.calendar}</span></div>
              </article>`
            )
            .join("")}
        </div>
      </section>
    </div>`;
}

function buyLayout(insights: BuyInsight[]): string {
  const combined = combinedTotal(buy);
  return `<div class="layout">
      <aside class="panel">
        <h2>Next action</h2>
        ${insights.map(buyInsightCard).join("")}
        <h2 style="margin-top:18px">Rails</h2>
        <div class="meta">Beer &lt;21% · liquor &lt;20% of sales. Do not fill par from the guide alone — use POS movement.</div>
      </aside>
      <section class="panel">
        <h2>This week's qty-to-order</h2>
        <div class="meta">${buy.driveTitle} · modified ${buy.modifiedAt} · unit costs stay in Drive</div>
        <div class="metrics">
          <div class="metric"><span>Liquor / wine / cordial</span><b>${money(buy.liquor.total)}</b></div>
          <div class="metric"><span>Beer / kegs</span><b>${money(buy.beer.total)}</b></div>
          <div class="metric"><span>Combined</span><b>${money(combined)}</b></div>
          <div class="metric"><span>Vs $1,400 replacement</span><b>${money(combined - buy.baselineWeeklySpend)} over</b></div>
        </div>
        <div class="order-grid">
          ${orderCol("Send", withActions([...buy.liquor.lines, ...buy.beer.lines]).filter(l => l.action === "send"))}
          ${orderCol("Hold", withActions([...buy.liquor.lines, ...buy.beer.lines]).filter(l => l.action === "hold"))}
        </div>
        <p class="fine">Mixers ordered: ${buy.mixersOrdered}. Sheet over/under: liquor ${money(buy.liquor.overUnder)}, beer ${money(buy.beer.overUnder)}. ${buy.cremeBruleeRow.name} on live sheet · par ${buy.cremeBruleeRow.par} · qty ${buy.cremeBruleeRow.qty}.</p>
      </section>
    </div>`;
}

function orderCol(title: string, lines: Array<BuyLine & { action?: string }>): string {
  return `<div class="order-col">
      <h3>${title}</h3>
      ${lines
        .map(
          line => `<div class="order-row ${line.action ?? ""}">
            <span>${line.name}${line.par != null ? ` · par ${line.par}` : ""}</span>
            <b>${line.action === "hold" ? "HOLD" : "SEND"} ×${line.qty}</b>
          </div>`
        )
        .join("")}
    </div>`;
}

function loopStrip(): string {
  const tagged = withActions([...buy.liquor.lines, ...buy.beer.lines]).filter(
    line => line.qty > 0
  );
  const z = sales.recentZ[0];
  const smash = smashBurger(calendar);
  const pizza = thursdayPizza(calendar);
  const report = buildNightlyReport({
    pdq: z
      ? {
          businessDate: z.date,
          grandTotal: z.grandTotal.toFixed(2),
          laborPct: (z.labor / z.grandTotal) * 100,
        }
      : null,
    buy: {
      sendCount: tagged.filter(line => line.action === "send").length,
      holdCount: tagged.filter(line => line.action === "hold").length,
      combined: combinedTotal(buy),
      mykeInLoop: buy.mykeInLoop,
    },
    calendar: {
      smashPrice: smash?.price ?? "11.99",
      pizzaDay: pizza?.day ?? "Thursday",
      drinkApproved: calendar.drink.approved,
      foodNamed: Boolean(calendar.food.name),
    },
    invoicePhotos: invoiceWeek.photoCount,
    gmailConnected: false,
    ocrConfigured: invoiceWeek.ocrLive,
  });
  return `<div class="loop">${report.steps
    .map(
      step =>
        `<span class="${step.status}" title="${step.detail}">${step.title}</span>`
    )
    .join("")}</div>`;
}

function calendarLayout(insights: CalendarInsight[]): string {
  return `<div class="layout">
      <aside class="panel">
        <h2>Next action</h2>
        ${insights.map(i => `<div class="insight ${i.kind}"><b>${i.title}</b><span>${i.detail}</span></div>`).join("")}
      </aside>
      <section class="panel">
        <h2>${calendar.monthLabel} · ${calendar.status}</h2>
        <div class="meta">${calendar.humesRule}</div>
        <div class="metrics">
          <div class="metric"><span>Drink · Kenzy</span><b>${calendar.drink.name}</b></div>
          <div class="metric"><span>Food · Tom</span><b>${calendar.food.name ?? "Missing"}</b></div>
          <div class="metric"><span>Humes</span><b>Not sent</b></div>
          <div class="metric"><span>Football promos</span><b>Not created</b></div>
        </div>
        <h2>Weekly library</h2>
        <div class="week-grid">
          ${calendar.weekly
            .map(
              item => `<article class="week-day ${item.locked ? "locked" : ""}">
                <div class="when">${item.day}${item.goesUp ? " · GOES UP" : ""}</div>
                <div class="who">${item.name}</div>
                <div class="flags">${item.price ? `<span class="flag">$${item.price}</span>` : ""}${
                  item.poster ? `<span class="flag">Poster</span>` : ""
                }${item.locked ? `<span class="flag">Locked</span>` : ""}</div>
              </article>`
            )
            .join("")}
        </div>
        <h2>Events</h2>
        ${calendar.events
          .map(
            e => `<article class="card"><div class="who">${e.name}</div><div class="when">${e.date} · ${e.status}</div></article>`
          )
          .join("")}
        <h2>Football on the planning screen</h2>
        <p class="fine">Games may show. They are not promotions.</p>
        ${calendar.football.games
          .map(
            g => `<article class="card"><div class="who">${g.label}</div><div class="when">${g.date}</div></article>`
          )
          .join("")}
      </section>
    </div>`;
}

function zDayPanel(day: ZDay): string {
  const labor = pctLabel(day.labor, day.grandTotal);
  return `<div class="metrics">
      <div class="metric"><span>Grand total</span><b>${money(day.grandTotal)}</b></div>
      <div class="metric"><span>Labor</span><b>${money(day.labor)} · ${labor}</b></div>
      <div class="metric"><span>Food sales</span><b>${money(day.foodSales)}</b></div>
      <div class="metric"><span>Beer / liquor</span><b>${money(day.beerSales)} / ${money(day.liquorSales)}</b></div>
    </div>
    ${
      day.channels.length
        ? `<div class="channels">${day.channels
            .map(
              c =>
                `<div class="channel"><span>${c.name}</span><b>${money(c.amount)}</b><i>${pctLabel(c.amount, day.grandTotal)}</i></div>`
            )
            .join("")}</div>`
        : ""
    }
    <div class="meta">Source: ${day.source}${
      day.actualDeposit != null
        ? ` · deposit ${money(day.actualDeposit)} vs expected ${money(day.expectedCash)}`
        : ""
    }</div>`;
}

function insightCard(insight: ShiftInsight): string {
  return `<div class="insight ${insight.kind}"><b>${insight.title}</b><span>${insight.detail}</span></div>`;
}

function invoiceInsightCard(
  insight: ReturnType<typeof buildInvoiceInsights>[0]
): string {
  return `<div class="insight ${insight.kind}"><b>${insight.title}</b><span>${insight.detail}</span></div>`;
}

function salesInsightCard(insight: SalesInsight): string {
  return `<div class="insight ${insight.kind}"><b>${insight.title}</b><span>${insight.detail}</span></div>`;
}

function buyInsightCard(insight: BuyInsight): string {
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

function bindShift(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-dept]").forEach(btn => {
    btn.addEventListener("click", () => {
      dept = (btn.dataset.dept as DeptId) ?? dept;
      extra = [];
      selectedDate = currentWeek().dates[0] ?? "";
      toast = "";
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-date]").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedDate = btn.dataset.date ?? selectedDate;
      toast = "";
      render();
    });
  });

  const file = document.querySelector<HTMLInputElement>("#csv");
  file?.addEventListener("change", async () => {
    const picked = file.files?.[0];
    if (!picked) return;
    const text = await picked.text();
    const loaded = parseWideScheduleCsv(text, DEPT_LABEL[dept]);
    if (dept === "kitchen") kitchenWeek = loaded;
    else if (dept === "drivers") driverWeek = loaded;
    else barWeek = loaded;
    extra = [];
    selectedDate = loaded.dates[0] ?? selectedDate;
    toast = `Loaded ${picked.name} · ${loaded.assignments.length} assignments`;
    render();
  });

  document.querySelector("#copy-sun")?.addEventListener("click", () => {
    const week = currentWeek();
    const source = week.dates[0];
    const target = week.dates[1];
    if (!source || !target) return;
    const copies = allAssignments()
      .filter(
        a =>
          a.date === source &&
          !a.flags.requestedOff &&
          !a.incomplete &&
          (a.start || a.end)
      )
      .map(a => ({ ...a, date: target }));
    extra = extra.concat(copies);
    selectedDate = target;
    toast = `Copied ${copies.length} Sunday shifts onto Monday.`;
    render();
  });

  document.querySelector("#qa-save")?.addEventListener("click", () => {
    const week = currentWeek();
    const employee = value("#qa-name");
    const station = value("#qa-station");
    const startRaw = value("#qa-start");
    const endRaw = value("#qa-end");
    const row = `${employee},${isoToSlash(selectedDate)},${startRaw},${endRaw},${station}`;
    const header = "employee,date,start time,end time,station";
    const oneDay = parseWideScheduleCsv(`${header}\n${row}`, week.department);
    extra = extra.concat(oneDay.assignments);
    toast = `Posted ${firstName(employee)} ${startRaw}–${endRaw} on ${station}.`;
    render();
  });
}

function bindSales(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-z]").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedZ = btn.dataset.z ?? selectedZ;
      render();
    });
  });
}

function value(sel: string): string {
  return (document.querySelector(sel) as HTMLSelectElement).value;
}

function isoToSlash(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}/${y}`;
}

async function boot(): Promise<void> {
  const [barCsv, kitchenCsv, driverCsv, invoiceJson, salesJson, buyJson, calendarJson, menuJson] =
    await Promise.all([
      fetch("./data/ctap-bar-schedule.csv").then(r => r.text()),
      fetch("./data/ctap-kitchen-schedule.csv").then(r => r.text()),
      fetch("./data/ctap-driver-schedule.csv").then(r => r.text()),
      fetch("./data/ctap-invoice-week.json").then(r => r.json() as Promise<InvoiceWeekSeed>),
      fetch("./data/ctap-sales.json").then(r => r.json() as Promise<SalesSeed>),
      fetch("./data/ctap-buy.json").then(r => r.json() as Promise<BuySeed>),
      fetch("./data/ctap-calendar.json").then(r => r.json() as Promise<CalendarSeed>),
      fetch("./data/ctap-menu.json").then(r => r.json() as Promise<MenuSeed>),
    ]);
  barWeek = parseWideScheduleCsv(barCsv, "Bar Crew");
  kitchenWeek = parseWideScheduleCsv(kitchenCsv, "Kitchen");
  driverWeek = parseWideScheduleCsv(driverCsv, "Drivers");
  invoiceWeek = invoiceJson;
  sales = salesJson;
  buy = buyJson;
  calendar = calendarJson;
  menu = menuJson;
  selectedDate = barWeek.dates[0] ?? "";
  selectedZ = sales.recentZ[0]?.date ?? "";
  render();
}

void boot();
