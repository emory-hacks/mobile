import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { LinkedText } from "@/components/linked-text";
import type { Announcement } from "@/types/announcement";

type NoticeListItemProps = {
  isExpanded?: boolean;
  isUnread?: boolean;
  nextNotice?: Announcement;
  notice: Announcement;
  onEdit?: (notice: Announcement) => void;
  onPress?: () => void;
  previousNotice?: Announcement;
};

export function NoticeListItem({
  isExpanded = false,
  isUnread = false,
  nextNotice,
  notice,
  onEdit,
  onPress,
  previousNotice,
}: NoticeListItemProps) {
  const expand = useSharedValue(isExpanded ? 1 : 0);

  useEffect(() => {
    expand.value = withTiming(isExpanded ? 1 : 0, {
      duration: 150,
      easing: Easing.out(Easing.cubic),
    });
  }, [expand, isExpanded]);

  const contentStyle = useAnimatedStyle(() => ({
    paddingBottom: interpolate(expand.value, [0, 1], [14, 20]),
    paddingTop: interpolate(expand.value, [0, 1], [14, 16]),
  }));
  const bodyStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(expand.value, [0, 1], [14, 16]),
    lineHeight: interpolate(expand.value, [0, 1], [20, 23]),
    marginTop: interpolate(expand.value, [0, 1], [0, 8]),
  }));
  const titleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(expand.value, [0, 1], [18, 24]),
    lineHeight: interpolate(expand.value, [0, 1], [24, 32]),
  }));
  const metadataStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(expand.value, [0, 1], [10, 12]),
    marginBottom: interpolate(expand.value, [0, 1], [5, 8]),
    marginTop: interpolate(expand.value, [0, 1], [4, 6]),
  }));

  const date = new Date(notice.createdAt);
  const dateKey = date.toDateString();
  const previousDateKey = previousNotice
    ? new Date(previousNotice.createdAt).toDateString()
    : null;
  const nextDateKey = nextNotice
    ? new Date(nextNotice.createdAt).toDateString()
    : null;

  return (
    <Pressable
      accessibilityLabel={`${isUnread ? "Unread announcement" : "Announcement"}: ${notice.title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.noticeItem,
        nextDateKey !== null &&
          dateKey !== nextDateKey &&
          styles.noticeItemBeforeDateDivider,
      ]}
    >
      {dateKey !== previousDateKey && (
        <View style={styles.dateDivider}>
          <Text style={styles.dateDividerText}>
            {date.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
          <View style={styles.dateDividerLine} />
        </View>
      )}

      <Animated.View style={contentStyle}>
        <View style={styles.headingRow}>
          {isUnread ? (
            <View accessibilityLabel="Unread" style={styles.unreadDot} />
          ) : null}
          <Animated.Text style={[styles.title, titleStyle]}>
            {notice.title}
          </Animated.Text>
          {onEdit && (
            <Pressable
              accessibilityLabel={`Edit ${notice.title}`}
              accessibilityRole="button"
              hitSlop={10}
              onPress={(event) => {
                event.stopPropagation();
                onEdit(notice);
              }}
              style={({ pressed }) => [
                styles.editButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
          )}
        </View>

        <Animated.Text style={[styles.metadata, metadataStyle]}>
          {date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {" · "}
          {date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            hour12: true,
            minute: "2-digit",
          })}
        </Animated.Text>

        <LinkedText
          ellipsizeMode="tail"
          numberOfLines={isExpanded ? undefined : 2}
          style={[styles.body, bodyStyle]}
        >
          {notice.content}
        </LinkedText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    color: "#111111",
    fontFamily: "AlanSans_400Regular",
    fontSize: 14,
    includeFontPadding: false,
    lineHeight: 20,
    width: "100%",
  },
  dateDivider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingBottom: 4,
  },
  dateDividerLine: {
    backgroundColor: "#111111",
    flex: 1,
    height: 1.35,
  },
  dateDividerText: {
    color: "#668713",
    fontFamily: "AlanSans_500Medium",
    fontSize: 12,
  },
  editButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  editButtonText: {
    color: "#7DA515",
    fontFamily: "AlanSans_500Medium",
    fontSize: 16,
  },
  headingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  metadata: {
    color: "#AFAFAF",
    fontFamily: "AlanSans_400Regular",
    fontSize: 10,
    marginBottom: 5,
    marginTop: 4,
  },
  noticeItem: {
    borderBottomColor: "#DADADA",
    borderBottomWidth: 1,
    paddingHorizontal: 4,
  },
  noticeItemBeforeDateDivider: {
    borderBottomWidth: 0,
  },
  title: {
    color: "#111111",
    flex: 1,
    fontFamily: "AlanSans_600SemiBold",
    fontSize: 18,
    lineHeight: 24,
  },
  unreadDot: {
    backgroundColor: "#E53935",
    borderRadius: 5,
    height: 10,
    width: 10,
  },
});
