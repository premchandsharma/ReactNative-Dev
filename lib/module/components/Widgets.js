"use strict";

import { FlatList, Image, Linking, View, Dimensions, TouchableOpacity } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { UserActionTrack } from "../utils/trackuseraction.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Widgets = ({
  campaigns,
  user_id
}) => {
  const flatlistRef = useRef(null);
  const screenWidth = Dimensions.get("window").width;
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef(null);
  const data = useMemo(() => campaigns.find(val => val.campaign_type === "WID"), [campaigns]);
  const extendedImages = useMemo(() => {
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
  useEffect(() => {
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
  const trackedImpressionsRef = useRef([]);
  const trackImpression = widget_image_id => {
    if (!trackedImpressionsRef.current.includes(widget_image_id)) {
      console.log(`Tracking impression for: ${widget_image_id}`); // Debug log
      trackedImpressionsRef.current.push(widget_image_id);
      UserActionTrack(user_id, data.id, "IMP", undefined, widget_image_id);
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
    return /*#__PURE__*/_jsx(View, {
      style: {
        width: screenWidth * 0.94,
        marginHorizontal: screenWidth * 0.03
      },
      children: /*#__PURE__*/_jsx(TouchableOpacity, {
        activeOpacity: 1,
        onPress: () => {
          if (item.link) {
            UserActionTrack(user_id, data.id, "CLK", undefined, item.id);
            Linking.openURL(item.link);
          }
        },
        children: /*#__PURE__*/_jsx(Image, {
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
    return /*#__PURE__*/_jsx(View, {
      style: {
        width: screenWidth * 0.455,
        marginLeft: screenWidth * 0.03
      },
      children: /*#__PURE__*/_jsx(TouchableOpacity, {
        activeOpacity: 1,
        onPress: () => {
          if (item.link) {
            UserActionTrack(user_id, data.id, "CLK", undefined, item.id);
            Linking.openURL(item.link);
          }
        },
        children: /*#__PURE__*/_jsx(Image, {
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
      return /*#__PURE__*/_jsx(View, {
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
  return /*#__PURE__*/_jsxs(View, {
    style: {
      // height: data.details.type === "full" ? 160 : screenWidth * 0.44,
      width: '100%',
      marginVertical: screenWidth * 0.03,
      paddingRight: data.details.type === "half" ? screenWidth * 0.03 : null
    },
    children: [/*#__PURE__*/_jsx(FlatList, {
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
    }), data.details.type === "full" && /*#__PURE__*/_jsx(View, {
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
export default Widgets;
//# sourceMappingURL=Widgets.js.map