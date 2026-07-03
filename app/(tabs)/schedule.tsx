import ScheduleItem from "@/components/schedule-related/schedule-item";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Fake Schedule Items, will receive API calls
const scheduleItems = [
  {
    time: "09:48",
    title: "For Tokyo",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 27",
    body: "This train has left the station. Please take the next one! JK! This box represents a past event, controlled by a flag called isActive",
    isActive: false,
    isPassed: true,
  },
  {
    time: "09:55",
    title: "For Nagoya",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 27",
    body: "This train has left the station. Please take the next one! JK! This box represents a past event, controlled by a flag called isActive",
    isActive: false,
    isPassed: true,
  },
  {
    time: "10:13",
    title: "For Tokyo",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 25",
    body: "We will be stopping at Kyoto, Nagoya, Shin-Yokohama, and Shinagawa. Non-reserved seats are in car number 1 to 3.",
    isActive: true,
  },
  {
    time: "10:50",
    title: "Out of Service",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 26",
  },
  {
    time: "11:10",
    title: "For Tokyo",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 25",
  },
  {
    time: "11:25",
    title: "Out of Service",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 26",
  },
  {
    time: "11:35",
    title: "For Tokyo",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 25",
  },
  {
    time: "11:50",
    title: "For Nagoya",
    startTime: "00:00",
    endTime: "00:00",
    location: "Platform 27",
  },
];

// Date Utility: Get an offset date
function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

// Format as MM/DD
function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
  });
}

function GradientDateText({
  date,
  direction,
}: {
  date: string;
  direction: "yesterday" | "tomorrow";
}) {
  const isYesterday = direction === "yesterday";

  return (
    <MaskedView
      maskElement={
        <Text style={[styles.dateText, styles.gradientDateMask]}>{date}</Text>
      }
    >
      <LinearGradient
        colors={["#d8d8d8", "#8f8f8f"]}
        start={{ x: isYesterday ? 0 : 1, y: 0.5 }}
        end={{ x: isYesterday ? 1 : 0, y: 0.5 }}
      >
        <Text style={[styles.dateText, styles.transparentDateText]}>
          {date}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();

  // Grab today's, yesterday, and tomorrow's date.
  const today = new Date();
  const visibleDates = [
    formatDate(addDays(today, -1)),
    formatDate(today),
    formatDate(addDays(today, 1)),
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16 }]}>
      <View style={styles.dateRow}>
        {visibleDates.map((date, index) => {
          const isToday = index === 1;

          if (isToday) {
            return (
              <Text key={date} style={[styles.dateText, styles.todayText]}>
                {date}
              </Text>
            );
          }

          return (
            <GradientDateText
              key={date}
              date={date}
              direction={index === 0 ? "yesterday" : "tomorrow"}
            />
          );
        })}
      </View>

      <View style={styles.panel}>
        <View style={styles.panelContent}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 32 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {scheduleItems.map((item, index) => (
              <ScheduleItem
                key={`${item.time}-${index}`}
                time={item.time}
                title={item.title}
                startTime={item.startTime}
                endTime={item.endTime}
                location={item.location}
                body={item.body}
                isActive={item.isActive}
                isPassed={item.isPassed}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  panel: {
    flex: 1,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  panelContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    overflow: "hidden",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 32,
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingBottom: 4,
  },
  dateText: {
    color: "#9d9d9d",
    fontSize: 21,
    fontWeight: "700",
  },
  gradientDateMask: {
    backgroundColor: "transparent",
  },
  transparentDateText: {
    opacity: 0,
  },
  todayText: {
    color: "#000",
    fontSize: 31,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
});
