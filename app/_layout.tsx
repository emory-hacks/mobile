import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';
const CustomTheme = { 
  ...DefaultTheme, 
  colors: { 
    ...DefaultTheme.colors, 
    background: '#a9ea97', 
  }, 
}; 
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
    }, 2500);

    return () => clearTimeout(splashTimer);
  }, []);

  if (!isSplashReady) {
    return <LandingSplash />;
  }

  return (
    <ThemeProvider value={CustomTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

function LandingSplash() {
  return (
    <View style={styles.splashContainer}>
      <View style={styles.logoPlaceholder}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    alignItems: 'center',
    backgroundColor: '#9be287',
    flex: 1,
    justifyContent: 'center',
  },
  logoPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#9be287',
    borderRadius: 24,
    height: 128,
    justifyContent: 'center',
    width: 128,
  },
  logo: {
    height: 84,
    width: 84,
  },
});
