import { type ReactNode } from "react";
import {
  KeyboardAvoidingView as FallbackKeyboardAvoidingView,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from "react-native-keyboard-controller";

import { ErrorBoundary } from "@/components/error-boundary";

type AvoidingProps = {
  behavior?: "height" | "padding" | "position";
  children?: ReactNode;
  keyboardVerticalOffset?: number;
  style?: StyleProp<ViewStyle>;
};

export function SafeKeyboardProvider({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary fallback={children}>
      <KeyboardProvider>{children}</KeyboardProvider>
    </ErrorBoundary>
  );
}

export function SafeKeyboardAvoidingView(props: AvoidingProps) {
  return (
    <ErrorBoundary fallback={<FallbackKeyboardAvoidingView {...props} />}>
      <KeyboardAvoidingView {...props} />
    </ErrorBoundary>
  );
}
