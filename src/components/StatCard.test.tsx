import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatCard } from "./StatCard";
import { Users } from "lucide-react";

describe("StatCard Component", () => {
  it("renders label and value correctly", () => {
    render(<StatCard label="Total Users" value="1,234" />);
    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("renders delta text correctly when provided", () => {
    render(<StatCard label="Revenue" value="$5,000" delta="+15% from last month" deltaTone="positive" />);
    const deltaEl = screen.getByText("+15% from last month");
    expect(deltaEl).toBeInTheDocument();
    expect(deltaEl).toHaveClass("text-cardamom");
  });

  it("applies negative tone classes to delta", () => {
    render(<StatCard label="Expenses" value="$2,000" delta="-5% from last month" deltaTone="negative" />);
    const deltaEl = screen.getByText("-5% from last month");
    expect(deltaEl).toBeInTheDocument();
    expect(deltaEl).toHaveClass("text-destructive");
  });

  it("renders icon when provided", () => {
    const { container } = render(<StatCard label="Users" value="100" icon={Users} />);
    // Check if the svg element for the icon is present inside the card
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies the correct glow text color class", () => {
    render(<StatCard label="Active" value="50" glow="turmeric" />);
    const valueEl = screen.getByText("50");
    expect(valueEl).toHaveClass("text-turmeric");
  });
});
