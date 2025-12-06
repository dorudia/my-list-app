import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

export function ClockWidget() {
  // const now = new Date();

  // // Format oră: HH:MM
  // const hours = now.getHours().toString().padStart(2, "0");
  // const minutes = now.getMinutes().toString().padStart(2, "0");
  // const timeString = `${hours}:${minutes}`;

  // // Format dată: Vineri, 6 Decembrie
  // const days = [
  //   "Duminică",
  //   "Luni",
  //   "Marți",
  //   "Miercuri",
  //   "Joi",
  //   "Vineri",
  //   "Sâmbătă",
  // ];
  // const months = [
  //   "Ianuarie",
  //   "Februarie",
  //   "Martie",
  //   "Aprilie",
  //   "Mai",
  //   "Iunie",
  //   "Iulie",
  //   "August",
  //   "Septembrie",
  //   "Octombrie",
  //   "Noiembrie",
  //   "Decembrie",
  // ];

  // const dayName = days[now.getDay()];
  // const day = now.getDate();
  // const monthName = months[now.getMonth()];
  // const dateString = `${dayName}, ${day} ${monthName}`;

  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#1a1a2e",
        borderRadius: 16,
        padding: 20,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text="Welcome"
        style={{
          fontSize: 56,
          color: "#ffffff",
          fontWeight: "bold",
        }}
      />
    </FlexWidget>
  );
}
