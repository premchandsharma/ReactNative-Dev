import {getAccessToken, getUserId} from "../sdk/store";

type ActionType = 'IMP' | 'CLK' | 'CNV';

export default async function trackUserAction(
  campaign_id: string,
  event_type: ActionType,
  story_slide?: string, // Optional argument
  widget_image?: string // Optional argument
) {
  try {
    const access_token = await getAccessToken();
    if (!access_token) {
      throw new Error('Access token not found');
    }

    // Create the body object
    const body: any = {
      campaign_id,
      user_id: getUserId(),
      event_type
    };

    // Add story_slide to the body if it is provided
    if (story_slide) {
      body.story_slide = story_slide;
    }

    if (widget_image) {
      body.widget_image = widget_image;
    }

    const response = await fetch('https://backend.appstorys.com/api/v1/users/track-action/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify(body), // Send the complete body
    });

    if (!response.ok) {
      throw new Error('Something went wrong');
    }
  } catch (error) {
    console.log(error);
  }
}
