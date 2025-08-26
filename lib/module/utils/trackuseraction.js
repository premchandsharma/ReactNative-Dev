"use strict";

import EncryptedStorage from "react-native-encrypted-storage";
export const UserActionTrack = async (user_id, campaign_id, event_type, story_slide, widget_image) => {
  try {
    const access_token = await EncryptedStorage.getItem('access_token');
    if (!access_token) {
      throw new Error('Access token not found');
    }

    // Create the body object
    const body = {
      campaign_id,
      user_id,
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
      body: JSON.stringify(body) // Send the complete body
    });
    if (!response.ok) {
      throw new Error('Something went wrong');
    }
  } catch (error) {
    console.log(error);
  }
};
//# sourceMappingURL=trackuseraction.js.map