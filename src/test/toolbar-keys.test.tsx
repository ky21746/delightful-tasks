import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Index } from "@/routes/index";

const getSearch = () => screen.getByRole("searchbox", { name: /חיפוש משימות/ }) as HTMLInputElement;
const getChip = (re: RegExp) => screen.getByRole("button", { name: re });
const getView = (re: RegExp) => screen.getByRole("radio", { name: re });

describe("Toolbar — Esc behavior", () => {
  beforeEach(() => cleanup());

  it("Esc inside search clears query but does NOT clear active filter chip", async () => {
    const user = userEvent.setup();
    render(<Index />);
    const todoChip = getChip(/סנן משימות בסטטוס לביצוע/);
    await user.click(todoChip);
    expect(todoChip).toHaveAttribute("aria-pressed", "true");

    const search = getSearch();
    await user.click(search);
    await user.keyboard("hello{Escape}");
    expect(search.value).toBe("");
    // Filter must remain
    expect(todoChip).toHaveAttribute("aria-pressed", "true");
  });

  it("Esc on a focused chip does not toggle the chip nor clear filters", async () => {
    const user = userEvent.setup();
    render(<Index />);
    const todoChip = getChip(/סנן משימות בסטטוס לביצוע/);
    await user.click(todoChip);
    expect(todoChip).toHaveAttribute("aria-pressed", "true");
    todoChip.focus();
    await user.keyboard("{Escape}");
    expect(todoChip).toHaveAttribute("aria-pressed", "true");
  });

  it("Esc outside an input does not clear the search query", async () => {
    const user = userEvent.setup();
    render(<Index />);
    const search = getSearch();
    await user.click(search);
    await user.keyboard("design");
    expect(search.value).toBe("design");
    // Move focus away then press Esc
    (document.body as HTMLElement).focus();
    await user.keyboard("{Escape}");
    expect(search.value).toBe("design");
  });
});

describe("Toolbar — Arrow-key roving navigation", () => {
  beforeEach(() => cleanup());

  it("ArrowLeft/ArrowRight move focus between filter chips (RTL semantics)", async () => {
    const user = userEvent.setup();
    render(<Index />);
    const all = getChip(/הצג את כל המשימות/);
    const todo = getChip(/סנן משימות בסטטוס לביצוע/);

    all.focus();
    expect(all).toHaveFocus();
    // ArrowLeft → next visual (in RTL: next chip)
    await user.keyboard("{ArrowLeft}");
    expect(todo).toHaveFocus();
    // ArrowRight → previous
    await user.keyboard("{ArrowRight}");
    expect(all).toHaveFocus();
  });

  it("ArrowDown/ArrowUp also move focus between filter chips", async () => {
    const user = userEvent.setup();
    render(<Index />);
    const all = getChip(/הצג את כל המשימות/);
    const todo = getChip(/סנן משימות בסטטוס לביצוע/);
    all.focus();
    await user.keyboard("{ArrowDown}");
    expect(todo).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(all).toHaveFocus();
  });

  it("Home/End jump to first/last chip", async () => {
    const user = userEvent.setup();
    render(<Index />);
    const all = getChip(/הצג את כל המשימות/);
    const blocked = getChip(/סנן משימות חסומות/);
    all.focus();
    await user.keyboard("{End}");
    expect(blocked).toHaveFocus();
    await user.keyboard("{Home}");
    expect(all).toHaveFocus();
  });

  it("Arrow keys roving works inside the view-mode radiogroup", async () => {
    const user = userEvent.setup();
    render(<Index />);
    const list = getView(/תצוגת רשימה/);
    const kanban = getView(/תצוגת קאנבן/);
    list.focus();
    await user.keyboard("{ArrowLeft}");
    expect(kanban).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(list).toHaveFocus();
  });
});

describe("Toolbar — Shift+Tab reverse focus order", () => {
  beforeEach(() => cleanup());

  it("Shift+Tab from a view radio walks back through sort/filter and chips to the search field", async () => {
    const user = userEvent.setup();
    render(<Index />);
    const lastView = getView(/תצוגת טבלה/);
    lastView.focus();
    expect(lastView).toHaveFocus();

    const seen: string[] = [];
    const search = getSearch();
    for (let i = 0; i < 40; i++) {
      await user.tab({ shift: true });
      const el = document.activeElement as HTMLElement | null;
      if (!el) continue;
      seen.push(el.getAttribute("aria-label") || el.textContent?.trim() || el.tagName);
      if (el === search) break;
    }

    expect(document.activeElement).toBe(search);
    // The reverse walk must pass through at least one status chip before reaching search
    expect(seen.some((l) => /סנן משימות/.test(l))).toBe(true);
    const idxChip = seen.findIndex((l) => /סנן משימות/.test(l));
    const idxSearch = seen.findIndex((l) => /חיפוש משימות/.test(l));
    expect(idxChip).toBeLessThan(idxSearch);
  });
});
