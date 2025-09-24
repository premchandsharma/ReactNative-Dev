import {Attributes} from "../sdk/types";
import useAppStorysStore, {getAccessToken, getAppId, getAttributes, getCampaigns, getUserId} from "../sdk/store";

export default async function verifyUser(attributes?: Attributes) {
  try {
    const campaigns = getCampaigns();
    if (!campaigns || campaigns.length == 0) {
      console.log('No campaigns found');
      return;
    }
    const access_token = await getAccessToken();
    if (!access_token) {
      console.error('Access token not found');
      return;
    }

    const response = await fetch('https://backend.appstorys.com/api/v1/users/track-user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        user_id: getUserId(),
        app_id: getAppId(),
        campaign_list: campaigns,
        attributes: {...attributes, ...getAttributes()}
      }),
    });

    if (!response.ok) {
      console.error('Something went wrong');
    }
    const data = await response.json();
    if (data.user_id) {
      useAppStorysStore().setUserId(data.user_id);
    }
    if (data.campaigns) {
      useAppStorysStore().saveCampaigns(data.campaigns);
    }
  } catch (error) {
    console.error('Error in verifyUser', error);
  }
}
;
