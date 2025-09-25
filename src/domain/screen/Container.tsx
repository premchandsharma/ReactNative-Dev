import {ScreenProviderProps} from "./types";
import {useEffect, useState} from "react";
import ScreenProvider from "./ScreenProvider";
import Overlay from "./Overlay";
import {onScreenTracked} from "../actions/track-screen";

export default function Container({name: screen, options, children}: Partial<ScreenProviderProps>) {
  const [name, setName] = useState<string | null>(screen || null);

  useEffect(() => {
    if (screen) {
      return
    }
    return onScreenTracked(setName);
  }, [screen]);

  const screenName = name || 'Unknown';
  return (
    <ScreenProvider name={screenName} options={options}>
      {children}
      <Overlay name={screenName}/>
    </ScreenProvider>
  );
}
