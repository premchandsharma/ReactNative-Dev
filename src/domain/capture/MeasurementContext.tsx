import {createContext} from 'react';
import {MeasurementContextType} from "./types";

// This context will provide a way for components to register themselves
// and for our screen to trigger the measurement of all registered components.
const MeasurementContext = createContext<MeasurementContextType>({
  register: (_: string, __: any) => {
  },
  unregister: (_: string) => {
  },
  measureAll: async () => {
    return [];
  },
});

export default MeasurementContext;
