"use strict";

import React, { useState, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, StyleSheet } from 'react-native';
import { UserActionTrack } from "../utils/trackuseraction.js";
import { CaptureCsatResponse } from "../utils/capturecsatresponse.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Csat = ({
  campaigns,
  user_id
}) => {
  const [showCSAT, setShowCSAT] = useState(true);
  const [selectedStars, setSelectedStars] = useState(0);
  const [showThanks, setShowThanks] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [additionalComments, setAdditionalComments] = useState('');

  // Added from Flutter implementation
  const [_showCsat, set_ShowCsat] = useState(false);
  const [csatLocalValue, setCsatLocalValue] = useState('');
  const data = useMemo(() => campaigns.find(val => val.campaign_type === "CSAT"), [campaigns]);
  useEffect(() => {
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
      const csatLoaded = await AsyncStorage.getItem('csat_loaded');
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
      UserActionTrack(user_id, data.id, "IMP");
      set_ShowCsat(true);
      if (data) {
        try {
          await AsyncStorage.setItem('csat_loaded', 'true');
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
          CaptureCsatResponse(data.details.id, user_id, starCount, selectedOption || undefined, additionalComments || undefined);
        }
      }, 1000);
    } else {
      setShowFeedback(true);
    }
  };
  const handleSubmitFeedback = () => {
    if (data) {
      console.log(selectedStars);
      CaptureCsatResponse(data.details.id, user_id, selectedStars, selectedOption || undefined, additionalComments || undefined);
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
  return /*#__PURE__*/_jsx(View, {
    style: styles.container,
    children: /*#__PURE__*/_jsxs(View, {
      style: [styles.card, {
        backgroundColor: data.details.styling.csatBackgroundColor
      }],
      children: [/*#__PURE__*/_jsx(ScrollView, {
        children: showThanks ? /*#__PURE__*/_jsxs(View, {
          style: styles.thanksContainer,
          children: [data.details.thankyouImage && /*#__PURE__*/_jsx(Image, {
            source: {
              uri: data.details.thankyouImage
            },
            style: styles.thanksImage
          }), /*#__PURE__*/_jsx(Text, {
            style: [styles.thanksTitle, {
              color: data.details.styling.csatTitleColor
            }],
            children: data.details.thankyouText
          }), /*#__PURE__*/_jsx(Text, {
            style: [styles.thanksDescription, {
              color: data.details.styling.csatDescriptionTextColor
            }],
            children: data.details.thankyouDescription
          }), /*#__PURE__*/_jsx(TouchableOpacity, {
            style: [styles.button, {
              backgroundColor: data.details.styling.csatCtaBackgroundColor
            }],
            onPress: () => setShowCSAT(false),
            children: /*#__PURE__*/_jsx(Text, {
              style: [styles.buttonText, {
                color: data.details.styling.csatCtaTextColor
              }],
              children: "Done"
            })
          })]
        }) : /*#__PURE__*/_jsxs(View, {
          children: [/*#__PURE__*/_jsx(Text, {
            style: [styles.title, {
              color: data.details.styling.csatTitleColor
            }],
            children: data.details.title
          }), /*#__PURE__*/_jsx(Text, {
            style: [styles.description, {
              color: data.details.styling.csatDescriptionTextColor
            }],
            children: data.details.description_text
          }), /*#__PURE__*/_jsx(View, {
            style: styles.starsContainer,
            children: Array.from({
              length: 5
            }).map((_, index) => /*#__PURE__*/_jsx(TouchableOpacity, {
              onPress: () => handleStarPress(index),
              activeOpacity: 1,
              children: /*#__PURE__*/_jsx(Image, {
                source: require("../assets/images/star.png"),
                style: {
                  tintColor: index < selectedStars ? '#FFD700' : '#B0B0B0',
                  width: 32,
                  height: 32,
                  marginHorizontal: 3
                }
              })
            }, index))
          }), !showFeedback ? /*#__PURE__*/_jsx(Text, {
            style: [styles.rateText, {
              color: data.details.styling.csatDescriptionTextColor
            }],
            children: "Rate Us!"
          }) : /*#__PURE__*/_jsxs(View, {
            style: styles.feedbackContainer,
            children: [/*#__PURE__*/_jsx(Text, {
              style: [styles.feedbackPrompt, {
                color: data.details.styling.csatDescriptionTextColor
              }],
              children: "Please tell us what went wrong."
            }), feedbackOptions.map(option => /*#__PURE__*/_jsx(TouchableOpacity, {
              activeOpacity: 1,
              style: [styles.optionButton, {
                backgroundColor: selectedOption === option.name ? data.details.styling.csatSelectedOptionBackgroundColor : data.details.styling.csatBackgroundColor,
                borderColor: data.details.styling.csatOptionStrokeColor
              }],
              onPress: () => setSelectedOption(option.name),
              children: /*#__PURE__*/_jsx(Text, {
                style: [styles.optionText, {
                  color: selectedOption === option.name ? data.details.styling.csatSelectedOptionTextColor : data.details.styling.csatOptionTextColour
                }],
                children: option.name
              })
            }, option.id)), /*#__PURE__*/_jsx(TextInput, {
              style: [styles.input, {
                color: data.details.styling.csatDescriptionTextColor
              }],
              value: additionalComments,
              onChangeText: setAdditionalComments,
              placeholder: "Your feedback",
              placeholderTextColor: data.details.styling.csatDescriptionTextColor
            }), /*#__PURE__*/_jsx(TouchableOpacity, {
              style: [styles.submitButton, {
                backgroundColor: data.details.styling.csatCtaBackgroundColor
              }],
              onPress: handleSubmitFeedback,
              children: /*#__PURE__*/_jsx(Text, {
                style: [styles.submitText, {
                  color: data.details.styling.csatCtaTextColor
                }],
                children: "Submit"
              })
            })]
          })]
        })
      }), /*#__PURE__*/_jsx(TouchableOpacity, {
        style: {
          position: 'absolute',
          top: 20,
          right: 20,
          backgroundColor: data.details.styling['csatCtaBackgroundColor'],
          borderRadius: 16,
          padding: 8
        },
        onPress: () => setShowCSAT(false),
        children: /*#__PURE__*/_jsx(Image, {
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
const styles = StyleSheet.create({
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
export default Csat;
//# sourceMappingURL=Csat.js.map