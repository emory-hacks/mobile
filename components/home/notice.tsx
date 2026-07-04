import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export type NoticeItem = {
  id: string;
  title: string;
  time: string;
  body: string;
};

type NoticeProps = {
  title: string;
  time: string;
  body: string;
};

export default function Notice({ title, time, body }: NoticeProps) {
  return (
    <View style={styles.noticeRow}>
      <View style={styles.iconCol}>
        <Ionicons
          name="notifications"
          size={25}
          color="#000000"
          style={styles.icon}
        />
      </View>

      <View style={styles.contentCol}>
        <View style={styles.headingRow}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  noticeRow: {
    flexDirection: "row",
    paddingVertical: 16,
  },
  iconCol: {
    alignItems: "center",
    paddingTop: 0,
    width: 44,
  },
  icon: {
    transform: [{ translateY: -3 }],
  },
  contentCol: {
    flex: 1,
  },
  headingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    color: "#000000",
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 19,
    paddingRight: 12,
  },
  time: {
    color: "#000000",
    fontSize: 10,
    lineHeight: 13,
  },
  body: {
    color: "#A8A8A8",
    fontSize: 13,
    lineHeight: 16,
    textAlign: "justify",
  },
});
