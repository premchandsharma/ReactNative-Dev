"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.trackUser = void 0;
var _reactNativeEncryptedStorage = _interopRequireDefault(require("react-native-encrypted-storage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const trackUser = async (user_id, attributes) => {
  try {
    const access_token = await _reactNativeEncryptedStorage.default.getItem('access_token');
    const app_id = await _reactNativeEncryptedStorage.default.getItem('app_id');
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
exports.trackUser = trackUser;
//# sourceMappingURL=trackuser.js.map