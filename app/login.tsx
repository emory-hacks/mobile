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

export default function Login() {
  const [username, setUsername] = useState<string>("");
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
      margin: 8,
      borderWidth: 0,
      padding: 10,
      borderColor: "black",
      borderRadius: 9,
      fontSize: 16,
      color: "gray",
      backgroundColor: "#d0cece",
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
      marginBottom: 70,
    },
    normaltext: {
      marginTop: 25,
      fontSize: 10,
      color: "gray",
    },
    urltext: {
      marginLeft: 5,
      marginTop: 25,
      marginBottom: 100,
      fontSize: 10,
      color: "blue",
      textDecorationLine: "underline",
    },
    sidebyside: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    logo: {
      width: 230,
      height: 72,
      marginBottom: 50,
      resizeMode: "contain",
    },
    button: {
      width: "80%",
      marginTop: 20,
      borderRadius: 9,
      backgroundColor: "#A3CE26",
      padding: 10,
    },
  });

  const computer_ip_address = ""; //for development, DON'T PUSH YOUR IP ADDRESS TO GITHUB!

  const handleLogin = async () => {
    setErrorMessage(null);

    if (!username || !password) {
      setErrorMessage("Please enter username and password");
      return;
    }

    try {
      const response = await fetch(
        `http://${computer_ip_address}:8080/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: "token=put_jwt_place_hodler_here",
          },
          body: JSON.stringify({ username, password }),
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
          value={username}
          onChangeText={setUsername}
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
    </View>
  );
}
