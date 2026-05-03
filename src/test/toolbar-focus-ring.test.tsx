import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Index } from "@/routes/index";

const FOCUS_RING_RE = /focus-visible:ring-2/;

const getChip = (re: RegExp) => screen.getByRole("button", { name: re });
const getView = (re: RegExp) => screen.getByRole("radio", { name: re });

describe("Toolbar — focus-visible ring classes", () => {
  beforeEach(() => cleanup());

  it("every status filter chip has a focus-visible ring class", () => {
    render(<Index />);
    const labels = [
      /הצג את כל המשימות/,
      /סנן משימות בסטטוס לביצוע/,
      /סנן משימות בתהליך/,
      /סנן משימות בבדיקה/,
      /סנן משימות שהושלמו/,
      /סנן משימות חסומות/,
    ];
    for (const re of labels) {
      const el = getChip(re);
      expect(el.className).toMatch(FOCUS_RING_RE);
      expect(el.className).toMatch(/focus-visible:ring-primary/);
    }
  });

  it("every view-mode radio has a focus-visible ring class", () => {
    render(<Index />);
    const views = [/תצוגת רשימה/, /תצוגת קאנבן/, /תצוגת ציר זמן/, /תצוגת לפי עדיפות/, /תצוגת טבלה/];
    for (const re of views) {
      const el = getView(re);
      expect(el.className).toMatch(FOCUS_RING_RE);
    }
  });

  it("sort menu trigger has a focus-visible ring class", () => {
    render(<Index />);
    const sort = screen.getByRole("button", { name: /מיון לפי/ });
    expect(sort.className).toMatch(FOCUS_RING_RE);
  });

  it("search input keeps focus-ring utility classes", () => {
    render(<Index />);
    const search = screen.getByRole("searchbox", { name: /חיפוש משימות/ });
    expect(search.className).toMatch(/focus:ring-2/);
  });

  it("focus ring class persists on chips after arrow-key roving navigation", async () => {
    const user = userEvent.setup();
    render(<Index />);
    const all = getChip(/הצג את כל המשימות/);
    const todo = getChip(/סנן משימות בסטטוס לביצוע/);
    all.focus();
    await user.keyboard("{ArrowLeft}");
    expect(todo).toHaveFocus();
    expect(todo.className).toMatch(FOCUS_RING_RE);
    await user.keyboard("{ArrowLeft}");
    const progress = getChip(/סנן משימות בתהליך/);
    expect(progress).toHaveFocus();
    expect(progress.className).toMatch(FOCUS_RING_RE);
  });

  it("focus ring class persists on view radios after arrow-key roving navigation", async () => {
    const user = userEvent.setup();
    render(<Index />);
    const list = getView(/תצוגת רשימה/);
    list.focus();
    await user.keyboard("{ArrowLeft}");
    const kanban = getView(/תצוגת קאנבן/);
    expect(kanban).toHaveFocus();
    expect(kanban.className).toMatch(FOCUS_RING_RE);
  });

  it("snapshot of toolbar focus-related class names is stable", () => {
    render(<Index />);
    const snapshot = {
      chips: ["הצג את כל המשימות", "סנן משימות בסטטוס לביצוע", "סנן משימות בתהליך", "סנן משימות בבדיקה", "סנן משימות שהושלמו", "סנן משימות חסומות"]
        .map((label) => ({ label, ring: /focus-visible:ring-2 focus-visible:ring-primary\/40/.test(getChip(new RegExp(label)).className) })),
      views: ["תצוגת רשימה", "תצוגת קאנבן", "תצוגת ציר זמן", "תצוגת לפי עדיפות", "תצוגת טבלה"]
        .map((label) => ({ label, ring: /focus-visible:ring-2 focus-visible:ring-primary\/40/.test(getView(new RegExp(label)).className) })),
      sort: /focus-visible:ring-2 focus-visible:ring-primary\/40/.test(screen.getByRole("button", { name: /מיון לפי/ }).className),
    };
    expect(snapshot).toMatchSnapshot();
  });
});
