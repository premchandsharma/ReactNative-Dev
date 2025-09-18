import useAppStorysStore, {getAccessToken, getUserId} from "../sdk/store";
import {Attributes} from "../sdk/types";
import getDeviceInfo from "./getDeviceInfo";
import {sendOrQueue} from "./offlineQueue";

export default async function trackEvent(event: string, campaignId?: string, metadata?: Attributes) {
  try {
    if (!event) {
      console.error('Error in trackEvent. Event name is required');
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.error('Error in trackEvent. Access token not found');
      return;
    }

    if (event !== 'viewed' && event !== 'clicked') {
      const state = useAppStorysStore.getState();
      const trackedEvents = state.trackedEvents;
      if (!trackedEvents.includes(event)) {
        state.setTrackedEvents([...trackedEvents, event]);
      } else {
        // Remove and re-add to update the order
        const updatedEvents = trackedEvents.filter(e => e !== event);
        updatedEvents.push(event);
        state.setTrackedEvents(updatedEvents);
      }
    }

    const deviceInfo = await getDeviceInfo();

    const mergedMetadata = {
      ...(metadata || {}),
      ...deviceInfo,
    };

    const body: Record<string, any> = {
      user_id: getUserId(),
      event: event,
      metadata: mergedMetadata,
    };
    if (campaignId) {
      body.campaign_id = campaignId;
    }

    const response = sendOrQueue({
      url: "https://tracking.appstorys.com/capture-event",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: body,
    });

    if (response instanceof Response && !response.ok) {
      console.error('Something went wrong in trackEvent:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error in trackEvent', error);
  }
}
