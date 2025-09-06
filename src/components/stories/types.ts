import { CampaignStory } from "../../domain/sdk/types";

export type StoryData = {
  slideData: CampaignStory;
  campaignId: string;
  initialGroupIndex: number;
};