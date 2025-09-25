import { useEffect, useMemo, useState } from 'react';
import { Image, Modal, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useCampaigns from "../../domain/actions/useCampaigns";
import { CampaignStory, CampaignStoryGroup } from "../../domain/sdk/types";
import StoriesScreen from "./screen";
import { StoryData } from './types';
import trackEvent from '../../domain/actions/trackEvent';

const VIEWED_STORIES_KEY = 'viewed_stories';
const GREY_COLOR = '#808080';

export default function Stories() {
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  const [selectedStoryData, setSelectedStoryData] = useState<StoryData | null>(null);

  const data = useCampaigns<CampaignStory>("STR");

  const reversedDetailsData = useMemo(() => {
    if (!data?.details) return null;

    const reversedDetails = [...data.details].reverse() as [CampaignStoryGroup];

    return {
      id: data.id,
      campaign_type: 'STR' as const,
      details: reversedDetails
    };
  }, [data]);

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
    }) as [CampaignStoryGroup];

    return {
      id: reversedDetailsData.id,
      campaign_type: 'STR' as const,
      details: sortedDetails
    };
  }, [reversedDetailsData, viewedStories]);

  const markStoryAsViewed = async (storyId: string) => {
    const newViewedStories = new Set(viewedStories);
    newViewedStories.add(storyId);
    setViewedStories(newViewedStories);

    try {
      await AsyncStorage.setItem(
        VIEWED_STORIES_KEY,
        JSON.stringify(Array.from(newViewedStories))
      );
    } catch (error) {
      console.error('Error saving viewed stories:', error);
    }
  };

  function onNavigate(data: CampaignStory, groupIndex: number) {
    const storyGroup = data.details[groupIndex];
    void markStoryAsViewed(storyGroup!.id);

    setSelectedStoryData({
      slideData: data,
      campaignId: data.id,
      initialGroupIndex: groupIndex
    });
  }

  useEffect(() => {
    if (sortedDetailsData?.id) {
      void trackEvent("viewed", sortedDetailsData.id)
    }
  }, [sortedDetailsData?.id]);

  if (!sortedDetailsData) return null;

  return (
    <View style={{
      width: '100%',
      position: 'relative',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexDirection: 'row',
      backgroundColor: 'rgba(0, 0, 0, 0)',
    }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {sortedDetailsData.details
        .filter((storyGroup) => storyGroup.slides && storyGroup.slides.length > 0)
        .map((storyGroup, index) => {
          const isViewed = viewedStories.has(storyGroup.id);
          const size = storyGroup?.styling?.['size']
            ? parseInt(storyGroup.styling['size'], 10) || 70
            : 70;
          return (
            <View key={storyGroup.id} style={{
              flexDirection: 'row',
              flex: 1,
              width: size + 16,
              backgroundColor: 'rgba(0, 0, 0, 0)',
              justifyContent: 'center',
            }}>
              <View style={{
                marginTop: 6,
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <TouchableWithoutFeedback onPress={() => {
                  onNavigate(sortedDetailsData, index)
                  void trackEvent("clicked", sortedDetailsData.id)
                }}>
                  <View
                    style={{
                      height: size,
                      width: size,
                      borderRadius: size,
                      borderWidth: 2,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderColor: isViewed ? GREY_COLOR : storyGroup.ringColor
                    }}
                  >
                    <Image source={{ uri: storyGroup.thumbnail }} style={{
                      width: size - 17,
                      height: size - 17,
                      borderRadius: size,
                      overflow: 'hidden',
                      opacity: isViewed ? 0.6 : 1
                    }} />
                  </View>
                </TouchableWithoutFeedback>
                {storyGroup.name ? (
                  <Text
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      fontWeight: '500',
                      color: isViewed ? GREY_COLOR : storyGroup.nameColor,
                      textAlign: 'center',
                    }}
                  >
                    {storyGroup.name}
                  </Text>
                ) : null}

              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={false}
        visible={!!selectedStoryData}
        onRequestClose={() => setSelectedStoryData(null)}
      >
        {selectedStoryData && (
          <StoriesScreen
            params={selectedStoryData}
            onClose={() => setSelectedStoryData(null)}
          />
        )}
      </Modal>
    </View>
  );
};