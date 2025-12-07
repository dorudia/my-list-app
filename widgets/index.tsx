import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import {
  registerWidgetTaskHandler,
  requestWidgetUpdate,
} from "react-native-android-widget";
import { ClockWidget } from "./ClockWidget";

// Handler pentru actualizări widget
registerWidgetTaskHandler(async (props: WidgetTaskHandlerProps) => {
  const { widgetName } = props.widgetInfo;

  console.log("⚡ Widget handler:", widgetName);

  // Forțează update-ul widget-ului
  if (widgetName === "ClockWidget") {
    await requestWidgetUpdate({
      widgetName: "ClockWidget",
      renderWidget: () => <ClockWidget />,
      widgetNotFound: () => {
        console.warn("⚠️ ClockWidget not found");
      },
    });
  }
});

// Export pentru a fi găsit de sistem
export { ClockWidget };
