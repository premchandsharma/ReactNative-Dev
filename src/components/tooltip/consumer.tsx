import React, {useEffect, useState} from "react";
import TooltipManager from "../../domain/tooltips/TooltipManager";
import {subscribeToLayoutChange} from "../../domain/capture/layoutChangeEvent";
import useScreen from "../../domain/screen/useScreen";

interface TooltipConsumerState {
  content: React.ReactElement | null;
  id: string | null;
}

export default function TooltipConsumer() {
  const {name, context: {measure}} = useScreen();

  const [state, setState] = useState<TooltipConsumerState>({
    content: null,
    id: null
  });

  useEffect(() => {
    TooltipManager.getInstance(name).setTooltipHandlers(
      (id, content) => setState({content, id}),
      () => setState({content: null, id: null})
    );

    TooltipManager.getInstance(name).setMeasurementFunction(measure);
  }, [name, measure]);

  useEffect(() => {
    if (!state.id) {
      return;
    }
    return subscribeToLayoutChange(state.id, () => TooltipManager.getInstance(name).reshowCurrentTooltip());
  }, [name, state.id]);

  return state.content;
}
