import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActivityForm } from "../ActivityForm";

// Mock supabase client (the form references supabase which may be undefined in tests)
vi.mock("../../lib/supabaseClient", () => ({
  supabase: null,
  hasSupabase: false,
}));

describe("ActivityForm", () => {
  test("renders main categories initially", () => {
    render(<ActivityForm />);
    // Heading
    expect(screen.getByText(/Main Log/i)).toBeInTheDocument();
    // Category buttons
    expect(
      screen.getByRole("button", { name: /Select Hydration category/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Select Nutrition category/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Select Personal Care category/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Select Incident category/i })
    ).toBeInTheDocument();
  });

  test("hydration -> confirm flow", () => {
    render(<ActivityForm />);
    const categoryBtn = screen.getByRole("button", {
      name: /Select Hydration category/i,
    });
    fireEvent.click(categoryBtn);
    // Now subtype list should appear (e.g. hydration)
    // Confirm phase shows Save button
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
  });

  test("incident -> subtype -> confirm flow", () => {
    render(<ActivityForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /Select Incident category/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Pick incident Breathing difficulty/i })
    );
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
  });

  test("icon aria-label present in confirm phase", () => {
    render(<ActivityForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /Select Hydration category/i })
    );
    // Find the icon by role=img
    const icon = screen.getByRole("img", { name: /hydration \(adl\) icon/i });
    expect(icon).toBeInTheDocument();
  });
});
