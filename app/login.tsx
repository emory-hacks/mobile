import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  let colorScheme = useColorScheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "stretch",
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
      borderWidth: 1,
      padding: 10,
      borderColor: colorScheme === "dark" ? "white" : "black",
      borderRadius: 9,
      fontSize: 16,
      color: "gray",
    },
    subtitle: {
      width: "80%",
      fontSize: 20,
      color: colorScheme === "dark" ? "white" : "black",
      marginBottom: 15,
      marginLeft: 10,
    },
    normaltext: {
      marginTop: 25,
      fontSize: 10,
      color: colorScheme === "dark" ? "lightgray" : "gray",
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
      margin: 40,
      width: 85,
      height: 85,
      borderRadius: 100,
    },
    button: {
      marginTop: 10,
      borderRadius: 9,
      borderColor: "blue",
      backgroundColor: "#007AFF",
      padding: 15,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.subcontainer}>
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.logo}
        />
        <Text style={styles.subtitle}>Login to your Account</Text>
        <TextInput placeholder="Username" style={styles.input} />
        <TextInput placeholder="Password" style={styles.input} />
        {errorMessage && <Text style={{ color: "red" }}>{errorMessage}</Text>}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setErrorMessage(null);
            router.replace("/(tabs)");
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Login</Text>
        </TouchableOpacity>
        <View style={styles.sidebyside}>
          <Text style={styles.normaltext}>Don't have an account?</Text>
          <Pressable
            onPress={() => Linking.openURL("https://google.com")}
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
