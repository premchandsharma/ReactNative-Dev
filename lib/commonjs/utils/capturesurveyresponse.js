"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CaptureSurveyResponse = void 0;
var _reactNativeEncryptedStorage = _interopRequireDefault(require("react-native-encrypted-storage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const CaptureSurveyResponse = async (surveyId, userId, responseOptions, comment) => {
  try {
    const accessToken = await _reactNativeEncryptedStorage.default.getItem('access_token');
    if (!accessToken) {
      console.log('Error in captureSurveyResponse. Access token not found');
      return;
    }
    const body = {
      user_id: userId,
      survey: surveyId,
      responseOptions,
      ...(comment && {
        comment
      })
    };
    const response = await fetch('https://backend.appstorys.com/api/v1/campaigns/capture-survey-response/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(body)
    });
    if (response.status !== 200 && response.status !== 201) {
      console.log(`Error in captureSurveyResponse. Something went wrong ${await response.text()}`);
      return;
    }
  } catch (error) {
    console.log('Error in captureSurveyResponse:', error);
  }
};
exports.CaptureSurveyResponse = CaptureSurveyResponse;
//# sourceMappingURL=capturesurveyresponse.js.map