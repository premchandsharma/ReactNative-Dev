"use strict";

import React, { useState, useRef, useEffect } from "react";
import { View, Dimensions, Animated, Image, Platform } from "react-native";
import { GestureHandlerRootView, PanGestureHandler, State, TouchableWithoutFeedback } from "react-native-gesture-handler";
import Video from "react-native-video";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { UserActionTrack } from "../utils/trackuseraction.js";
import { subscribeToPipVisibility } from "../utils/pipState.js";
import RNFS from "react-native-fs";
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const {
  width,
  height
} = Dimensions.get("window");
const Pip = ({
  campaigns,
  user_id
}) => {
  const data = campaigns.find(val => val.campaign_type === "PIP");
  // let pipBottomValue = height > 700 ? (Platform.OS === "ios" ? 220 : 220) : 220;

  useEffect(() => {
    const unsubscribe = subscribeToPipVisibility(isVisible => {
      setPipVisible(isVisible);
    });
    return () => {
      unsubscribe();
    };
  }, []);
  const navigation = useNavigation();
  let pipBottomValue = data != null && data.details.height != null ? data.details.height + 20 : 220;
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  var PIP_WIDTH = data != null && data.details.width != null ? data.details.width : 140;
  var PIP_HEIGHT = data != null && data.details.height != null ? data.details.height : 200;

  // Calculate the maximum x and y positions to keep PIP within screen bounds
  const MAX_X = width - PIP_WIDTH - 20;
  const MAX_Y = height - (tabBarHeight + PIP_HEIGHT) - 20;
  const MIN_X = 20;
  const MIN_Y = Platform.OS === "ios" ? 60 + headerHeight : 20 + headerHeight;
  const [isPipVisible, setPipVisible] = useState(true);
  // const [isExpanded, setExpanded] = useState(false);

  const [smallVideoPath, setSmallVideoPath] = useState("");
  const [largeVideoPath, setLargeVideoPath] = useState("");
  const [mute, setMute] = useState(true);
  const initialX = data != null && data.details.position == "right" ? data.details.width != null ? width - (data.details.width + 20) : width - 160 : 20;
  const initialY = height - (tabBarHeight + pipBottomValue);
  const pan = useRef(new Animated.ValueXY({
    x: 0,
    y: 0
  })).current;
  useEffect(() => {
    pan.setOffset({
      x: initialX,
      y: initialY
    });
  }, []);
  const downloadVideo = async (url, filename) => {
    try {
      const downloadResult = await RNFS.downloadFile({
        fromUrl: url,
        toFile: `${RNFS.DocumentDirectoryPath}/${filename}`
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
      const fileExists = await RNFS.exists(`${RNFS.DocumentDirectoryPath}/${filename}`);
      if (!fileExists) {
        await downloadVideo(url, filename);
        setSmallVideoPath(`${RNFS.DocumentDirectoryPath}/${filename}`);
      } else {
        setSmallVideoPath(`${RNFS.DocumentDirectoryPath}/${filename}`);
      }
    } catch (error) {
      console.error("Error in checking and downloading video:", error);
    }
  };
  const checkAndDownloadLargeVideo = async url => {
    try {
      const filename = url.split("/").pop()?.split("?")[0];
      const fileExists = await RNFS.exists(`${RNFS.DocumentDirectoryPath}/${filename}`);
      if (!fileExists) {
        await downloadVideo(url, filename);
        setLargeVideoPath(`${RNFS.DocumentDirectoryPath}/${filename}`);
      } else {
        setLargeVideoPath(`${RNFS.DocumentDirectoryPath}/${filename}`);
      }
    } catch (error) {
      console.error("Error in checking and downloading video:", error);
    }
  };
  useEffect(() => {
    if (data && data.id) {
      UserActionTrack(user_id, data.id, "IMP");
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
      UserActionTrack(user_id, data.id, "IMP");
    }
  }
  ;
  const constrainPosition = (x, y) => {
    return {
      x: Math.min(Math.max(x, MIN_X), MAX_X),
      y: Math.min(Math.max(y, MIN_Y), MAX_Y)
    };
  };
  const onPanGestureEvent = Animated.event([{
    nativeEvent: {
      translationX: pan.x,
      translationY: pan.y
    }
  }], {
    useNativeDriver: true
  });
  const onHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
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
  return /*#__PURE__*/_jsx(GestureHandlerRootView, {
    style: {
      position: 'absolute',
      zIndex: 999998
    },
    children: data && isPipVisible && /*#__PURE__*/_jsx(PanGestureHandler, {
      onGestureEvent: onPanGestureEvent,
      onHandlerStateChange: onHandlerStateChange,
      children: /*#__PURE__*/_jsxs(Animated.View, {
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
            translateY: Animated.subtract(pan.y, new Animated.Value(headerHeight))
          }]
        },
        children: [/*#__PURE__*/_jsx(View, {
          onTouchEnd: expandPip,
          style: {
            flex: 1
          },
          children: data.details.small_video && data.details.large_video && /*#__PURE__*/_jsx(Video, {
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
        }), /*#__PURE__*/_jsx(TouchableWithoutFeedback, {
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
          children: /*#__PURE__*/_jsx(Image, {
            source: require("../assets/images/close.png"),
            style: {
              height: 9,
              width: 9
            }
          })
        }), /*#__PURE__*/_jsx(TouchableWithoutFeedback, {
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
          children: /*#__PURE__*/_jsx(Image, {
            source: mute ? require("../assets/images/mute.png") : require("../assets/images/volume.png"),
            style: {
              height: 16,
              width: 16
            }
          })
        }), data.details.large_video != null && data.details.large_video != "" && /*#__PURE__*/_jsx(TouchableWithoutFeedback, {
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
          children: /*#__PURE__*/_jsx(Image, {
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
export default Pip;
//# sourceMappingURL=pip.js.map