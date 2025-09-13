import WebSocketClient from "./websocket";
import useAppStorysStore, {getAccessToken, getUserId} from "../../sdk/store";
import {TrackScreenConfig, TrackScreenResponse} from "./types";
import CaptureService, {useCaptureServiceStore} from "../../capture/CaptureService";
import TooltipManager from "../../tooltips/TooltipManager";
import {ScreenOptions} from "../../sdk/types";

let client: WebSocketClient | null = null;

export default async function trackScreen(screenName: string, options?: ScreenOptions) {
  const response = await new Promise<TrackScreenResponse | null>(async (resolve) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        console.error('Access token not found');
        return resolve(null);
      }
      const response = await fetch('https://users.appstorys.com/track-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          user_id: getUserId(),
          screenName,
          attributes: {}
        }),
      });

      // Check if response is OK before parsing
      if (!response.ok) {
        // console.error('API response not OK:', response.status, response.statusText);
        return resolve(null);
      }

      const data: TrackScreenConfig = await response.json();
      useCaptureServiceStore.getState().setScreenCaptureEnabled(data.screen_capture_enabled);

      client?.disconnect();
      client = new WebSocketClient();
      client.connect(data.ws);
      client.onMessage((message: string) => {
        try {
          const parsedMessage = JSON.parse(message);
          if (parsedMessage) {
            client?.disconnect();
            resolve(parsedMessage);
          }
        } catch (error) {
          resolve(null);
        }
      });
    } catch (error) {
      console.error('Error in trackScreen', error);
      resolve(null);
    }
  });
  if (response) {
    console.log(response);

    CaptureService.setup(response.metadata.screen_capture_enabled, screenName);

    const campaigns = response.campaigns || [];
    if (campaigns.length > 0) {
      const state = useAppStorysStore.getState();
      state.setCampaigns(campaigns);
      state.setScreenOptions(options);
      await TooltipManager.getInstance().processTooltips(campaigns)
    }
  }
}
