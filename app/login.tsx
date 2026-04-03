import { useState } from "react";
import {
  Linking,
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
      color: colorScheme === "dark" ? "white" : "black",
    },
    urltext: {
      marginLeft: 5,
      marginTop: 25,
      fontSize: 10,
      color: "blue",
      textDecorationLine: "underline",
    },
    buttonText: {
      fontSize: 24,
      color: colorScheme === "dark" ? "white" : "black",
    },
    button: {
      backgroundColor: "green",
      padding: 12,
      borderRadius: 10,
      marginTop: 10,
    },
    sidebyside: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.subcontainer}>
        <Text style={styles.subtitle}>Login to your Account</Text>
        <TextInput placeholder="Username" style={styles.input} />
        <TextInput placeholder="Password" style={styles.input} />
        {errorMessage && <Text>{errorMessage}</Text>}
        <View style={styles.sidebyside}>
          <Text style={styles.normaltext}>Don't have an account?</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://google.com")}
          >
            <Text style={styles.urltext}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
