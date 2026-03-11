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

    fireEvent.click(screen.getByRole("button", { name: "Front Forehead" }));

    expect(screen.getAllByText("Front: Forehead").length).toBeGreaterThan(0);
  });

  test("selecting another region keeps locations distinct", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Front Forehead" }));
    fireEvent.click(screen.getByRole("button", { name: "Back Spine" }));

    expect(screen.getAllByText("Front: Forehead").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Back: Spine").length).toBeGreaterThan(0);
  });

  test("duplicate shapes for one part are selected independently", () => {
    const { container } = render(<Harness />);

    const rightKneeButton = screen.getByRole("button", {
      name: "Front Knees 2",
    });
    fireEvent.click(rightKneeButton);

    const selectedKnees = container.querySelectorAll(
      '.region[data-view="front"][data-part="knees"][data-selected="true"]',
    );
    expect(selectedKnees.length).toBe(1);
  });

  test("all body views can be selected", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Front Forehead" }));
    fireEvent.click(screen.getByRole("button", { name: "Back Back Of Head" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Left side Left Knee" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Right side Right Knee" }),
    );

    expect(screen.getAllByText("Front: Forehead").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Back: Back of head").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Left side: Left knee").length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByText("Right side: Right knee").length,
    ).toBeGreaterThan(0);
  });

  test("wrist regions can be selected", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Back Wrists 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Left side Wrists" }));
    fireEvent.click(screen.getByRole("button", { name: "Right side Wrists" }));

    expect(screen.getAllByText("Back: Wrists").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Left side: Wrists").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Right side: Wrists").length).toBeGreaterThan(0);
  });

  test("clicking a selected region removes it", () => {
    render(<Harness />);

    const foreheadButton = screen.getByRole("button", {
      name: "Front Forehead",
    });
    fireEvent.click(foreheadButton);
    expect(screen.getAllByText("Front: Forehead").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Front Forehead" }));
    expect(screen.queryByText("Front: Forehead")).not.toBeInTheDocument();
  });

  test("keyboard interaction toggles a region", () => {
    render(<Harness />);

    const backHeadButton = screen.getByRole("button", {
      name: "Back Back Of Head",
    });

    fireEvent.keyDown(backHeadButton, { key: "Enter" });
    expect(screen.getAllByText("Back: Back of head").length).toBeGreaterThan(0);

    fireEvent.keyDown(
      screen.getByRole("button", { name: "Back Back Of Head" }),
      {
        key: "Enter",
      },
    );
    expect(screen.queryByText("Back: Back of head")).not.toBeInTheDocument();
  });

  test("clear removes all selected regions", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Front Forehead" }));
    fireEvent.click(screen.getByRole("button", { name: "Back Spine" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.queryByText("Front: Forehead")).not.toBeInTheDocument();
    expect(screen.queryByText("Back: Spine")).not.toBeInTheDocument();
    expect(screen.getByText("None")).toBeInTheDocument();
  });
});
