export type Status = "todo" | "progress" | "review" | "done" | "blocked";
export type Priority = "high" | "med" | "low";

export type Subtask = {
  id: string;
  title: string;
  status: Status;
  assignee?: string;
  due?: string;
};

export type Task = {
  id: string;
  code: string;
  title: string;
  project: string;
  projectColor: string;
  status: Status;
  priority: Priority;
  due: string;
  updated: string;
  assignees: { name: string; color: string }[];
  description?: string;
  subtasks: Subtask[];
  comments: number;
  attachments: number;
};

export const stats = [
  { label: "באיחור", value: 16, tone: "blocked" as const },
  { label: "השבוע", value: 2, tone: "review" as const },
  { label: "הושלם", value: 21, tone: "done" as const },
  { label: "בתהליך", value: 6, tone: "progress" as const },
  { label: "לביצוע", value: 52, tone: "todo" as const },
  { label: "סה״כ משימות", value: 80, tone: "neutral" as const },
];

export const projects = [
  { name: "Octastrike", color: "oklch(0.7 0.13 280)" },
  { name: "Syncore", color: "oklch(0.68 0.14 38)" },
  { name: "Ambil", color: "oklch(0.7 0.13 200)" },
];

export const tasks: Task[] = [
  {
    id: "t1",
    code: "ADR-13",
    title: "ADR-ים עתידיים — הרשאות, אבטחה ומערכות קשורות",
    project: "Syncore",
    projectColor: "oklch(0.68 0.14 38)",
    status: "progress",
    priority: "high",
    due: "29 אפר׳",
    updated: "לפני שעה",
    assignees: [
      { name: "יב", color: "oklch(0.65 0.18 280)" },
      { name: "תמ", color: "oklch(0.7 0.14 38)" },
    ],
    description:
      "אוסף של ADR-ים שזוהו במהלך כתיבת ADR-13 (מערכת הרשאות) אבל הוצאו מתחום ה-ADR הזה כדי לשמור עליו ממוקד. לכל תת-משימה = ADR נפרד שצריך להיכתב אחרי ש-ADR-13 ירוק בפרודקשן.",
    subtasks: [
      { id: "s1", title: "ADR — Step-up confirmation לפעולות רגישות וקול", status: "progress", assignee: "יב", due: "29 אפר׳" },
      { id: "s2", title: "ADR — Service principals לתהליכי רקע", status: "todo", assignee: "תמ", due: "29 אפר׳" },
      { id: "s3", title: "ADR — Super-admin / platform-owner (Anthropic staff)", status: "todo", due: "29 אפר׳" },
      { id: "s4", title: "ADR — API key scopes לגישה חיצונית", status: "review", assignee: "יב", due: "29 אפר׳" },
      { id: "s5", title: "ADR — Field-level permissions", status: "done", assignee: "תמ", due: "27 אפר׳" },
      { id: "s6", title: "ניקוי MemberRole — ADR (OWNER/EDITOR/VIEWER)", status: "todo", due: "29 אפר׳" },
    ],
    comments: 4,
    attachments: 2,
  },
  {
    id: "t2",
    code: "UI-22",
    title: "CTA סופי — לבדוק את נוסח הכפתור והטקסט",
    project: "Syncore",
    projectColor: "oklch(0.68 0.14 38)",
    status: "review",
    priority: "med",
    due: "23 אפר׳",
    updated: "לפני 3 שעות",
    assignees: [{ name: "א", color: "oklch(0.7 0.12 200)" }],
    subtasks: [
      { id: "ss1", title: "ניסוח חלופי 1", status: "done" },
      { id: "ss2", title: "A/B test setup", status: "progress" },
    ],
    comments: 2,
    attachments: 0,
  },
  {
    id: "t3",
    code: "MOB-07",
    title: "Hero — בסלולרי ודסקטופ צריך יותר נוכחות",
    project: "Syncore",
    projectColor: "oklch(0.68 0.14 38)",
    status: "progress",
    priority: "high",
    due: "23 אפר׳",
    updated: "לפני יום",
    assignees: [{ name: "ר", color: "oklch(0.7 0.15 320)" }],
    subtasks: [
      { id: "sa1", title: "Mobile breakpoints", status: "progress" },
      { id: "sa2", title: "Hero image generation", status: "todo" },
      { id: "sa3", title: "Copy refinement", status: "todo" },
    ],
    comments: 1,
    attachments: 3,
  },
  {
    id: "t4",
    code: "AI-04",
    title: "כרטיסי יכולת — לבדוק שטוקני AI וטוקן קולי בולטים ושווים",
    project: "Syncore",
    projectColor: "oklch(0.68 0.14 38)",
    status: "progress",
    priority: "med",
    due: "23 אפר׳",
    updated: "לפני יום",
    assignees: [{ name: "מ", color: "oklch(0.65 0.14 150)" }],
    subtasks: [],
    comments: 0,
    attachments: 0,
  },
  {
    id: "t5",
    code: "DSN-11",
    title: "מצב יום (light mode) — לבדוק שהכל נראה טוב",
    project: "Syncore",
    projectColor: "oklch(0.68 0.14 38)",
    status: "todo",
    priority: "low",
    due: "23 אפר׳",
    updated: "לפני יומיים",
    assignees: [{ name: "ד", color: "oklch(0.68 0.13 250)" }],
    subtasks: [{ id: "sd1", title: "צבעים", status: "todo" }, { id: "sd2", title: "צללים", status: "todo" }],
    comments: 0,
    attachments: 0,
  },
  {
    id: "t6",
    code: "OCT-02",
    title: "תצוגת משקיעים",
    project: "Octastrike",
    projectColor: "oklch(0.7 0.13 280)",
    status: "blocked",
    priority: "high",
    due: "16 אפר׳",
    updated: "לפני 5 ימים",
    assignees: [{ name: "יב", color: "oklch(0.65 0.18 280)" }],
    subtasks: [{ id: "so1", title: "סלייד פיננסי", status: "blocked" }],
    comments: 6,
    attachments: 4,
  },
  {
    id: "t7",
    code: "OCT-03",
    title: "להוסיף לעדכון את מצגת התכנון העסקי והפיננסי בסוף״ש הקרוב",
    project: "Octastrike",
    projectColor: "oklch(0.7 0.13 280)",
    status: "done",
    priority: "med",
    due: "19 אפר׳",
    updated: "אתמול",
    assignees: [{ name: "תמ", color: "oklch(0.7 0.14 38)" }],
    subtasks: [
      { id: "soa", title: "טיוטא ראשונית", status: "done" },
      { id: "sob", title: "ביקורת פנימית", status: "done" },
    ],
    comments: 3,
    attachments: 1,
  },
];
