import {
  AlanSans_400Regular,
  AlanSans_500Medium,
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
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NoticeBar } from "@/components/home/notice-bar";
import { NoticeDetailComponent } from "@/components/home/notice-detail-component";
import { ProfileComponent } from "@/components/home/profile-component";
import { API_BASE_URL } from "@/constants/computer-ip";
import { TEST_NOTICES } from "@/constants/test-notices";
import { getEmail, getJwt, saveRole } from "@/utils/auth-token";
import { saveInfo } from "@/utils/user-info";

const FEATURED_NOTICE = TEST_NOTICES[0];
const FOLLOWING_NOTICES = TEST_NOTICES.slice(1);

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [isPosting, setIsPosting] = useState(false);

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
        setIsAdmin(!!userData.role && String(userData.role).includes("admin"));
      })();

      return () => {
        active = false;
      };
    }, []),
  );

  const closeCompose = () => {
    setComposeOpen(false);
    setAnnouncementTitle("");
    setAnnouncementBody("");
  };

  const handlePostAnnouncement = async () => {
    const title = announcementTitle.trim();
    const content = announcementBody.trim();
    if (!title || !content) {
      Alert.alert("Missing fields", "Title and body are required.");
      return;
    }

    const jwt = await getJwt();
    const email = await getEmail();

    setIsPosting(true);
    try {
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
          publisher: email,
          created_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        Alert.alert("Error", await response.text());
        return;
      }

      closeCompose();
      Alert.alert("Posted", "Announcement published.");
    } catch {
      Alert.alert("Error", "Could not post announcement.");
    } finally {
      setIsPosting(false);
    }
  };

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

      {isAdmin && (
        <Pressable
          accessibilityLabel="Create announcement"
          accessibilityRole="button"
          onPress={() => setComposeOpen(true)}
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
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalHeading}>New announcement</Text>
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
                disabled={isPosting}
                onPress={closeCompose}
                style={({ pressed }) => [
                  styles.cancelButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                disabled={isPosting}
                onPress={handlePostAnnouncement}
                style={({ pressed }) => [
                  styles.postButton,
                  { opacity: pressed || isPosting ? 0.7 : 1 },
                ]}
              >
                {isPosting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.postButtonText}>Post</Text>
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
  expandedFeaturedNotice: {
    marginBottom: 0,
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
});
