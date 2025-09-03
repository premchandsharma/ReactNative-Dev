import {CampaignStory} from "../../domain/sdk/types";

export type StoriesScreenRootStackParamList = {
  StoryScreen: {
    storySlideData: CampaignStory;
    storyCampaignId: string;
    initialGroupIndex: number;
  };
};
