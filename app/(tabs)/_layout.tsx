import { HapticTab } from "@/components/haptic-tab";
import {
  CalendarTabIcon,
  HomeTabIcon,
  ScanTabIcon,
} from "@/components/navigation/tab-bar-icons";
import { Tabs } from "expo-router";
import React from "react";

const NAV_ICON_COLOR = "#A3CE26";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: NAV_ICON_COLOR,
        tabBarInactiveTintColor: NAV_ICON_COLOR,
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
            <CalendarTabIcon color={NAV_ICON_COLOR} filled={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <HomeTabIcon color={NAV_ICON_COLOR} filled={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="qrcode"
        options={{
          title: "QR Code",
          tabBarIcon: ({ focused }) => (
            <ScanTabIcon color={NAV_ICON_COLOR} filled={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
