import { ErrorBoundary } from "@/components/error-boundary";
import { SafeKeyboardAvoidingView, SafeKeyboardProvider } from "@/components/safe-keyboard";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

try {
  // Static import cannot be caught, and a missing native module crashes launch.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("react-native-reanimated");
} catch {
  // This binary does not include the native module. Keep the app open.
}

void SplashScreen.preventAutoHideAsync().catch(() => {});

try {
  const textWithDefaults = Text as typeof Text & {
    defaultProps?: { allowFontScaling?: boolean };
  };
  textWithDefaults.defaultProps = textWithDefaults.defaultProps ?? {};
  textWithDefaults.defaultProps.allowFontScaling = false;
} catch {
  // React 19 does not allow defaultProps on some devices.
}

export default function RootLayout() {
  const [isSplashReady, setIsSplashReady] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => {});

    const splashTimer = setTimeout(() => {
      setIsSplashReady(true);
    }, 1500);

    return () => clearTimeout(splashTimer);
  }, []);

  if (!isSplashReady) {
    return <LandingSplash />;
  }

  return (
    <ErrorBoundary
      key={resetKey}
      fallback={<RootError onRetry={() => setResetKey((key) => key + 1)} />}
    >
      <SafeKeyboardProvider>
        <ThemeProvider value={DefaultTheme}>
          <SafeKeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={0}
            style={styles.flex}
          >
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="signup" />
              <Stack.Screen name="forgot-password" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal" }}
              />
            </Stack>
          </SafeKeyboardAvoidingView>
          <StatusBar style="dark" />
        </ThemeProvider>
      </SafeKeyboardProvider>
    </ErrorBoundary>
  );
}

function RootError({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={styles.errorButton}
      >
        <Text style={styles.errorButtonText}>Try again</Text>
      </Pressable>
    </View>
  );
}

function LandingSplash() {
  return (
    <LinearGradient
      colors={["#EDF3F7", "#F3F9E7"]}
      style={styles.splashContainer}
    >
      <Image
        source={require("@/assets/images/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  splashContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    aspectRatio: 654 / 200,
    maxWidth: 240,
    width: "60%",
  },
  errorContainer: {
    alignItems: "center",
    backgroundColor: "#EDF3F7",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorTitle: {
    color: "#111",
    fontSize: 20,
    fontWeight: "700",
  },
  errorButton: {
    backgroundColor: "#A3CE26",
    borderRadius: 12,
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
