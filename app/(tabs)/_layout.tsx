import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { hasValidToken } from "@/utils/login-cookie";
import { Tabs } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

import Login from "../login";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const refreshAuth = useCallback(async () => {
    setIsLoggedIn(await hasValidToken());
  }, []);

  useEffect(() => {
    refreshAuth();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refreshAuth();
      }
    });

    return () => subscription.remove();
  }, [refreshAuth]);

  if (!isLoggedIn) {
    return <Login onLoginSuccess={refreshAuth} />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="qrcode"
        options={{
          title: "QR Code",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="qrcode" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
