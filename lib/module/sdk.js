"use strict";

import { trackUser } from "./utils/trackuser.js";
import { UserActionTrack } from "./utils/trackuseraction.js";
import { verifyUser } from "./utils/verifyuser.js";
import { verifyAccount } from "./utils/verifyaccount.js";
import { trackScreen } from "./utils/screen.js";
import Banner from "./components/banner.js";
import Floater from "./components/floater.js";
import Pip from "./components/pip.js";
import { PipScreen } from "./components/pipscreen.js";
import Stories from "./components/stories.js";
import { StoryScreen } from "./components/storyscreen.js";
// import Tooltip from './components/Tooltip';
import Survey from "./components/Survey.js";
import Csat from "./components/Csat.js";
import Widgets from "./components/Widgets.js";
import { CaptureSurveyResponse } from "./utils/capturesurveyresponse.js";
import { CaptureCsatResponse } from "./utils/capturecsatresponse.js";

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

class AppStorys {
  campaigns = [];
  static getInstance() {
    if (!AppStorys.instance) {
      AppStorys.instance = new AppStorys();
    }
    return AppStorys.instance;
  }
  async trackScreen(app_id, screen_name) {
    this.campaigns = await trackScreen(app_id, screen_name);
    return this.campaigns;
  }
  async trackUser(user_id, attributes) {
    return await trackUser(user_id, attributes);
  }
  async trackUserAction(user_id, campaign_id, action) {
    return await UserActionTrack(user_id, campaign_id, action);
  }
  async verifyUser(user_id, attributes) {
    return await verifyUser(user_id, this.campaigns, attributes);
  }
  async verifyAccount(account_id, app_id) {
    return await verifyAccount(account_id, app_id);
  }
  async CaptureSurveyResponse(userId, surveyId, responseOptions, comment) {
    return await CaptureSurveyResponse(surveyId, userId, responseOptions, comment);
  }
  async CaptureCsatResponse(userId, csatId, rating, feedbackOption, additionalComments) {
    return await CaptureCsatResponse(csatId, userId, rating, feedbackOption, additionalComments);
  }

  // Function to initialize appstorys
  async initialize(app_id, account_id, user_id, screen_name, attributes) {
    await verifyAccount(account_id, app_id);
    this.campaigns = await trackScreen(app_id, screen_name);
    this.data = await verifyUser(user_id, this.campaigns, attributes);
    return this.data;
  }
  // Function to initialize appstorys

  static Stories = Stories;
  static StoryScreen = StoryScreen;
  static Floater = Floater;
  static Pip = Pip;
  static PipScreen = PipScreen;
  static Banner = Banner;
  // public static Spotlight = Tooltip;
  static Survey = Survey;
  static Csat = Csat;
  static Widgets = Widgets;
}
export default new AppStorys();
//# sourceMappingURL=sdk.js.map