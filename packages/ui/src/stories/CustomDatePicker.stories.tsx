import type { Meta, StoryObj } from "@storybook/react-vite";
import { CustomDatePicker, FieldError, Label } from "@ui";
import type { ComponentProps } from "react";
import { useState } from "react";

type CustomDatePickerStoryArgs = ComponentProps<typeof CustomDatePicker>;

function StatefulDatePickerStory(args: CustomDatePickerStoryArgs) {
  const [value, setValue] = useState(args.value);

  return (
    <div className="max-w-sm space-y-2">
      <Label htmlFor={args.id}>Data/hora de encerramento</Label>
      <CustomDatePicker {...args} value={value} onChange={setValue} />
    </div>
  );
}

function InvalidDatePickerStory(args: CustomDatePickerStoryArgs) {
  const [value, setValue] = useState(args.value);

  return (
    <div className="max-w-sm space-y-2">
      <Label htmlFor={args.id}>Data/hora de encerramento</Label>
      <CustomDatePicker {...args} value={value} onChange={setValue} />
      <FieldError id="auction-ends-at-error-story">
        Selecione uma data futura para o encerramento.
      </FieldError>
    </div>
  );
}

const meta = {
  title: "Forms/CustomDatePicker",
  component: CustomDatePicker,
  tags: ["autodocs"],
  args: {
    id: "auction-ends-at-story",
    value: "2026-05-15T14:30",
    includeTime: true,
    onChange: () => {},
  },
  render: (args) => <StatefulDatePickerStory {...args} />,
} satisfies Meta<typeof CustomDatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DateTime: Story = {};

export const DateOnly: Story = {
  args: {
    id: "activity-log-start-date-story",
    includeTime: false,
    value: "2026-05-02",
  },
};

export const Empty: Story = {
  args: {
    value: "",
    placeholder: "Selecione uma data",
  },
};

export const Invalid: Story = {
  args: {
    "aria-describedby": "auction-ends-at-error-story",
    "aria-invalid": true,
    value: "",
  },
  render: (args) => <InvalidDatePickerStory {...args} />,
};
