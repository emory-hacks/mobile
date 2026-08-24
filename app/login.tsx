import { API_BASE_URL } from "@/constants/computer-ip";
import {
  Fredoka_600SemiBold,
  Fredoka_700Bold,
  useFonts,
} from "@expo-google-fonts/fredoka";
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
import { saveEmail, saveJwt } from "../utils/auth-token";

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
      fontSize: 14,
      color: "black",
    },
    urltext: {
      marginLeft: 5,
      marginTop: 25,
      marginBottom: 100,
      fontSize: 14,
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
    forgotPasswordPressable: {
      alignSelf: "flex-end",
      marginRight: "10%",
      marginTop: 4,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: "#99c024",
    },
  });

  const handleLogin = async () => {
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter email and password");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setErrorMessage("Login failed");
        return;
      }

      const data = await response.json();
      const jwt = data.token;

      if (!jwt) {
        setErrorMessage("Login failed");
        return;
      }

      await saveJwt(jwt);
      await saveEmail(email);
      console.log(jwt);
      router.replace("/(tabs)/(home)");
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
          placeholder="Email@email.edu"
          placeholderTextColor="#8a8a8a"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#8a8a8a"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Pressable
          onPress={() => router.push("/forgot-password")}
          style={({ pressed }) => [
            styles.forgotPasswordPressable,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          {({ pressed }) => (
            <Text
              style={[
                styles.forgotPasswordText,
                pressed && { color: "purple" },
              ]}
            >
              Forgot password?
            </Text>
          )}
        </Pressable>
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
