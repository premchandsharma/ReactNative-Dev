import {CampaignTooltips} from "../tooltips/types";

export type CampaignFloater = {
  id: string,
  campaign_type: 'FLT',
  details: {
    id: string,
    image: string,
    link: string | null,
    width: null | number,
    height: null | number,
    position: null | string,
  }
}

export type CampaignStorySlide = {
  id: string,
  parent: string
  image: null | string,
  video: null | string,
  link: null | string,
  button_text: null | string,
  order: number;
  content: string | null
  finish: number
}

export type CampaignStoryGroup = {
  id: string,
  name: string,
  thumbnail: string,
  ringColor: string,
  nameColor: string,
  order: number,
  slides: Array<CampaignStorySlide>
}

export type CampaignStory = {
  id: string,
  campaign_type: 'STR',
  details: Array<CampaignStoryGroup>
}

export type CampaignBanner = {
  id: string,
  campaign_type: 'BAN',
  details: {
    id: string,
    image: string,
    width: null | number,
    height: null | number,
    link: null | string,
    styling: {
      [key: string]: string;
    },
  }
}

export type CampaignPip = {
  id: string
  campaign_type: 'PIP',
  details: {
    id: string,
    small_video: string,
    height: null | number,
    width: null | number,
    large_video: string,
    link: string | null,
    button_text: string | null,
    position: null | string,
    campaign: string,
    screen: number,
  }
}

export type CampaignSurvey = {
  id: string,
  campaign_type: 'SUR',
  details: {
    id: string,
    name: string;
    responses: number;
    styling: {
      [key: string]: string;
    },
    surveyQuestion: string;
    surveyOptions: {
      [key: string]: string;
    },
    campaign: string;
    hasOthers: boolean;
    screen: string;
  }
}

export type CampaignCsat = {
  id: string,
  campaign_type: 'CSAT',
  details: {
    id: string,
    description_text: string;
    feedback_option: {
      [key: string]: string;
    },
    highStarText: string;
    link: string;
    lowStarText: string,
    title: string;
    styling: {
      [key: string]: string;
    },
    thankyouImage: string;
    thankyouText: string;
    thankyouDescription: string;
  }
}

export type CampaignWidgets = {
  id: string,
  campaign_type: 'WID',
  details: {
    id: string,
    type: string,
    height: number,
    widget_images: [
      {
        id: string,
        image: string,
        link: string,
        order: number;
      }
    ],
    styling: {
      [key: string]: string;
    },
    campaign: string,
  },
}

export interface CampaignModal {
  id: string;
  campaign_type: "MOD";
  details: ModalDetails;
}

export interface ModalDetails {
  modals?: Array<{
    url?: string;
    size?: string;
    borderRadius?: string;
    backgroundOpacity?: string;
    link?: string;
  }>;
}

export interface BottomSheetElement {
  type?: "image" | "body" | "cta";
  order?: number;
  url?: string;
  imageLink?: string;
  overlayButton?: boolean;
  titleText?: string;
  descriptionText?: string;
  ctaText?: string;
  ctaLink?: string;
  position?: "left" | "right" | "center";
  alignment?: "left" | "right" | "center";
  paddingLeft?: string;
  paddingRight?: string;
  paddingTop?: string;
  paddingBottom?: string;
  ctaFullWidth?: boolean;
  // Add other styling properties as needed
}

export interface BottomSheetDetails {
  elements?: BottomSheetElement[];
  cornerRadius?: string;
  enableCrossButton?: string;
}

export interface CampaignBottomSheet {
  id: string;
  campaign_type: "BTS";
  details: BottomSheetDetails;
}

export interface Attributes {
  [key: string]: string;
}

export interface AppStorysStore {
  campaigns: Array<Campaign>;
  userId: string;
  appId: string;
  accountId: string;
  attributes?: Attributes;
}

export interface AppStorysActions {
  setCampaigns: (campaigns: Array<Campaign>) => void;
  setUserId: (userId: string) => void;
  setAppId: (appId: string) => void;
  setAccountId: (accountId: string) => void;
  setAttributes: (attributes: Attributes) => void;
}

export interface AppStorysComponentProps {
  topPadding?: number;
  bottomPadding?: number;
}

export type Campaign = CampaignFloater | CampaignStory | CampaignBanner | CampaignPip | CampaignSurvey |
  CampaignTooltips |
  CampaignCsat | CampaignWidgets | CampaignModal | CampaignBottomSheet;
