import React, {useContext, useEffect, useState} from "react";
import MeasurementContext from "../../domain/capture/MeasurementContext";
import TooltipManager from "../../domain/tooltips/TooltipManager";
import {subscribeToLayoutChange} from "../../domain/capture/layoutChangeEvent";

interface TooltipConsumerState {
  content: React.ReactElement | null;
  id: string | null;
}

export default function TooltipConsumer() {
  const [state, setState] = useState<TooltipConsumerState>({
    content: null,
    id: null
  });
  const measurementContext = useContext(MeasurementContext);

  useEffect(() => {
    TooltipManager.getInstance().setTooltipHandlers(
      (id, content) => setState({content, id}),
      () => setState({content: null, id: null})
    );

    TooltipManager.getInstance().setMeasurementFunction(measurementContext.measure);
  }, [measurementContext]);

  useEffect(() => {
    if (!state.id) {
      return;
    }
    return subscribeToLayoutChange(state.id, () => TooltipManager.getInstance().reshowCurrentTooltip(state.id!));
  }, [state.id]);

  return state.content;
}
