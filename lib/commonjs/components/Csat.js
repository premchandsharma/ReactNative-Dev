"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _asyncStorage = _interopRequireDefault(require("@react-native-async-storage/async-storage"));
var _reactNative = require("react-native");
var _trackuseraction = require("../utils/trackuseraction.js");
var _capturecsatresponse = require("../utils/capturecsatresponse.js");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Csat = ({
  campaigns,
  user_id
}) => {
  const [showCSAT, setShowCSAT] = (0, _react.useState)(true);
  const [selectedStars, setSelectedStars] = (0, _react.useState)(0);
  const [showThanks, setShowThanks] = (0, _react.useState)(false);
  const [showFeedback, setShowFeedback] = (0, _react.useState)(false);
  const [selectedOption, setSelectedOption] = (0, _react.useState)(null);
  const [additionalComments, setAdditionalComments] = (0, _react.useState)('');

  // Added from Flutter implementation
  const [_showCsat, set_ShowCsat] = (0, _react.useState)(false);
  const [csatLocalValue, setCsatLocalValue] = (0, _react.useState)('');
  const data = (0, _react.useMemo)(() => campaigns.find(val => val.campaign_type === "CSAT"), [campaigns]);
  (0, _react.useEffect)(() => {
    if (data && data.id) {
      _initializeCsat();
      _ifshowCsat();
    }
    console.log(csatLocalValue);
  }, [data, user_id]);
  const _initializeCsat = () => {
    if (!data) return;
  };
  const _ifshowCsat = async () => {
    try {
      const csatLoaded = await _asyncStorage.default.getItem('csat_loaded');
      setCsatLocalValue(csatLoaded || '');
      if (!csatLoaded || csatLoaded !== 'true') {
        _scheduleCsatDisplay();
      }
    } catch (error) {
      console.error('Error checking CSAT status:', error);
    }
  };
  const _scheduleCsatDisplay = async () => {
    const delayDisplay = data?.details?.styling?.delayDisplay;
    const delay = delayDisplay ? parseInt(delayDisplay) : 0;
    setTimeout(async () => {
      (0, _trackuseraction.UserActionTrack)(user_id, data.id, "IMP");
      set_ShowCsat(true);
      if (data) {
        try {
          await _asyncStorage.default.setItem('csat_loaded', 'true');
        } catch (error) {
          console.error('Error saving CSAT status:', error);
        }
      }
    }, delay * 1000);
  };
  const handleStarPress = index => {
    const starCount = index + 1;
    setSelectedStars(starCount);
    if (starCount >= 4) {
      setTimeout(() => {
        setShowThanks(true);
        if (data) {
          console.log(starCount);
          (0, _capturecsatresponse.CaptureCsatResponse)(data.details.id, user_id, starCount, selectedOption || undefined, additionalComments || undefined);
        }
      }, 1000);
    } else {
      setShowFeedback(true);
    }
  };
  const handleSubmitFeedback = () => {
    if (data) {
      console.log(selectedStars);
      (0, _capturecsatresponse.CaptureCsatResponse)(data.details.id, user_id, selectedStars, selectedOption || undefined, additionalComments || undefined);
    }
    setShowThanks(true);
  };
  if (!showCSAT || !_showCsat || !data || !data.details) {
    return null;
  }
  const feedbackOptions = Object.entries(data.details.feedback_option || {}).map(([key, value]) => ({
    id: key,
    name: value
  }));
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
    style: styles.container,
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: [styles.card, {
        backgroundColor: data.details.styling.csatBackgroundColor
      }],
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.ScrollView, {
        children: showThanks ? /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: styles.thanksContainer,
          children: [data.details.thankyouImage && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
            source: {
              uri: data.details.thankyouImage
            },
            style: styles.thanksImage
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: [styles.thanksTitle, {
              color: data.details.styling.csatTitleColor
            }],
            children: data.details.thankyouText
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: [styles.thanksDescription, {
              color: data.details.styling.csatDescriptionTextColor
            }],
            children: data.details.thankyouDescription
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
            style: [styles.button, {
              backgroundColor: data.details.styling.csatCtaBackgroundColor
            }],
            onPress: () => setShowCSAT(false),
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: [styles.buttonText, {
                color: data.details.styling.csatCtaTextColor
              }],
              children: "Done"
            })
          })]
        }) : /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: [styles.title, {
              color: data.details.styling.csatTitleColor
            }],
            children: data.details.title
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: [styles.description, {
              color: data.details.styling.csatDescriptionTextColor
            }],
            children: data.details.description_text
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
            style: styles.starsContainer,
            children: Array.from({
              length: 5
            }).map((_, index) => /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
              onPress: () => handleStarPress(index),
              activeOpacity: 1,
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
                source: require("../assets/images/star.png"),
                style: {
                  tintColor: index < selectedStars ? '#FFD700' : '#B0B0B0',
                  width: 32,
                  height: 32,
                  marginHorizontal: 3
                }
              })
            }, index))
          }), !showFeedback ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: [styles.rateText, {
              color: data.details.styling.csatDescriptionTextColor
            }],
            children: "Rate Us!"
          }) : /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
            style: styles.feedbackContainer,
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: [styles.feedbackPrompt, {
                color: data.details.styling.csatDescriptionTextColor
              }],
              children: "Please tell us what went wrong."
            }), feedbackOptions.map(option => /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
              activeOpacity: 1,
              style: [styles.optionButton, {
                backgroundColor: selectedOption === option.name ? data.details.styling.csatSelectedOptionBackgroundColor : data.details.styling.csatBackgroundColor,
                borderColor: data.details.styling.csatOptionStrokeColor
              }],
              onPress: () => setSelectedOption(option.name),
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                style: [styles.optionText, {
                  color: selectedOption === option.name ? data.details.styling.csatSelectedOptionTextColor : data.details.styling.csatOptionTextColour
                }],
                children: option.name
              })
            }, option.id)), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TextInput, {
              style: [styles.input, {
                color: data.details.styling.csatDescriptionTextColor
              }],
              value: additionalComments,
              onChangeText: setAdditionalComments,
              placeholder: "Your feedback",
              placeholderTextColor: data.details.styling.csatDescriptionTextColor
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
              style: [styles.submitButton, {
                backgroundColor: data.details.styling.csatCtaBackgroundColor
              }],
              onPress: handleSubmitFeedback,
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                style: [styles.submitText, {
                  color: data.details.styling.csatCtaTextColor
                }],
                children: "Submit"
              })
            })]
          })]
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
        style: {
          position: 'absolute',
          top: 20,
          right: 20,
          backgroundColor: data.details.styling['csatCtaBackgroundColor'],
          borderRadius: 16,
          padding: 8
        },
        onPress: () => setShowCSAT(false),
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
          source: require("../assets/images/close.png"),
          style: {
            tintColor: data.details.styling['csatCtaTextColor'],
            width: 13,
            height: 13
          }
        })
      })]
    })
  });
};
const styles = _reactNative.StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10
  },
  card: {
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 40,
    paddingRight: 40,
    position: 'relative'
  },
  thanksContainer: {
    alignItems: 'center'
  },
  thanksImage: {
    width: 66,
    height: 66
  },
  thanksTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8
  },
  thanksDescription: {
    fontSize: 14,
    marginTop: 4
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold'
  },
  description: {
    fontSize: 14,
    marginTop: 4
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 16
  },
  rateText: {
    fontSize: 16,
    marginTop: 8,
    marginLeft: 8
  },
  feedbackContainer: {
    marginTop: 8
  },
  feedbackPrompt: {
    fontSize: 14,
    marginBottom: 12
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 6,
    paddingHorizontal: 12,
    marginVertical: 4,
    alignSelf: 'flex-start'
  },
  optionText: {
    fontSize: 14
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 8,
    marginTop: 8
  },
  button: {
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 6,
    marginTop: 16
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16
  },
  submitButton: {
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 6,
    marginTop: 18,
    alignSelf: 'flex-start'
  },
  submitText: {
    fontWeight: '600',
    fontSize: 16
  }
});
var _default = exports.default = Csat;
//# sourceMappingURL=Csat.js.map