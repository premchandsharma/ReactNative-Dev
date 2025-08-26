"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _trackuser = require("./utils/trackuser.js");
var _trackuseraction = require("./utils/trackuseraction.js");
var _verifyuser = require("./utils/verifyuser.js");
var _verifyaccount = require("./utils/verifyaccount.js");
var _screen = require("./utils/screen.js");
var _banner = _interopRequireDefault(require("./components/banner.js"));
var _floater = _interopRequireDefault(require("./components/floater.js"));
var _pip = _interopRequireDefault(require("./components/pip.js"));
var _pipscreen = require("./components/pipscreen.js");
var _stories = _interopRequireDefault(require("./components/stories.js"));
var _storyscreen = require("./components/storyscreen.js");
var _Survey = _interopRequireDefault(require("./components/Survey.js"));
var _Csat = _interopRequireDefault(require("./components/Csat.js"));
var _Widgets = _interopRequireDefault(require("./components/Widgets.js"));
var _capturesurveyresponse = require("./utils/capturesurveyresponse.js");
var _capturecsatresponse = require("./utils/capturecsatresponse.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// import Tooltip from './components/Tooltip';

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
    this.campaigns = await (0, _screen.trackScreen)(app_id, screen_name);
    return this.campaigns;
  }
  async trackUser(user_id, attributes) {
    return await (0, _trackuser.trackUser)(user_id, attributes);
  }
  async trackUserAction(user_id, campaign_id, action) {
    return await (0, _trackuseraction.UserActionTrack)(user_id, campaign_id, action);
  }
  async verifyUser(user_id, attributes) {
    return await (0, _verifyuser.verifyUser)(user_id, this.campaigns, attributes);
  }
  async verifyAccount(account_id, app_id) {
    return await (0, _verifyaccount.verifyAccount)(account_id, app_id);
  }
  async CaptureSurveyResponse(userId, surveyId, responseOptions, comment) {
    return await (0, _capturesurveyresponse.CaptureSurveyResponse)(surveyId, userId, responseOptions, comment);
  }
  async CaptureCsatResponse(userId, csatId, rating, feedbackOption, additionalComments) {
    return await (0, _capturecsatresponse.CaptureCsatResponse)(csatId, userId, rating, feedbackOption, additionalComments);
  }

  // Function to initialize appstorys
  async initialize(app_id, account_id, user_id, screen_name, attributes) {
    await (0, _verifyaccount.verifyAccount)(account_id, app_id);
    this.campaigns = await (0, _screen.trackScreen)(app_id, screen_name);
    this.data = await (0, _verifyuser.verifyUser)(user_id, this.campaigns, attributes);
    return this.data;
  }
  // Function to initialize appstorys

  static Stories = _stories.default;
  static StoryScreen = _storyscreen.StoryScreen;
  static Floater = _floater.default;
  static Pip = _pip.default;
  static PipScreen = _pipscreen.PipScreen;
  static Banner = _banner.default;
  // public static Spotlight = Tooltip;
  static Survey = _Survey.default;
  static Csat = _Csat.default;
  static Widgets = _Widgets.default;
}
var _default = exports.default = new AppStorys();
//# sourceMappingURL=sdk.js.map