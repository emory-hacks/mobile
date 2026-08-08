import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";

import type { Announcement } from "@/types/announcement";

type NoticeBarProps = {
  notice: Announcement;
  onPress: () => void;
};

export function NoticeBar({ notice, onPress }: NoticeBarProps) {
  const pressProgress = useRef(new Animated.Value(0)).current;
  const backgroundColor = pressProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FF6048", "#C93D2A"],
  });

  const animatePress = (toValue: number, duration: number) => {
    Animated.timing(pressProgress, {
      duration,
      toValue,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Pressable
      accessibilityHint="Opens or closes the featured notice"
      accessibilityLabel={`Featured notice: ${notice.title}`}
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={() => animatePress(1, 150)}
      onPressOut={() => animatePress(0, 220)}
      style={styles.container}
    >
      <Animated.View style={[styles.alertBadge, { backgroundColor }]}>
        <Text style={styles.alertMark}>!</Text>
      </Animated.View>
      <Animated.View style={[styles.content, { backgroundColor }]}>
        <Text style={styles.title}>{notice.title}</Text>
        <Text numberOfLines={1} style={styles.preview}>
          {notice.content}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  alertBadge: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRadius: 10,
    justifyContent: "center",
    width: 46,
  },
  alertMark: {
    color: "#FFFFFF",
    fontFamily: "AlanSans_700Bold",
    fontSize: 22,
  },
  container: {
    flexDirection: "row",
    gap: 6,
    height: 46,
  },
  content: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
  },
  preview: {
    color: "#FFFFFF",
    flex: 1,
    fontFamily: "AlanSans_400Regular",
    fontSize: 13,
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "AlanSans_700Bold",
    fontSize: 17,
  },
});
