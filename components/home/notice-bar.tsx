import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Notice } from "@/constants/test-notices";

type NoticeBarProps = {
  notice: Notice;
  onPress: () => void;
};

export function NoticeBar({ notice, onPress }: NoticeBarProps) {
  return (
    <Pressable
      accessibilityHint="Opens or closes the featured notice"
      accessibilityLabel={`Featured notice: ${notice.title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.alertBadge}>
        <Text style={styles.alertMark}>!</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{notice.title}</Text>
        <Text numberOfLines={1} style={styles.preview}>
          {notice.preview}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  alertBadge: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#FF6048",
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
    backgroundColor: "#FF6048",
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
