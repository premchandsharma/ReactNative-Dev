import {getAccessToken} from "../sdk/store";

export default async function identifyWidgetPositions(screenName: string, positionList?: string[]) {
  if (!positionList || positionList.length === 0) {
    console.warn('No positions to identify for widgets.');
    return;
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error('Error in identify widget position. Access token not found');
    return;
  }

  const response = await fetch('https://backend.appstorys.com/api/v2/appinfo/identify-positions/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      screen_name: screenName,
      position_list: positionList,
    }),
  });

  if (response instanceof Response && !response.ok) {
    console.error('Something went wrong in identify widget position:', response.status, response.statusText);
  }
}
