import MiniProfile from "@/components/home/mini-profile";
import Notice, { NoticeItem } from "@/components/home/notice";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const notices: NoticeItem[] = [
  {
    id: "latest",
    title: "The Latest Notice",
    time: "01/01 00:00:00",
    body: "This is where the announcement comes in. Click to view the original text in a large window. The announcements are placed in chronological order, and the filter function allows you to filter through filters such as previously read or unread notices.",
  },
  {
    id: "notice-1",
    title: "Notice Title",
    time: "01/01 00:00:00",
    body: "This is where the announcement comes in. Click to view the original text in a large window. The announcements are placed in chronological order, and the filter function allows you to filter through filters such as previously read or unread notices.",
  },
  {
    id: "notice-2",
    title: "Notice Title",
    time: "01/01 00:00:00",
    body: "This is where the announcement comes in. Click to view the original text in a large window. The announcements are placed in chronological order, and the filter function allows you to filter through filters such as previously read or unread notices.",
  },
  {
    id: "notice-3",
    title: "Notice Title",
    time: "01/01 00:00:00",
    body: "This is where the announcement comes in. Click to view the original text in a large window. The announcements are placed in chronological order, and the filter function allows you to filter through filters such as previously read or unread notices.",
  },
];

export default function HomePage() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#000000" : "#FFFFFF",
          paddingTop: insets.top + 48,
        },
      ]}
    >
      <Pressable
        accessibilityLabel="Options"
        accessibilityRole="button"
        style={[styles.optionsButton, { top: insets.top + 12 }]}
      >
        <Ionicons name="settings-sharp" size={24} color="#000000" />
      </Pressable>
      <MiniProfile
        name="John Doe"
        teamName="Default Team"
        email="hackathon@email.com"
      />
      <View style={styles.noticePanel}>
        <View style={styles.noticePanelContent}>
          <ScrollView
            contentContainerStyle={styles.noticeList}
            showsVerticalScrollIndicator={false}
          >
            {notices.map((notice, index) => (
              <View key={notice.id}>
                <Notice
                  title={notice.title}
                  time={notice.time}
                  body={notice.body}
                />
                {index < notices.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  optionsButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    position: "absolute",
    right: 10,
    width: 44,
    zIndex: 1,
  },
  noticePanel: {
    elevation: 8,
    flex: 1,
    marginTop: 28,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
  },
  noticePanelContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    overflow: "hidden",
  },
  noticeList: {
    paddingBottom: 32,
    paddingHorizontal: 22,
    paddingTop: 36,
  },
  divider: {
    backgroundColor: "#A8A8A8",
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },
});
