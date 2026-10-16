import { HapticTab } from "@/components/haptic-tab";
import {
  CalendarTabIcon,
  HomeTabIcon,
  ScanTabIcon,
} from "@/components/navigation/tab-bar-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAV_ICON_COLOR = "#000000";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: NAV_ICON_COLOR,
          tabBarInactiveTintColor: NAV_ICON_COLOR,
          tabBarIconStyle: {
            transform: [{ translateY: insets.bottom / 2 }],
          },
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#EDF3F7",
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerShown: false,
          tabBarHideOnKeyboard: true,
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
          name="(home)"
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
      </Tabs>
      <View pointerEvents="none" style={styles.corners}>
        <Image
          source={require("@/assets/images/bottom_left.png")}
          style={styles.bottomLeft}
        />
        <Image
          source={require("@/assets/images/bottom_right.png")}
          style={styles.bottomRight}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  corners: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  bottomLeft: {
    position: "absolute",
    width: 210,
    height: 172,
    left: -78,
    bottom: -46,
  },
  bottomRight: {
    position: "absolute",
    width: 168,
    height: 200,
    right: -62,
    bottom: -64,
  },
});
