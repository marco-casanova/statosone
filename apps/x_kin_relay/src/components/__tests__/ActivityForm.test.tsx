import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActivityForm } from "../ActivityForm";

// Mock supabase client (the form references supabase which may be undefined in tests)
vi.mock("../../lib/supabaseClient", () => ({ supabase: null }));

describe("ActivityForm", () => {
  test("renders quick actions and categories initially", () => {
    render(<ActivityForm />);
    // Heading
    expect(screen.getByText(/Quick Log/i)).toBeInTheDocument();
    // Quick section label should exist (avoid ambiguity by using exact match among multiples)
    const quickLabels = screen.getAllByText(/^Quick$/i);
    expect(quickLabels.length).toBeGreaterThan(0);
    // Example quick action button
    expect(
      screen.getByRole("button", { name: /Hydration quick action/i })
    ).toBeInTheDocument();
    // Categories section label
    expect(screen.getByText(/Categories/i)).toBeInTheDocument();
  });

  test("category -> subtype -> confirm flow", () => {
    render(<ActivityForm />);
    const categoryBtn = screen.getByRole("button", {
      name: /Select adl category/i,
    });
    fireEvent.click(categoryBtn);
    // Now subtype list should appear (e.g. hydration)
    const subtypeBtn = screen.getByRole("button", {
      name: /Pick subtype hydration/i,
    });
    fireEvent.click(subtypeBtn);
    // Confirm phase shows Save button
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
  });

  test("quick action jumps directly to confirm phase", () => {
    render(<ActivityForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /Hydration quick action/i })
    );
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
  });

  test("icon aria-label present in confirm phase", () => {
    render(<ActivityForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /Hydration quick action/i })
    );
    // Find the icon by role=img
    const icon = screen.getByRole("img", { name: /hydration \(adl\) icon/i });
    expect(icon).toBeInTheDocument();
  });
});
