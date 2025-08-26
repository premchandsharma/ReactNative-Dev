"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _trackuseraction = require("../utils/trackuseraction.js");
var _reactNativeFs = _interopRequireDefault(require("react-native-fs"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// Import the tracking function

const Floater = ({
  campaigns,
  user_id
}) => {
  // const { width } = Dimensions.get("window");

  const data = campaigns.find(val => val.campaign_type === "FLT");
  const [imagePath, setImagePath] = _react.default.useState(null);
  const downloadImage = async url => {
    const filename = url.split("/").pop()?.split("?")[0];
    try {
      const downloadResult = await _reactNativeFs.default.downloadFile({
        fromUrl: url,
        toFile: `${_reactNativeFs.default.DocumentDirectoryPath}/${filename}`
      }).promise;
      if (downloadResult.statusCode === 200) {
        console.log("Image downloaded!");
      } else {
        console.error("Failed to download image:", downloadResult);
      }
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };
  const checkCacheForImage = async url => {
    const filename = url.split("/").pop()?.split("?")[0];
    const path = `${_reactNativeFs.default.DocumentDirectoryPath}/${filename}`;
    try {
      const exists = await _reactNativeFs.default.exists(path);
      if (exists) {
        setImagePath(path);
      } else {
        await downloadImage(url);
        setImagePath(path);
      }
    } catch (error) {
      console.error("Error checking cache for image:", error);
    }
  };
  (0, _react.useEffect)(() => {
    if (!data) {
      return;
    }
    checkCacheForImage(data.details.image);
    const trackImpression = async () => {
      try {
        await (0, _trackuseraction.UserActionTrack)(user_id, data.id, "IMP");
      } catch (error) {
        console.error("Error in tracking impression:", error);
      }
    };
    trackImpression();
  }, [data, user_id]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_jsxRuntime.Fragment, {
    children: data && data.details && data.details.image !== "" && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: {
        position: "absolute",
        // top: 0,
        left: data.details.position == "left" ? 16 : undefined,
        right: data.details.position == "right" || data.details.position == "" || data.details.position == null ? 16 + (data.details.width ?? 60) : undefined,
        bottom: 20,
        justifyContent: "flex-end",
        // marginRight: 20 + width * 0.15,
        // marginBottom: 20,
        zIndex: 10
      },
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
        activeOpacity: 1,
        onPress: () => {
          if (data.details.link) {
            (0, _trackuseraction.UserActionTrack)(user_id, data.id, "CLK");
            _reactNative.Linking.openURL(data.details.link);
          }
        },
        style: {
          width: data.details.width ?? 60,
          height: data.details.height ?? 60,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          position: "absolute",
          // right: 20,
          // bottom: 20,
          overflow: "hidden",
          borderRadius: 100
        },
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
          source: {
            uri: `file://${imagePath}`
          },
          style: styles.image
        })
      })
    })
  });
};
const styles = _reactNative.StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  }
});
var _default = exports.default = Floater;
//# sourceMappingURL=floater.js.map