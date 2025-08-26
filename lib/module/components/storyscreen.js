"use strict";

import { Animated, Dimensions, Image, Text, TouchableOpacity, View, Linking, Share, PanResponder, Platform } from "react-native";
import { useEffect, useRef, useState } from "react";
import Video from "react-native-video";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UserActionTrack } from "../utils/trackuseraction.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const closeImage = require("../assets/images/close.png");
const shareImage = require("../assets/images/share.png");
export const StoryScreen = () => {
  const navigation = useNavigation();
  const {
    params
  } = useRoute();
  const {
    height,
    width
  } = Dimensions.get("window");
  const [content, setContent] = useState([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [current, setCurrent] = useState(0);
  const [currentStorySlide, setCurrentStorySlide] = useState(0);
  const [videoDuration, setVideoDuration] = useState(5);
  const [mute, setMute] = useState(false);
  useEffect(() => {
    if (!params) return;

    // Initialize with the clicked group index
    setCurrentGroupIndex(params.initialGroupIndex);
    loadStoryGroup(params.initialGroupIndex);
    navigation.setOptions({
      headerShown: false
    });
    console.log(videoDuration);
  }, [params, navigation]);
  const loadStoryGroup = groupIndex => {
    if (!params?.storySlideData?.details[groupIndex]) {
      close();
      return;
    }
    const slides = params.storySlideData.details[groupIndex].slides;
    const transformedData = slides.map(storySlide => ({
      ...storySlide,
      finish: 0
    }));

    // Remove this line if needed if the progress does not works properly
    progress.setValue(0);
    setContent(transformedData);
    setCurrent(0);
    setCurrentStorySlide(0);
  };

  // Share function
  const shareContent = async () => {
    try {
      await Share.share({
        message: "Check this out: " + content[current]?.link,
        url: content[current]?.content ?? undefined
      });
    } catch (error) {
      console.error("Error sharing content: ", error);
    }
  };
  const progress = useRef(new Animated.Value(0)).current;
  const start = duration => {
    if (params?.storySlideData?.details && params.storySlideData.details[currentGroupIndex] && params.storySlideData.details[currentGroupIndex].slides && params.storySlideData.details[currentGroupIndex].slides[currentStorySlide] && params.storySlideData.details[currentGroupIndex].slides[currentStorySlide].id) {
      if (params?.storyCampaignId) {
        UserActionTrack(params.user_id, params.storyCampaignId, "IMP", params.storySlideData.details[currentGroupIndex].slides[currentStorySlide]?.id ?? "");
        setCurrentStorySlide(currentStorySlide + 1);
      }
    }
    Animated.timing(progress, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false
    }).start(({
      finished
    }) => {
      if (finished) {
        next();
      }
    });
  };
  const next = () => {
    if (current !== content.length - 1) {
      let tempData = [...content];
      if (tempData[current]) {
        tempData[current].finish = 1;
      }
      setContent(tempData);
      setCurrent(current + 1);
      progress.setValue(0);
    } else {
      // Move to next story group
      const nextGroupIndex = currentGroupIndex + 1;
      if (nextGroupIndex < params.storySlideData.details.length) {
        setCurrentGroupIndex(nextGroupIndex);
        loadStoryGroup(nextGroupIndex);
      } else {
        close();
      }
    }
  };
  const previous = () => {
    if (current > 0) {
      let tempData = [...content];
      if (tempData[current]) {
        tempData[current].finish = 0;
      }
      setContent(tempData);
      progress.setValue(0);
      setCurrent(current - 1);
    } else if (currentGroupIndex > 0) {
      // Move to previous story group
      const prevGroupIndex = currentGroupIndex - 1;
      setCurrentGroupIndex(prevGroupIndex);
      // const prevGroupSlides = params!.storySlideData.details[prevGroupIndex].slides;
      loadStoryGroup(prevGroupIndex);
      // setCurrent(prevGroupSlides.length - 1);
      setCurrent(0);
    }
  };
  const close = () => {
    console.log("Close function called");
    progress.setValue(0);
    navigation.goBack();
  };
  const speaker = () => {
    setMute(!mute);
  };

  // PanResponder for swipe down gesture
  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 150) {
        close();
      }
    }
  })).current;
  if (!params) {
    return /*#__PURE__*/_jsx(View, {
      style: {
        backgroundColor: "black"
      },
      children: /*#__PURE__*/_jsx(Text, {
        style: {
          color: "white",
          fontSize: 14
        },
        children: "No data available"
      })
    });
  }
  const {
    user_id
  } = params;
  return /*#__PURE__*/_jsxs(View, {
    style: {
      flex: 1,
      backgroundColor: "black",
      paddingTop: Platform.OS === "ios" ? height * 0.07 : height * 0.02,
      paddingBottom: height * 0.1
    },
    ...panResponder.panHandlers,
    children: [content && content.length !== 0 && typeof content[current]?.image === "string" && content[current]?.image !== "" && /*#__PURE__*/_jsx(Image, {
      source: {
        uri: content[current]?.image
      },
      onLoadEnd: () => {
        progress.setValue(0);
        start(5000); // Image lasts 5 seconds
      },
      style: {
        height: "100%",
        width: width,
        resizeMode: "cover",
        top: 0
      }
    }), content && content.length !== 0 && typeof content[current]?.video === "string" && content[current]?.video !== "" && /*#__PURE__*/_jsx(Video, {
      source: {
        uri: content[current]?.video
      },
      style: {
        height: "100%",
        width: width
      },
      resizeMode: "cover",
      muted: mute ? true : false,
      onLoad: data => {
        console.log("Video loaded with duration:", data.duration);
        setVideoDuration(data.duration);
        progress.setValue(0);
        start(data.duration * 1000); // Start based on video duration
      },
      onError: error => console.error("Video error:", error),
      onEnd: next // Move to next content when video ends
      ,
      paused: false
    }), /*#__PURE__*/_jsx(View, {
      style: {
        width: width - 5,
        position: "absolute",
        top: Platform.OS === "ios" ? height * 0.08 : height * 0.03,
        justifyContent: "space-evenly",
        alignItems: "center",
        flexDirection: "row"
      },
      children: content.map((_, index) => /*#__PURE__*/_jsx(View, {
        style: {
          flexDirection: "row",
          flex: 1,
          height: 3,
          backgroundColor: "grey",
          marginLeft: 5,
          borderRadius: 2
        },
        children: /*#__PURE__*/_jsx(Animated.View, {
          style: {
            flex: current === index ? progress : content[index]?.finish ?? 1,
            height: 3,
            borderRadius: 2,
            backgroundColor: "rgba(211, 202, 202, 1)"
          }
        })
      }, index))
    }), /*#__PURE__*/_jsx(View, {
      style: {
        width: width,
        height: 50,
        flexDirection: "row",
        justifyContent: "space-between",
        position: "absolute",
        top: Platform.OS === "ios" ? height * 0.094 : height * 0.045
      },
      children: /*#__PURE__*/_jsxs(View, {
        style: {
          flexDirection: "row",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          paddingRight: 26,
          paddingLeft: 20
        },
        children: [/*#__PURE__*/_jsxs(View, {
          style: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row"
          },
          children: [params?.storySlideData?.details && params.storySlideData.details[currentGroupIndex] && params.storySlideData.details[currentGroupIndex].thumbnail && /*#__PURE__*/_jsx(Image, {
            source: {
              uri: params?.storySlideData?.details[currentGroupIndex].thumbnail
            },
            style: {
              width: 40,
              height: 40,
              borderRadius: 20
            }
          }), params?.storySlideData?.details && params.storySlideData.details[currentGroupIndex] && params.storySlideData.details[currentGroupIndex].name && /*#__PURE__*/_jsx(Text, {
            style: {
              marginLeft: 12,
              fontSize: 15,
              fontWeight: "500",
              color: "white"
            },
            children: params.storySlideData.details[currentGroupIndex].name
          })]
        }), /*#__PURE__*/_jsxs(View, {
          style: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            bottom: 2
          },
          children: [content && content[current] && content[current]?.video && /*#__PURE__*/_jsx(TouchableOpacity, {
            onPress: speaker,
            style: {},
            children: /*#__PURE__*/_jsx(Image, {
              source: mute ? require("../assets/images/mute.png") : require("../assets/images/volume.png"),
              style: {
                height: 24,
                width: 24,
                marginVertical: 16,
                marginRight: 16
              }
            })
          }), content && content[current] && content[current]?.button_text && content[current]?.link && /*#__PURE__*/_jsx(TouchableOpacity, {
            onPress: shareContent,
            style: {},
            children: /*#__PURE__*/_jsx(Image, {
              source: shareImage,
              style: {
                height: 20,
                width: 20,
                marginVertical: 16,
                marginRight: 16
              }
            })
          }), /*#__PURE__*/_jsx(TouchableOpacity, {
            onPress: close,
            style: {},
            children: /*#__PURE__*/_jsx(Image, {
              source: closeImage,
              style: {
                height: 18,
                width: 18
              }
            })
          })]
        })]
      })
    }), /*#__PURE__*/_jsxs(View, {
      style: {
        marginTop: height * 0.15,
        width: width,
        height: height,
        position: "absolute",
        top: 0,
        flexDirection: "row",
        justifyContent: "space-between"
      },
      children: [/*#__PURE__*/_jsx(TouchableOpacity, {
        style: {
          width: "50%",
          height: "100%"
        },
        onPress: previous
      }), /*#__PURE__*/_jsx(TouchableOpacity, {
        style: {
          width: "50%",
          height: "100%"
        },
        onPress: next
      })]
    }), content && content[current] && content[current]?.button_text && content[current]?.link && /*#__PURE__*/_jsx(View, {
      style: {
        position: "absolute",
        bottom: height * 0.037,
        width: width,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      },
      children: /*#__PURE__*/_jsx(TouchableOpacity, {
        activeOpacity: 1,
        onPress: () => {
          if (typeof content[current]?.link === "string") {
            Linking.openURL(content[current]?.link);
          }
          if (params && params.storyCampaignId) {
            UserActionTrack(user_id, params.storyCampaignId, "CLK", content[current]?.id);
          }
        },
        children: /*#__PURE__*/_jsx(View, {
          style: {
            backgroundColor: "white",
            borderRadius: 30
            // paddingHorizontal: 18,
            // paddingVertical: 12,
          },
          children: /*#__PURE__*/_jsx(Text, {
            style: {
              color: "black",
              fontWeight: "600",
              textAlign: 'center',
              textAlignVertical: 'center',
              height: 45,
              paddingVertical: 10,
              paddingHorizontal: 25
            },
            children: content[current]?.button_text
          })
        })
      })
    })]
  });
};
//# sourceMappingURL=storyscreen.js.map