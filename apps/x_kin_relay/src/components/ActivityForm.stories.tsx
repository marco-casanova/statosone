import type { Meta, StoryObj } from "@storybook/react";
import { ActivityForm } from "./ActivityForm";

// Simple story file for visual/manual regression (if Storybook is configured later)
const meta: Meta<typeof ActivityForm> = {
  title: "Activities/ActivityForm",
  component: ActivityForm,
  parameters: { layout: "centered" },
};
export default meta;

export const Basic: StoryObj<typeof ActivityForm> = {
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <ActivityForm />
    </div>
  ),
};
