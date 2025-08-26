"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyAccount = void 0;
var _reactNativeEncryptedStorage = _interopRequireDefault(require("react-native-encrypted-storage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const verifyAccount = async (account_id, app_id) => {
  try {
    await _reactNativeEncryptedStorage.default.setItem('app_id', app_id);
    const response = await fetch('https://backend.appstorys.com/api/v1/admins/validate-account/', {
      method: 'POST',
      body: JSON.stringify({
        account_id,
        app_id
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      const data = await response.json();
      const {
        access_token,
        refresh_token
      } = data;
      if (access_token && refresh_token) {
        await _reactNativeEncryptedStorage.default.setItem('access_token', access_token);
        await _reactNativeEncryptedStorage.default.setItem('refresh_token', refresh_token);
      }
    }
    ;
  } catch (error) {
    console.log(error);
  }
};
exports.verifyAccount = verifyAccount;
//# sourceMappingURL=verifyaccount.js.map