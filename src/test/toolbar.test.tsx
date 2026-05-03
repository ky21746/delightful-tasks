import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Index } from "@/routes/index";

function renderToolbar() {
  return render(<Index />);
}

describe("Toolbar — ARIA & keyboard", () => {
  beforeEach(() => cleanup());

  it("exposes a toolbar landmark with descriptive aria-label", () => {
    renderToolbar();
    const toolbar = screen.getByRole("toolbar", { name: /סרגל כלים/ });
    expect(toolbar).toBeInTheDocument();
  });

  it("search input, status group, and view radiogroup have accessible names", () => {
    renderToolbar();
    expect(screen.getByRole("searchbox", { name: /חיפוש משימות/ })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /סינון משימות לפי סטטוס/ })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: /בחירת מצב תצוגה/ })).toBeInTheDocument();
  });

  it("filter chips expose aria-pressed reflecting state", async () => {
    const user = userEvent.setup();
    renderToolbar();
    const todoChip = screen.getByRole("button", { name: /סנן משימות בסטטוס לביצוע/ });
    expect(todoChip).toHaveAttribute("aria-pressed", "false");
    await user.click(todoChip);
    expect(todoChip).toHaveAttribute("aria-pressed", "true");
  });

  it("pressing '/' focuses the search input", async () => {
    const user = userEvent.setup();
    renderToolbar();
    const search = screen.getByRole("searchbox", { name: /חיפוש משימות/ });
    expect(search).not.toHaveFocus();
    await user.keyboard("/");
    expect(search).toHaveFocus();
  });

  it("Escape inside search clears the query", async () => {
    const user = userEvent.setup();
    renderToolbar();
    const search = screen.getByRole("searchbox", { name: /חיפוש משימות/ }) as HTMLInputElement;
    await user.click(search);
    await user.keyboard("hello");
    expect(search.value).toBe("hello");
    await user.keyboard("{Escape}");
    expect(search.value).toBe("");
  });

  it("clear button removes the search query", async () => {
    const user = userEvent.setup();
    renderToolbar();
    const search = screen.getByRole("searchbox", { name: /חיפוש משימות/ }) as HTMLInputElement;
    await user.click(search);
    await user.keyboard("design");
    const clearBtn = screen.getByRole("button", { name: /נקה חיפוש/ });
    await user.click(clearBtn);
    expect(search.value).toBe("");
  });

  it("aria-live region announces filtered task count and updates on search", async () => {
    const user = userEvent.setup();
    renderToolbar();
    const live = screen.getByTestId("results-live");
    expect(live).toHaveAttribute("aria-live", "polite");
    expect(live).toHaveAttribute("role", "status");
    expect(live.textContent).toMatch(/נמצאו \d+ משימות/);

    const search = screen.getByRole("searchbox", { name: /חיפוש משימות/ });
    await user.click(search);
    await user.keyboard("zzznoresultsxxx");
    expect(live.textContent).toMatch(/נמצאו 0 משימות/);
    expect(live.textContent).toContain("zzznoresultsxxx");
  });

  it("keyboard Tab navigates through search → status chips → sort/filter → view radios in order", async () => {
    const user = userEvent.setup();
    renderToolbar();
    const search = screen.getByRole("searchbox", { name: /חיפוש משימות/ });
    search.focus();
    expect(search).toHaveFocus();

    // Walk forward — at some point focus should reach a status chip then a view radio.
    const order: string[] = [];
    for (let i = 0; i < 25; i++) {
      await user.tab();
      const el = document.activeElement as HTMLElement | null;
      if (!el) continue;
      const label = el.getAttribute("aria-label") || el.textContent || "";
      order.push(label.trim());
    }

    const idxStatus = order.findIndex((l) => /סנן משימות בסטטוס לביצוע/.test(l));
    const idxView = order.findIndex((l) => /^תצוגת /.test(l));
    expect(idxStatus).toBeGreaterThanOrEqual(0);
    expect(idxView).toBeGreaterThan(idxStatus);
  });
});
