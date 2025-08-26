"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeFs = _interopRequireDefault(require("react-native-fs"));
var _trackuseraction = require("../utils/trackuseraction.js");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Banner = ({
  campaigns,
  user_id
}) => {
  const [isBannerVisible, setIsBannerVisible] = (0, _react.useState)(true);
  const [imagePath, setImagePath] = (0, _react.useState)(null);
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
  const data = (0, _react.useMemo)(() => campaigns.find(val => val.campaign_type === "BAN"), [campaigns]);
  (0, _react.useEffect)(() => {
    if (data && data.id) {
      (0, _trackuseraction.UserActionTrack)(user_id, data.id, "IMP");
      checkCacheForImage(data.details.image);
    }
  }, [data, user_id]);
  const closeBanner = () => {
    setIsBannerVisible(false);
    // UserActionTrack(user_id, data.id, 'CLK');
  };
  const {
    width
  } = _reactNative.Dimensions.get("window");
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_jsxRuntime.Fragment, {
    children: data && data.details && data.details.image !== "" && isBannerVisible && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: styles.container,
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.TouchableOpacity, {
        activeOpacity: 1,
        onPress: () => {
          (0, _trackuseraction.UserActionTrack)(user_id, data.id, "CLK");
          if (data.details.link) {
            _reactNative.Linking.openURL(data.details.link);
          }
        },
        style: [styles.banner, {
          width: width - 20,
          height: data.details.height ?? 92,
          borderRadius: 6
        }],
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
          style: [styles.banner, {
            borderRadius: 6
          }],
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
            source: {
              uri: `file://${imagePath}`
            },
            style: {
              width: width - 20,
              height: data.details.height ?? 92,
              borderRadius: 6
            }
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
          onPress: closeBanner,
          style: styles.closeButton,
          activeOpacity: 1,
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
            source: require("../assets/images/close.png"),
            style: styles.closeIcon
          })
        })]
      })
    })
  });
};
const styles = _reactNative.StyleSheet.create({
  container: {
    position: "absolute",
    // top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 12,
    zIndex: 10 // Ensure the banner is on top
  },
  banner: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 1)",
    position: "relative",
    // bottom: 16,
    overflow: "visible"
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  closeButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "black",
    borderRadius: 15,
    padding: 6,
    justifyContent: "center",
    alignItems: "center"
  },
  closeIcon: {
    height: 8,
    width: 8
  }
});
var _default = exports.default = Banner;
//# sourceMappingURL=banner.js.map