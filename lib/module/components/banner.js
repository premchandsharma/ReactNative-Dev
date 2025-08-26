"use strict";

import React, { useEffect, useMemo, useState } from "react";
import { View, Image, TouchableOpacity, Dimensions, Linking, StyleSheet } from "react-native";
import RNFS from "react-native-fs";
import { UserActionTrack } from "../utils/trackuseraction.js";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const Banner = ({
  campaigns,
  user_id
}) => {
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [imagePath, setImagePath] = useState(null);
  const downloadImage = async url => {
    const filename = url.split("/").pop()?.split("?")[0];
    try {
      const downloadResult = await RNFS.downloadFile({
        fromUrl: url,
        toFile: `${RNFS.DocumentDirectoryPath}/${filename}`
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
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
    try {
      const exists = await RNFS.exists(path);
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
  const data = useMemo(() => campaigns.find(val => val.campaign_type === "BAN"), [campaigns]);
  useEffect(() => {
    if (data && data.id) {
      UserActionTrack(user_id, data.id, "IMP");
      checkCacheForImage(data.details.image);
    }
  }, [data, user_id]);
  const closeBanner = () => {
    setIsBannerVisible(false);
    // UserActionTrack(user_id, data.id, 'CLK');
  };
  const {
    width
  } = Dimensions.get("window");
  return /*#__PURE__*/_jsx(_Fragment, {
    children: data && data.details && data.details.image !== "" && isBannerVisible && /*#__PURE__*/_jsx(View, {
      style: styles.container,
      children: /*#__PURE__*/_jsxs(TouchableOpacity, {
        activeOpacity: 1,
        onPress: () => {
          UserActionTrack(user_id, data.id, "CLK");
          if (data.details.link) {
            Linking.openURL(data.details.link);
          }
        },
        style: [styles.banner, {
          width: width - 20,
          height: data.details.height ?? 92,
          borderRadius: 6
        }],
        children: [/*#__PURE__*/_jsx(View, {
          style: [styles.banner, {
            borderRadius: 6
          }],
          children: /*#__PURE__*/_jsx(Image, {
            source: {
              uri: `file://${imagePath}`
            },
            style: {
              width: width - 20,
              height: data.details.height ?? 92,
              borderRadius: 6
            }
          })
        }), /*#__PURE__*/_jsx(TouchableOpacity, {
          onPress: closeBanner,
          style: styles.closeButton,
          activeOpacity: 1,
          children: /*#__PURE__*/_jsx(Image, {
            source: require("../assets/images/close.png"),
            style: styles.closeIcon
          })
        })]
      })
    })
  });
};
const styles = StyleSheet.create({
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
export default Banner;
//# sourceMappingURL=banner.js.map