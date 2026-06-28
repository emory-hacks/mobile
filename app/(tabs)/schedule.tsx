import ScheduleItem from "@/components/schedule-related/schedule-item";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

// Fake Schedule Items, will receive API calls
const scheduleItems = [
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

export default function ScheduleScreen() {
  // Grab today's, yesterday, and tomorrow's date.
  const today = new Date();
  const visibleDates = [
    formatDate(addDays(today, -1)),
    formatDate(today),
    formatDate(addDays(today, 1)),
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.dateRow}>
        {visibleDates.map((date, index) => {
          const isToday = index === 1;

          return (
            <Text
              key={date}
              style={[styles.dateText, isToday && styles.todayText]}
            >
              {date}
            </Text>
          );
        })}
      </View>

      <View style={styles.panel}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  panel: {
    flex: 1,
    marginTop: 0,
    marginHorizontal: 8,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  dateRow: {
    height: 128,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 36,
    backgroundColor: "#fff",
  },
  dateText: {
    color: "#9d9d9d",
    fontSize: 21,
    fontWeight: "700",
  },
  todayText: {
    color: "#000",
    fontSize: 31,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
});
