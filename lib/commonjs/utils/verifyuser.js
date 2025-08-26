"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyUser = void 0;
var _reactNativeEncryptedStorage = _interopRequireDefault(require("react-native-encrypted-storage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const verifyUser = async (user_id, campaigns, attributes) => {
  try {
    if (!campaigns || campaigns.length == 0) {
      console.log('No campaigns found');
      return;
    }
    const app_id = await _reactNativeEncryptedStorage.default.getItem('app_id');
    const access_token = await _reactNativeEncryptedStorage.default.getItem('access_token');
    const bodyData = {
      user_id: user_id,
      app_id: app_id,
      campaign_list: campaigns
    };
    if (attributes) {
      bodyData.attributes = attributes;
    }
    const response = await fetch('https://backend.appstorys.com/api/v1/users/track-user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify(bodyData)
    });
    if (!response.ok) {
      console.error('Something went wrong');
    }
    const data = await response.json();
    user_id = data.user_id;
    campaigns = data.campaigns;
    return {
      user_id,
      campaigns
    };
  } catch (error) {
    console.error('Error in trackUser', error);
    return {
      user_id,
      campaigns
    };
  }
};
exports.verifyUser = verifyUser;
//# sourceMappingURL=verifyuser.js.map