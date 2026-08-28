import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text } from "react-native";
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from "react-native-keyboard-controller";
import "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

// Temporary workaround to keep text sizing consistent across devices.
// @ts-expect-error React Native does not expose defaultProps in the Text type.
Text.defaultProps = Text.defaultProps ?? {};
// @ts-expect-error React Native does not expose defaultProps in the Text type.
Text.defaultProps.allowFontScaling = false;

export default function RootLayout() {
  const [isSplashReady, setIsSplashReady] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync();

    const splashTimer = setTimeout(() => {
      setIsSplashReady(true);
    }, 1500);

    return () => clearTimeout(splashTimer);
  }, []);

  if (!isSplashReady) {
    return <LandingSplash />;
  }

  return (
    <KeyboardProvider>
      <ThemeProvider value={DefaultTheme}>
        <KeyboardAvoidingView
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
        </KeyboardAvoidingView>
        <StatusBar style="dark" />
      </ThemeProvider>
    </KeyboardProvider>
  );
}

function LandingSplash() {
  return (
    <LinearGradient
      colors={["#FFFFFF", "#F3F9E7"]}
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
});
