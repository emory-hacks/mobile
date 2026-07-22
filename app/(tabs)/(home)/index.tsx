import {
  AlanSans_400Regular,
  AlanSans_500Medium,
  AlanSans_700Bold,
} from "@expo-google-fonts/alan-sans"; // fonts
import { Grandstander_900Black } from "@expo-google-fonts/grandstander";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NoticeBar } from "@/components/home/notice-bar";
import { NoticeDetailComponent } from "@/components/home/notice-detail-component";
import { ProfileComponent } from "@/components/home/profile-component";
import { TEST_NOTICES } from "@/constants/test-notices";
import { getEmail, getJwt, saveRole } from "@/utils/auth-token";

const FEATURED_NOTICE = TEST_NOTICES[0];
const FOLLOWING_NOTICES = TEST_NOTICES.slice(1);
const computer_ip_address = "192.168.1.126";

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(false);
  const [fontsLoaded] = useFonts({
    AlanSans_400Regular,
    AlanSans_500Medium,
    AlanSans_700Bold,
    Grandstander_900Black,
  });

  useEffect(() => {
    (async () => {
      const jwt = await getJwt();
      const email = await getEmail();

      if (!jwt || !email) return;

      const response = await fetch(
        `http://${computer_ip_address}:8080/api/users/${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        },
      );
      if (!response.ok) return;

      const userData = await response.json();
      await saveRole(String(userData.role ?? ""));
      console.log("role:", userData.role);
    })();
  }, []);

  if (!fontsLoaded) {
    return <View style={styles.screen} />;
  }

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <ProfileComponent
          name="Taeeun K."
          onSettingsPress={() => router.push("/settings")}
          teamName="Team Name"
        />
      </View>

      <View style={styles.noticeSection}>
        <View
          style={[
            styles.featuredNotice,
            isNoticeExpanded && styles.expandedFeaturedNotice,
          ]}
        >
          <NoticeBar
            notice={FEATURED_NOTICE}
            onPress={() => setIsNoticeExpanded((isExpanded) => !isExpanded)}
          />
        </View>

        {isNoticeExpanded ? (
          <NoticeDetailComponent
            followingNotices={FOLLOWING_NOTICES}
            notice={FEATURED_NOTICE}
          />
        ) : (
          <View style={styles.noticeListViewport}>
            <ScrollView
              contentContainerStyle={styles.noticeList}
              showsVerticalScrollIndicator={false}
              style={styles.noticeScroll}
            >
              {TEST_NOTICES.map((notice) => (
                <View key={notice.id} style={styles.noticeItem}>
                  <Text style={styles.noticeTitle}>{notice.title}</Text>
                  <View style={styles.metadata}>
                    <Text style={styles.metadataText}>{notice.author}</Text>
                    <View style={styles.metadataDivider} />
                    <Text style={styles.metadataText}>{notice.time}</Text>
                  </View>
                  <Text numberOfLines={3} style={styles.noticeBody}>
                    {notice.preview}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/*
              Keep the fade fixed to the viewport while notices scroll behind it.
              This makes every notice fade based on its visible position rather
              than hard-coding opacity for a specific list item.
            */}
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0)",
                "rgba(255, 255, 255, 0.72)",
                "rgba(255, 255, 255, 0.98)",
              ]}
              locations={[0, 0.55, 1]}
              pointerEvents="none"
              style={styles.noticeFade}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  expandedFeaturedNotice: {
    marginBottom: 0,
  },
  featuredNotice: {
    height: 46,
    marginBottom: 28,
    marginHorizontal: 32,
  },
  metadata: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
    marginTop: 5,
  },
  metadataDivider: {
    backgroundColor: "#C3C3C3",
    height: 12,
    width: 1,
  },
  metadataText: {
    color: "#AFAFAF",
    fontFamily: "AlanSans_400Regular",
    fontSize: 10,
  },
  noticeBody: {
    color: "#111111",
    fontFamily: "AlanSans_400Regular",
    fontSize: 13,
    lineHeight: 17,
  },
  noticeFade: {
    bottom: 0,
    height: 120,
    left: 0,
    position: "absolute",
    right: 0,
  },
  noticeItem: {
    borderBottomColor: "#DADADA",
    borderBottomWidth: 1,
    minHeight: 126,
    paddingHorizontal: 4,
    paddingVertical: 18,
  },
  noticeList: {
    // Lets the final notice scroll completely above the fixed fade overlay.
    paddingBottom: 120,
    width: "100%",
  },
  noticeListViewport: {
    flex: 1,
    marginHorizontal: 32,
    position: "relative",
  },
  noticeScroll: {
    flex: 1,
  },
  noticeSection: {
    flex: 1,
    paddingTop: 34,
  },
  noticeTitle: {
    color: "#111111",
    fontFamily: "AlanSans_700Bold",
    fontSize: 19,
    lineHeight: 23,
  },
  screen: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
});
