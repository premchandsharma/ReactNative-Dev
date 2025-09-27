import {StyleSheet} from 'react-native';
import TooltipConsumer from "../../components/tooltip/consumer";
import Modal from '../../components/Modal';
import Banner from '../../components/Banner';
import Floater from '../../components/Floater';
import Csat from '../../components/Csat';
import BottomSheet from '../../components/BottomSheet';
import Survey from '../../components/Survey';
import CaptureScreenButton from '../../components/CaptureScreenButton';
import Pip from "../../components/pip";
import {SafeAreaView} from "react-native-safe-area-context";
import {ScreenProviderProps} from "./types";
import {useCaptureServiceStore} from "../capture/store";

export default function Overlay({name}: { name: ScreenProviderProps['name'] }) {
  const isCapturing = useCaptureServiceStore(state => state.isCapturing)[name];

  if (isCapturing) {
    return null;
  }

  return (
    <SafeAreaView
      style={StyleSheet.absoluteFill}
      pointerEvents="box-none"
      edges={['top', 'left', 'right', 'bottom']}
    >
      <Banner/>
      <Floater/>
      <Pip/>
      <Csat/>
      <TooltipConsumer/>
      <Survey/>
      <BottomSheet/>
      <Modal/>
      <CaptureScreenButton/>
    </SafeAreaView>
  );
}
