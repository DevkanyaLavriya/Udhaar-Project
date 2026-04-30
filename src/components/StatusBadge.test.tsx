import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusBadge } from "./StatusBadge";
import type { CustomerStatus } from "@/lib/mock-data";

describe("StatusBadge Component", () => {
  it("renders the 'Paid' status correctly", () => {
    render(<StatusBadge status="paid" />);
    const badge = screen.getByText("Paid");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("text-cardamom");
  });

  it("renders the 'Pending' status correctly", () => {
    render(<StatusBadge status="pending" />);
    const badge = screen.getByText("Pending");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("text-turmeric");
  });

  it("renders the 'Overdue' status correctly", () => {
    render(<StatusBadge status="overdue" />);
    const badge = screen.getByText("Overdue");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("text-destructive");
  });

  it("applies additional class names", () => {
    render(<StatusBadge status="paid" className="custom-class" />);
    const badge = screen.getByText("Paid");
    expect(badge).toHaveClass("custom-class");
  });
});
