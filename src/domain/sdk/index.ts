import Banner from '../../components/Banner';
import BottomSheet from '../../components/BottomSheet';
import CaptureScreenButton from "../../components/CaptureScreenButton";
import Csat from '../../components/Csat';
import Floater from '../../components/Floater';
import Modal from '../../components/Modal';
import Pip from '../../components/pip';
import PipScreen from '../../components/pip/screen';
import Stories from '../../components/stories';
import StoriesScreen from '../../components/stories/screen';
import Survey from '../../components/Survey';
import Widgets from '../../components/Widgets';
import captureCsatResponse from '../actions/captureCsatResponse';
import captureSurveyResponse from '../actions/captureSurveyResponse';
import setUserProperties from "../actions/setUserProperties";
import trackScreen from '../actions/track-screen';
import trackEvent from "../actions/trackEvent";
import trackUser from '../actions/trackUser';
import trackUserAction from '../actions/trackUserAction';
import verifyAccount from '../actions/verifyAccount';
import verifyUser from '../actions/verifyUser';
import Measurable from '../capture/Measurable';
import MeasurementProvider from '../capture/MeasurementProvider';
import useAppStorysStore from "./store";
import {Attributes} from "./types";

class AppStorys {
  private isInitializing = false;

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

  public Stories = Stories;

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

  public async trackEvent(event: string, campaignId?: string, metadata?: Attributes) {
    await this.ensureInitialized();
    return trackEvent(event, campaignId, metadata);
  }

  public async setUserProperties(attributes: Attributes) {
    await this.ensureInitialized();
    return setUserProperties(attributes);
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

  public StoriesScreen = StoriesScreen;
  public Floater = Floater;
  public Pip = Pip;
  public PipScreen = PipScreen;
  public Banner = Banner;
  public CaptureScreenButton = CaptureScreenButton;
  // public Tooltip = Tooltip;
  public Survey = Survey;
  public Csat = Csat;
  public Widgets = Widgets;
  public Modal = Modal;
  public BottomSheet = BottomSheet
  public MeasurementProvider = MeasurementProvider;
  public Measurable = Measurable;
}

export default new AppStorys();
