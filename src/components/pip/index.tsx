import {useEffect, useRef, useState} from "react";
import {ActivityIndicator, Animated, Dimensions, Image, Modal, Platform, Pressable, StyleSheet, View} from "react-native";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Video from "react-native-video";
import checkForCache from "../../domain/actions/checkForCache";
import {subscribeToPipVisibility} from '../../domain/actions/pipState';
import useCampaigns from "../../domain/actions/useCampaigns";
import {CampaignPip} from "../../domain/sdk/types";
import PipScreen from "./screen";
import {PipData} from "./types";
import trackEvent from "../../domain/actions/trackEvent";
import usePadding from "../../domain/actions/usePadding";

export default function Pip() {
  const { width, height } = Dimensions.get("window");

  const data = useCampaigns<CampaignPip>("PIP");

  const padding = usePadding('PIP');
  const topPadding = padding?.top || 0;
  const bottomPadding = padding?.bottom || 0;

  useEffect(() => {
    const unsubscribe = subscribeToPipVisibility((isVisible) => {
      setPipVisible(isVisible);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const [selectedPipData, setSelectedPipData] = useState<PipData | null>(null);

  let pipBottomValue = data != null && data.details.height != null ? data.details.height + 20 : 220;

  let PIP_WIDTH = data != null && data.details.width != null ? data.details.width : 140;
  let PIP_HEIGHT = data != null && data.details.height != null ? data.details.height : 200;

  // Calculate the maximum x and y positions to keep PIP within screen bounds
  const MAX_X = width - PIP_WIDTH - 20;
  const MAX_Y = height - (bottomPadding + PIP_HEIGHT) - 20;
  const MIN_X = 20;
  const MIN_Y = Platform.OS === "ios" ? (60) : (20);

  const [isPipVisible, setPipVisible] = useState(true);

  const [cachedSmallVideoPath, setCachedSmallVideoPath] = useState<string | null>(null);
  const [cachedLargeVideoPath, setCachedLargeVideoPath] = useState<string | null>(null);

  const [isSmallVideoCached, setIsSmallVideoCached] = useState<boolean>(false);
  const [isLargeVideoCached, setIsLargeVideoCached] = useState<boolean>(false);

  isLargeVideoCached;

  const [mute, setMute] = useState(true);

  const initialX = data != null && data.details.position == "right" ? (data.details.width != null ? width - (data.details.width + 20) : width - 160) : 20;

  const initialY = height - (bottomPadding + pipBottomValue)

  const [isVideoLoading, setIsVideoLoading] = useState(false);

  // pick local file if available, else fallback to remote
  const smallSrc = cachedSmallVideoPath || (data?.details.small_video ?? "");
  const largeSrc = cachedLargeVideoPath || (data?.details.large_video ?? "");

  const isPlayable = (u?: string) => !!u && (/^https?:\/\//i.test(u) || /^file:\/\//i.test(u));

  const pan = useRef(
    new Animated.ValueXY({
      x: 0,
      y: 0,
    })
  ).current;

  useEffect(() => {
    pan.setOffset({ x: initialX, y: initialY });
  }, [])

  useEffect(() => {
    if (data && data.id) {
      void trackEvent("viewed", data.id)
      
      // Reset states when new data comes in
      setIsVideoLoading(false);
      setCachedSmallVideoPath(null);
      setCachedLargeVideoPath(null);
      setIsSmallVideoCached(false);
      setIsLargeVideoCached(false);

      // Cache small video
      if (data.details.small_video) {
        setIsVideoLoading(true);
        checkForCache(data.details.small_video, 'video').then((result) => {
          if (result?.path) {
            setCachedSmallVideoPath(result.path);
            setIsSmallVideoCached(true);
          }
        });
      }

      // Cache large video
      if (data.details.large_video) {
        checkForCache(data.details.large_video, 'video').then((result) => {
          if (result?.path) {
            setCachedLargeVideoPath(result.path);
            setIsLargeVideoCached(true);
          }
        });
      }
    }
  }, [data]);

  const closePip = () => {
    setPipVisible(false);
  };

  const closeModal = () => {
    setSelectedPipData(null);
    setPipVisible(true); // Show small PIP again when modal closes
  };

  const speaker = () => {
    setMute(!mute);
  }

  function expandPip() {
    if (data && (data.details.large_video != null || data.details.large_video != "")) {
      closePip();
      const link = data.details.link;
      setSelectedPipData({
        id: data.id,
        link,
        button_text: data.details.button_text,
        largeVideoUrl: largeSrc,
        styling: data.details.styling,
      });
      void trackEvent("viewed", data.id)
    }
  }

  // Store the initial offset values
  const offsetRef = useRef({ x: initialX, y: initialY });

  const constrainPosition = (x: number, y: number) => {
    return {
      x: Math.min(Math.max(x, MIN_X), MAX_X),
      y: Math.min(Math.max(y, MIN_Y), MAX_Y),
    };
  };

  const panGesture = Gesture.Pan()
    .minDistance(10) // Require minimum distance before starting pan
    .onUpdate((event) => {
      pan.setValue({
        x: event.translationX,
        y: event.translationY,
      });
    })
    .onEnd((event) => {
      const newX = offsetRef.current.x + event.translationX;
      const newY = offsetRef.current.y + event.translationY;

      const constrainedPosition = constrainPosition(newX, newY);

      offsetRef.current = constrainedPosition;
      pan.setOffset(constrainedPosition);
      pan.setValue({ x: 0, y: 0 });
    })
    .simultaneousWithExternalGesture(); // Allow other gestures to work simultaneously

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 999998, top: topPadding, bottom: bottomPadding }]}
      pointerEvents="box-none">
      {data && isPipVisible && (
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={
              {
                backgroundColor: "black",
                width: data.details.width ?? 140,
                height: data.details.height ?? 200,
                position: "absolute",
                borderRadius: 15,
                display: "flex",
                flexDirection: "row",
                zIndex: 999999, // Add a high zIndex
                elevation: 999999, // Add elevation for Android
                transform: [
                  {
                    translateX: pan.x
                  },
                  {
                    translateY: Animated.subtract(pan.y, new Animated.Value(topPadding)),
                  },
                ],
              }
            }
          >
            <Pressable onPress={expandPip} style={{ flex: 1 }}>
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
                    borderRadius: 15,
                    zIndex: 10,
                  }}
                >
                  {!isSmallVideoCached && <ActivityIndicator size="large" color="white"/>}
                </View>
              )}

              {/* Video - only visible after caching */}
              {cachedSmallVideoPath && isPlayable(smallSrc) && (
                <Video
                  repeat
                  resizeMode="contain"
                  muted={mute}
                  controls={false}
                  source={{ uri: smallSrc }}
                  paused={isVideoLoading}
                  onLoadStart={() => {
                    console.log("PIP video loading started");
                    setIsVideoLoading(true);
                  }}
                  onLoad={() => {
                    console.log("PIP video loaded");
                    setIsVideoLoading(false);
                  }}
                  onError={(e) => {
                    console.error("PIP small video error:", e);
                    setIsVideoLoading(false);
                  }}
                  style={{
                    borderRadius: 15,
                    position: "absolute",
                    overflow: "hidden",
                    top: 0, 
                    left: 0, 
                    bottom: 0, 
                    right: 0,
                    opacity: isVideoLoading ? 0 : 1,
                  }}
                />
              )}
            </Pressable>

            <Pressable
              onPress={closePip}
              style={{
                padding: 7,
                position: "absolute",
                top: 5,
                right: 5,
                backgroundColor: "black",
                borderRadius: 20,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000000, // Higher z-index than the container
                elevation: 1000000, // Higher elevation for Android
              }}
            >
              <Image
                source={require("../../assets/images/close.png")}
                style={{
                  height: 9,
                  width: 9,
                }}
              />
            </Pressable>

            <Pressable
              onPress={speaker}
              style={{
                padding: 5,
                position: "absolute",
                top: 5,
                right: data.details.width != null ? (data.details.width - 30) : 110,
                backgroundColor: "black",
                borderRadius: 20,
                display: "flex",
                zIndex: 1000000, // Higher z-index than the container
                elevation: 1000000, // Higher elevation for Android
              }}
            >
              <Image
                source={mute ? require("../../assets/images/mute.png") : require("../../assets/images/volume.png")}
                style={{
                  height: 16,
                  width: 16,
                }}
              />
            </Pressable>

            { isPlayable(largeSrc) &&
              <Pressable
                onPress={expandPip}
                style={{
                  padding: 7,
                  position: "absolute",
                  bottom: 7,
                  right: 5,
                  backgroundColor: "black",
                  borderRadius: 20,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1000000, // Higher z-index than the container
                  elevation: 1000000, // Higher elevation for Android
                }}
              >
                <Image
                  source={require("../../assets/images/enlarge.png")}
                  style={{
                    height: 10,
                    width: 10,
                  }}
                />
              </Pressable>}
          </Animated.View>
        </GestureDetector>
      )}

      <Modal
        animationType="fade"
        transparent={false}
        visible={!!selectedPipData}
        onRequestClose={closeModal}
      >
        {selectedPipData && (
          <PipScreen
            params={selectedPipData}
            onClose={closeModal}
            onMinimize={closeModal}
          />
        )}
      </Modal>
    </View>
  );
};