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
            <Text style={styles.author}>
              {notice.publisherName} | {notice.publisher}
            </Text>
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
          <View
            key={`${followingNotice.createdAt}-${followingNotice.publisher}-${followingNotice.title}`}
            style={styles.followingNotice}
          >
            <Text style={styles.nextTitle}>{followingNotice.title}</Text>
            <View style={styles.nextMetadata}>
              <Text style={styles.nextMetadataText}>
                {followingNotice.publisherName}
              </Text>
              <View style={styles.metadataDivider} />
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
    fontSize: 10,
  },
  authorDetails: {
    alignItems: "flex-start",
    gap: 4,
  },
  authorRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#A3CE26",
    borderRadius: 20,
    height: 40,
    justifyContent: "flex-end",
    overflow: "hidden",
    width: 40,
  },
  avatarBody: {
    backgroundColor: "#82BF78",
    borderRadius: 20,
    height: 21,
    marginBottom: -2,
    width: 35,
  },
  avatarHead: {
    backgroundColor: "#82BF78",
    borderRadius: 8,
    height: 16,
    marginBottom: -1,
    width: 16,
  },
  body: {
    gap: 16,
    marginTop: 24,
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
    flexShrink: 0,
    fontSize: 10,
  },
  divider: {
    backgroundColor: "#D8D8D8",
    height: StyleSheet.hairlineWidth,
    marginVertical: 18,
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
    paddingHorizontal: 4,
    paddingVertical: 14,
  },
  headingRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 10,
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
    fontSize: 11,
    lineHeight: 15,
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
    fontSize: 9,
  },
  nextTitle: {
    color: "#111111",
    fontFamily: "AlanSans_700Bold",
    fontSize: 16,
    lineHeight: 20,
  },
  paragraph: {
    color: "#111111",
    fontFamily: "AlanSans_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  scroll: {
    flex: 1,
  },
  title: {
    color: "#111111",
    flex: 1,
    fontFamily: "AlanSans_700Bold",
    fontSize: 20,
    lineHeight: 25,
  },
  topDivider: {
    marginTop: 12,
  },
});
