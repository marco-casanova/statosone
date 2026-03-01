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

  test("clicking a selected region removes it", () => {
    render(<Harness />);

    const kneeButton = screen.getByRole("button", {
      name: "Front Left Knee",
    });
    fireEvent.click(kneeButton);
    expect(kneeButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText("Front: Left knee").length).toBeGreaterThan(0);

    fireEvent.click(kneeButton);
    expect(screen.queryByText("Front: Left knee")).not.toBeInTheDocument();
    expect(kneeButton).toHaveAttribute("aria-pressed", "false");
  });
});
