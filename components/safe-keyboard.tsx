import { type ComponentType, type ReactNode } from "react";
import {
  KeyboardAvoidingView as FallbackKeyboardAvoidingView,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ErrorBoundary } from "@/components/error-boundary";

type AvoidingProps = {
  behavior?: "height" | "padding" | "position";
  children?: ReactNode;
  keyboardVerticalOffset?: number;
  style?: StyleProp<ViewStyle>;
};

type KeyboardModule = {
  KeyboardAvoidingView: ComponentType<AvoidingProps>;
  KeyboardProvider: ComponentType<{ children: ReactNode }>;
};

function loadKeyboardModule(): KeyboardModule | null {
  try {
    // Static import cannot be caught, and a missing native module crashes launch.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("react-native-keyboard-controller") as KeyboardModule;
  } catch {
    return null;
  }
}

const keyboardModule = loadKeyboardModule();

export function SafeKeyboardProvider({ children }: { children: ReactNode }) {
  const Provider = keyboardModule?.KeyboardProvider;
  if (!Provider) return children;

  return (
    <ErrorBoundary fallback={children}>
      <Provider>{children}</Provider>
    </ErrorBoundary>
  );
}

export function SafeKeyboardAvoidingView(props: AvoidingProps) {
  const NativeAvoidingView = keyboardModule?.KeyboardAvoidingView;
  if (!NativeAvoidingView) {
    return <FallbackKeyboardAvoidingView {...props} />;
  }

  return (
    <ErrorBoundary fallback={<FallbackKeyboardAvoidingView {...props} />}>
      <NativeAvoidingView {...props} />
    </ErrorBoundary>
  );
}
