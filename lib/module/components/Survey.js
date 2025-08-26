"use strict";

import { View, Text, Dimensions, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { UserActionTrack } from "../utils/trackuseraction.js";
import { CaptureSurveyResponse } from "../utils/capturesurveyresponse.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Survey = ({
  campaigns,
  user_id
}) => {
  const {
    height,
    width
  } = Dimensions.get('window');
  const [showSurvey, setShowSurvey] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState([]); // Track multiple selections
  const [otherText, setOtherText] = useState('');
  const data = useMemo(() => campaigns.find(val => val.campaign_type === "SUR"), [campaigns]);
  useEffect(() => {
    if (data && data.id) {
      UserActionTrack(user_id, data.id, "IMP");
    }
  }, [data, user_id]);
  const closeSurvey = () => {
    setShowSurvey(false);
  };
  const toggleOption = value => {
    setSelectedOptions(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };
  const handleSubmit = () => {
    if (selectedOptions.length > 0) {
      // Capture survey response
      CaptureSurveyResponse(data.details.id, user_id, selectedOptions, otherText || undefined);
      closeSurvey();
    }
  };
  if (!showSurvey || !data || !data.details) {
    return null;
  }

  // Create survey options including "Others" if enabled
  const surveyOptions = Object.entries(data.details.surveyOptions).map(([key, value]) => ({
    id: key,
    name: value
  }));
  if (data.details.hasOthers) {
    const nextOptionId = String.fromCharCode(65 + surveyOptions.length);
    surveyOptions.push({
      id: nextOptionId,
      name: 'Others'
    });
  }
  return /*#__PURE__*/_jsx(View, {
    style: {
      position: 'absolute',
      height: height,
      width: width,
      backgroundColor: 'rgba(0, 0, 0, 0.4)'
    },
    children: /*#__PURE__*/_jsx(ScrollView, {
      contentContainerStyle: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20
      },
      children: /*#__PURE__*/_jsxs(View, {
        style: {
          width: width * 0.9,
          backgroundColor: data.details.styling['backgroundColor'],
          borderRadius: 18,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 20,
          alignSelf: 'center'
        },
        children: [/*#__PURE__*/_jsxs(View, {
          style: {
            height: height * 0.05,
            justifyContent: 'center',
            marginBottom: 12
          },
          children: [/*#__PURE__*/_jsx(Text, {
            style: {
              color: data.details.styling['surveyQuestionColor'],
              fontSize: 20,
              fontWeight: '500',
              textAlign: 'center'
            },
            children: data.details.name
          }), /*#__PURE__*/_jsx(TouchableOpacity, {
            activeOpacity: 0.7,
            style: {
              position: 'absolute',
              right: 0,
              top: 10,
              backgroundColor: data.details.styling['ctaBackgroundColor'],
              padding: 10,
              borderRadius: 25
            },
            onPress: closeSurvey,
            children: /*#__PURE__*/_jsx(Image, {
              source: require("../assets/images/close.png"),
              style: {
                tintColor: data.details.styling['ctaTextIconColor'],
                width: 12,
                height: 12
              }
            })
          })]
        }), /*#__PURE__*/_jsx(Text, {
          style: {
            color: data.details.styling['surveyQuestionColor'],
            fontSize: 18,
            fontWeight: '700',
            marginBottom: 20
          },
          children: data.details.surveyQuestion
        }), surveyOptions.map(option => /*#__PURE__*/_jsxs(TouchableOpacity, {
          activeOpacity: 0.7,
          onPress: () => toggleOption(option.name),
          style: {
            marginBottom: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: selectedOptions.includes(option.name) ? data.details.styling['selectedOptionColor'] : data.details.styling['optionColor'],
            borderRadius: 12
          },
          children: [/*#__PURE__*/_jsx(View, {
            style: {
              backgroundColor: 'white',
              borderRadius: 18,
              borderWidth: 0.8,
              borderColor: 'black',
              paddingVertical: 4,
              paddingHorizontal: 8
            },
            children: /*#__PURE__*/_jsx(Text, {
              style: {
                color: 'black',
                fontSize: 12,
                fontWeight: '600'
              },
              children: option.id
            })
          }), /*#__PURE__*/_jsx(Text, {
            style: {
              marginLeft: 12,
              color: selectedOptions.includes(option.name) ? data.details.styling['selectedOptionTextColor'] : data.details.styling['optionTextColor'],
              fontSize: 14,
              fontWeight: '400'
            },
            children: option.name
          })]
        }, option.id)), selectedOptions.includes('Others') && /*#__PURE__*/_jsx(TextInput, {
          style: {
            height: height * 0.057,
            marginBottom: width * 0.04,
            backgroundColor: 'white',
            borderRadius: 8,
            borderWidth: 2.5,
            borderColor: data.details.styling['othersBackgroundColor'],
            paddingHorizontal: height * 0.015,
            color: 'black'
          },
          placeholder: "Please enter Others text\u2026..upto 200 chars",
          placeholderTextColor: "black",
          value: otherText,
          onChangeText: setOtherText,
          maxLength: 200
        }), /*#__PURE__*/_jsx(TouchableOpacity, {
          activeOpacity: 0.7,
          onPress: handleSubmit,
          style: {
            backgroundColor: data.details.styling['ctaBackgroundColor'],
            borderRadius: 12,
            padding: 14
          },
          children: /*#__PURE__*/_jsx(Text, {
            style: {
              color: data.details.styling['ctaTextIconColor'],
              fontSize: 18,
              fontWeight: '500',
              textAlign: 'center'
            },
            children: "SUBMIT"
          })
        })]
      })
    })
  });
};
export default Survey;
//# sourceMappingURL=Survey.js.map