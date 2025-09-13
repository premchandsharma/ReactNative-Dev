import { Dimensions, Image, Linking, Platform, Text, TouchableOpacity, View, } from "react-native";
import { useState } from "react";
import Video from "react-native-video";
import { togglePipVisibility } from '../../domain/actions/pipState';
import trackUserAction from "../../domain/actions/trackUserAction";
import { Pressable } from "react-native-gesture-handler";
import { PipData } from "./types";
import trackEvent from "../../domain/actions/trackEvent";

interface PipScreenProps {
  params: PipData;
  onClose: () => void;
  onMinimize: () => void;
}

export default function PipScreen({ params, onClose, onMinimize }: PipScreenProps) {
  const { height, width } = Dimensions.get("window");

  const [mute, setMute] = useState(false);

  const minimize = () => {
    // set small pip visible
    togglePipVisibility(true);
    onMinimize();
  };

  const speaker = () => {
    setMute(!mute);
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
      }}
    >
      <View style={{ flex: 1 }}>
        <Video
          repeat={true}
          resizeMode="contain"
          muted={mute}
          controls={false}
          source={{
            uri: params.largeVideoUrl
          }}
          style={{
            position: "absolute",
            overflow: "hidden",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
        />
      </View>

      {/* Close button */}
      <TouchableOpacity
        onPress={onClose}
        style={{
          flex: 1,
          position: "absolute",
          top: Platform.OS === "ios" ? height * 0.1 : 25,
          right: 25,
        }}
      >
        <Image
          source={require("../../assets/images/close.png")}
          style={{
            height: 20,
            width: 20,
          }}
        />
      </TouchableOpacity>
      {/* Close button */}

      {/* Speaker button */}
      <TouchableOpacity
        onPress={speaker}
        style={{
          flex: 1,
          position: "absolute",
          top: Platform.OS === "ios" ? height * 0.1 : 22,
          right: 68,
        }}
      >
        <Image
          source={mute ? require("../../assets/images/mute.png") : require("../../assets/images/volume.png")}
          style={{
            height: 25,
            width: 25,
          }}
        />
      </TouchableOpacity>
      {/* Speaker button */}

      {/* Minimize button */}
      <TouchableOpacity
        onPress={minimize}
        style={{
          flex: 1,
          position: "absolute",
          top: Platform.OS === "ios" ? height * 0.1 : 25,
          left: 25,
        }}
      >
        <Image
          source={require("../../assets/images/minimize.png")}
          style={{
            height: 22,
            width: 22,
          }}
        />
      </TouchableOpacity>
      {/* Minimize button */}

      {params.link != null && params.link != "" && (
        <View
          style={{
            display: "flex",
            position: "absolute",
            width: width,
            justifyContent: "center",
            alignItems: "center",
            bottom: parseInt(params.styling["marginBottom"]!) || 20,
            left: parseInt(params.styling["marginLeft"]!) || 20,
            right: parseInt(params.styling["marginRight"]!) || 20,
          }}
        >
          <Pressable
            style={{
              backgroundColor: params.styling["ctaButtonBackgroundColor"],
              borderRadius: params.styling["cornerRadius"]
            }}
            onPress={() => {
              if (params.link) {
                void Linking.openURL(params.link);
              }
              void trackUserAction(params.id, "CLK");
              void trackEvent("clicked", params.id)
            }}
          >
            <Text style={{
              color: params.styling["ctaButtonTextColor"],
              fontWeight: "600",
              textAlign: 'center',
              textAlignVertical: 'center',
              fontSize: parseInt(params.styling["fontSize"]!) || 14,
              height: 45,
              paddingVertical: 10,
              paddingHorizontal: 25,
            }}>
              {params.button_text}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};