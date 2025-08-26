"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.togglePipVisibility = exports.subscribeToPipVisibility = exports.PipEvents = void 0;
var _events = require("events");
const pipEventEmitter = new _events.EventEmitter();
const PipEvents = exports.PipEvents = {
  TOGGLE_PIP: 'TOGGLE_PIP'
};
const togglePipVisibility = isVisible => {
  pipEventEmitter.emit(PipEvents.TOGGLE_PIP, isVisible);
};
exports.togglePipVisibility = togglePipVisibility;
const subscribeToPipVisibility = callback => {
  pipEventEmitter.on(PipEvents.TOGGLE_PIP, callback);
  return () => {
    pipEventEmitter.off(PipEvents.TOGGLE_PIP, callback);
  };
};
exports.subscribeToPipVisibility = subscribeToPipVisibility;
//# sourceMappingURL=pipState.js.map