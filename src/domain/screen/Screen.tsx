import {ScreenProviderProps} from "./types";
import {useEffect} from "react";
import ScreenProvider from "./ScreenProvider";
import Overlay from "./Overlay";
import AppStorys from "../sdk";

export default function Screen({name, options, children}: ScreenProviderProps) {
  useEffect(() => {
    // @ts-ignore
    void AppStorys.trackScreen(name, false);
  }, [name]);

  return (
    <ScreenProvider name={name} options={options}>
      {children}
      <Overlay name={name}/>
    </ScreenProvider>
  );
}
