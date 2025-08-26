import { trackUser } from './utils/trackuser';
import { UserActionTrack } from './utils/trackuseraction';
import { verifyUser } from './utils/verifyuser';
import { verifyAccount } from './utils/verifyaccount';
import { trackScreen } from './utils/screen';
import Banner from './components/banner';
import Floater from './components/floater';
import Pip from './components/pip';
import { PipScreen } from './components/pipscreen';
import Stories from './components/stories';
import { StoryScreen } from './components/storyscreen';
// import Tooltip from './components/Tooltip';
import Survey from './components/Survey';
import Csat from './components/Csat';
import Widgets from './components/Widgets';
import { CaptureSurveyResponse } from './utils/capturesurveyresponse';
import { CaptureCsatResponse } from './utils/capturecsatresponse';

export type StoryGroup = {
  ringColor: string;
  thumbnail: string;
  name: string;
}

export type StoryGroupData = {
  ringColor: string;
  thumbnail: string;
  name: string;
}

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

// export type CampaignSpotlight = {
//   id: string,
//   campaign_type: 'SPO',
//   details: {
//     id: string,
//     title: string,
//     target_element: string,
//     description_text: string,
//     styling: {
//       [key: string]: string;
//     },
//     position: string,
//     background_opacity: number,
//     animation_type: string,
//     animation_duration: number,
//     screen: number,
//     campaign: string,
//   }
// }

export type CampaignStory = {
  id: string,
  campaign_type: 'STR',
  details: [
    {
      id: string,
      name: string,
      thumbnail: string,
      ringColor: string,
      nameColor: string,
      order: number,
      slides: [
        {
          id: string,
          parent: string
          image: null | string,
          video: null | string,
          link: null | string,
          button_text: null | string,
          order: number;
          content: string | null
        }
      ]
    },
  ]
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
    title: string;
    styling: {
      [key: string]: string;
    },
    thankyouImage: string;
    thankyouText: string;
    thankyouDescription: string;
    description_text: string;
    feedback_option: {
      [key: string]: string;
    },
    campaign: string;
    screen: number;
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
    campaign: string,
  },
}

export type UserData = {
  campaigns: Array<CampaignFloater | CampaignStory | CampaignBanner | CampaignPip | CampaignSurvey |
    // CampaignSpotlight | 
    CampaignCsat | CampaignWidgets>;
  user_id: string;
}

class AppStorys {

  private static instance: AppStorys;

  private campaigns: any[] = [];

  private data: UserData | undefined;


  public static getInstance(): AppStorys {
    if (!AppStorys.instance) {
      AppStorys.instance = new AppStorys();
    }
    return AppStorys.instance;
  }

  public async trackScreen(app_id: string, screen_name: string) {
    this.campaigns = await trackScreen(app_id, screen_name);
    return this.campaigns;
  }
  public async trackUser(user_id: string, attributes?: any) {
    return await trackUser(user_id, attributes);
  }

  public async trackUserAction(user_id: string, campaign_id: string, action: any) {
    return await UserActionTrack(user_id, campaign_id, action);
  }

  public async verifyUser(user_id: string, attributes?: any): Promise<UserData | undefined> {
    return await verifyUser(user_id, this.campaigns, attributes);
  }

  public async verifyAccount(account_id: string, app_id: string) {
    return await verifyAccount(account_id, app_id);
  }

  public async CaptureSurveyResponse(userId: string, surveyId: string, responseOptions: string[], comment?: string) {
    return await CaptureSurveyResponse(surveyId, userId, responseOptions, comment);
  }

  public async CaptureCsatResponse(userId: string, csatId: string,rating: number , feedbackOption?: string, 
    additionalComments?: string,) {
    return await CaptureCsatResponse(csatId, userId, rating, feedbackOption, additionalComments, );
  }

  // Function to initialize appstorys
  public async initialize(app_id: string, account_id: string, user_id: string, screen_name: string, attributes?: any,) {

    await verifyAccount(account_id, app_id);
    this.campaigns =  await trackScreen(app_id, screen_name);
    this.data = await verifyUser(user_id, this.campaigns, attributes);
    return this.data;
  }
  // Function to initialize appstorys

  public static Stories = Stories;
  public static StoryScreen = StoryScreen;
  public static Floater = Floater;
  public static Pip = Pip;
  public static PipScreen = PipScreen;
  public static Banner = Banner;
  // public static Spotlight = Tooltip;
  public static Survey = Survey;
  public static Csat = Csat;
  public static Widgets = Widgets;

}

export default new AppStorys();
