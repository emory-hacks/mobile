import { API_BASE_URL } from "@/constants/computer-ip";
import { formatEasternDateTime } from "@/utils/eastern-time";
import {
  Fredoka_600SemiBold,
  Fredoka_700Bold,
  useFonts,
} from "@expo-google-fonts/fredoka";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ForgotPassword() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const digitRefs = useRef<(TextInput | null)[]>([]);
  const [fontsLoaded] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
    scrollContent: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    input: {
      width: "80%",
      height: 45,
      margin: 6,
      borderWidth: 0,
      padding: 10,
      borderColor: "black",
      borderRadius: 9,
      fontSize: 16,
      color: "gray",
      backgroundColor: "#eaeaea",
    },
    passwordInput: {
      marginTop: 18,
    },
    subtitle1: {
      fontFamily: "Fredoka_700Bold",
      fontSize: 20,
      color: "black",
    },
    subtitle2: {
      fontFamily: "Fredoka_700Bold",
      fontSize: 20,
      color: "#A3CE26",
      marginBottom: 40,
    },
    normaltext: {
      marginTop: 25,
      fontSize: 14,
      color: "black",
    },
    urltext: {
      marginLeft: 5,
      marginTop: 25,
      fontSize: 14,
      color: "#99c024",
    },
    error: {
      color: "red",
      marginLeft: "15%",
      marginRight: "15%",
      textAlign: "center",
    },
    copyright: {
      fontSize: 10,
      color: "#a4a4a4",
      marginTop: 48,
      marginBottom: 24,
      textAlign: "center",
    },
    sidebyside: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    logo: {
      width: "70%",
      height: 90,
      marginBottom: 32,
      resizeMode: "contain",
    },
    button: {
      width: "80%",
      marginTop: 20,
      borderRadius: 9,
      backgroundColor: "#A3CE26",
      padding: 10,
    },
    codeHint: {
      fontSize: 14,
      color: "#555",
      textAlign: "center",
      marginBottom: 24,
      marginHorizontal: 24,
    },
    codeRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 10,
      marginBottom: 8,
    },
    codeDigit: {
      width: 48,
      height: 56,
      borderRadius: 9,
      backgroundColor: "#eaeaea",
      fontSize: 24,
      color: "#111",
      textAlign: "center",
      fontFamily: "Fredoka_700Bold",
    },
  });

  const invalidPassword = (value: string) => {
    let hasAlpha = false;
    let hasNumber = false;
    let hasSpecial = false;
    for (const letter of value) {
      if (/^[a-zA-Z]$/.test(letter)) {
        hasAlpha = true;
      }
      if (/^[0-9]$/.test(letter)) {
        hasNumber = true;
      }
      if (/[^a-zA-Z0-9 ]/.test(letter)) {
        hasSpecial = true;
      }
    }
    return !(hasAlpha && hasNumber && hasSpecial);
  };

  const formatCurtime = () => formatEasternDateTime();

  const handleSendCode = async () => {
    setErrorMessage(null);

    if (!email) {
      setErrorMessage("Please enter your email");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-user-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        setErrorMessage("Failed to send verification code");
        return;
      }

      setDigits(["", "", "", "", ""]);
      setPassword("");
      setConfirmPassword("");
      setAwaitingCode(true);
    } catch {
      setErrorMessage("Unable to connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (submitting) {
      return;
    }

    setErrorMessage(null);

    const code = digits.join("");
    if (code.length !== 5) {
      setErrorMessage("Please enter the 5-digit code");
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }

    if (invalidPassword(password)) {
      setErrorMessage(
        "Password must contain a letter, number, and special character",
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-user-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          inputted_code: code,
          curtime: formatCurtime(),
          newPassword: password,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        setErrorMessage(message?.trim() || "Invalid or expired code");
        setDigits(["", "", "", "", ""]);
        digitRefs.current[0]?.focus();
        return;
      }

      router.replace("/login");
    } catch {
      setErrorMessage("Unable to connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < 4) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !digits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 16,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.logo}
        />
        <Text style={styles.subtitle1}>Forgot your</Text>
        <Text style={styles.subtitle2}>password?</Text>

        {awaitingCode ? (
          <>
            <Text style={styles.codeHint}>
              Enter the 5-digit code sent to {email}, then choose a new password
            </Text>
            <View style={styles.codeRow}>
              {digits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    digitRefs.current[index] = ref;
                  }}
                  style={styles.codeDigit}
                  value={digit}
                  onChangeText={(value) => handleDigitChange(index, value)}
                  onKeyPress={({ nativeEvent }) =>
                    handleDigitKeyPress(index, nativeEvent.key)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  autoFocus={index === 0}
                  selectTextOnFocus
                  editable={!submitting}
                />
              ))}
            </View>
            <TextInput
              placeholder="New password"
              placeholderTextColor="#8a8a8a"
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!submitting}
            />
            <TextInput
              placeholder="Confirm new password"
              placeholderTextColor="#8a8a8a"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!submitting}
            />
            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
            <TouchableOpacity
              style={styles.button}
              onPress={handleResetPassword}
              disabled={submitting}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 17,
                }}
              >
                Reset password
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              placeholder="Email@email.edu"
              placeholderTextColor="#8a8a8a"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!submitting}
            />
            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSendCode}
              disabled={submitting}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 17,
                }}
              >
                Send code
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.sidebyside}>
          <Text style={styles.normaltext}>Remember your password?</Text>
          <Pressable
            onPress={() => router.push("/login")}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          >
            {({ pressed }) => (
              <Text style={[styles.urltext, pressed && { color: "purple" }]}>
                Log in
              </Text>
            )}
          </Pressable>
        </View>
        <Text style={styles.copyright}>
          @ 2026 Emory Hacks. All rights reserved
        </Text>
      </ScrollView>
    </View>
  );
}
