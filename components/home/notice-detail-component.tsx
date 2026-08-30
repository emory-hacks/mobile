import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { Announcement } from "@/types/announcement";

type NoticeDetailComponentProps = {
  followingNotices: Announcement[];
  notice: Announcement;
  onClose: () => void;
};

function formatCreatedAt(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");

  return `${year}.${month}.${day} ${hour}:${minute}`;
}

export function NoticeDetailComponent({
  followingNotices,
  notice,
  onClose,
}: NoticeDetailComponentProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <Pressable onPress={onClose} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to announcements</Text>
        </Pressable>
        <View style={[styles.divider, styles.topDivider]} />

        <View style={styles.featuredNotice}>
          <Text style={styles.title}>{notice.title}</Text>
          <Text style={styles.date}>{formatCreatedAt(notice.createdAt)}</Text>

          <View style={styles.body}>
            {notice.content
              .split(/\n+/)
              .filter(Boolean)
              .map((paragraph) => (
                <Text key={paragraph} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}
          </View>
        </View>

        <View style={[styles.divider, styles.featuredSeparator]} />

        {followingNotices.map((followingNotice) => (
          <View
            key={`${followingNotice.createdAt}-${followingNotice.publisher}-${followingNotice.title}`}
            style={styles.followingNotice}
          >
            <Text style={styles.nextTitle}>{followingNotice.title}</Text>
            <View style={styles.nextMetadata}>
              <Text style={styles.nextMetadataText}>
                {formatCreatedAt(followingNotice.createdAt)}
              </Text>
            </View>
            <Text
              ellipsizeMode="tail"
              numberOfLines={5}
              style={styles.nextBody}
            >
              {followingNotice.content.replace(/\s+/g, " ").trim()}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Fade by viewport position without measuring individual notice rows. */}
      <LinearGradient
        colors={[
          "rgba(255, 255, 255, 0)",
          "rgba(255, 255, 255, 0.72)",
          "rgba(255, 255, 255, 0.98)",
        ]}
        locations={[0, 0.55, 1]}
        pointerEvents="none"
        style={styles.fade}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  backButtonText: {
    color: "#7DA515",
    fontFamily: "AlanSans_500Medium",
    fontSize: 12,
  },
  body: {
    gap: 20,
  },
  container: {
    flex: 1,
    position: "relative",
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: 34,
  },
  date: {
    color: "#A9A9A9",
    fontFamily: "AlanSans_400Regular",
    fontSize: 11,
    marginTop: 6,
  },
  divider: {
    backgroundColor: "#D8D8D8",
    height: StyleSheet.hairlineWidth,
    marginVertical: 18,
    width: "100%",
  },
  featuredNotice: {
    backgroundColor: "#F4F8E8",
    marginHorizontal: -34,
    paddingHorizontal: 34,
    paddingVertical: 20,
  },
  featuredSeparator: {
    marginVertical: 0,
  },
  fade: {
    bottom: 0,
    height: 120,
    left: 0,
    position: "absolute",
    right: 0,
  },
  followingNotice: {
    borderBottomColor: "#DADADA",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
    paddingVertical: 14,
  },
  nextBody: {
    color: "#111111",
    fontFamily: "AlanSans_400Regular",
    fontSize: 14,
    includeFontPadding: false,
    lineHeight: 20,
    width: "100%",
  },
  nextMetadata: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
    marginTop: 5,
  },
  nextMetadataText: {
    color: "#AFAFAF",
    fontFamily: "AlanSans_400Regular",
    fontSize: 10,
  },
  nextTitle: {
    color: "#111111",
    fontFamily: "AlanSans_600SemiBold",
    fontSize: 18,
    lineHeight: 24,
  },
  paragraph: {
    color: "#111111",
    fontFamily: "AlanSans_400Regular",
    fontSize: 16,
    lineHeight: 23,
  },
  scroll: {
    flex: 1,
  },
  title: {
    color: "#111111",
    flex: 1,
    fontFamily: "AlanSans_700Bold",
    fontSize: 24,
    lineHeight: 32,
  },
  topDivider: {
    marginBottom: 0,
    marginTop: 12,
  },
});
