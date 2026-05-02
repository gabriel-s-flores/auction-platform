import { describe, expect, test } from "vitest";

import * as AlertStories from "./Alert.stories";
import * as AuctionCardStories from "./AuctionCard.stories";
import * as BadgeStories from "./Badge.stories";
import * as ButtonStories from "./Button.stories";
import * as CardStories from "./Card.stories";
import * as CustomDatePickerStories from "./CustomDatePicker.stories";
import * as FieldErrorStories from "./FieldError.stories";
import * as ImageCarouselStories from "./ImageCarousel.stories";
import * as ImageUploaderStories from "./ImageUploader.stories";
import * as InputStories from "./Input.stories";
import * as LabelStories from "./Label.stories";
import * as ModalStories from "./Modal.stories";
import * as ResponsiveImageStories from "./ResponsiveImage.stories";

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
  ["ImageCarousel", ImageCarouselStories],
  ["ImageUploader", ImageUploaderStories],
  ["Input", InputStories],
  ["Label", LabelStories],
  ["Modal", ModalStories],
  ["ResponsiveImage", ResponsiveImageStories],
];

describe("Storybook stories", () => {
  test.each(storyModules)("%s exports metadata and at least one story", (_, stories) => {
    const namedStories = Object.keys(stories).filter((storyName) => storyName !== "default");

    expect(stories.default.title).toBeTruthy();
    expect(stories.default.component).toBeTruthy();
    expect(namedStories.length).toBeGreaterThan(0);
  });
});
