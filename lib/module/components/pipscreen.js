"use strict";

import { Dimensions, Image, Text, TouchableOpacity, View, Linking, Platform } from "react-native";
import { useEffect, useState } from "react";
import Video from "react-native-video";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UserActionTrack } from "../utils/trackuseraction.js";
import { togglePipVisibility } from "../utils/pipState.js";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const PipScreen = () => {
  const navigation = useNavigation();
  const {
    params
  } = useRoute();
  const {
    height,
    width
  } = Dimensions.get("window");
  const [mute, setMute] = useState(false);
  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);
  const close = () => {
    navigation.goBack();
  };
  const minimize = () => {
    // set small pip visible
    togglePipVisibility(true);
    navigation.goBack();
  };
  const speaker = () => {
    setMute(!mute);
  };
  return /*#__PURE__*/_jsxs(View, {
    style: {
      flex: 1,
      backgroundColor: "black"
    },
    children: [/*#__PURE__*/_jsx(View, {
      style: {
        flex: 1
      },
      children: /*#__PURE__*/_jsx(Video, {
        repeat: true,
        resizeMode: "contain",
        muted: mute ? true : false,
        source: {
          uri: params.largeVideoUrl
        },
        style: {
          position: "absolute",
          overflow: "hidden",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0
        }
      })
    }), /*#__PURE__*/_jsx(TouchableOpacity, {
      onPress: close,
      style: {
        flex: 1,
        position: "absolute",
        top: Platform.OS === "ios" ? height * 0.1 : 25,
        right: 25
      },
      children: /*#__PURE__*/_jsx(Image, {
        source: require("../assets/images/close.png"),
        style: {
          height: 20,
          width: 20
        }
      })
    }), /*#__PURE__*/_jsx(TouchableOpacity, {
      onPress: speaker,
      style: {
        flex: 1,
        position: "absolute",
        top: Platform.OS === "ios" ? height * 0.1 : 22,
        right: 68
      },
      children: /*#__PURE__*/_jsx(Image, {
        source: mute ? require("../assets/images/mute.png") : require("../assets/images/volume.png"),
        style: {
          height: 25,
          width: 25
        }
      })
    }), /*#__PURE__*/_jsx(TouchableOpacity, {
      onPress: minimize,
      style: {
        flex: 1,
        position: "absolute",
        top: Platform.OS === "ios" ? height * 0.1 : 25,
        left: 25
      },
      children: /*#__PURE__*/_jsx(Image, {
        source: require("../assets/images/minimize.png"),
        style: {
          height: 22,
          width: 22
        }
      })
    }), params.link != null && params.link != "" && /*#__PURE__*/_jsx(View, {
      style: {
        display: "flex",
        position: "absolute",
        width: width,
        justifyContent: "center",
        alignItems: "center",
        bottom: Platform.OS === "ios" ? height * 0.045 : height * 0.025
      },
      children: /*#__PURE__*/_jsx(TouchableWithoutFeedback, {
        style: {
          backgroundColor: "white",
          borderRadius: 30
        },
        onPress: () => {
          if (params.link) {
            Linking.openURL(params.link);
          }
          UserActionTrack(params.user_id, params.id, "CLK");
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
          children: params.button_text
        })
      })
    })]
  });
};

// continue Button
// {data && data.details && data.details.link && (
//     <View
//       style={{
//         display: "flex",
//         position: "absolute",
//         width: width,
//         justifyContent: "center",
//         alignItems: "center",
//         bottom:
//           Platform.OS === "ios" ? height * 0.045 : height * 0.025,
//       }}
//     >
//       <TouchableWithoutFeedback
//         style={{
//           backgroundColor: "white",
//           borderRadius: 30,

//         }}
//         onPress={() => {
//           if (data.details.link) {
//             Linking.openURL(data.details.link);
//           }
//           UserActionTrack(user_id, data.id, "CLK");
//         }}
//       >
//         <Text style={{
//           color: "black",
//           fontWeight: "600",
//           textAlign: 'center',
//           textAlignVertical: 'center',
//           height: 45,
//           paddingVertical: 10,
//           paddingHorizontal: 25,
//         }}>
//           Continue
//         </Text>
//       </TouchableWithoutFeedback>
//     </View>
//   )}
//# sourceMappingURL=pipscreen.js.map