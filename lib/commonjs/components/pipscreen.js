"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PipScreen = void 0;
var _reactNative = require("react-native");
var _react = require("react");
var _reactNativeVideo = _interopRequireDefault(require("react-native-video"));
var _native = require("@react-navigation/native");
var _trackuseraction = require("../utils/trackuseraction.js");
var _pipState = require("../utils/pipState.js");
var _reactNativeGestureHandler = require("react-native-gesture-handler");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const PipScreen = () => {
  const navigation = (0, _native.useNavigation)();
  const {
    params
  } = (0, _native.useRoute)();
  const {
    height,
    width
  } = _reactNative.Dimensions.get("window");
  const [mute, setMute] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);
  const close = () => {
    navigation.goBack();
  };
  const minimize = () => {
    // set small pip visible
    (0, _pipState.togglePipVisibility)(true);
    navigation.goBack();
  };
  const speaker = () => {
    setMute(!mute);
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
    style: {
      flex: 1,
      backgroundColor: "black"
    },
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: {
        flex: 1
      },
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeVideo.default, {
        repeat: true,
        resizeMode: "contain",
        muted: mute ? true : false,
        source: {
          uri: params.largeVideoUrl
        },
        style: {
          position: "absolute",
          overflow: "hidden",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0
        }
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
      onPress: close,
      style: {
        flex: 1,
        position: "absolute",
        top: _reactNative.Platform.OS === "ios" ? height * 0.1 : 25,
        right: 25
      },
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
        source: require("../assets/images/close.png"),
        style: {
          height: 20,
          width: 20
        }
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
      onPress: speaker,
      style: {
        flex: 1,
        position: "absolute",
        top: _reactNative.Platform.OS === "ios" ? height * 0.1 : 22,
        right: 68
      },
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
        source: mute ? require("../assets/images/mute.png") : require("../assets/images/volume.png"),
        style: {
          height: 25,
          width: 25
        }
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
      onPress: minimize,
      style: {
        flex: 1,
        position: "absolute",
        top: _reactNative.Platform.OS === "ios" ? height * 0.1 : 25,
        left: 25
      },
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
        source: require("../assets/images/minimize.png"),
        style: {
          height: 22,
          width: 22
        }
      })
    }), params.link != null && params.link != "" && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: {
        display: "flex",
        position: "absolute",
        width: width,
        justifyContent: "center",
        alignItems: "center",
        bottom: _reactNative.Platform.OS === "ios" ? height * 0.045 : height * 0.025
      },
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeGestureHandler.TouchableWithoutFeedback, {
        style: {
          backgroundColor: "white",
          borderRadius: 30
        },
        onPress: () => {
          if (params.link) {
            _reactNative.Linking.openURL(params.link);
          }
          (0, _trackuseraction.UserActionTrack)(params.user_id, params.id, "CLK");
        },
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: {
            color: "black",
            fontWeight: "600",
            textAlign: 'center',
            textAlignVertical: 'center',
            height: 45,
            paddingVertical: 10,
            paddingHorizontal: 25
          },
          children: params.button_text
        })
      })
    })]
  });
};

// continue Button
// {data && data.details && data.details.link && (
//     <View
//       style={{
//         display: "flex",
//         position: "absolute",
//         width: width,
//         justifyContent: "center",
//         alignItems: "center",
//         bottom:
//           Platform.OS === "ios" ? height * 0.045 : height * 0.025,
//       }}
//     >
//       <TouchableWithoutFeedback
//         style={{
//           backgroundColor: "white",
//           borderRadius: 30,

//         }}
//         onPress={() => {
//           if (data.details.link) {
//             Linking.openURL(data.details.link);
//           }
//           UserActionTrack(user_id, data.id, "CLK");
//         }}
//       >
//         <Text style={{
//           color: "black",
//           fontWeight: "600",
//           textAlign: 'center',
//           textAlignVertical: 'center',
//           height: 45,
//           paddingVertical: 10,
//           paddingHorizontal: 25,
//         }}>
//           Continue
//         </Text>
//       </TouchableWithoutFeedback>
//     </View>
//   )}
exports.PipScreen = PipScreen;
//# sourceMappingURL=pipscreen.js.map