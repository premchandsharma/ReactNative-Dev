"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _native = require("@react-navigation/native");
var _asyncStorage = _interopRequireDefault(require("@react-native-async-storage/async-storage"));
var _trackuseraction = require("../utils/trackuseraction.js");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const VIEWED_STORIES_KEY = 'viewed_stories';
const GREY_COLOR = '#808080';
const Stories = ({
  campaigns,
  user_id
}) => {
  const navigation = (0, _native.useNavigation)();
  const [viewedStories, setViewedStories] = (0, _react.useState)(new Set());

  // Find the original campaign data
  const campaignData = campaigns.find(val => val.campaign_type === 'STR');
  const reversedDetailsData = (0, _react.useMemo)(() => {
    if (!campaignData?.details) return null;
    const reversedDetails = [...campaignData.details].reverse();
    return {
      id: campaignData.id,
      campaign_type: 'STR',
      details: reversedDetails
    };
  }, [campaignData]);

  // Load viewed stories from AsyncStorage on component mount
  (0, _react.useEffect)(() => {
    const loadViewedStories = async () => {
      try {
        const storedViewedStories = await _asyncStorage.default.getItem(VIEWED_STORIES_KEY);
        if (storedViewedStories) {
          setViewedStories(new Set(JSON.parse(storedViewedStories)));
        }
      } catch (error) {
        console.error('Error loading viewed stories:', error);
      }
    };
    loadViewedStories();
  }, []);

  // Create a new data structure with stories sorted by viewed status
  const sortedDetailsData = (0, _react.useMemo)(() => {
    if (!reversedDetailsData?.details) return null;
    const details = [...reversedDetailsData.details];
    const sortedDetails = details.sort((a, b) => {
      const aViewed = viewedStories.has(a.id);
      const bViewed = viewedStories.has(b.id);
      if (aViewed === bViewed) return 0;
      return aViewed ? 1 : -1;
    });
    return {
      id: reversedDetailsData.id,
      campaign_type: 'STR',
      details: sortedDetails
    };
  }, [reversedDetailsData, viewedStories]);
  const markStoryAsViewed = async storyId => {
    const newViewedStories = new Set(viewedStories);
    newViewedStories.add(storyId);
    setViewedStories(newViewedStories);
    try {
      await _asyncStorage.default.setItem(VIEWED_STORIES_KEY, JSON.stringify(Array.from(newViewedStories)));
    } catch (error) {
      console.error('Error saving viewed stories:', error);
    }
  };
  function onNavigate(data, groupIndex) {
    const storyGroup = data.details[groupIndex];
    markStoryAsViewed(storyGroup.id);
    navigation.navigate('StoryScreen', {
      storySlideData: data,
      storyCampaignId: data.id,
      user_id,
      initialGroupIndex: groupIndex
    });
  }
  (0, _react.useEffect)(() => {
    if (sortedDetailsData?.id) {
      (0, _trackuseraction.UserActionTrack)(user_id, sortedDetailsData.id, 'IMP');
    }
  }, [sortedDetailsData?.id, user_id]);
  if (!sortedDetailsData) return null;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
    style: styles.container,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.ScrollView, {
      horizontal: true,
      showsHorizontalScrollIndicator: false,
      children: sortedDetailsData.details.map((storyGroup, index) => {
        const isViewed = viewedStories.has(storyGroup.id);
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
          style: styles.storyContainer,
          children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
            style: styles.storyWrapper,
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableWithoutFeedback, {
              onPress: () => {
                onNavigate(sortedDetailsData, index);
                (0, _trackuseraction.UserActionTrack)(user_id, sortedDetailsData.id, 'CLK');
              },
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
                style: [styles.thumbnailContainer, {
                  borderColor: isViewed ? GREY_COLOR : storyGroup.ringColor
                }],
                children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
                  source: {
                    uri: storyGroup.thumbnail
                  },
                  style: [styles.thumbnail, {
                    opacity: isViewed ? 0.6 : 1
                  }]
                })
              })
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                marginTop: 6,
                fontSize: 14,
                fontWeight: '500',
                color: isViewed ? GREY_COLOR : storyGroup.nameColor,
                textAlign: 'center'
              },
              children: storyGroup.name
            })]
          })
        }, storyGroup.id);
      })
    })
  });
};
const styles = _reactNative.StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row'
  },
  storyContainer: {
    flexDirection: 'row',
    flex: 1,
    height: 135,
    width: 98,
    backgroundColor: 'rgba(255, 255, 255, 0)',
    justifyContent: 'center'
  },
  storyWrapper: {
    marginTop: 6,
    flexDirection: 'column',
    alignItems: 'center'
  },
  thumbnailContainer: {
    height: 82,
    width: 82,
    borderRadius: 45,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  thumbnail: {
    width: 65,
    height: 65,
    borderRadius: 35,
    overflow: 'hidden'
  }
});
var _default = exports.default = Stories;
//# sourceMappingURL=stories.js.map