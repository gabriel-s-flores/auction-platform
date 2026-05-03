import { describe, expect, test } from "vitest";

import * as AlertStories from "./Alert.stories";
import * as AuctionCardStories from "./AuctionCard.stories";
import * as BadgeStories from "./Badge.stories";
import * as ButtonStories from "./Button.stories";
import * as CardStories from "./Card.stories";
import * as CustomDatePickerStories from "./CustomDatePicker.stories";
import * as FieldErrorStories from "./FieldError.stories";
import * as FormFieldStories from "./FormField.stories";
import * as ImageCarouselStories from "./ImageCarousel.stories";
import * as ImageUploaderStories from "./ImageUploader.stories";
import * as InputStories from "./Input.stories";
import * as LabelStories from "./Label.stories";
import * as ModalStories from "./Modal.stories";
import * as PaginationStories from "./Pagination.stories";
import * as ResponsiveImageStories from "./ResponsiveImage.stories";
import * as SelectStories from "./Select.stories";
import * as StateMessageStories from "./StateMessage.stories";
import * as TextareaStories from "./Textarea.stories";

type StoryModule = {
  default: {
    component?: unknown;
    title?: string;
  };
  [storyName: string]: unknown;
};

const storyModules: Array<[string, StoryModule]> = [
  ["Alert", AlertStories],
  ["AuctionCard", AuctionCardStories],
  ["Badge", BadgeStories],
  ["Button", ButtonStories],
  ["Card", CardStories],
  ["CustomDatePicker", CustomDatePickerStories],
  ["FieldError", FieldErrorStories],
  ["FormField", FormFieldStories],
  ["ImageCarousel", ImageCarouselStories],
  ["ImageUploader", ImageUploaderStories],
  ["Input", InputStories],
  ["Label", LabelStories],
  ["Modal", ModalStories],
  ["Pagination", PaginationStories],
  ["ResponsiveImage", ResponsiveImageStories],
  ["Select", SelectStories],
  ["StateMessage", StateMessageStories],
  ["Textarea", TextareaStories],
];

describe("Storybook stories", () => {
  test.each(storyModules)("%s exports metadata and at least one story", (_, stories) => {
    const namedStories = Object.keys(stories).filter((storyName) => storyName !== "default");

    expect(stories.default.title).toBeTruthy();
    expect(stories.default.component).toBeTruthy();
    expect(namedStories.length).toBeGreaterThan(0);
  });
});
