import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BodyLocationPicker } from "../BodyLocationPicker";
import { BodyLocation } from "../../types/bodyLocation";

function Harness() {
  const [value, setValue] = useState<BodyLocation[]>([]);
  return <BodyLocationPicker value={value} onChange={setValue} embedded />;
}

describe("BodyLocationPicker", () => {
  test("selecting a region adds a body-location chip", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Front Left Knee" }));

    expect(screen.getAllByText("Front: Left knee").length).toBeGreaterThan(0);
  });

  test("selecting another region keeps locations distinct", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Front Left Knee" }));
    fireEvent.click(screen.getByRole("button", { name: "Front Right Knee" }));

    expect(screen.getAllByText("Front: Left knee").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Front: Right knee").length).toBeGreaterThan(0);
  });

  test("fingers and toes can be selected as body regions", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Front Left Fingers" }));
    fireEvent.click(screen.getByRole("button", { name: "Left side Toes" }));

    expect(screen.getAllByText("Front: Left fingers").length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("Left side: Toes").length).toBeGreaterThan(0);
  });

  test("all body views are labeled distinctly", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Front Head" }));
    fireEvent.click(screen.getByRole("button", { name: "Back Head" }));
    fireEvent.click(screen.getByRole("button", { name: "Left side Head" }));
    fireEvent.click(screen.getByRole("button", { name: "Right side Head" }));

    expect(screen.getAllByText("Front: Head").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Back: Head").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Left side: Head").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Right side: Head").length).toBeGreaterThan(0);
  });

  test("discomfort options can be attached to a selected body location", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Front Neck" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Toggle Inflammation for Front: Neck",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Toggle Pain for Front: Neck",
      }),
    );

    expect(
      screen.getByText("Front: Neck - Pain, Inflammation"),
    ).toBeInTheDocument();
  });

  test("clicking a selected region opens the discomfort popup", () => {
    render(<Harness />);

    const kneeButton = screen.getByRole("button", {
      name: "Front Left Knee",
    });
    // First click adds the region and auto-opens the popup
    fireEvent.click(kneeButton);
    expect(kneeButton).toHaveAttribute("aria-pressed", "true");

    // Popup should show region-specific discomfort options
    expect(
      screen.getByRole("button", { name: /Toggle Pain for/ }),
    ).toBeInTheDocument();

    // Close popup by clicking the same region again
    fireEvent.click(kneeButton);
    expect(
      screen.queryByRole("button", { name: /Toggle Pain for/ }),
    ).not.toBeInTheDocument();

    // Region should still be selected
    expect(kneeButton).toHaveAttribute("aria-pressed", "true");
  });
});
