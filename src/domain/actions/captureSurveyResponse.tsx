import {getAccessToken, getUserId} from "../sdk/store";

export default async function captureSurveyResponse(
  surveyId: string,
  responseOptions: string[],
  comment?: string
) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.log('Error in captureSurveyResponse. Access token not found');
      return;
    }

    const body = {
      user_id: getUserId(),
      survey: surveyId,
      responseOptions,
      ...(comment && {comment})
    };

    const response = await fetch('https://backend.appstorys.com/api/v1/campaigns/capture-survey-response/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(body),
    });

    if (response.status !== 200 && response.status !== 201) {
      console.log(`Error in captureSurveyResponse. Something went wrong ${await response.text()}`);
      return;
    }
  } catch (error) {
    console.log('Error in captureSurveyResponse:', error);
  }
};
