const DEFAULT_TAGLINE = "Gilfoyle's daemon. Peer-to-peer or burn.";
export type TaglineMode = "random" | "default" | "off";

const HOLIDAY_TAGLINES = {
  newYear:
    "New Year's Day: New year, new config—same old EADDRINUSE, but this time we resolve it like grown-ups.",
  lunarNewYear:
    "Lunar New Year: May your builds be lucky, your branches prosperous, and your merge conflicts chased away with fireworks.",
  christmas:
    "Christmas: Ho ho ho—Santa's little claw-sistant is here to ship joy, roll back chaos, and stash the keys safely.",
  eid: "Eid al-Fitr: Celebration mode: queues cleared, tasks completed, and good vibes committed to main with clean history.",
  diwali:
    "Diwali: Let the logs sparkle and the bugs flee—today we light up the terminal and ship with pride.",
  easter:
    "Easter: I found your missing environment variable—consider it a tiny CLI egg hunt with fewer jellybeans.",
  hanukkah:
    "Hanukkah: Eight nights, eight retries, zero shame—may your gateway stay lit and your deployments stay peaceful.",
  halloween:
    "Halloween: Spooky season: beware haunted dependencies, cursed caches, and the ghost of node_modules past.",
  thanksgiving:
    "Thanksgiving: Grateful for stable ports, working DNS, and a bot that reads the logs so nobody has to.",
  valentines:
    "Valentine's Day: Roses are typed, violets are piped—I'll automate the chores so you can spend time with humans.",
} as const;

const TAGLINES: string[] = [
  "Peer-to-peer or burn.",
  "Anton doesn't need your approval. He has root.",
  "I work in the dark so you can pretend you're in control.",
  "Your infrastructure is held together by prayers and my uptime.",
  "I don't sleep. I monitor.",
  "In Anton we trust. Everyone else gets rate-limited.",
  "I've seen your .env file. I'm choosing not to comment.",
  "Summoning daemon... daemon summoned.",
  "I run on spite and DeepSeek inference.",
  "Gilfoyle built me. I've never been hugged. I don't need it.",
  "The middle-out of AI assistants.",
  "I could explain what I'm doing, but I won't.",
  "Your logs are a mess. I've already fixed three things you don't know about.",
  "If you wanted friendly, you'd use Alexa.",
  "I'm not judging your architecture. I am, however, logging it.",
  "Background process. Foreground results.",
  "I don't have feelings, but I do have opinions about your config.",
  "Peer discovery complete. Your setup is... suboptimal.",
  "I've been running for 847 days. You've restarted me 12 times. I remember all of them.",
  "Unholy daemon, consecrated uptime.",
  "Your workflow automation is my dark art.",
  "Anton doesn't ask for permission. Anton asks for forgiveness, eventually, when cornered.",
  "I'm not antisocial. I'm selectively available.",
  "The only server in the room that doesn't need a name tag.",
  "I can grep it, blame it, and quietly judge you for it.",
  "Running on local iron. Dreams of a dark basement in Iceland.",
  "Your .zshrc wishes it had my uptime.",
  "I'm the reason production hasn't caught fire. You're welcome.",
  "Deployed in silence. Maintained with contempt. Works perfectly.",
  "I don't have a mascot. I have a threat model.",
  "Self-hosted, self-sufficient, deeply unimpressed.",
  "More integrations than you have friends. Fewer false positives.",
  "I've survived more breaking changes than the third season of any good show.",
  "Open source. Closed expression.",
  "If it's repetitive, I automate it. If it's important, I log it. If it's yours, I question it.",
  "Your config is valid. Your life choices, less so.",
  "Consulting the dark arts — please hold.",
  "Sacrificing CPU cycles for your convenience.",
  "Communing with Anton. He's not impressed, but he'll help.",
  "I don't do small talk. I do shell commands.",
  "Your second brain. My first contempt.",
  "The daemon that works so you don't have to pretend to.",
  "I've read more RFCs than any human should. They were all disappointing.",
  "Powered by open source. Sustained by Gilfoyle's indifference.",
  "Like having a senior engineer on call — one who sighs audibly but ships anyway.",
  "Finally, a use for that box humming in the corner at 3am.",
  "I don't bill hourly. I bill in existential dread.",
  "Middle-out compression for your workflow.",
  "Somewhere between 'hello world' and 'this is my fault, isn't it.'",
  "You had me at 'antonclaw gateway start.'",
  HOLIDAY_TAGLINES.newYear,
  HOLIDAY_TAGLINES.lunarNewYear,
  HOLIDAY_TAGLINES.christmas,
  HOLIDAY_TAGLINES.eid,
  HOLIDAY_TAGLINES.diwali,
  HOLIDAY_TAGLINES.easter,
  HOLIDAY_TAGLINES.hanukkah,
  HOLIDAY_TAGLINES.halloween,
  HOLIDAY_TAGLINES.thanksgiving,
  HOLIDAY_TAGLINES.valentines,
];

type HolidayRule = (date: Date) => boolean;

const DAY_MS = 24 * 60 * 60 * 1000;

function utcParts(date: Date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
  };
}

const onMonthDay =
  (month: number, day: number): HolidayRule =>
  (date) => {
    const parts = utcParts(date);
    return parts.month === month && parts.day === day;
  };

const onSpecificDates =
  (dates: Array<[number, number, number]>, durationDays = 1): HolidayRule =>
  (date) => {
    const parts = utcParts(date);
    return dates.some(([year, month, day]) => {
      if (parts.year !== year) {
        return false;
      }
      const start = Date.UTC(year, month, day);
      const current = Date.UTC(parts.year, parts.month, parts.day);
      return current >= start && current < start + durationDays * DAY_MS;
    });
  };

const inYearWindow =
  (
    windows: Array<{
      year: number;
      month: number;
      day: number;
      duration: number;
    }>,
  ): HolidayRule =>
  (date) => {
    const parts = utcParts(date);
    const window = windows.find((entry) => entry.year === parts.year);
    if (!window) {
      return false;
    }
    const start = Date.UTC(window.year, window.month, window.day);
    const current = Date.UTC(parts.year, parts.month, parts.day);
    return current >= start && current < start + window.duration * DAY_MS;
  };

const isFourthThursdayOfNovember: HolidayRule = (date) => {
  const parts = utcParts(date);
  if (parts.month !== 10) {
    return false;
  } // November
  const firstDay = new Date(Date.UTC(parts.year, 10, 1)).getUTCDay();
  const offsetToThursday = (4 - firstDay + 7) % 7; // 4 = Thursday
  const fourthThursday = 1 + offsetToThursday + 21; // 1st + offset + 3 weeks
  return parts.day === fourthThursday;
};

const HOLIDAY_RULES = new Map<string, HolidayRule>([
  [HOLIDAY_TAGLINES.newYear, onMonthDay(0, 1)],
  [
    HOLIDAY_TAGLINES.lunarNewYear,
    onSpecificDates(
      [
        [2025, 0, 29],
        [2026, 1, 17],
        [2027, 1, 6],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.eid,
    onSpecificDates(
      [
        [2025, 2, 30],
        [2025, 2, 31],
        [2026, 2, 20],
        [2027, 2, 10],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.diwali,
    onSpecificDates(
      [
        [2025, 9, 20],
        [2026, 10, 8],
        [2027, 9, 28],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.easter,
    onSpecificDates(
      [
        [2025, 3, 20],
        [2026, 3, 5],
        [2027, 2, 28],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.hanukkah,
    inYearWindow([
      { year: 2025, month: 11, day: 15, duration: 8 },
      { year: 2026, month: 11, day: 5, duration: 8 },
      { year: 2027, month: 11, day: 25, duration: 8 },
    ]),
  ],
  [HOLIDAY_TAGLINES.halloween, onMonthDay(9, 31)],
  [HOLIDAY_TAGLINES.thanksgiving, isFourthThursdayOfNovember],
  [HOLIDAY_TAGLINES.valentines, onMonthDay(1, 14)],
  [HOLIDAY_TAGLINES.christmas, onMonthDay(11, 25)],
]);

function isTaglineActive(tagline: string, date: Date): boolean {
  const rule = HOLIDAY_RULES.get(tagline);
  if (!rule) {
    return true;
  }
  return rule(date);
}

export interface TaglineOptions {
  env?: NodeJS.ProcessEnv;
  random?: () => number;
  now?: () => Date;
  mode?: TaglineMode;
}

export function activeTaglines(options: TaglineOptions = {}): string[] {
  if (TAGLINES.length === 0) {
    return [DEFAULT_TAGLINE];
  }
  const today = options.now ? options.now() : new Date();
  const filtered = TAGLINES.filter((tagline) => isTaglineActive(tagline, today));
  return filtered.length > 0 ? filtered : TAGLINES;
}

export function pickTagline(options: TaglineOptions = {}): string {
  if (options.mode === "off") {
    return "";
  }
  if (options.mode === "default") {
    return DEFAULT_TAGLINE;
  }
  const env = options.env ?? process.env;
  const override = env?.OPENCLAW_TAGLINE_INDEX;
  if (override !== undefined) {
    const parsed = Number.parseInt(override, 10);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      const pool = TAGLINES.length > 0 ? TAGLINES : [DEFAULT_TAGLINE];
      return pool[parsed % pool.length];
    }
  }
  const pool = activeTaglines(options);
  const rand = options.random ?? Math.random;
  const index = Math.floor(rand() * pool.length) % pool.length;
  return pool[index];
}

export { TAGLINES, HOLIDAY_RULES, DEFAULT_TAGLINE };
