import {getAccessToken, getAppId, getUserId} from "../sdk/store";
import {Attributes} from "../sdk/types";

export default async function trackUser(attributes?: Attributes) {
  try {
    const access_token = await getAccessToken();
    if (!access_token) {
      console.error('Error in trackUser. Access token not found');
      return;
    }

    const bodyData: any = {
      user_id: getUserId(),
      app_id: getAppId(),
      attributes: attributes
    };

    const response = await fetch('https://backend.appstorys.com/api/v1/users/update-user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      throw new Error('Something went wrong');
    }
  } catch (error) {
    console.error('Error in trackUser', error);
  }
}
