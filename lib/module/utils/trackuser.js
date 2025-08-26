"use strict";

import EncryptedStorage from "react-native-encrypted-storage";
export const trackUser = async (user_id, attributes) => {
  try {
    const access_token = await EncryptedStorage.getItem('access_token');
    const app_id = await EncryptedStorage.getItem('app_id');
    const bodyData = {
      user_id: user_id,
      app_id: app_id,
      attributes: attributes
    };
    const response = await fetch('https://backend.appstorys.com/api/v1/users/update-user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify(bodyData)
    });
    if (!response.ok) {
      throw new Error('Something went wrong');
    }
  } catch (error) {
    console.error('Error in trackUser', error);
  }
};
//# sourceMappingURL=trackuser.js.map