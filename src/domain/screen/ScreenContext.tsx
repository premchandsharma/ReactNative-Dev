import {createContext} from 'react';
import {ScreenContextValue} from "./types";

// This context will provide a way for components to register themselves
// and for our screen to trigger the measurement of all registered components.
const ScreenContext = createContext<ScreenContextValue | undefined>(undefined);

export default ScreenContext;
