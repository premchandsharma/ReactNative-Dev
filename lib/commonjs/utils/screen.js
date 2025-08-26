"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.trackScreen = void 0;
var _reactNativeEncryptedStorage = _interopRequireDefault(require("react-native-encrypted-storage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const trackScreen = async (app_id, screen_name) => {
  try {
    const access_token = await _reactNativeEncryptedStorage.default.getItem('access_token');
    if (!access_token) {
      throw new Error('Access token not found');
    }
    const response = await fetch('https://backend.appstorys.com/api/v1/users/track-screen/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify({
        app_id,
        screen_name
      })
    });
    if (!response.ok) {
      throw new Error('Something went wrong');
    }
    const data = await response.json();
    return data.campaigns || [];
  } catch (error) {
    console.error('Error in trackScreen', error);
    return [];
  }
  ;
};
exports.trackScreen = trackScreen;
//# sourceMappingURL=screen.js.map