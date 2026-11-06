import { PlatformPressable } from "expo-router/react-navigation";
import * as Haptics from "expo-haptics";
import type { ComponentProps } from "react";
import type { GestureResponderEvent } from "react-native";

type HapticTabProps = {
  onPressIn?: (event: GestureResponderEvent) => void;
} & Record<string, unknown>;

export function HapticTab(props: HapticTabProps) {
  return (
    <PlatformPressable
      {...(props as unknown as ComponentProps<typeof PlatformPressable>)}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === "ios") {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
