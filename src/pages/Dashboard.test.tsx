import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Dashboard from "./Dashboard";
import { BrowserRouter } from "react-router-dom";
import { useStore } from "@/hooks/useStore";

// Mock the useStore hook
vi.mock("@/hooks/useStore", () => ({
  useStore: vi.fn(),
}));

vi.mock("@/lib/store", () => ({
  useStore: vi.fn(() => ({
    addCustomer: vi.fn(),
    addTransaction: vi.fn(),
    customers: [],
    transactions: [],
  })),
}));

describe("Dashboard Page", () => {
  it("renders dashboard with empty state", () => {
    // Setup mock data
    (useStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      customers: [],
      transactions: [],
      reminderLogs: [],
      session: { shopName: "Test Shop" },
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Check if the greeting and shop name are rendered
    expect(screen.getByText(/Test Shop/)).toBeInTheDocument();
    
    // Check if stat cards are rendered
    expect(screen.getByText("Active Customers")).toBeInTheDocument();
    expect(screen.getByText("Total Udhaar")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    
    // Check empty state messages
    expect(screen.getByText("All caught up — no pending dues. 🎉")).toBeInTheDocument();
  });

  it("renders dashboard with customer data", () => {
    (useStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      customers: [
        { id: 1, name: "John Doe", totalDue: 1000, status: "pending", avatarColor: "bg-red-500", initials: "JD", lastTransaction: "Today" },
      ],
      transactions: [],
      reminderLogs: [],
      session: null, // default "Our Shop"
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Check if the customer is rendered in Priority Collections
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    
    // The shop name should default to "Our Shop"
    expect(screen.getByText(/Our Shop/)).toBeInTheDocument();
  });
});
