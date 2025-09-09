import EventEmitter from "events";

const layoutChangeEventEmitter = new EventEmitter();

export function layoutChangeEvent(id: string) {
  layoutChangeEventEmitter.emit(`layout_changed_${id}`, id);
}

export function subscribeToLayoutChange(id: string, callback: () => void) {
  layoutChangeEventEmitter.on(`layout_changed_${id}`, callback);
  return () => {
    layoutChangeEventEmitter.off(`layout_changed_${id}`, callback);
  };
};
