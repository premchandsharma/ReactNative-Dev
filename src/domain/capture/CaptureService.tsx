import {captureScreen} from 'react-native-view-shot';
import {LayoutFrame, LayoutInfo} from "./types";
import {getAccessToken, getUserId} from "../sdk/store";
import identifyWidgetPositions from "../actions/identifyWidgetPositions";
import {useCaptureServiceStore} from "./store";

class CaptureService {
  private static layoutData: Record<string, LayoutInfo[]> = {};

  static setup(screenName: string, enabled: boolean) {
    const state = useCaptureServiceStore.getState();
    state.setScreenCaptureEnabled(screenName, enabled);
  }

  static getIsCapturing(screenName: string): boolean {
    return useCaptureServiceStore.getState().isCapturing[screenName] || false;
  }

  static getIsScreenCaptureEnabled(screenName: string): boolean {
    return useCaptureServiceStore.getState().isScreenCaptureEnabled[screenName] || false;
  }

  static addLayoutInfo(screenName: string, id: string, layout: LayoutFrame) {
    if (!this.layoutData[screenName]) {
      this.layoutData[screenName] = [];
    }

    const infos = this.layoutData[screenName];
    const existingIndex = infos.findIndex(item => item.id === id);
    const layoutInfo: LayoutInfo = {
      id,
      frame: layout,
    };

    if (existingIndex >= 0) {
      infos[existingIndex] = layoutInfo;
    } else {
      infos.push(layoutInfo);
    }
  }

  static clearLayoutData(screenName: string) {
    this.layoutData[screenName] = [];
  }

  static async takeScreenshot(screenName: string, positionList?: string[]): Promise<boolean> {
    try {
      if (!screenName) {
        console.error('Screen name is not set. Cannot identify elements.');
        return false;
      }

      this.setIsCapturing(screenName, true);

      // Small delay to ensure UI is settled
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the screen
      const screenshotPath = await captureScreen({
        format: 'png',
        quality: 1.0,
      });

      // Collect layout information
      const children = JSON.stringify(this.layoutData[screenName]);

      console.log('Layout data ', screenName, ' : ', this.layoutData[screenName]);

      // Send to server for element identification
      await this.identifyElements({
        screenName,
        positionList,
        screenshotPath,
        children,
      });

      return true;
    } catch (error) {
      console.error('Screenshot failed:', error);
      return false;
    } finally {
      this.setIsCapturing(screenName, false);
    }
  }

  private static async identifyElements(
    {
      screenName,
      positionList,
      screenshotPath,
      children,
    }: {
      screenName: string;
      positionList?: string[];
      screenshotPath: string;
      children: string;
    }) {
    const accessToken = await getAccessToken();
    const userId = getUserId();

    if (!accessToken || !userId) {
      throw new Error('Error in identifyElements. Access token or user ID not found');
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
      throw new Error(`Server error: ${response.status} ${await response.text()}`);
    }

    await identifyWidgetPositions(screenName, positionList);
  }

  private static setIsCapturing(screenName: string, capturing: boolean) {
    useCaptureServiceStore.getState().setIsCapturing(screenName, capturing);
  }
}

export default CaptureService;
