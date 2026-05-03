import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { TaskPanel } from "@/components/tasks/TaskPanel";
import { KanbanView } from "@/components/tasks/views/KanbanView";
import { TimelineView } from "@/components/tasks/views/TimelineView";
import { CompactView } from "@/components/tasks/views/CompactView";
import { tasks } from "@/data/tasks";

beforeEach(() => {
  cleanup();
  document.documentElement.setAttribute("dir", "rtl");
  document.documentElement.setAttribute("lang", "he");
});

describe("RTL layout — TaskPanel", () => {
  it("opens anchored to the right side of the viewport", () => {
    render(<TaskPanel task={tasks[0]} onClose={() => {}} />);
    const panel = screen.getByTestId("task-panel");
    expect(panel).toHaveAttribute("dir", "rtl");
    expect(panel.className).toMatch(/\bright-0\b/);
    expect(panel.className).not.toMatch(/\bleft-0\b/);
  });

  it("uses the slide-in-from-right animation (not from-left)", () => {
    render(<TaskPanel task={tasks[0]} onClose={() => {}} />);
    const panel = screen.getByTestId("task-panel");
    expect(panel.className).toMatch(/slide-in-from-right/);
    expect(panel.className).not.toMatch(/slide-in-from-left/);
  });

  it("closes on overlay click and Escape key", () => {
    const onClose = vi.fn();
    render(<TaskPanel task={tasks[0]} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("task-panel-overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("returns null with no task — no panel in DOM", () => {
    render(<TaskPanel task={null} onClose={() => {}} />);
    expect(screen.queryByTestId("task-panel")).toBeNull();
  });
});

describe("RTL layout — view containers use right-aligned text", () => {
  const noop = () => {};

  it("KanbanView cards are text-right", () => {
    const { container } = render(
      <KanbanView tasks={tasks.slice(0, 2)} onOpen={noop} />,
    );
    const cards = container.querySelectorAll(".text-right");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("TimelineView marker sits on the right side (right-0)", () => {
    const { container } = render(
      <TimelineView tasks={tasks.slice(0, 2)} onOpen={noop} />,
    );
    expect(container.querySelector(".right-0")).not.toBeNull();
    expect(container.querySelector(".left-0")).toBeNull();
  });

  it("CompactView rows are text-right", () => {
    const { container } = render(
      <CompactView tasks={tasks.slice(0, 2)} onOpen={noop} />,
    );
    expect(container.querySelectorAll(".text-right").length).toBeGreaterThan(0);
  });
});
