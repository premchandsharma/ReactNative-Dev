import { SetStateAction, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  PanResponder,
  Platform,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Video from "react-native-video";
import { CampaignStorySlide } from "../../domain/sdk/types";
import { StoryData } from "./types";
import trackEvent from "../../domain/actions/trackEvent";

const closeImage = require("../../assets/images/close.png");
const shareImage = require("../../assets/images/share.png");

interface StoriesScreenProps {
  params: StoryData;
  onClose: () => void;
}

export default function StoriesScreen({ params, onClose }: StoriesScreenProps) {

  const { height, width } = Dimensions.get("window");

  const [content, setContent] = useState<CampaignStorySlide[]>([]);
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

    console.log(videoDuration);
  }, [params]);

  const loadStoryGroup = (groupIndex: number) => {
    if (!params?.slideData?.details[groupIndex]) {
      close();
      return;
    }

    const slides = params.slideData.details[groupIndex].slides;
    const transformedData = slides.map((storySlide) => ({
      ...storySlide,
      finish: 0,
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
        url: content[current]?.content ?? undefined,
      });
    } catch (error) {
      console.error("Error sharing content: ", error);
    }
  };

  const progress = useRef(new Animated.Value(0)).current;

  const start = (duration: number) => {
    if (params?.slideData?.details &&
      params.slideData.details[currentGroupIndex] &&
      params.slideData.details[currentGroupIndex].slides &&
      params.slideData.details[currentGroupIndex].slides[currentStorySlide] &&
      params.slideData.details[currentGroupIndex].slides[currentStorySlide].id) {
      if (params?.campaignId) {
        void trackEvent("viewed", params.campaignId, {
          "story_slide": params.slideData.details[currentGroupIndex].slides[currentStorySlide]?.id ?? ""
        })
        setCurrentStorySlide(currentStorySlide + 1);
      }
    }

    Animated.timing(progress, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
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
      if (nextGroupIndex < params!.slideData.details.length) {
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
      // const prevGroupSlides = params!.slideData.details[prevGroupIndex].slides;
      loadStoryGroup(prevGroupIndex);
      // setCurrent(prevGroupSlides.length - 1);
      setCurrent(0);
    }
  };

  const close = () => {
    console.log("Close function called");
    progress.setValue(0);
    onClose();
  };

  const speaker = () => {
    setMute(!mute);
  }

  // PanResponder for swipe down gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          close();
        }
      },
    }),
  ).current;

  if (!params) {
    return (
      <View style={{ backgroundColor: "black" }}>
        <Text style={{ color: "white", fontSize: 14 }}>No data available</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        paddingTop: Platform.OS === "ios" ? height * 0.07 : height * 0.02,
        paddingBottom: Platform.OS === "ios" ? height * 0.07 : height * 0.02,
      }}
      {...panResponder.panHandlers} // Attach PanResponder handlers
    >
      {content &&
        content.length !== 0 &&
        typeof content[current]?.image === "string" &&
        content[current]?.image !== "" && (
          <Image
            source={{ uri: content[current]?.image! }}
            onLoadEnd={() => {
              progress.setValue(0);
              start(5000); // Image lasts 5 seconds
            }}
            style={{
              height: "100%",
              width: width,
              resizeMode: "contain",
              top: 0,
            }}
          />
        )}
      {content &&
        content.length !== 0 &&
        typeof content[current]?.video === "string" &&
        content[current]?.video !== "" && (
          <Video
            source={{ uri: content[current]?.video! }}
            style={{ height: "100%", width: width }}
            resizeMode="contain"
            muted={mute}
            controls={false}
            onLoad={(data: { duration: SetStateAction<number>; }) => {
              console.log("Video loaded with duration:", data.duration);
              setVideoDuration(data.duration);
              progress.setValue(0);
              // @ts-ignore
              start(data.duration * 1000); // Start based on video duration
            }}
            onError={(error) => console.error("Video error:", error)}
            onEnd={next} // Move to next content when video ends
            paused={false}
          />
        )}

      <View
        style={{
          width: width - 5,
          position: "absolute",
          top: Platform.OS === "ios" ? height * 0.08 : height * 0.03,
          justifyContent: "space-evenly",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        {content.map((_, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              flex: 1,
              height: 3,
              backgroundColor: "grey",
              marginLeft: 5,
              borderRadius: 2,
            }}
          >
            <Animated.View
              style={{
                flex:
                  current === index ? progress : (content[index]?.finish ?? 1),
                height: 3,
                borderRadius: 2,
                backgroundColor: "rgba(211, 202, 202, 1)",
              }}
            />
          </View>
        ))}
      </View>

      <View
        style={{
          width: width,
          height: 50,
          flexDirection: "row",
          justifyContent: "space-between",
          position: "absolute",
          top: Platform.OS === "ios" ? height * 0.094 : height * 0.045,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            paddingRight: 26,
            paddingLeft: 20,
          }}
        >
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            {
              params?.slideData?.details &&
              params.slideData.details[currentGroupIndex] &&
              params.slideData.details[currentGroupIndex].thumbnail && (
                <Image
                  source={{ uri: params?.slideData?.details[currentGroupIndex].thumbnail }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                  }}
                />
              )}
            {params?.slideData?.details &&
              params.slideData.details[currentGroupIndex] &&
              params.slideData.details[currentGroupIndex].name && (
                <Text style={{
                  marginLeft: 12,
                  fontSize: 15,
                  fontWeight: "500",
                  color: "white",
                }}>
                  {params.slideData.details[currentGroupIndex].name}
                </Text>
              )}
          </View>

          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              bottom: 2,
            }}
          >
            {
              content &&
              content[current] &&
              content[current]?.video &&
              <TouchableOpacity onPress={speaker} style={{}}>
                <Image
                  source={mute ? require("../../assets/images/mute.png") : require("../../assets/images/volume.png")}
                  style={{
                    height: 24,
                    width: 24,
                    marginVertical: 16,
                    marginRight: 16
                  }}
                />
              </TouchableOpacity>
            }

            {
              content &&
              content[current] &&
              content[current]?.button_text &&
              content[current]?.link &&
              <TouchableOpacity onPress={shareContent} style={{}}>
                <Image
                  source={shareImage}
                  style={{
                    height: 20,
                    width: 20,
                    marginVertical: 16,
                    marginRight: 16
                  }}
                />
              </TouchableOpacity>
            }

            <TouchableOpacity onPress={close} style={{}}>
              <Image
                source={closeImage}
                style={{
                  height: 18,
                  width: 18,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View
        style={{
          marginTop: height * 0.15,
          width: width,
          height: height,
          position: "absolute",
          top: 0,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          style={{ width: "50%", height: "100%" }}
          onPress={previous}
        />
        <TouchableOpacity
          style={{ width: "50%", height: "100%" }}
          onPress={next}
        />
      </View>

      {content &&
        content[current] &&
        content[current]?.button_text &&
        content[current]?.link && (
          <View
            style={{
              position: "absolute",
              bottom: height * 0.037,
              width: width,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                if (typeof content[current]?.link === "string") {
                  void Linking.openURL(content[current]?.link!);
                }
                if (params && params.campaignId) {
                  void trackEvent("clicked", params.campaignId, {
                    "story_slide": content[current]?.id ?? ""
                  })
                }
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 30,
                  // paddingHorizontal: 18,
                  // paddingVertical: 12,
                }}
              >
                <Text
                  style={{
                    color: "black",
                    fontWeight: "600",
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    height: 45,
                    paddingVertical: 10,
                    paddingHorizontal: 25,
                  }}
                >
                  {content[current]?.button_text}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
    </View>
  );
};
