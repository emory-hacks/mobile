import ScheduleItem from "@/components/schedule-related/schedule-item";
import {
  getSchedule,
  type ScheduleEventUpdate,
  updateScheduleEvent,
} from "@/services/schedule";
import type { ScheduleEvent } from "@/types/schedule-event";
import { getRole } from "@/utils/auth-token";
import {
  AlanSans_400Regular,
  AlanSans_500Medium,
  AlanSans_700Bold,
} from "@expo-google-fonts/alan-sans";
import { Grandstander_900Black } from "@expo-google-fonts/grandstander";
import MaskedView from "@react-native-masked-view/masked-view";
import { useFocusEffect } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
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

const ESTIMATED_SCHEDULE_ITEM_HEIGHT = 112;
const FOCUSED_EVENT_TOP_OFFSET = ESTIMATED_SCHEDULE_ITEM_HEIGHT;

// Date Utility: Get an offset date
function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

// Format as MM/DD
function formatDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatFullDate(date: Date) {
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function isBeforeToday(date: Date) {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  return dateStart < todayStart;
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function toMinutes(time: string) {
  const date = new Date(time);

  return date.getHours() * 60 + date.getMinutes();
}

function formatEventTime(time: string) {
  const date = new Date(time);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Split backend timestamps for friendly form inputs.
function splitEventDateTime(value: string) {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
  );

  if (!match) return { date: "", time: "" };

  const [, year, month, day, hoursText, minutes] = match;
  const hours = Number(hoursText);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return {
    date: `${month}/${day}/${year}`,
    time: `${displayHours}:${minutes} ${period}`,
  };
}

// Combine form fields into backend timestamps.
function combineEventDateTime(dateValue: string, timeValue: string) {
  const dateMatch = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const timeMatch = timeValue.match(
    /^(1[0-2]|0?[1-9]):([0-5]\d)\s*(AM|PM)$/i,
  );

  if (!dateMatch || !timeMatch) return null;

  const [, monthText, dayText, yearText] = dateMatch;
  const [, hoursText, minutes, periodText] = timeMatch;
  const month = Number(monthText);
  const day = Number(dayText);
  const year = Number(yearText);
  const testDate = new Date(year, month - 1, day);

  if (
    testDate.getFullYear() !== year ||
    testDate.getMonth() !== month - 1 ||
    testDate.getDate() !== day
  ) {
    return null;
  }

  let hours = Number(hoursText) % 12;
  if (periodText.toUpperCase() === "PM") hours += 12;

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${minutes}:00`;
}

function getActiveEventIndex(items: ScheduleEvent[], now: Date) {
  return items.findIndex(
    (item) =>
      new Date(item.startTime) <= now && now < new Date(item.endTime), // Active if now is between start & end time
  );
}

function getScheduleFocusIndex(items: ScheduleEvent[], selectedDate: Date) {
  if (items.length === 0) {
    return -1;
  }

  const today = new Date();
  if (isBeforeToday(selectedDate)) {
    return -1;
  }

  if (!isSameDay(selectedDate, today)) {
    return -1;
  }

  // Prefer the event currently in progress.
  const activeIndex = getActiveEventIndex(items, today);
  if (activeIndex !== -1) {
    return activeIndex;
  }

  // Otherwise focus the next upcoming event.
  const upcomingIndex = items.findIndex(
    (item) => new Date(item.startTime) > today,
  );

  return upcomingIndex;
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
        colors={[
          "rgba(163, 206, 38, 0.12)",
          "rgba(163, 206, 38, 0.72)",
        ]}
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
  const scrollViewRef = useRef<ScrollView>(null);
  const transitionAnim = useRef(new Animated.Value(1)).current;
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  // null means every event is collapsed; otherwise this stores the backend ID.
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(
    null
  );
  const [scheduleItems, setScheduleItems] = useState<ScheduleEvent[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventBody, setEventBody] = useState("");
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [fontsLoaded] = useFonts({
    AlanSans_400Regular,
    AlanSans_500Medium,
    AlanSans_700Bold,
    Grandstander_900Black,
  });

  // Grab the selected day, plus the previous and next dates around it.
  const visibleDates = [
    addDays(selectedDate, -1),
    selectedDate,
    addDays(selectedDate, 1),
  ];
  const isSelectedDatePast = isBeforeToday(selectedDate);
  // Show only events starting on the selected date.
  const selectedScheduleItems = useMemo(
    () =>
      scheduleItems.filter((item) =>
        isSameDay(new Date(item.startTime), selectedDate),
      ),
    [scheduleItems, selectedDate],
  );
  const focusIndex = useMemo(
    () => getScheduleFocusIndex(selectedScheduleItems, selectedDate),
    [selectedScheduleItems, selectedDate]
  );

  const loadSchedule = useCallback(async () => {
    setIsLoadingSchedule(true);
    setScheduleError(null);

    try {
      const data = await getSchedule();

      // Keep the timeline ordered after an event is edited.
      setScheduleItems(
        [...data].sort(
          (left, right) =>
            toMinutes(left.startTime) - toMinutes(right.startTime),
        ),
      );
    } catch (error) {
      setScheduleError(
        error instanceof Error
          ? error.message
          : "Unable to load the schedule.",
      );
    } finally {
      setIsLoadingSchedule(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSchedule();

      // This controls the UI; the backend must also enforce Admin access.
      getRole().then((role) =>
        setIsAdmin(role?.toLowerCase().includes("admin") ?? false),
      );
    }, [loadSchedule]),
  );

  useEffect(() => {
    transitionAnim.setValue(0);
    Animated.timing(transitionAnim, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const scrollTimer = setTimeout(() => {
      const shouldShowPreviousItem =
        isSameDay(selectedDate, new Date()) && focusIndex > 0;
      const focusedOffset = shouldShowPreviousItem
        ? FOCUSED_EVENT_TOP_OFFSET
        : 0;

      scrollViewRef.current?.scrollTo({
        y: Math.max(
          0,
          focusIndex * ESTIMATED_SCHEDULE_ITEM_HEIGHT - focusedOffset
        ),
        animated: true,
      });
    }, 150);

    return () => clearTimeout(scrollTimer);
  }, [focusIndex, selectedDate, transitionAnim]);

  const transitionStyle = {
    opacity: transitionAnim,
    transform: [
      {
        translateY: transitionAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
    ],
  };

  const selectedDateStyle = {
    opacity: transitionAnim,
    transform: [
      {
        scale: transitionAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1],
        }),
      },
    ],
  };

  const selectDate = (date: Date) => {
    // A new date receives a different schedule, so do not keep a stale event open.
    setExpandedScheduleId(null);
    setSelectedDate(date);
  };

  const toggleSchedule = (scheduleId: string) => {
    setExpandedScheduleId((currentId) =>
      currentId === scheduleId ? null : scheduleId
    );
  };

  const openEdit = (event: ScheduleEvent) => {
    const start = splitEventDateTime(event.startTime);
    const end = splitEventDateTime(event.endTime);

    setEditingEvent(event);
    setEventName(event.title);
    setEventLocation(event.location);
    setEventStartDate(start.date);
    setEventStartTime(start.time);
    setEventEndDate(end.date);
    setEventEndTime(end.time);
    setEventBody(event.body ?? "");
  };

  const closeEdit = () => {
    setEditingEvent(null);
    setEventName("");
    setEventLocation("");
    setEventStartDate("");
    setEventStartTime("");
    setEventEndDate("");
    setEventEndTime("");
    setEventBody("");
  };

  const handleSaveEvent = async () => {
    if (!editingEvent) return;

    const name = eventName.trim();
    const location = eventLocation.trim();
    const startDate = eventStartDate.trim();
    const startTimeValue = eventStartTime.trim();
    const endDate = eventEndDate.trim();
    const endTimeValue = eventEndTime.trim();
    const body = eventBody.trim();

    if (
      !name ||
      !location ||
      !startDate ||
      !startTimeValue ||
      !endDate ||
      !endTimeValue
    ) {
      Alert.alert("Missing fields", "Every event field is required.");
      return;
    }

    const startTime = combineEventDateTime(startDate, startTimeValue);
    const endTime = combineEventDateTime(endDate, endTimeValue);

    if (!startTime || !endTime) {
      Alert.alert(
        "Invalid date or time",
        "Use MM/DD/YYYY and h:mm AM/PM.",
      );
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      Alert.alert("Invalid time range", "End must be after start.");
      return;
    }

    const updates: ScheduleEventUpdate = { title: editingEvent.title };
    if (name !== editingEvent.title) updates.correctedTitle = name;
    if (body !== (editingEvent.body ?? "")) updates.correctedBody = body;
    if (location !== editingEvent.location) {
      updates.correctedLocation = location;
    }
    if (
      new Date(startTime).getTime() !==
      new Date(editingEvent.startTime).getTime()
    ) {
      updates.correctedStartTime = startTime;
    }
    if (
      new Date(endTime).getTime() !== new Date(editingEvent.endTime).getTime()
    ) {
      updates.correctedEndTime = endTime;
    }

    if (Object.keys(updates).length === 1) {
      Alert.alert("No changes", "Nothing was changed.");
      return;
    }

    setIsSavingEvent(true);
    try {
      await updateScheduleEvent(updates);
      await loadSchedule();
      closeEdit();
      Alert.alert("Updated", "Event updated.");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Could not update event.",
      );
    } finally {
      setIsSavingEvent(false);
    }
  };

  if (!fontsLoaded) {
    return <View style={styles.screen} />;
  }

  return (
    <View style={styles.screen}>
      <View
        style={[styles.header, { paddingTop: insets.top + 62 }]}
      >
        <View style={styles.dateRow}>
          {visibleDates.map((date, index) => {
            const formattedDate = formatDate(date);
            const isSelected = index === 1;

            if (isSelected) {
              return (
                <Animated.Text
                  key={formattedDate}
                  style={[
                    styles.dateText,
                    styles.selectedDateText,
                    selectedDateStyle,
                  ]}
                >
                  {formattedDate}
                </Animated.Text>
              );
            }

            return (
              <Pressable
                key={formattedDate}
                accessibilityRole="button"
                accessibilityLabel={`View schedule for ${formattedDate}`}
                hitSlop={12}
                onPress={() => selectDate(date)}
              >
                <GradientDateText
                  date={formattedDate}
                  direction={index === 0 ? "yesterday" : "tomorrow"}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.panelContent}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: insets.bottom + 32,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={transitionStyle}>
              {isLoadingSchedule ? (
                <Text style={styles.statusText}>Loading schedule...</Text>
              ) : scheduleError ? (
                <Text style={styles.errorText}>{scheduleError}</Text>
              ) : selectedScheduleItems.length === 0 ? (
                <Text style={styles.statusText}>No events scheduled.</Text>
              ) : selectedScheduleItems.map((item) => {
                const itemKey = `${item.startTime}-${item.title}`;
                const now = new Date();
                // Green means this event is happening now.
                const isActive =
                  isSameDay(selectedDate, now) &&
                  new Date(item.startTime) <= now &&
                  now < new Date(item.endTime);
                const isPassed =
                  isSelectedDatePast ||
                  (!isActive && new Date(item.endTime) <= now);

                return (
                  <ScheduleItem
                    key={itemKey}
                    time={formatEventTime(item.startTime)}
                    title={item.title}
                    startTime={formatEventTime(item.startTime)}
                    endTime={formatEventTime(item.endTime)}
                    location={item.location}
                    body={item.body}
                    isActive={isActive}
                    isExpanded={expandedScheduleId === itemKey}
                    isPassed={isPassed}
                    activeDate={formatFullDate(selectedDate)}
                    onEdit={() => openEdit(item)}
                    onPress={() => toggleSchedule(itemKey)}
                    showEdit={isAdmin}
                  />
                );
              })}
            </Animated.View>
          </ScrollView>

          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0)",
              "rgba(255, 255, 255, 0.72)",
              "rgba(255, 255, 255, 0.98)",
            ]}
            locations={[0, 0.55, 1]}
            pointerEvents="none"
            style={styles.scheduleFade}
          />
        </View>
      </View>

      <Modal
        animationType="slide"
        onRequestClose={closeEdit}
        transparent
        visible={editingEvent !== null}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalHeading}>Edit event</Text>
            <TextInput
              onChangeText={setEventName}
              placeholder="Event name"
              placeholderTextColor="#AFAFAF"
              style={styles.input}
              value={eventName}
            />
            <TextInput
              onChangeText={setEventLocation}
              placeholder="Location"
              placeholderTextColor="#AFAFAF"
              style={styles.input}
              value={eventLocation}
            />
            <TextInput
              multiline
              onChangeText={setEventBody}
              placeholder="Event body"
              placeholderTextColor="#AFAFAF"
              style={[styles.input, styles.bodyInput]}
              textAlignVertical="top"
              value={eventBody}
            />
            <View style={styles.dateTimeSection}>
              <Text style={styles.fieldLabel}>Start</Text>
              <View style={styles.dateTimeRow}>
                <TextInput
                  keyboardType="numbers-and-punctuation"
                  onChangeText={setEventStartDate}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor="#AFAFAF"
                  style={[styles.input, styles.dateInput]}
                  value={eventStartDate}
                />
                <TextInput
                  autoCapitalize="characters"
                  onChangeText={setEventStartTime}
                  placeholder="h:mm AM/PM"
                  placeholderTextColor="#AFAFAF"
                  style={[styles.input, styles.clockInput]}
                  value={eventStartTime}
                />
              </View>
            </View>
            <View style={styles.dateTimeSection}>
              <Text style={styles.fieldLabel}>End</Text>
              <View style={styles.dateTimeRow}>
                <TextInput
                  keyboardType="numbers-and-punctuation"
                  onChangeText={setEventEndDate}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor="#AFAFAF"
                  style={[styles.input, styles.dateInput]}
                  value={eventEndDate}
                />
                <TextInput
                  autoCapitalize="characters"
                  onChangeText={setEventEndTime}
                  placeholder="h:mm AM/PM"
                  placeholderTextColor="#AFAFAF"
                  style={[styles.input, styles.clockInput]}
                  value={eventEndTime}
                />
              </View>
            </View>
            <View style={styles.modalActions}>
              <Pressable
                disabled={isSavingEvent}
                onPress={closeEdit}
                style={({ pressed }) => [
                  styles.cancelButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                disabled={isSavingEvent}
                onPress={handleSaveEvent}
                style={({ pressed }) => [
                  styles.saveButton,
                  { opacity: pressed || isSavingEvent ? 0.7 : 1 },
                ]}
              >
                {isSavingEvent ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
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
    minHeight: 90,
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
  clockInput: {
    flex: 1,
  },
  dateInput: {
    flex: 1,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateTimeSection: {
    marginBottom: 2,
  },
  fieldLabel: {
    color: "#777777",
    fontFamily: "AlanSans_500Medium",
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    borderColor: "#DADADA",
    borderRadius: 10,
    borderWidth: 1,
    color: "#111111",
    fontFamily: "AlanSans_400Regular",
    fontSize: 15,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
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
  saveButton: {
    alignItems: "center",
    backgroundColor: "#A3CE26",
    borderRadius: 10,
    flex: 1,
    paddingVertical: 14,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontFamily: "AlanSans_700Bold",
    fontSize: 15,
  },
  errorText: {
    color: "#C93D2A",
    fontFamily: "AlanSans_400Regular",
    fontSize: 14,
    paddingHorizontal: 32,
    paddingTop: 40,
    textAlign: "center",
  },
  screen: {
    backgroundColor: "#fff",
    flex: 1,
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    paddingBottom: 28,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    zIndex: 2,
  },
  panel: {
    flex: 1,
  },
  panelContent: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  dateRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  dateText: {
    color: "#A3CE26",
    fontFamily: "Grandstander_900Black",
    fontSize: 48,
    lineHeight: 58,
  },
  gradientDateMask: {
    backgroundColor: "transparent",
  },
  transparentDateText: {
    opacity: 0,
  },
  selectedDateText: {
    color: "#A3CE26",
    fontSize: 56,
    lineHeight: 72,
  },
  statusText: {
    color: "#777777",
    fontFamily: "AlanSans_400Regular",
    fontSize: 14,
    paddingHorizontal: 32,
    paddingTop: 40,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  scheduleFade: {
    bottom: 0,
    height: 120,
    left: 0,
    position: "absolute",
    right: 0,
  },
});
