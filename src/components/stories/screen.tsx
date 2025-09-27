import {SetStateAction, useEffect, useRef, useState} from "react";
import {
  ActivityIndicator,
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
import {CampaignStorySlide} from "../../domain/sdk/types";
import {StoryData} from "./types";
import trackEvent from "../../domain/actions/trackEvent";
import checkForCache from "../../domain/actions/checkForCache";

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
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const [mute, setMute] = useState(false);

  const [cachedImagePath, setCachedImagePath] = useState<string | null>(null);
  const [cachedVideoPath, setCachedVideoPath] = useState<string | null>(null);

  const [isVideoCached, setIsVideoCached] = useState<boolean>(false);
  const [isImageCached, setIsImageCached] = useState(false);


  useEffect(() => {
    if (!params) return;

    // Initialize with the clicked group index
    setCurrentGroupIndex(params.initialGroupIndex);
    loadStoryGroup(params.initialGroupIndex);

    console.log(videoDuration);
  }, [params]);

  useEffect(() => {
    // Reset loading states when content changes
    setIsVideoLoading(false);
    setIsImageLoading(false);

    if (content[current]?.video) {
      setIsVideoLoading(true);
    } else if (content[current]?.image) {
      setIsImageLoading(true);
    }
  }, [current, content]);

  useEffect(() => {
    setIsVideoLoading(false);
    setIsImageLoading(false);
    setCachedImagePath(null);
    setCachedVideoPath(null);

    if (content[current]?.video) {
      setIsVideoLoading(true);
      checkForCache(content[current].video).then((result) => {
        if (!result) return;
        setCachedVideoPath(result.path);
        setIsVideoCached(true);
      });
    } else if (content[current]?.image) {
      setIsImageLoading(true);
      checkForCache(content[current].image).then((result) => {
        if (!result) return;
        setCachedImagePath(result.path);
        setIsImageCached(true);
      });
    }
  }, [current, content]);

  const loadStoryGroup = (groupIndex: number) => {
    if (!params?.slideData?.details[groupIndex]) {
      close();
      return;
    }

    const slides = params.slideData.details[groupIndex].slides || [];

    if (slides.length === 0) {
      // If this group has no slides, jump to the next one
      const nextGroupIndex = groupIndex + 1;
      if (nextGroupIndex < params.slideData.details.length) {
        loadStoryGroup(nextGroupIndex);
      } else {
        close();
      }
      return;
    }

    const transformedData = slides.map((storySlide) => ({
      ...storySlide,
      finish: 0,
    }));

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
      let nextGroupIndex = currentGroupIndex + 1;
      while (
        nextGroupIndex < params!.slideData.details.length &&
        (!params!.slideData.details[nextGroupIndex]?.slides ||
          params!.slideData.details[nextGroupIndex]?.slides.length === 0)
      ) {
        nextGroupIndex++;
      }

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
    } else {
      let prevGroupIndex = currentGroupIndex - 1;
      while (
        prevGroupIndex >= 0 &&
        (!params!.slideData.details[prevGroupIndex]?.slides ||
          params!.slideData.details[prevGroupIndex]?.slides.length === 0)
      ) {
        prevGroupIndex--;
      }

      if (prevGroupIndex >= 0) {
        setCurrentGroupIndex(prevGroupIndex);
        loadStoryGroup(prevGroupIndex);
      } else {
        close();
      }
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
      {/* Image Content */}
      {content &&
        content.length !== 0 &&
        typeof content[current]?.image === "string" &&
        content[current]?.image !== "" && (
          <>
            {/* Show loading indicator while image is loading */}
            {isImageLoading && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "black",
                }}
              >

                {!isImageCached && (<ActivityIndicator size="large" color="white" />)}
              </View>
            )}

            {/* Image - only visible after loading */}
            {cachedImagePath && (<Image
              source={{ uri: cachedImagePath }}
              onLoadStart={() => setIsImageLoading(true)}
              onLoadEnd={() => {
                setIsImageLoading(false);
                progress.setValue(0);
                start(5000); // Image lasts 5 seconds
              }}
              onError={() => setIsImageLoading(false)}
              style={{
                height: "100%",
                width: width,
                resizeMode: "contain",
                top: 0,
                opacity: isImageLoading ? 0 : 1
              }}
            />)}
          </>
        )}

      {/* Video Content */}
      {content &&
        content.length !== 0 &&
        typeof content[current]?.video === "string" &&
        content[current]?.video !== "" && (
          <>
            {/* Show loading indicator while video is loading */}
            {isVideoLoading && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "black",
                }}
              >
                {!isVideoCached && (<ActivityIndicator size="large" color="white" />)}
              </View>
            )}

            {/* Hidden video component for loading - only visible after loading */}
            {cachedVideoPath && (<Video
              source={{ uri: cachedVideoPath }}
              style={{
                height: "100%",
                width: width,
                opacity: isVideoLoading ? 0 : 1
              }}
              resizeMode="contain"
              muted={mute}
              controls={false}
              disableFocus={true}
              ignoreSilentSwitch="ignore"
              playInBackground={false}
              preventsDisplaySleepDuringVideoPlayback={true}
              onLoadStart={() => {
                console.log("Video loading started");
                setIsVideoLoading(true);
              }}
              onLoad={(data: { duration: SetStateAction<number>; }) => {
                console.log("Video loaded with duration:", data.duration);
                setVideoDuration(data.duration);
                setIsVideoLoading(false);
                progress.setValue(0);
                // @ts-ignore
                start(data.duration * 1000); // Start based on video duration
              }}
              onError={(error) => {
                console.error("Video error:", error);
                setIsVideoLoading(false);
              }}
              onEnd={next} // Move to next content when video ends
              paused={isVideoLoading} // Pause video while loading
            />)}
          </>
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
