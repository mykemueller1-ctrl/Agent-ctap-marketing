/**
 * Parse CTAP weekly schedule CSVs as they live in Google Drive:
 * one row per employee, seven day-blocks of (date, start, end, station).
 *
 * Paper-schedule tokens (from Drive doc "HOW TO INPUT WEEKLY SCHEDULES"):
 *   Open  — starts when the restaurant opens
 *   OPEN  — first person cut when it slows ("O" on paper)
 *   Close — works until close
 *   RO    — requested off
 */
export const OPEN_CLOCK = "07:00";
export const CLOSE_CLOCK = "24:00";

export type ShiftFlags = {
  opens: boolean;
  firstCut: boolean;
  closes: boolean;
  requestedOff: boolean;
};

export type Assignment = {
  employee: string;
  date: string;
  start: string | null;
  end: string | null;
  station: string | null;
  flags: ShiftFlags;
  hours: number | null;
  incomplete: boolean;
};

export type ParsedSchedule = {
  department: string;
  weekStart: string | null;
  weekEnd: string | null;
  dates: string[];
  employees: string[];
  stations: string[];
  assignments: Assignment[];
  requestedOff: Assignment[];
};

const TIME_RE = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

function padDate(raw: string): string | null {
  const m = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  const month = m[1].padStart(2, "0");
  const day = m[2].padStart(2, "0");
  const year = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${year}-${month}-${day}`;
}

function clockToMinutes(clock: string): number | null {
  if (clock === OPEN_CLOCK) return 7 * 60;
  if (clock === CLOSE_CLOCK) return 24 * 60;
  const m = clock.match(/^(\d{2}):(\d{2})$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function parseClock(raw: string, role: "start" | "end"): {
  clock: string | null;
  opens: boolean;
  firstCut: boolean;
  closes: boolean;
  requestedOff: boolean;
} {
  const value = raw.trim();
  if (!value) {
    return {
      clock: null,
      opens: false,
      firstCut: false,
      closes: false,
      requestedOff: false,
    };
  }
  if (value.toUpperCase() === "RO") {
    return {
      clock: null,
      opens: false,
      firstCut: false,
      closes: false,
      requestedOff: true,
    };
  }
  if (value === "OPEN") {
    return {
      clock: role === "end" ? null : OPEN_CLOCK,
      opens: role === "start",
      firstCut: true,
      closes: false,
      requestedOff: false,
    };
  }
  if (value.toLowerCase() === "open") {
    return {
      clock: role === "start" ? OPEN_CLOCK : null,
      opens: role === "start",
      firstCut: false,
      closes: false,
      requestedOff: false,
    };
  }
  if (value.toLowerCase() === "close") {
    return {
      clock: role === "end" ? CLOSE_CLOCK : null,
      opens: false,
      firstCut: false,
      closes: true,
      requestedOff: false,
    };
  }
  const match = value.match(TIME_RE);
  if (!match) {
    return {
      clock: null,
      opens: false,
      firstCut: false,
      closes: false,
      requestedOff: false,
    };
  }
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour += 12;
  if (match[3].toUpperCase() === "AM" && match[1] === "12") hour = 0;
  const minutes = Number(match[2]);
  let total = hour * 60 + minutes;
  if (role === "end" && total === 0) total = 24 * 60;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return {
    clock: `${hh}:${mm}`,
    opens: false,
    firstCut: false,
    closes: false,
    requestedOff: false,
  };
}

function hoursBetween(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const a = clockToMinutes(start);
  const b = clockToMinutes(end);
  if (a === null || b === null) return null;
  let diff = b - a;
  if (diff <= 0) diff += 24 * 60;
  return Number((diff / 60).toFixed(2));
}

function splitCsvLine(line: string): string[] {
  return line.split(",").map(cell => cell.trim());
}

export function parseWideScheduleCsv(
  csv: string,
  department = "Bar Crew"
): ParsedSchedule {
  const lines = csv.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const rows = lines.filter(line => line.trim().length > 0);
  if (rows.length < 2) {
    return {
      department,
      weekStart: null,
      weekEnd: null,
      dates: [],
      employees: [],
      stations: [],
      assignments: [],
      requestedOff: [],
    };
  }

  const assignments: Assignment[] = [];
  const employees: string[] = [];
  const dateSet: string[] = [];

  for (const row of rows.slice(1)) {
    const cells = splitCsvLine(row);
    const employee = cells[0];
    if (!employee) continue;
    employees.push(employee);

    for (let i = 1; i + 3 < cells.length; i += 4) {
      const date = padDate(cells[i] ?? "");
      if (!date) continue;
      if (!dateSet.includes(date)) dateSet.push(date);

      const startTok = parseClock(cells[i + 1] ?? "", "start");
      const endTok = parseClock(cells[i + 2] ?? "", "end");
      const stationRaw = (cells[i + 3] ?? "").trim();
      const station = stationRaw.length ? stationRaw : null;
      const flags: ShiftFlags = {
        opens: startTok.opens || endTok.opens,
        firstCut: startTok.firstCut || endTok.firstCut,
        closes: startTok.closes || endTok.closes,
        requestedOff: startTok.requestedOff || endTok.requestedOff,
      };
      const hasTimes = Boolean(startTok.clock || endTok.clock || flags.closes || flags.opens);
      if (!hasTimes && !station && !flags.requestedOff) continue;

      assignments.push({
        employee,
        date,
        start: startTok.clock,
        end: endTok.clock,
        station,
        flags,
        hours: flags.requestedOff
          ? 0
          : hoursBetween(startTok.clock, endTok.clock),
        incomplete:
          !flags.requestedOff &&
          ((Boolean(station) && !hasTimes) ||
            (hasTimes && (!startTok.clock || !endTok.clock) && !flags.closes && !flags.opens)),
      });
    }
  }

  dateSet.sort();
  const stations = [
    ...new Set(
      assignments
        .map(a => a.station)
        .filter((s): s is string => Boolean(s))
    ),
  ];

  return {
    department,
    weekStart: dateSet[0] ?? null,
    weekEnd: dateSet.at(-1) ?? null,
    dates: dateSet,
    employees,
    stations,
    assignments,
    requestedOff: assignments.filter(a => a.flags.requestedOff),
  };
}

export type CoverageHole = {
  date: string;
  station: string;
  message: string;
};

export type ShiftInsight = {
  kind: "coverage" | "thin-day" | "requested-off" | "long-shift" | "incomplete";
  date: string;
  title: string;
  detail: string;
};

const CORE_STATIONS = ["BAR SIDE", "PIZZA SIDE"];

export function buildInsights(parsed: ParsedSchedule): ShiftInsight[] {
  const insights: ShiftInsight[] = [];

  for (const date of parsed.dates) {
    const day = parsed.assignments.filter(a => a.date === date);
    const working = day.filter(a => !a.flags.requestedOff && (a.start || a.end || a.station));
    const names = new Set(working.map(a => a.employee));

    for (const station of CORE_STATIONS) {
      const covered = working.some(a => a.station === station && !a.incomplete);
      if (!covered) {
        insights.push({
          kind: "coverage",
          date,
          title: `No ${station.toLowerCase()} coverage`,
          detail: `${formatPrettyDate(date)} has nobody posted on ${station}.`,
        });
      }
    }

    if (names.size > 0 && names.size <= 3) {
      insights.push({
        kind: "thin-day",
        date,
        title: `Thin floor — ${names.size} people posted`,
        detail: `${formatPrettyDate(date)} only has ${[...names].join(", ")}.`,
      });
    }

    for (const a of day.filter(x => x.flags.requestedOff)) {
      insights.push({
        kind: "requested-off",
        date,
        title: `${firstName(a.employee)} requested off`,
        detail: `${a.employee} is RO on ${formatPrettyDate(date)}.`,
      });
    }

    for (const a of day.filter(x => (x.hours ?? 0) >= 10)) {
      insights.push({
        kind: "long-shift",
        date,
        title: `${firstName(a.employee)} is on ${a.hours}h`,
        detail: `${a.employee} ${displayWindow(a)} on ${a.station ?? "unassigned"}.`,
      });
    }

    for (const a of day.filter(x => x.incomplete)) {
      insights.push({
        kind: "incomplete",
        date,
        title: `${firstName(a.employee)} missing times`,
        detail: `${a.employee} is listed${a.station ? ` on ${a.station}` : ""} without a full start/end.`,
      });
    }
  }

  return insights;
}

export function displayWindow(a: Assignment): string {
  if (a.flags.requestedOff) return "RO";
  const start = a.flags.opens && a.start === OPEN_CLOCK ? "Open" : formatClock(a.start);
  const end = a.flags.closes && a.end === CLOSE_CLOCK ? "Close" : formatClock(a.end);
  if (!start && !end) return "—";
  return `${start ?? "?"}–${end ?? "?"}`;
}

export function formatClock(clock: string | null): string {
  if (!clock) return "";
  if (clock === CLOSE_CLOCK) return "12:00 AM";
  const [hRaw, m] = clock.split(":");
  let h = Number(hRaw);
  const ampm = h >= 12 && h < 24 ? "PM" : "AM";
  if (h === 0 || h === 24) return `12:${m} AM`;
  if (h > 12) h -= 12;
  return `${h}:${m} ${ampm}`;
}

export function formatPrettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function firstName(full: string): string {
  return full.split(" ")[0] ?? full;
}

export function weekdayIndex(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
