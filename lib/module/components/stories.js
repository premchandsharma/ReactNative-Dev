"use strict";

import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserActionTrack } from "../utils/trackuseraction.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const VIEWED_STORIES_KEY = 'viewed_stories';
const GREY_COLOR = '#808080';
const Stories = ({
  campaigns,
  user_id
}) => {
  const navigation = useNavigation();
  const [viewedStories, setViewedStories] = useState(new Set());

  // Find the original campaign data
  const campaignData = campaigns.find(val => val.campaign_type === 'STR');
  const reversedDetailsData = useMemo(() => {
    if (!campaignData?.details) return null;
    const reversedDetails = [...campaignData.details].reverse();
    return {
      id: campaignData.id,
      campaign_type: 'STR',
      details: reversedDetails
    };
  }, [campaignData]);

  // Load viewed stories from AsyncStorage on component mount
  useEffect(() => {
    const loadViewedStories = async () => {
      try {
        const storedViewedStories = await AsyncStorage.getItem(VIEWED_STORIES_KEY);
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
  const sortedDetailsData = useMemo(() => {
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
      await AsyncStorage.setItem(VIEWED_STORIES_KEY, JSON.stringify(Array.from(newViewedStories)));
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
  useEffect(() => {
    if (sortedDetailsData?.id) {
      UserActionTrack(user_id, sortedDetailsData.id, 'IMP');
    }
  }, [sortedDetailsData?.id, user_id]);
  if (!sortedDetailsData) return null;
  return /*#__PURE__*/_jsx(View, {
    style: styles.container,
    children: /*#__PURE__*/_jsx(ScrollView, {
      horizontal: true,
      showsHorizontalScrollIndicator: false,
      children: sortedDetailsData.details.map((storyGroup, index) => {
        const isViewed = viewedStories.has(storyGroup.id);
        return /*#__PURE__*/_jsx(View, {
          style: styles.storyContainer,
          children: /*#__PURE__*/_jsxs(View, {
            style: styles.storyWrapper,
            children: [/*#__PURE__*/_jsx(TouchableWithoutFeedback, {
              onPress: () => {
                onNavigate(sortedDetailsData, index);
                UserActionTrack(user_id, sortedDetailsData.id, 'CLK');
              },
              children: /*#__PURE__*/_jsx(View, {
                style: [styles.thumbnailContainer, {
                  borderColor: isViewed ? GREY_COLOR : storyGroup.ringColor
                }],
                children: /*#__PURE__*/_jsx(Image, {
                  source: {
                    uri: storyGroup.thumbnail
                  },
                  style: [styles.thumbnail, {
                    opacity: isViewed ? 0.6 : 1
                  }]
                })
              })
            }), /*#__PURE__*/_jsx(Text, {
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
const styles = StyleSheet.create({
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
export default Stories;
//# sourceMappingURL=stories.js.map