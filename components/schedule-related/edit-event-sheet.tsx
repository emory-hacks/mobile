import {
  createScheduleEvent,
  updateScheduleEvent,
  type ScheduleEventUpdate,
} from "@/services/schedule";
import type { ScheduleEvent } from "@/types/schedule-event";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
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

type Props = {
  creating?: boolean;
  defaultDate?: string;
  event: ScheduleEvent | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

function splitEventDateTime(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

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

function combineEventDateTime(dateValue: string, timeValue: string) {
  const dateMatch = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const timeMatch = timeValue.match(/^(1[0-2]|0?[1-9]):([0-5]\d)\s*(AM|PM)$/i);

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

export function EditEventSheet({
  creating = false,
  defaultDate = "",
  event,
  onClose,
  onSaved,
}: Props) {
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventBody, setEventBody] = useState("");
  const [eventPoints, setEventPoints] = useState("");
  const [eventIsDeadline, setEventIsDeadline] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  useEffect(() => {
    setFormError(null);
    if (creating) {
      setEventName("");
      setEventLocation("");
      setEventStartDate(defaultDate);
      setEventStartTime("");
      setEventEndDate(defaultDate);
      setEventEndTime("");
      setEventBody("");
      setEventPoints("0");
      setEventIsDeadline(false);
      return;
    }
    if (!event) return;
    const start = splitEventDateTime(event.startTime);
    const end = splitEventDateTime(event.endTime);
    setEventName(event.title);
    setEventLocation(event.location);
    setEventStartDate(start.date);
    setEventStartTime(start.time);
    setEventEndDate(end.date);
    setEventEndTime(end.time);
    setEventBody(event.body ?? "");
    setEventPoints(String(event.points ?? 0));
    setEventIsDeadline(event.isDeadline === true);
  }, [creating, defaultDate, event]);

  const handleSaveEvent = async () => {
    if (!creating && !event) return;

    const name = eventName.trim();
    const location = eventLocation.trim();
    const startDate = eventStartDate.trim();
    const startTimeValue = eventStartTime.trim();
    const endDate = eventEndDate.trim();
    const endTimeValue = eventEndTime.trim();
    const body = eventBody.trim();
    const pointsValue = Number(eventPoints.trim());

    if (
      !name ||
      !location ||
      !startDate ||
      !startTimeValue ||
      !endDate ||
      !endTimeValue
    ) {
      setFormError("Name, location, start, and end are required.");
      return;
    }

    const startTime = combineEventDateTime(startDate, startTimeValue);
    const endTime = combineEventDateTime(endDate, endTimeValue);

    if (!startTime || !endTime) {
      setFormError("Use MM/DD/YYYY and h:mm AM/PM.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setFormError("End must be after start.");
      return;
    }

    if (
      eventPoints.trim() === "" ||
      !Number.isInteger(pointsValue) ||
      pointsValue < 0
    ) {
      setFormError("Points must be a whole number.");
      return;
    }

    setIsSavingEvent(true);
    setFormError(null);
    try {
      if (creating) {
        await createScheduleEvent({
          title: name,
          body,
          location,
          startTime,
          endTime,
          points: pointsValue,
          isDeadline: eventIsDeadline,
        });
      } else if (event) {
        const updates: ScheduleEventUpdate = { title: event.title };
        if (name !== event.title) updates.correctedTitle = name;
        if (body !== (event.body ?? "")) updates.correctedBody = body;
        if (location !== event.location) updates.correctedLocation = location;
        if (
          new Date(startTime).getTime() !== new Date(event.startTime).getTime()
        ) {
          updates.correctedStartTime = startTime;
        }
        if (new Date(endTime).getTime() !== new Date(event.endTime).getTime()) {
          updates.correctedEndTime = endTime;
        }
        if (eventIsDeadline !== (event.isDeadline === true)) {
          updates.correctedIsDeadline = eventIsDeadline;
        }
        if (pointsValue !== (event.points ?? 0)) {
          updates.correctedPoints = pointsValue;
        }

        if (Object.keys(updates).length === 1) {
          setFormError("Nothing was changed.");
          setIsSavingEvent(false);
          return;
        }

        await updateScheduleEvent(updates);
      }

      await onSaved();
      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save event.",
      );
    } finally {
      setIsSavingEvent(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={creating || event !== null}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <Pressable
          accessibilityLabel="Dismiss keyboard"
          onPress={Keyboard.dismiss}
          style={styles.dismissArea}
        />
        <View style={styles.card}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.heading}>
              {creating ? "Add event" : "Edit event"}
            </Text>
            <TextInput
              autoCorrect={false}
              onChangeText={setEventName}
              placeholder="Event name"
              placeholderTextColor="#AFAFAF"
              spellCheck={false}
              style={styles.input}
              value={eventName}
            />
            <TextInput
              autoCorrect={false}
              onChangeText={setEventLocation}
              placeholder="Location"
              placeholderTextColor="#AFAFAF"
              spellCheck={false}
              style={styles.input}
              value={eventLocation}
            />
            <TextInput
              autoCorrect={false}
              multiline
              onChangeText={setEventBody}
              onSubmitEditing={Keyboard.dismiss}
              placeholder="Event body"
              placeholderTextColor="#AFAFAF"
              returnKeyType="done"
              spellCheck
              style={[styles.input, styles.bodyInput]}
              submitBehavior="blurAndSubmit"
              textAlignVertical="top"
              value={eventBody}
            />
            <TextInput
              keyboardType="number-pad"
              onChangeText={setEventPoints}
              placeholder="Points"
              placeholderTextColor="#AFAFAF"
              style={styles.input}
              value={eventPoints}
            />
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: eventIsDeadline }}
              onPress={() => setEventIsDeadline((current) => !current)}
              style={styles.deadlineToggle}
            >
              <View
                style={[
                  styles.checkbox,
                  eventIsDeadline && styles.checkboxChecked,
                ]}
              >
                {eventIsDeadline ? (
                  <Text style={styles.checkboxMark}>✓</Text>
                ) : null}
              </View>
              <Text style={styles.deadlineToggleText}>Deadline</Text>
            </Pressable>
            <View style={styles.dateTimeSection}>
              <Text style={styles.fieldLabel}>Start</Text>
              <View style={styles.dateTimeRow}>
                <TextInput
                  autoCorrect={false}
                  keyboardType="numbers-and-punctuation"
                  onChangeText={setEventStartDate}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor="#AFAFAF"
                  spellCheck={false}
                  style={[styles.input, styles.dateInput]}
                  value={eventStartDate}
                />
                <TextInput
                  autoCapitalize="characters"
                  autoCorrect={false}
                  onChangeText={setEventStartTime}
                  placeholder="h:mm AM/PM"
                  placeholderTextColor="#AFAFAF"
                  spellCheck={false}
                  style={[styles.input, styles.clockInput]}
                  value={eventStartTime}
                />
              </View>
            </View>
            <View style={styles.dateTimeSection}>
              <Text style={styles.fieldLabel}>End</Text>
              <View style={styles.dateTimeRow}>
                <TextInput
                  autoCorrect={false}
                  keyboardType="numbers-and-punctuation"
                  onChangeText={setEventEndDate}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor="#AFAFAF"
                  spellCheck={false}
                  style={[styles.input, styles.dateInput]}
                  value={eventEndDate}
                />
                <TextInput
                  autoCapitalize="characters"
                  autoCorrect={false}
                  onChangeText={setEventEndTime}
                  placeholder="h:mm AM/PM"
                  placeholderTextColor="#AFAFAF"
                  spellCheck={false}
                  style={[styles.input, styles.clockInput]}
                  value={eventEndTime}
                />
              </View>
            </View>
            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
            <View style={styles.actions}>
              <Pressable
                disabled={isSavingEvent}
                onPress={onClose}
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
                  <Text style={styles.saveButtonText}>
                    {creating ? "Add" : "Save"}
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    flex: 1,
    justifyContent: "flex-end",
  },
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
  card: {
    backgroundColor: "#EDF3F7",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  checkbox: {
    alignItems: "center",
    borderColor: "#DADADA",
    borderRadius: 4,
    borderWidth: 1,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  checkboxChecked: {
    backgroundColor: "#C93D2A",
    borderColor: "#C93D2A",
  },
  checkboxMark: {
    color: "#FFFFFF",
    fontFamily: "AlanSans_700Bold",
    fontSize: 14,
    lineHeight: 16,
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
  deadlineToggle: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  deadlineToggleText: {
    color: "#111111",
    fontFamily: "AlanSans_500Medium",
    fontSize: 15,
  },
  errorText: {
    color: "#C93D2A",
    fontFamily: "AlanSans_400Regular",
    fontSize: 13,
    marginBottom: 12,
  },
  dismissArea: {
    flex: 1,
  },
  fieldLabel: {
    color: "#777777",
    fontFamily: "AlanSans_500Medium",
    fontSize: 12,
    marginBottom: 6,
  },
  heading: {
    color: "#111111",
    fontFamily: "AlanSans_700Bold",
    fontSize: 20,
    marginBottom: 16,
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
});
