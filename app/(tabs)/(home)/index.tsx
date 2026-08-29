import {
  AlanSans_400Regular,
  AlanSans_500Medium,
  AlanSans_600SemiBold,
  AlanSans_700Bold,
} from "@expo-google-fonts/alan-sans"; // fonts
import { Grandstander_900Black } from "@expo-google-fonts/grandstander";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { fetch } from "expo/fetch";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NoticeBar } from "@/components/home/notice-bar";
import { NoticeDetailComponent } from "@/components/home/notice-detail-component";
import { ProfileComponent } from "@/components/home/profile-component";
import { API_BASE_URL } from "@/constants/computer-ip";
import { getAnnouncements, updateAnnouncement } from "@/services/announcements";
import type { Announcement } from "@/types/announcement";
import { getEmail, getJwt } from "@/utils/auth-token";
import { saveUserSession } from "@/utils/session";
import { getInfo, saveInfo } from "@/utils/user-info";

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(false);
  const [lastReadCreatedAt, setLastReadCreatedAt] = useState<string | null>(
    null,
  );
  const [fontsLoaded] = useFonts({
    AlanSans_400Regular,
    AlanSans_500Medium,
    AlanSans_600SemiBold,
    AlanSans_700Bold,
    Grandstander_900Black,
  });
  const [name, setName] = useState("");
  const [teamName, setTeamName] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [announcementError, setAnnouncementError] = useState<string | null>(
    null,
  );

  const featuredAnnouncement = announcements[0];
  const followingAnnouncements = announcements.slice(1);
  const showUnreadNotice =
    !!featuredAnnouncement &&
    featuredAnnouncement.createdAt !== lastReadCreatedAt;

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
        const response = await fetch(`${API_BASE_URL}/api/users/${email}`, {
          method: "GET",
          credentials: "omit",
          headers: {
            "Content-Type": "application/json",
            Cookie: `token=${jwt}`,
          },
        });

        if (!response.ok) {
          console.log(response.status, await response.text());
          return;
        }

        const userData = await response.json();
        if (!active) return;

        await saveUserSession(userData, email);
        console.log(String(!!userData.checkedIn));
        setName(userData.name);
        setTeamName(userData.teamName);
        setIsAdmin(!!userData.role && String(userData.role).includes("admin"));
      })();

      return () => {
        active = false;
      };
    }, []),
  );

  const loadAnnouncements = useCallback(async () => {
    setIsLoadingAnnouncements(true);
    setAnnouncementError(null);

    try {
      const data = await getAnnouncements();

      // Keep typo fixes in their original position by sorting on createdAt.
      const newestFirst = [...data].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      );
      const savedCreatedAt = await getInfo("lastReadAnnouncement");

      setLastReadCreatedAt(savedCreatedAt);
      if (newestFirst[0]?.createdAt !== savedCreatedAt) {
        setIsNoticeExpanded(false);
      }
      setAnnouncements(newestFirst);
    } catch (error) {
      setAnnouncementError(
        error instanceof Error
          ? error.message
          : "Unable to load announcements.",
      );
    } finally {
      setIsLoadingAnnouncements(false);
    }
  }, []);

  const handleNoticePress = async () => {
    if (!featuredAnnouncement) return;

    setIsNoticeExpanded(true);
    setLastReadCreatedAt(featuredAnnouncement.createdAt);
    await saveInfo("lastReadAnnouncement", featuredAnnouncement.createdAt);
  };

  const openCreate = () => {
    setEditingAnnouncement(null);
    setAnnouncementTitle("");
    setAnnouncementBody("");
    setComposeOpen(true);
  };

  const openEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementTitle(announcement.title);
    setAnnouncementBody(announcement.content);
    setComposeOpen(true);
  };

  const closeCompose = () => {
    setComposeOpen(false);
    setEditingAnnouncement(null);
    setAnnouncementTitle("");
    setAnnouncementBody("");
  };

  const handleSubmitAnnouncement = async () => {
    const title = announcementTitle.trim();
    const content = announcementBody.trim();
    const wasEditing = editingAnnouncement !== null;
    if (!title || !content) {
      Alert.alert("Missing fields", "Title and body are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAnnouncement) {
        if (
          title === editingAnnouncement.title &&
          content === editingAnnouncement.content
        ) {
          Alert.alert("No changes", "Nothing was changed.");
          return;
        }

        await updateAnnouncement({
          title: editingAnnouncement.title,
          correctedTitle: title,
          correctedContent: content,
        });
      } else {
        const jwt = await getJwt();
        const email = await getEmail();

        if (!jwt || !email) {
          throw new Error("Please sign in to post announcements.");
        }

        const response = await fetch(`${API_BASE_URL}/api/announcements`, {
          method: "POST",
          credentials: "omit",
          headers: {
            "Content-Type": "application/json",
            Cookie: `token=${jwt}`,
          },
          body: JSON.stringify({
            title,
            content,
            publisherName: name,
            publisher: email,
            created_at: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error(
            (await response.text()) || "Could not post announcement.",
          );
        }
      }

      // GET again so the page immediately matches the backend.
      await loadAnnouncements();
      closeCompose();
      Alert.alert(
        wasEditing ? "Updated" : "Posted",
        wasEditing ? "Announcement updated." : "Announcement published.",
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Could not save announcement.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAnnouncements();
    }, [loadAnnouncements]),
  );

  if (!fontsLoaded) {
    return <View style={styles.screen} />;
  }

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <ProfileComponent
          isAdmin={isAdmin}
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
            {showUnreadNotice && (
              <View style={styles.featuredNotice}>
                <NoticeBar
                  notice={featuredAnnouncement}
                  onPress={handleNoticePress}
                />
              </View>
            )}

            {isNoticeExpanded ? (
              <NoticeDetailComponent
                followingNotices={followingAnnouncements}
                notice={featuredAnnouncement}
                onClose={() => setIsNoticeExpanded(false)}
              />
            ) : (
              <View style={styles.noticeListViewport}>
                <ScrollView
                  contentContainerStyle={styles.noticeList}
                  showsVerticalScrollIndicator={false}
                  style={styles.noticeScroll}
                >
                  {announcements.map((notice, index) => {
                    const date = new Date(notice.createdAt);
                    const dateKey = date.toDateString();
                    const previousDateKey =
                      index > 0
                        ? new Date(
                            announcements[index - 1].createdAt,
                          ).toDateString()
                        : null;
                    const nextDateKey =
                      index < announcements.length - 1
                        ? new Date(
                            announcements[index + 1].createdAt,
                          ).toDateString()
                        : null;

                    return (
                      <View
                        key={`${notice.createdAt}-${notice.publisher}-${notice.title}`}
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
                        <View style={styles.noticeHeadingRow}>
                          <Text style={styles.noticeTitle}>{notice.title}</Text>
                          {isAdmin && (
                            <Pressable
                              accessibilityLabel={`Edit ${notice.title}`}
                              accessibilityRole="button"
                              hitSlop={10}
                              onPress={() => openEdit(notice)}
                              style={({ pressed }) => [
                                styles.editButton,
                                { opacity: pressed ? 0.6 : 1 },
                              ]}
                            >
                              <Text style={styles.editButtonText}>Edit</Text>
                            </Pressable>
                          )}
                        </View>
                        <View style={styles.metadata}>
                          <Text style={styles.metadataText}>
                            {new Date(notice.createdAt).toLocaleDateString([], {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            {" · "}
                            {new Date(notice.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </View>
                        <Text
                          ellipsizeMode="tail"
                          numberOfLines={5}
                          style={styles.noticeBody}
                        >
                          {notice.content.replace(/\s+/g, " ").trim()}
                        </Text>
                      </View>
                    );
                  })}
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

      {isAdmin && (
        <Pressable
          accessibilityLabel="Create announcement"
          accessibilityRole="button"
          onPress={openCreate}
          style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Ionicons color="#FFFFFF" name="add" size={32} />
        </Pressable>
      )}

      <Modal
        animationType="slide"
        onRequestClose={closeCompose}
        transparent
        visible={composeOpen}
      >
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={0}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalHeading}>
              {editingAnnouncement ? "Edit announcement" : "New announcement"}
            </Text>
            <TextInput
              onChangeText={setAnnouncementTitle}
              placeholder="Title"
              placeholderTextColor="#AFAFAF"
              style={styles.titleInput}
              value={announcementTitle}
            />
            <TextInput
              multiline
              onChangeText={setAnnouncementBody}
              placeholder="Body paragraph"
              placeholderTextColor="#AFAFAF"
              style={styles.bodyInput}
              textAlignVertical="top"
              value={announcementBody}
            />
            <View style={styles.modalActions}>
              <Pressable
                disabled={isSubmitting}
                onPress={closeCompose}
                style={({ pressed }) => [
                  styles.cancelButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                disabled={isSubmitting}
                onPress={handleSubmitAnnouncement}
                style={({ pressed }) => [
                  styles.postButton,
                  { opacity: pressed || isSubmitting ? 0.7 : 1 },
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.postButtonText}>
                    {editingAnnouncement ? "Save" : "Post"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bodyInput: {
    borderColor: "#DADADA",
    borderRadius: 10,
    borderWidth: 1,
    color: "#111111",
    flex: 1,
    fontFamily: "AlanSans_400Regular",
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 16,
    minHeight: 160,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cancelButton: {
    alignItems: "center",
    borderColor: "#DADADA",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: "#111111",
    fontFamily: "AlanSans_500Medium",
    fontSize: 15,
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
    height: StyleSheet.hairlineWidth,
  },
  dateDividerText: {
    color: "#668713",
    fontFamily: "AlanSans_500Medium",
    fontSize: 12,
  },
  errorText: {
    color: "#C93D2A",
    fontFamily: "AlanSans_400Regular",
    fontSize: 14,
    marginHorizontal: 32,
    textAlign: "center",
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
  fab: {
    alignItems: "center",
    backgroundColor: "#A3CE26",
    borderRadius: 28,
    bottom: 24,
    elevation: 4,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    right: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 56,
  },
  featuredNotice: {
    height: 40,
    marginBottom: 28,
    marginHorizontal: 32,
  },
  metadata: {
    alignItems: "flex-start",
    marginBottom: 5,
    marginTop: 4,
  },
  metadataText: {
    color: "#AFAFAF",
    fontFamily: "AlanSans_400Regular",
    fontSize: 10,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    minHeight: 420,
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  modalHeading: {
    color: "#111111",
    fontFamily: "AlanSans_700Bold",
    fontSize: 20,
    marginBottom: 16,
  },
  noticeBody: {
    color: "#111111",
    fontFamily: "AlanSans_400Regular",
    fontSize: 14,
    includeFontPadding: false,
    lineHeight: 20,
    width: "100%",
  },
  noticeFade: {
    bottom: 0,
    height: 120,
    left: 0,
    position: "absolute",
    right: 0,
  },
  noticeHeadingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
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
    flex: 1,
    fontFamily: "AlanSans_600SemiBold",
    fontSize: 18,
    lineHeight: 24,
  },
  postButton: {
    alignItems: "center",
    backgroundColor: "#A3CE26",
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 14,
  },
  postButtonText: {
    color: "#FFFFFF",
    fontFamily: "AlanSans_700Bold",
    fontSize: 15,
  },
  screen: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },

  titleInput: {
    borderColor: "#DADADA",
    borderRadius: 10,
    borderWidth: 1,
    color: "#111111",
    fontFamily: "AlanSans_500Medium",
    fontSize: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  statusText: {
    color: "#777777",
    fontFamily: "AlanSans_400Regular",
    fontSize: 14,
    marginHorizontal: 32,
    textAlign: "center",
  },
});
