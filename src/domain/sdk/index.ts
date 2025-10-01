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
import Screen from "../screen/Screen";
import Container from "../screen/Container";
import useAppStorysStore from "./store";
import {Attributes, SdkState} from "./types";

class AppStorys {
  private state = SdkState.uninitialized;

  public async initialize(
    appId: string,
    accountId: string,
    userId: string,
    attributes?: Attributes
  ) {
    if (this.state === SdkState.initializing) {
      console.error('AppStorys is already initializing. Please wait for it to complete.');
      return;
    }

    if (this.state === SdkState.initialized) {
      // check if the same creds are being used
      const state = useAppStorysStore.getState();
      if (state.appId === appId && state.accountId === accountId && state.userId === userId) {
        console.warn('AppStorys is already initialized with the same credentials.');
        return;
      }
    }

    this.state = SdkState.initializing;
    console.log('Initializing AppStorys SDK...');

    try {
      const success = await verifyAccount(accountId, appId);
      if (success) {
        const state = useAppStorysStore.getState();
        state.setAppId(appId);
        state.setAccountId(accountId);
        state.setUserId(userId);
        if (attributes) {
          state.setAttributes(attributes);
        }
        this.state = SdkState.initialized;
        console.log('AppStorys SDK initialized successfully.');
      } else {
        this.state = SdkState.error;
        return Promise.reject(new Error('Account verification failed'));
      }
    } catch (e) {
      this.state = SdkState.error;
      return Promise.reject(e);
    }
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

  public async trackEvent(event: string, campaignId?: string, metadata?: Attributes) {
    await this.ensureInitialized();
    return trackEvent(event, campaignId, metadata);
  }

  public async setUserProperties(attributes: Attributes) {
    await this.ensureInitialized();
    return setUserProperties(attributes);
  }

  public async trackScreen(screenName: string) {
    await this.ensureInitialized();
    await trackScreen(screenName, arguments[1] !== false);
  }

  private async ensureInitialized() {
    if (this.state === SdkState.error) {
      throw new Error('AppStorys initialization failed previously. Please check your credentials and try again.');
    } else if (this.state === SdkState.initialized) {
      return;
    }

    const startTime = Date.now();

    // Wait if not initialized yet or in the process of initializing
    console.log('Waiting for AppStorys SDK to initialize...');
    while (this.state === SdkState.uninitialized || this.state === SdkState.initializing) {
      // Timeout after 10 seconds for uninitialized state
      if (this.state === SdkState.uninitialized && Date.now() - startTime > 10000) {
        throw new Error('AppStorys not initialized within timeout. Call initialize() first.');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (this.state === SdkState.error) {
      throw new Error('AppStorys initialization failed. Please check your credentials and try again.');
    } else if (this.state !== SdkState.initialized) {
      throw new Error('AppStorys not initialized. Call initialize() first.'); // this is a fallback, should not reach here
    }
  }

  public Container = Container;
  public Screen = Screen;
  public Stories = Stories;
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
  public BottomSheet = BottomSheet;
  public Measurable = Measurable;
}

const instance = new AppStorys();

export default instance;
