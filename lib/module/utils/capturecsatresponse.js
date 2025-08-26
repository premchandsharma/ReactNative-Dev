"use strict";

import EncryptedStorage from "react-native-encrypted-storage";
export const CaptureCsatResponse = async (csatId, userId, rating, feedbackOption, additionalComments) => {
  try {
    const accessToken = await EncryptedStorage.getItem('access_token');
    if (!accessToken) {
      console.log('Error in captureCsatResponse. Access token not found');
      return;
    }
    const body = {
      csat: csatId,
      user_id: userId,
      rating,
      ...(feedbackOption && {
        feedback_option: feedbackOption
      }),
      ...(additionalComments && {
        additional_comments: additionalComments
      })
    };
    const response = await fetch('https://backend.appstorys.com/api/v1/campaigns/capture-csat-response/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(body)
    });
    if (response.status !== 200 && response.status !== 201) {
      console.log(`Error in captureCsatResponse. Something went wrong ${await response.text()}`);
      return;
    }
  } catch (error) {
    console.log('Error in captureCsatResponse:', error);
  }
};
//# sourceMappingURL=capturecsatresponse.js.map