import {
  Fredoka_600SemiBold,
  Fredoka_700Bold,
  useFonts,
} from "@expo-google-fonts/fredoka";
import { Image as ExpoImage } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "stretch",
      backgroundColor: "#fff",
    },
    subcontainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
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
      marginBottom: 100,
      fontSize: 10,
      color: "#99c024",
    },
    copyright: {
      fontSize: 10,
      color: "#a4a4a4",
      margin: 50,
    },
    sidebyside: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    logo: {
      width: "80%",
      height: 72,
      marginBottom: 50,
      marginTop: 125,
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
  });

  const computer_ip_address = ""; //for development, DON'T PUSH YOUR IP ADDRESS TO GITHUB!

  const handleLogin = async () => {
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter email and password");
      return;
    }

    try {
      const response = await fetch(
        `http://${computer_ip_address}:8080/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!response.ok) {
        setErrorMessage("Login failed");
        return;
      }

      const data = await response.json();
      const jwt = data.jwt;
      console.log(jwt);

      router.replace("/(tabs)");
    } catch {
      setErrorMessage("Unable to connect to server");
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.subcontainer}>
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.logo}
        />
        <Text style={styles.subtitle1}>Welcome to</Text>
        <Text style={styles.subtitle2}>Emory Hacks !</Text>
        <TextInput
          placeholder="Email@email.com"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {errorMessage && <Text style={{ color: "red" }}>{errorMessage}</Text>}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontSize: 17,
            }}
          >
            Sign in
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
            accessibilityLabel="Sign in with Google"
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
            accessibilityLabel="Sign in with Apple"
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
            accessibilityLabel="Sign in with GitHub"
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
        <View style={styles.sidebyside}>
          <Text style={styles.normaltext}>Don&apos;t have an account?</Text>
          <Pressable
            onPress={() => router.push("/signup")}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          >
            {({ pressed }) => (
              <Text style={[styles.urltext, pressed && { color: "purple" }]}>
                Sign up
              </Text>
            )}
          </Pressable>
        </View>
      </View>
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Text style={styles.copyright}>
          @ 2026 Emory Hacks. All rights reserved
        </Text>
      </View>
    </View>
  );
}
