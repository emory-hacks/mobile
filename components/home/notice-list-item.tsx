import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Announcement } from "@/types/announcement";

type NoticeListItemProps = {
  nextNotice?: Announcement;
  notice: Announcement;
  onEdit?: (notice: Announcement) => void;
  previousNotice?: Announcement;
};

export function NoticeListItem({
  nextNotice,
  notice,
  onEdit,
  previousNotice,
}: NoticeListItemProps) {
  const date = new Date(notice.createdAt);
  const dateKey = date.toDateString();
  const previousDateKey = previousNotice
    ? new Date(previousNotice.createdAt).toDateString()
    : null;
  const nextDateKey = nextNotice
    ? new Date(nextNotice.createdAt).toDateString()
    : null;

  return (
    <View
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

      <View style={styles.headingRow}>
        <Text style={styles.title}>{notice.title}</Text>
        {onEdit && (
          <Pressable
            accessibilityLabel={`Edit ${notice.title}`}
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => onEdit(notice)}
            style={({ pressed }) => [
              styles.editButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.metadata}>
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
      </Text>

      <Text ellipsizeMode="tail" numberOfLines={7} style={styles.body}>
        {notice.content}
      </Text>
    </View>
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
    backgroundColor: "#DADADA",
    flex: 1,
    height: 1,
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
    paddingVertical: 14,
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
});
