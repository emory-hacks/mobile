import { API_BASE_URL } from "@/constants/computer-ip";
import {
  Fredoka_600SemiBold,
  Fredoka_700Bold,
  useFonts,
} from "@expo-google-fonts/fredoka";
import { Image as ExpoImage } from "expo-image";
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

export default function Signup() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const digitRefs = useRef<(TextInput | null)[]>([]);
  const [fontsLoaded] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#a9ea97",
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
      fontSize: 10,
      color: "black",
    },
    urltext: {
      marginLeft: 5,
      marginTop: 25,
      fontSize: 10,
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
    orRow: {
      width: "80%",
      flexDirection: "row",
      alignItems: "center",
      marginTop: 28,
      marginBottom: 20,
    },
    orLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: "#c8c8c8",
    },
    orText: {
      marginHorizontal: 14,
      fontSize: 15,
      color: "#111",
    },
    socialRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 36,
    },
    socialButton: {
      padding: 4,
    },
    socialIcon: {
      width: 28,
      height: 28,
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

  const isEduEmail = (value: string) =>
    value.trim().slice(-4).toLowerCase() === ".edu";

  const invalidPassword = (password: string) => {
    let hasAlpha = false; // anything that's alphabetic
    let hasNumber = false; // anything that's a number
    let hasSpecial = false; // anything that's not alphanumeric nor number
    for (let letter of password) {
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

  const formatCurtime = () => new Date().toISOString().slice(0, 19);

  const verifyAndRegister = async (code: string) => {
    if (verifying) {
      return;
    }
    setVerifying(true);
    setErrorMessage(null);

    try {
      const verifyResponse = await fetch(
        `${API_BASE_URL}/api/verify-user-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            inputted_code: code,
            curtime: formatCurtime(),
          }),
        },
      );

      if (!verifyResponse.ok) {
        setErrorMessage("Invalid or expired code");
        setDigits(["", "", "", "", ""]);
        digitRefs.current[0]?.focus();
        return;
      }

      const registerResponse = await fetch(
        `${API_BASE_URL}/api/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password, inputted_code: code }),
        },
      );

      if (!registerResponse.ok) {
        setErrorMessage("Signup failed");
        return;
      }

      router.replace("/login");
    } catch {
      setErrorMessage("Unable to connect to server");
    } finally {
      setVerifying(false);
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

    if (digit && next.every((d) => d !== "")) {
      verifyAndRegister(next.join(""));
    }
  };

  const handleDigitKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !digits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  const handleSignup = async () => {
    setErrorMessage(null);

    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (!isEduEmail(email)) {
      setErrorMessage("Your email should be .edu");
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
      setAwaitingCode(true);
    } catch {
      setErrorMessage("Unable to connect to server");
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
        <Text style={styles.subtitle1}>Welcome to</Text>
        <Text style={styles.subtitle2}>Emory Hacks !</Text>

        {awaitingCode ? (
          <>
            <Text style={styles.codeHint}>
              Enter the 5-digit code sent to {email}
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
                  editable={!verifying}
                />
              ))}
            </View>
            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
          </>
        ) : (
          <>
            <TextInput
              placeholder="@Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Email@email.edu"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Password"
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              placeholder="Check the password"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 17,
                }}
              >
                Create an account
              </Text>
            </TouchableOpacity>
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.orLine} />
            </View>
            <View style={styles.socialRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign up with Google"
                style={({ pressed }) => [
                  styles.socialButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {}}
              >
                <ExpoImage
                  source={require("../assets/images/google-icon.svg")}
                  style={styles.socialIcon}
                  contentFit="contain"
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign up with Apple"
                style={({ pressed }) => [
                  styles.socialButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {}}
              >
                <ExpoImage
                  source={require("../assets/images/apple-icon.svg")}
                  style={styles.socialIcon}
                  contentFit="contain"
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign up with GitHub"
                style={({ pressed }) => [
                  styles.socialButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {}}
              >
                <ExpoImage
                  source={require("../assets/images/github-icon.svg")}
                  style={styles.socialIcon}
                  contentFit="contain"
                />
              </Pressable>
            </View>
          </>
        )}

        <View style={styles.sidebyside}>
          <Text style={styles.normaltext}>Already have an account?</Text>
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
