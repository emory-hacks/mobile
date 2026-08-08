import {
  AlanSans_400Regular,
  AlanSans_500Medium,
  AlanSans_700Bold,
} from "@expo-google-fonts/alan-sans"; // fonts
import { Grandstander_900Black } from "@expo-google-fonts/grandstander";
import { useFocusEffect } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { fetch } from "expo/fetch";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NoticeBar } from "@/components/home/notice-bar";
import { NoticeDetailComponent } from "@/components/home/notice-detail-component";
import { ProfileComponent } from "@/components/home/profile-component";
import { API_BASE_URL } from "@/constants/computer-ip";
import { getAnnouncements } from "@/services/announcements";
import type { Announcement } from "@/types/announcement";
import { getEmail, getJwt, saveRole } from "@/utils/auth-token";
import { saveInfo } from "@/utils/user-info";

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
  const [name, setName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [announcementError, setAnnouncementError] = useState<string | null>(
    null,
  );

  const featuredAnnouncement = announcements[0];
  const followingAnnouncements = announcements.slice(1);

  useFocusEffect(
    //this will mount every time the tab is focused on. change back to useEffect
    //for production and make it remount after ever log in! Maybe when jwt changes?
    useCallback(() => {
      let active = true;

      (async () => {
        const jwt = await getJwt();
        const email = await getEmail();

        if (!jwt || !email || !active) return;

        // Use expo/fetch + credentials: "omit" so a manual Cookie header is sent.
        // RN's built-in fetch treats Cookie as managed and often strips it (403).
        const response = await fetch(
          `${API_BASE_URL}/api/users/${email}`,
          {
            method: "GET",
            credentials: "omit",
            headers: {
              "Content-Type": "application/json",
              Cookie: `token=${jwt}`,
            },
          },
        );

        if (!response.ok) {
          console.log(response.status, await response.text());
          return;
        }

        const userData = await response.json();
        if (!active) return;

        await saveRole(userData.role);
        await saveInfo("name", userData.name ?? "");
        await saveInfo("id", String(userData.id ?? ""));
        await saveInfo("teamName", userData.teamName ?? "");
        await saveInfo(
          "points",
          String(userData.points ?? userData.totalPoints ?? 0),
        );
        await saveInfo("checkedIn", String(!!userData.checkedIn));
        console.log(String(!!userData.checkedIn));
        setName(userData.name);
        setTeamName(userData.teamName);
      })();

      return () => {
        active = false;
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadAnnouncements = async () => {
        setIsLoadingAnnouncements(true);
        setAnnouncementError(null);

        try {
          const data = await getAnnouncements();

          if (!active) return;

          // The newest announcement is featured at the top of the home page.
          const newestFirst = [...data].sort(
            (left, right) =>
              new Date(right.createdAt).getTime() -
              new Date(left.createdAt).getTime(),
          );
          setAnnouncements(newestFirst);
        } catch (error) {
          if (!active) return;

          setAnnouncementError(
            error instanceof Error
              ? error.message
              : "Unable to load announcements.",
          );
        } finally {
          if (active) setIsLoadingAnnouncements(false);
        }
      };

      loadAnnouncements();

      // Ignore a late network response after the user leaves this tab.
      return () => {
        active = false;
      };
    }, []),
  );

  if (!fontsLoaded) {
    return <View style={styles.screen} />;
  }

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <ProfileComponent
          name={name}
          onSettingsPress={() => router.push("/settings")}
          teamName={teamName}
        />
      </View>

      <View style={styles.noticeSection}>
        {isLoadingAnnouncements ? (
          <Text style={styles.statusText}>Loading announcements...</Text>
        ) : announcementError ? (
          <Text style={styles.errorText}>{announcementError}</Text>
        ) : !featuredAnnouncement ? (
          <Text style={styles.statusText}>No announcements yet.</Text>
        ) : (
          <>
            <View
              style={[
                styles.featuredNotice,
                isNoticeExpanded && styles.expandedFeaturedNotice,
              ]}
            >
              <NoticeBar
                notice={featuredAnnouncement}
                onPress={() =>
                  setIsNoticeExpanded((isExpanded) => !isExpanded)
                }
              />
            </View>

            {isNoticeExpanded ? (
              <NoticeDetailComponent
                followingNotices={followingAnnouncements}
                notice={featuredAnnouncement}
              />
            ) : (
              <View style={styles.noticeListViewport}>
                <ScrollView
                  contentContainerStyle={styles.noticeList}
                  showsVerticalScrollIndicator={false}
                  style={styles.noticeScroll}
                >
                  {announcements.map((notice) => (
                    <View key={notice.id} style={styles.noticeItem}>
                      <Text style={styles.noticeTitle}>{notice.title}</Text>
                      <View style={styles.metadata}>
                        <Text style={styles.metadataText}>
                          {notice.publisher}
                        </Text>
                        <View style={styles.metadataDivider} />
                        <Text style={styles.metadataText}>
                          {new Date(notice.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                      <Text numberOfLines={3} style={styles.noticeBody}>
                        {notice.content}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

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
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: "#C93D2A",
    fontFamily: "AlanSans_400Regular",
    fontSize: 14,
    marginHorizontal: 32,
    textAlign: "center",
  },
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
  statusText: {
    color: "#777777",
    fontFamily: "AlanSans_400Regular",
    fontSize: 14,
    marginHorizontal: 32,
    textAlign: "center",
  },
});
