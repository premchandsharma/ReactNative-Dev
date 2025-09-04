import React, {useContext, useEffect, useState} from "react";
import MeasurementContext from "../../domain/capture/MeasurementContext";
import TooltipManager from "../../domain/tooltips/TooltipManager";

export default function TooltipConsumer() {
  const [content, setContent] = useState<React.ReactElement | null>(null);
  const measurementContext = useContext(MeasurementContext);

  useEffect(() => {
    // Initialize tooltip handlers when component mounts
    TooltipManager.getInstance().setTooltipHandlers(
      (component) => setContent(component),
      () => setContent(null)
    );

    // Set measurement function from your existing capture system
    TooltipManager.getInstance().setMeasurementFunction(measurementContext.measureAll);
  }, [measurementContext]);

  return content;
}
