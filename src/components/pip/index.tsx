import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from '@react-navigation/elements';
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, Modal, Platform, View, } from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  Pressable,
  State,
} from "react-native-gesture-handler";
import Video from "react-native-video";
import checkForImage from "../../domain/actions/checkForImage";
import { subscribeToPipVisibility } from '../../domain/actions/pipState';
import useCampaigns from "../../domain/actions/useCampaigns";
import { CampaignPip } from "../../domain/sdk/types";
import PipScreen from "./screen";
import { PipData } from "./types";
import trackEvent from "../../domain/actions/trackEvent";

export default function Pip() {
  const { width, height } = Dimensions.get("window");

  const data = useCampaigns<CampaignPip>("PIP");

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


  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  let PIP_WIDTH = data != null && data.details.width != null ? data.details.width : 140;
  let PIP_HEIGHT = data != null && data.details.height != null ? data.details.height : 200;

  // Calculate the maximum x and y positions to keep PIP within screen bounds
  const MAX_X = width - PIP_WIDTH - 20;
  const MAX_Y = height - (tabBarHeight + PIP_HEIGHT) - 20;
  const MIN_X = 20;
  const MIN_Y = Platform.OS === "ios" ? (60 + headerHeight) : (20 + headerHeight);

  const [isPipVisible, setPipVisible] = useState(true);
  // const [isExpanded, setExpanded] = useState(false);

  const [smallVideoPath, setSmallVideoPath] = useState("");
  const [largeVideoPath, setLargeVideoPath] = useState("");

  const [mute, setMute] = useState(true);

  const initialX = data != null && data.details.position == "right" ? (data.details.width != null ? width - (data.details.width + 20) : width - 160) : 20;

  const initialY = height - (tabBarHeight + pipBottomValue)

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
      void checkForImage(data.details.small_video, setSmallVideoPath);
      void checkForImage(data.details.large_video, setLargeVideoPath);
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
        largeVideoUrl: `file://${largeVideoPath}`,
      });
      void trackEvent("viewed", data.id)
    }
  }

  const constrainPosition = (x: number, y: number) => {
    return {
      x: Math.min(Math.max(x, MIN_X), MAX_X),
      y: Math.min(Math.max(y, MIN_Y), MAX_Y),
    };
  };

  const onPanGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: pan.x,
          translationY: pan.y,
        },
      },
    ],
    { useNativeDriver: true },
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { absoluteX, absoluteY, x, y, } = event.nativeEvent;

      const constrainedPosition = constrainPosition(absoluteX - x, absoluteY - y);

      pan.setOffset(constrainedPosition);
      pan.setValue({ x: 0, y: 0 });

    }
  };

  return (
    <GestureHandlerRootView style={{
      position: 'absolute',
      zIndex: 999998,
    }}>
      {data && isPipVisible && (
        <PanGestureHandler
          onGestureEvent={onPanGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
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
                    translateY: Animated.subtract(pan.y, new Animated.Value(headerHeight)),
                  },
                ],
              }
            }
          >
            <View onTouchEnd={expandPip} style={{ flex: 1 }}>
              {data.details.small_video &&
                data.details.large_video && (
                  <Video
                    repeat={true}
                    resizeMode="contain"
                    muted={mute}
                    source={{
                      uri: `file://${smallVideoPath}`,
                    }}
                    style={{
                      borderRadius: 15,
                      position: "absolute",
                      overflow: "hidden",
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                    }}
                  />
                )}
            </View>

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

            {data.details.large_video != null && data.details.large_video != "" &&
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
        </PanGestureHandler>
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
    </GestureHandlerRootView>
  );
};
