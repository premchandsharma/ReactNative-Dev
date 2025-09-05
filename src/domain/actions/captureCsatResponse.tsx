import {getAccessToken, getUserId} from "../sdk/store";

export default async function captureCsatResponse(
  csatId: string,
  rating: number,
  feedbackOption?: string,
  additionalComments?: string,
) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.log('Error in captureCsatResponse. Access token not found');
      return;
    }

    const body = {
      csat: csatId,
      user_id: getUserId(),
      rating,
      ...(feedbackOption && {feedback_option: feedbackOption}),
      ...(additionalComments && {additional_comments: additionalComments})
    };

    const response = await fetch('https://backend.appstorys.com/api/v1/campaigns/capture-csat-response/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(body),
    });

    if (response.status !== 200 && response.status !== 201) {
      console.log(`Error in captureCsatResponse. Something went wrong ${await response.text()}`);
      return;
    }
  } catch (error) {
    console.log('Error in captureCsatResponse:', error);
  }
};
