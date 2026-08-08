import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import type { Announcement } from "@/types/announcement";

type NoticeDetailComponentProps = {
  followingNotices: Announcement[];
  notice: Announcement;
};

function formatCreatedAt(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function NoticeDetailComponent({
  followingNotices,
  notice,
}: NoticeDetailComponentProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <View style={[styles.divider, styles.topDivider]} />

        <View style={styles.headingRow}>
          <Text style={styles.title}>{notice.title}</Text>
          <Text style={styles.date}>
            {formatCreatedAt(notice.createdAt)}
          </Text>
        </View>

        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <View style={styles.avatarHead} />
            <View style={styles.avatarBody} />
          </View>
          <View style={styles.authorDetails}>
            <Text style={styles.author}>{notice.publisher}</Text>
            <View style={styles.teamPill}>
              <Text style={styles.teamText}>Announcements</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {notice.content.split(/\n+/).filter(Boolean).map((paragraph) => (
            <Text key={paragraph} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>

        <View style={styles.divider} />

        {followingNotices.map((followingNotice) => (
          <View key={followingNotice.id} style={styles.followingNotice}>
            <Text style={styles.nextTitle}>{followingNotice.title}</Text>
            <View style={styles.nextMetadata}>
              <Text style={styles.nextMetadataText}>
                {followingNotice.publisher}
              </Text>
              <View style={styles.metadataDivider} />
              <Text style={styles.nextMetadataText}>
                {formatCreatedAt(followingNotice.createdAt)}
              </Text>
            </View>
            <Text numberOfLines={3} style={styles.nextBody}>
              {followingNotice.content}
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
  author: {
    color: "#A9A9A9",
    fontFamily: "AlanSans_400Regular",
    fontSize: 12,
  },
  authorDetails: {
    alignItems: "flex-start",
    gap: 4,
  },
  authorRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#A3CE26",
    borderRadius: 23,
    height: 46,
    justifyContent: "flex-end",
    overflow: "hidden",
    width: 46,
  },
  avatarBody: {
    backgroundColor: "#82BF78",
    borderRadius: 20,
    height: 24,
    marginBottom: -2,
    width: 40,
  },
  avatarHead: {
    backgroundColor: "#82BF78",
    borderRadius: 9,
    height: 18,
    marginBottom: -1,
    width: 18,
  },
  body: {
    gap: 24,
    marginTop: 42,
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
    fontSize: 12,
  },
  divider: {
    backgroundColor: "#D8D8D8",
    height: StyleSheet.hairlineWidth,
    marginVertical: 24,
    width: "100%",
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
    minHeight: 132,
    paddingHorizontal: 4,
    paddingVertical: 18,
  },
  headingRow: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metadataDivider: {
    backgroundColor: "#C3C3C3",
    height: 12,
    width: 1,
  },
  nextBody: {
    color: "#111111",
    fontFamily: "AlanSans_400Regular",
    fontSize: 13,
    lineHeight: 17,
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
    fontFamily: "AlanSans_700Bold",
    fontSize: 19,
    lineHeight: 23,
  },
  paragraph: {
    color: "#111111",
    fontFamily: "AlanSans_400Regular",
    fontSize: 15,
    lineHeight: 21,
  },
  scroll: {
    flex: 1,
  },
  teamPill: {
    backgroundColor: "#A3CE26",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  teamText: {
    color: "#FFFFFF",
    fontFamily: "AlanSans_500Medium",
    fontSize: 11,
  },
  title: {
    color: "#111111",
    fontFamily: "AlanSans_700Bold",
    fontSize: 26,
    lineHeight: 31,
  },
  topDivider: {
    marginTop: 16,
  },
});
