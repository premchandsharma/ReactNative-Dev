import {getAccessToken} from "../sdk/store";

export default async function identifyWidgetPositions(screenName: string, positionList?: string[],) {
  try {
    const access_token = await getAccessToken();
    if (!access_token) {
      console.error('Error in identify widget position. Access token not found');
      return;
    }

    const body: Record<string, any> = {
      screen_name: screenName,
      position_list: positionList,
    };

    const response = await fetch('https://backend.appstorys.com/api/v2/appinfo/identify-positions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify(body),
    });

    if (response instanceof Response && !response.ok) {
      console.error('Something went wrong in identify widget position:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error in identify widget position', error);
  }
}
