import Banner from '../../components/Banner';
// import Tooltip from './components/Tooltip';
import Survey from '../../components/Survey';
import Csat from '../../components/Csat';
import Widgets from '../../components/Widgets';
import {Attributes} from "./types";
import trackUserAction from '../actions/trackUserAction';
import useAppStorysStore from "./store";
import verifyAccount from '../actions/verifyAccount';
import trackScreen from '../actions/track-screen';
import trackUser from '../actions/trackUser';
import verifyUser from '../actions/verifyUser';
import captureSurveyResponse from '../actions/captureSurveyResponse';
import captureCsatResponse from '../actions/captureCsatResponse';
import Stories from '../../components/stories';
import Pip from '../../components/pip';
import PipScreen from '../../components/pip/screen';
import StoriesScreen from '../../components/stories/screen';
import Floater from '../../components/Floater';

class AppStorys {

  public static Stories = Stories;
  public static StoriesScreen = StoriesScreen;
  public static Floater = Floater;
  public static Pip = Pip;
  public static PipScreen = PipScreen;
  public static Banner = Banner;
  // public static Spotlight = Tooltip;
  public static Survey = Survey;
  public static Csat = Csat;
  public static Widgets = Widgets;
  private static instance: AppStorys;
  private isInitializing = false;

  public static getInstance(): AppStorys {
    if (!AppStorys.instance) {
      AppStorys.instance = new AppStorys();
    }
    return AppStorys.instance;
  }

  public async initialize(
    appId: string,
    accountId: string,
    userId: string,
    attributes?: Attributes
  ) {
    if (this.isInitializing) {
      throw new Error('Initialization already in progress');
    }
    this.isInitializing = true;
    const success = await verifyAccount(accountId, appId);
    if (success) {
      const state = useAppStorysStore.getState();
      state.setAppId(appId);
      state.setAccountId(accountId);
      state.setUserId(userId);
      if (attributes) {
        state.setAttributes(attributes);
      }
    } else {
      throw new Error('Account verification failed');
    }
    this.isInitializing = false;
  }

  public async trackScreen(screenName: string) {
    await this.ensureInitialized();
    await trackScreen(screenName);
  }

  public async trackUser(attributes?: Attributes) {
    await this.ensureInitialized();
    return trackUser(attributes);
  }

  public async trackUserAction(campaignId: string, action: any) {
    await this.ensureInitialized();
    return trackUserAction(campaignId, action);
  }

  public async verifyUser(attributes?: Attributes) {
    await this.ensureInitialized();
    return verifyUser(attributes);
  }

  public async verifyAccount(accountId: string, appId: string) {
    return verifyAccount(accountId, appId);
  }

  public async captureSurveyResponse(surveyId: string, responseOptions: string[], comment?: string) {
    await this.ensureInitialized();
    return captureSurveyResponse(surveyId, responseOptions, comment);
  }

  public async captureCsatResponse(
    csatId: string,
    rating: number,
    feedbackOption?: string,
    additionalComments?: string
  ) {
    await this.ensureInitialized();
    return captureCsatResponse(csatId, rating, feedbackOption, additionalComments);
  }

  private async ensureInitialized() {
    // Wait if initialization is in progress
    while (this.isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    const state = useAppStorysStore.getState();
    if (!state.userId || !state.appId || !state.accountId) {
      throw new Error('AppStorys not initialized. Call initialize() first.');
    }
  }
}

export default new AppStorys();
