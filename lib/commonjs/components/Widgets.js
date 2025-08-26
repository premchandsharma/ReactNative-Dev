"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
var _react = _interopRequireWildcard(require("react"));
var _trackuseraction = require("../utils/trackuseraction.js");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Widgets = ({
  campaigns,
  user_id
}) => {
  const flatlistRef = (0, _react.useRef)(null);
  const screenWidth = _reactNative.Dimensions.get("window").width;
  const [activeIndex, setActiveIndex] = (0, _react.useState)(0);
  const intervalRef = (0, _react.useRef)(null);
  const data = (0, _react.useMemo)(() => campaigns.find(val => val.campaign_type === "WID"), [campaigns]);
  const extendedImages = (0, _react.useMemo)(() => {
    if (!data?.details?.widget_images) return [];
    return data.details.type === "full" ? [data.details.widget_images[data.details.widget_images.length - 1], ...data.details.widget_images, data.details.widget_images[0]].filter(item => item !== undefined) : data.details.widget_images.filter(item => item !== undefined);
  }, [data]);

  // useEffect(() => {
  //     if (data && data.id) {
  //         UserActionTrack(user_id, data.id, "IMP");
  //     }
  // }, [data, user_id]);

  const scrollToNextImage = () => {
    if (!flatlistRef.current || !extendedImages.length || data.details.type !== "full") return;

    // const nextIndex = activeIndex === data.details.widget_images.length - 1 ? 0 : activeIndex + 1;

    if (activeIndex === data.details.widget_images.length - 1) {
      flatlistRef.current.scrollToOffset({
        offset: screenWidth,
        animated: false
      });
      setTimeout(() => {
        scrollToNextImage;
      }, 50);
    } else {
      flatlistRef.current.scrollToOffset({
        offset: screenWidth * (activeIndex + 2),
        animated: true
      });
    }
  };
  (0, _react.useEffect)(() => {
    // if (data.details.type !== "full") return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(scrollToNextImage, 5000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeIndex, data, extendedImages.length]);
  const getItemLayout = (data, index) => ({
    data: data,
    length: screenWidth,
    offset: screenWidth * index,
    index: index
  });
  const trackedImpressionsRef = (0, _react.useRef)([]);
  const trackImpression = widget_image_id => {
    if (!trackedImpressionsRef.current.includes(widget_image_id)) {
      console.log(`Tracking impression for: ${widget_image_id}`); // Debug log
      trackedImpressionsRef.current.push(widget_image_id);
      (0, _trackuseraction.UserActionTrack)(user_id, data.id, "IMP", undefined, widget_image_id);
    } else {
      console.log(`Impression already tracked for: ${widget_image_id}`); // Debug log
    }
  };
  const handleViewableItemsChanged = ({
    viewableItems
  }) => {
    viewableItems.forEach(({
      item
    }) => {
      trackImpression(item.id);
    });
  };
  const renderFullWidthItem = ({
    item,
    index
  }) => {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: {
        width: screenWidth * 0.94,
        marginHorizontal: screenWidth * 0.03
      },
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
        activeOpacity: 1,
        onPress: () => {
          if (item.link) {
            (0, _trackuseraction.UserActionTrack)(user_id, data.id, "CLK", undefined, item.id);
            _reactNative.Linking.openURL(item.link);
          }
        },
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
          source: {
            uri: item.image
          },
          style: {
            borderRadius: 18,
            height: data.details.height ?? 100,
            resizeMode: 'cover'
          }
        })
      })
    }, `${item.order}-${index}`);
  };
  const renderHalfWidthItem = ({
    item,
    index
  }) => {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: {
        width: screenWidth * 0.455,
        marginLeft: screenWidth * 0.03
      },
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
        activeOpacity: 1,
        onPress: () => {
          if (item.link) {
            (0, _trackuseraction.UserActionTrack)(user_id, data.id, "CLK", undefined, item.id);
            _reactNative.Linking.openURL(item.link);
          }
        },
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
          source: {
            uri: item.image
          },
          style: {
            borderRadius: 12,
            height: data.details.height ?? 200,
            // Make it square
            resizeMode: 'cover'
          }
        })
      })
    }, `${item.order}-${index}`);
  };
  const handleScroll = event => {
    if (data.details.type !== "full") return;
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    if (index === 0) {
      flatlistRef.current?.scrollToOffset({
        offset: screenWidth * (extendedImages.length - 2),
        animated: false
      });
      setActiveIndex(extendedImages.length - 3);
    } else if (index === extendedImages.length - 1) {
      flatlistRef.current?.scrollToOffset({
        offset: screenWidth,
        animated: false
      });
      setActiveIndex(0);
    } else {
      setActiveIndex(index - 1);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(scrollToNextImage, 5000);
    }
  };
  const renderDotIndicators = () => {
    return data.details.widget_images.map((dot, index) => {
      console.log(dot);
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        style: {
          backgroundColor: activeIndex === index ? "black" : "grey",
          height: 6,
          width: 6,
          borderRadius: 5,
          marginHorizontal: 4,
          marginVertical: 6
        }
      }, index);
    });
  };
  if (!data || !data.details.widget_images) return null;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
    style: {
      // height: data.details.type === "full" ? 160 : screenWidth * 0.44,
      width: '100%',
      marginVertical: screenWidth * 0.03,
      paddingRight: data.details.type === "half" ? screenWidth * 0.03 : null
    },
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.FlatList, {
      data: extendedImages,
      ref: flatlistRef,
      getItemLayout: data.details.type === "full" ? getItemLayout : undefined,
      renderItem: data.details.type === "full" ? renderFullWidthItem : renderHalfWidthItem,
      keyExtractor: (item, index) => `${item.image}-${index}`,
      horizontal: true,
      pagingEnabled: data.details.type === "full",
      onViewableItemsChanged: handleViewableItemsChanged,
      viewabilityConfig: {
        viewAreaCoveragePercentThreshold: 50
      },
      onScroll: data.details.type === "full" ? handleScroll : undefined,
      showsHorizontalScrollIndicator: false,
      initialScrollIndex: data.details.type === "full" ? 1 : undefined,
      onLayout: () => {
        if (data.details.type === "full") {
          flatlistRef.current?.scrollToOffset({
            offset: screenWidth,
            animated: false
          });
        }
      },
      scrollEnabled: data.details.type === "full"
    }), data.details.type === "full" && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center"
      },
      children: renderDotIndicators()
    })]
  });
};
var _default = exports.default = Widgets;
//# sourceMappingURL=Widgets.js.map