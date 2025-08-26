import { EventEmitter } from 'events';

const pipEventEmitter = new EventEmitter();

export const PipEvents = {
  TOGGLE_PIP: 'TOGGLE_PIP'
};

export const togglePipVisibility = (isVisible: boolean) => {
  pipEventEmitter.emit(PipEvents.TOGGLE_PIP, isVisible);
};

export const subscribeToPipVisibility = (callback: (isVisible: boolean) => void) => {
  pipEventEmitter.on(PipEvents.TOGGLE_PIP, callback);
  return () => {
    pipEventEmitter.off(PipEvents.TOGGLE_PIP, callback);
  };
};