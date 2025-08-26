import { CampaignStory } from "../sdk";
type StorySlide = CampaignStory["details"][0]["slides"][0] & {
    finish: number;
};
type StoryGroup = CampaignStory["details"][0] & {
    slides: StorySlide[];
};
export interface StoriesProps {
    data: {
        id: string;
        details: StoryGroup[];
    };
}
export declare const StoryScreen: () => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=storyscreen.d.ts.map