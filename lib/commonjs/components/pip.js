"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeGestureHandler = require("react-native-gesture-handler");
var _reactNativeVideo = _interopRequireDefault(require("react-native-video"));
var _bottomTabs = require("@react-navigation/bottom-tabs");
var _trackuseraction = require("../utils/trackuseraction.js");
var _pipState = require("../utils/pipState.js");
var _reactNativeFs = _interopRequireDefault(require("react-native-fs"));
var _elements = require("@react-navigation/elements");
var _native = require("@react-navigation/native");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const {
  width,
  height
} = _reactNative.Dimensions.get("window");
const Pip = ({
  campaigns,
  user_id
}) => {
  const data = campaigns.find(val => val.campaign_type === "PIP");
  // let pipBottomValue = height > 700 ? (Platform.OS === "ios" ? 220 : 220) : 220;

  (0, _react.useEffect)(() => {
    const unsubscribe = (0, _pipState.subscribeToPipVisibility)(isVisible => {
      setPipVisible(isVisible);
    });
    return () => {
      unsubscribe();
    };
  }, []);
  const navigation = (0, _native.useNavigation)();
  let pipBottomValue = data != null && data.details.height != null ? data.details.height + 20 : 220;
  const headerHeight = (0, _elements.useHeaderHeight)();
  const tabBarHeight = (0, _bottomTabs.useBottomTabBarHeight)();
  var PIP_WIDTH = data != null && data.details.width != null ? data.details.width : 140;
  var PIP_HEIGHT = data != null && data.details.height != null ? data.details.height : 200;

  // Calculate the maximum x and y positions to keep PIP within screen bounds
  const MAX_X = width - PIP_WIDTH - 20;
  const MAX_Y = height - (tabBarHeight + PIP_HEIGHT) - 20;
  const MIN_X = 20;
  const MIN_Y = _reactNative.Platform.OS === "ios" ? 60 + headerHeight : 20 + headerHeight;
  const [isPipVisible, setPipVisible] = (0, _react.useState)(true);
  // const [isExpanded, setExpanded] = useState(false);

  const [smallVideoPath, setSmallVideoPath] = (0, _react.useState)("");
  const [largeVideoPath, setLargeVideoPath] = (0, _react.useState)("");
  const [mute, setMute] = (0, _react.useState)(true);
  const initialX = data != null && data.details.position == "right" ? data.details.width != null ? width - (data.details.width + 20) : width - 160 : 20;
  const initialY = height - (tabBarHeight + pipBottomValue);
  const pan = (0, _react.useRef)(new _reactNative.Animated.ValueXY({
    x: 0,
    y: 0
  })).current;
  (0, _react.useEffect)(() => {
    pan.setOffset({
      x: initialX,
      y: initialY
    });
  }, []);
  const downloadVideo = async (url, filename) => {
    try {
      const downloadResult = await _reactNativeFs.default.downloadFile({
        fromUrl: url,
        toFile: `${_reactNativeFs.default.DocumentDirectoryPath}/${filename}`
      }).promise;
      if (downloadResult.statusCode === 200) {
        console.log("Downloaded successfully");
      } else {
        console.log("Download failed");
      }
    } catch (error) {
      console.error("Error in downloading video:", error);
    }
  };
  const checkAndDownloadSmallVideo = async url => {
    try {
      const filename = url.split("/").pop()?.split("?")[0];
      const fileExists = await _reactNativeFs.default.exists(`${_reactNativeFs.default.DocumentDirectoryPath}/${filename}`);
      if (!fileExists) {
        await downloadVideo(url, filename);
        setSmallVideoPath(`${_reactNativeFs.default.DocumentDirectoryPath}/${filename}`);
      } else {
        setSmallVideoPath(`${_reactNativeFs.default.DocumentDirectoryPath}/${filename}`);
      }
    } catch (error) {
      console.error("Error in checking and downloading video:", error);
    }
  };
  const checkAndDownloadLargeVideo = async url => {
    try {
      const filename = url.split("/").pop()?.split("?")[0];
      const fileExists = await _reactNativeFs.default.exists(`${_reactNativeFs.default.DocumentDirectoryPath}/${filename}`);
      if (!fileExists) {
        await downloadVideo(url, filename);
        setLargeVideoPath(`${_reactNativeFs.default.DocumentDirectoryPath}/${filename}`);
      } else {
        setLargeVideoPath(`${_reactNativeFs.default.DocumentDirectoryPath}/${filename}`);
      }
    } catch (error) {
      console.error("Error in checking and downloading video:", error);
    }
  };
  (0, _react.useEffect)(() => {
    if (data && data.id) {
      (0, _trackuseraction.UserActionTrack)(user_id, data.id, "IMP");
      const smallVideoUrl = data.details.small_video;
      checkAndDownloadSmallVideo(smallVideoUrl);
      const largeVideoUrl = data.details.large_video;
      checkAndDownloadLargeVideo(largeVideoUrl);
    }
  }, [user_id]);
  const closePip = () => {
    setPipVisible(false);
  };
  const speaker = () => {
    setMute(!mute);
  };
  function expandPip() {
    if (data.details.large_video != null || data.details.large_video != "") {
      closePip();
      const link = data.details.link;
      navigation.navigate('PipScreen', {
        user_id,
        id: data.id,
        link,
        button_text: data.details.button_text,
        largeVideoUrl: `file://${largeVideoPath}`
      });
      (0, _trackuseraction.UserActionTrack)(user_id, data.id, "IMP");
    }
  }
  ;
  const constrainPosition = (x, y) => {
    return {
      x: Math.min(Math.max(x, MIN_X), MAX_X),
      y: Math.min(Math.max(y, MIN_Y), MAX_Y)
    };
  };
  const onPanGestureEvent = _reactNative.Animated.event([{
    nativeEvent: {
      translationX: pan.x,
      translationY: pan.y
    }
  }], {
    useNativeDriver: true
  });
  const onHandlerStateChange = event => {
    if (event.nativeEvent.oldState === _reactNativeGestureHandler.State.ACTIVE) {
      const {
        absoluteX,
        absoluteY,
        x,
        y
      } = event.nativeEvent;
      const constrainedPosition = constrainPosition(absoluteX - x, absoluteY - y);
      pan.setOffset(constrainedPosition);
      pan.setValue({
        x: 0,
        y: 0
      });
    }
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeGestureHandler.GestureHandlerRootView, {
    style: {
      position: 'absolute',
      zIndex: 999998
    },
    children: data && isPipVisible && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeGestureHandler.PanGestureHandler, {
      onGestureEvent: onPanGestureEvent,
      onHandlerStateChange: onHandlerStateChange,
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Animated.View, {
        style: {
          backgroundColor: "black",
          width: data.details.width ?? 140,
          height: data.details.height ?? 200,
          position: "absolute",
          borderRadius: 15,
          display: "flex",
          flexDirection: "row",
          zIndex: 999999,
          // Add a high zIndex
          elevation: 999999,
          // Add elevation for Android
          transform: [{
            translateX: pan.x
          }, {
            translateY: _reactNative.Animated.subtract(pan.y, new _reactNative.Animated.Value(headerHeight))
          }]
        },
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
          onTouchEnd: expandPip,
          style: {
            flex: 1
          },
          children: data.details.small_video && data.details.large_video && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeVideo.default, {
            repeat: true,
            resizeMode: "contain",
            muted: mute ? true : false,
            source: {
              uri: `file://${smallVideoPath}`
            },
            style: {
              borderRadius: 15,
              position: "absolute",
              overflow: "hidden",
              top: 0,
              left: 0,
              bottom: 0,
              right: 0
            }
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeGestureHandler.TouchableWithoutFeedback, {
          onPress: closePip,
          style: {
            padding: 7,
            position: "absolute",
            top: 5,
            right: 5,
            backgroundColor: "black",
            borderRadius: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          },
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
            source: require("../assets/images/close.png"),
            style: {
              height: 9,
              width: 9
            }
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeGestureHandler.TouchableWithoutFeedback, {
          onPress: speaker,
          style: {
            padding: 5,
            position: "absolute",
            top: 5,
            right: data.details.width != null ? data.details.width - 30 : 110,
            backgroundColor: "black",
            borderRadius: 20,
            display: "flex"
          },
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
            source: mute ? require("../assets/images/mute.png") : require("../assets/images/volume.png"),
            style: {
              height: 16,
              width: 16
            }
          })
        }), data.details.large_video != null && data.details.large_video != "" && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeGestureHandler.TouchableWithoutFeedback, {
          onPress: expandPip,
          style: {
            padding: 7,
            position: "absolute",
            bottom: 7,
            right: 5,
            backgroundColor: "black",
            borderRadius: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          },
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
            source: require("../assets/images/enlarge.png"),
            style: {
              height: 10,
              width: 10
            }
          })
        })]
      })
    })
  });
};
var _default = exports.default = Pip;
//# sourceMappingURL=pip.js.map