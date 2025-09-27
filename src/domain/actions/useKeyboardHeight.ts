import {useEffect, useState} from "react";
import {Keyboard, KeyboardEvent, Platform} from "react-native";

export default function useKeyboardHeight(onKeyboardShow?: () => void) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    function keyboardWillShow(event: KeyboardEvent) {
      setKeyboardHeight(event.endCoordinates.height);
      setTimeout(() => onKeyboardShow, 100);
    }

    function keyboardWillHide() {
      setKeyboardHeight(0);
    }

    const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(keyboardShowEvent, keyboardWillShow);
    const hideSubscription = Keyboard.addListener(keyboardHideEvent, keyboardWillHide);

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, []);

  return keyboardHeight;
}
