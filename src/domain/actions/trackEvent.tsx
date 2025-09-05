import {getAccessToken, getUserId} from "../sdk/store";
import {Attributes} from "../sdk/types";

export default async function trackEvent(event: string, campaignId?: string, metadata?: Attributes) {
  try {
    const access_token = await getAccessToken();
    if (!access_token) {
      console.error('Error in trackEvent. Access token not found');
      return;
    }

    const body: Record<string, any> = {
      user_id: getUserId(),
      event,
    };
    if (campaignId) {
      body.campaign_id = campaignId;
    }
    if (metadata) {
      body.metadata = metadata;
    }

    const response = await fetch('https://tracking.appstorys.com/capture-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Something went wrong in trackEvent:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error in trackEvent', error);
  }
}
