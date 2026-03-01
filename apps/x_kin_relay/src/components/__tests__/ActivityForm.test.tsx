import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActivityForm } from "../ActivityForm";

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const dict: Record<string, string> = {
      main_log: "Main Log",
      "sections.quick_actions": "Quick Actions",
      "sections.categories": "Categories",
      "sections.incident_types": "Incident Types",
      "sections.recent_tasks": "Recent Tasks",
      "actions.save": "Save",
      "actions.saving": "Saving...",
      "actions.cancel": "Cancel",
      "actions.expand": "Expand",
      "actions.collapse": "Collapse",
      "states.loading": "Loading...",
      "states.no_tasks": "No tasks logged yet.",
      "states.no_clients": "No clients available",
      "labels.client": "Client",
      "labels.category": "Category",
      "labels.observed_at": "Observed at",
      "labels.assistance_level": "Assistance level",
      "labels.select_level": "Select level",
      "labels.fluid_type_optional": "Fluid type (optional)",
      "labels.food_type_caregiver_input": "Food type (caregiver input)",
      "placeholders.fluid_type": "Water, tea, juice, etc.",
      "placeholders.food_type": "Examples: pasta bolognesa, soup...",
      "helpers.hydration_multi": "Select multiple amounts to add them up.",
      "helpers.total_ml": "Total: {value} ml",
      "messages.pick_incident_type": "Pick incident type",
      "messages.saved_demo": "(demo) Saved",
      "messages.saved": "Saved",
      "messages.save_error": "Save error",
      "aria.show_assistance_info": "Show assistance level explanations",
      "aria.configure_quick_log": "Configure quick log",
      "aria.configure_quick_actions": "Configure quick actions",
      "aria.quick_action": "quick action",
      "aria.select": "Select",
      "aria.select_client": "Select client",
      "aria.go_back": "Go back",
      "aria.pick_incident": "Pick incident",
      "aria.add_to_quick_log": "Add to quick log",
      "aria.remove_from_quick_log": "Remove from quick log",
      "assistance_levels.title": "Assistance Levels",
      "assistance_levels.independent.label": "Independent",
      "assistance_levels.independent.desc":
        "Person completes task without help",
      "assistance_levels.supervision.label": "Supervision",
      "assistance_levels.supervision.desc":
        "Caregiver observes for safety (keep an eye)",
      "assistance_levels.prompted.label": "Prompted",
      "assistance_levels.prompted.desc":
        "Needs cues or setup (e.g., cut food into pieces)",
      "assistance_levels.assisted.label": "Assisted",
      "assistance_levels.assisted.desc":
        "Hands-on help with parts or most of the task",
    };

    return (key: string, values?: Record<string, string | number>) => {
      const template = dict[key] || key;
      if (!values) return template;
      return template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ""));
    };
  },
}));

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
    // Category buttons (normalized 10-category catalog)
    expect(
      screen.getByRole("button", { name: /Select Sleep Pattern categories/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Select Hydration categories/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Select Nutrition categories/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Select Medication Administration categories/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Select Incident categories/i }),
    ).toBeInTheDocument();
  });

  test("hydration category opens detail view immediately", () => {
    render(<ActivityForm />);
    const categoryBtn = screen.getByRole("button", {
      name: /Select Hydration categories/i,
    });
    fireEvent.click(categoryBtn);
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Water")).toBeInTheDocument();
  });

  test("switching subcategory inside detail updates the preset", () => {
    render(<ActivityForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /Select Hydration categories/i }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Select Juice/i }),
    );
    expect(screen.getByDisplayValue("Juice")).toBeInTheDocument();
  });

  test("incident category opens detail and still allows subtype switching", () => {
    render(<ActivityForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /Select Incident categories/i }),
    );
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /Pick incident Abrasion/i }),
    );
    expect(screen.getAllByText("Abrasion").length).toBeGreaterThan(0);
  });

  test("incident includes the new grouped subtype catalog and options", () => {
    render(<ActivityForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /Select Incident categories/i }),
    );

    expect(
      screen.getByRole("button", { name: /Pick incident Cough/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Pick incident Sleep apnea/i }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Pick incident Medication error/i }),
    );
    expect(screen.getByRole("button", { name: "Missed dose" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Overdose" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wrong med" })).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Pick incident Environment hazard/i }),
    );
    expect(screen.getByRole("button", { name: "Chemicals" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Flooring" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Infestation" }),
    ).toBeInTheDocument();
  });

  test("icon aria-label present in confirm phase", () => {
    render(<ActivityForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /Select Hydration categories/i }),
    );
    const icons = screen.getAllByRole("img", {
      name: /hydration \(adl\) icon/i,
    });
    expect(icons.length).toBeGreaterThan(0);
  });
});
