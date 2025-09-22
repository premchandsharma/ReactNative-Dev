import { captureScreen } from 'react-native-view-shot';
import { CaptureServiceActions, CaptureServiceStore, LayoutFrame, LayoutInfo } from "./types";
import { create } from "zustand/react";
import { getAccessToken, getUserId } from "../sdk/store";
import identifyWidgetPositions from "../actions/identifyWidgetPositions";

class CaptureService {
  private static layoutData: LayoutInfo[] = [];

  static setup(enabled: boolean, screenName: string | null) {
    const state = useCaptureServiceStore.getState();
    state.setScreenCaptureEnabled(enabled);
    state.setScreenName(screenName);
  }

  static getIsCapturing(): boolean {
    return useCaptureServiceStore.getState().isCapturing;
  }

  static getIsScreenCaptureEnabled(): boolean {
    return useCaptureServiceStore.getState().isScreenCaptureEnabled;
  }

  static addLayoutInfo(id: string, layout: LayoutFrame) {
    const existingIndex = this.layoutData.findIndex(item => item.id === id);
    const layoutInfo: LayoutInfo = {
      id,
      frame: layout,
    };

    if (existingIndex >= 0) {
      this.layoutData[existingIndex] = layoutInfo;
    } else {
      this.layoutData.push(layoutInfo);
    }
  }

  static clearLayoutData() {
    this.layoutData = [];
  }

  static async takeScreenshot(): Promise<boolean> {
    try {
      const screenName = useCaptureServiceStore.getState().screenName;
      if (!screenName) {
        console.error('Screen name is not set. Cannot identify elements.');
        return false;
      }

      this.setIsCapturing(true);

      // Small delay to ensure UI is settled
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the screen
      const screenshotPath = await captureScreen({
        format: 'png',
        quality: 1.0,
      });

      // Collect layout information
      const children = JSON.stringify(this.layoutData);

      console.log('Layout data:', this.layoutData);

      // Send to server for element identification
      await this.identifyElements({
        screenName,
        screenshotPath,
        children,
      });

      return true;
    } catch (error) {
      console.error('Screenshot failed:', error);
      return false;
    } finally {
      this.setIsCapturing(false);
    }
  }

  static dispose() {
    this.setIsCapturing(false);
    this.setup(false, null);
    this.clearLayoutData();
  }

  private static async identifyElements(
    {
      screenName,
      screenshotPath,
      children,
    }: {
      screenName: string;
      screenshotPath: string;
      children: string;
    }) {
    try {
      const accessToken = await getAccessToken();
      const userId = getUserId();

      if (!accessToken || !userId) {
        console.error('Error in identifyElements. Access token or user ID not found');
        return;
      }

      const formData = new FormData();
      formData.append('screenName', screenName);
      formData.append('user_id', userId);
      formData.append('children', children);
      formData.append('screenshot', {
        uri: screenshotPath,
        type: 'image/png',
        name: `screenshot_${userId}_${screenName}_${Date.now()}.png`,
      } as any);

      const response = await fetch(
        'https://backend.appstorys.com/api/v1/appinfo/identify-elements/',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      if (response.status === 200 || response.status === 201 || response.status === 204) {
        console.log('Elements identified successfully');
      } else {
        const responseText = await response.text();
        console.error(`Server error: ${response.status} ${responseText}`);
      }

      await identifyWidgetPositions(screenName)
    } catch (error) {
      console.error('Exception in identifyElements:', error);
    }
  }

  private static setIsCapturing(capturing: boolean) {
    useCaptureServiceStore.getState().setIsCapturing(capturing);
  }
}

export const useCaptureServiceStore = create<CaptureServiceStore & CaptureServiceActions>((set) => ({
  screenName: null,
  isCapturing: false,
  isScreenCaptureEnabled: false,
  setScreenName: (screenName) => set({ screenName }),
  setIsCapturing: (isCapturing) => set({ isCapturing }),
  setScreenCaptureEnabled: (isScreenCaptureEnabled) => set({ isScreenCaptureEnabled }),
}));

export default CaptureService;
