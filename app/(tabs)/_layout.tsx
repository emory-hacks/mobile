import { HapticTab } from "@/components/haptic-tab";
import {
  CalendarTabIcon,
  HomeTabIcon,
  ScanTabIcon,
} from "@/components/navigation/tab-bar-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAV_ICON_COLOR = "#A3CE26";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: NAV_ICON_COLOR,
        tabBarInactiveTintColor: NAV_ICON_COLOR,
        tabBarIconStyle: {
          transform: [{ translateY: insets.bottom / 2 }],
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ focused }) => (
            <CalendarTabIcon filled={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <HomeTabIcon filled={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="qrcode"
        options={{
          title: "QR Code",
          tabBarIcon: ({ focused }) => (
            <ScanTabIcon filled={focused} />
          ),
        }}
      />
      <Tabs.Screen name="home-page" options={{ href: null }} />
    </Tabs>
  );
}
