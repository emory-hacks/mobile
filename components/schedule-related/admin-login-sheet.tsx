import { signIn } from "@/services/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  onClose: () => void;
  onSignedIn: () => void;
  visible: boolean;
};

export function AdminLoginSheet({ onClose, onSignedIn, visible }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const close = () => {
    if (isSigningIn) return;
    setEmail("");
    setPassword("");
    setErrorMessage(null);
    onClose();
  };

  const handleSignIn = async () => {
    const nextEmail = email.trim();
    const nextPassword = password;

    if (!nextEmail || !nextPassword) {
      setErrorMessage("Enter your email and password.");
      return;
    }

    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      await signIn(nextEmail, nextPassword);
      setEmail("");
      setPassword("");
      onSignedIn();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={close}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <Pressable
          accessibilityLabel="Close sign in"
          onPress={close}
          style={styles.dismissArea}
        />
        <View style={styles.card}>
          <Text style={styles.heading}>Admin sign in</Text>
          <Text style={styles.note}>Only admins can edit events.</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#AFAFAF"
            spellCheck={false}
            style={styles.input}
            value={email}
          />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setPassword}
            onSubmitEditing={handleSignIn}
            placeholder="Password"
            placeholderTextColor="#AFAFAF"
            secureTextEntry
            spellCheck={false}
            style={styles.input}
            value={password}
          />
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
          <View style={styles.actions}>
            <Pressable
              disabled={isSigningIn}
              onPress={() => {
                Keyboard.dismiss();
                close();
              }}
              style={({ pressed }) => [
                styles.cancelButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={isSigningIn}
              onPress={handleSignIn}
              style={({ pressed }) => [
                styles.signInButton,
                { opacity: pressed || isSigningIn ? 0.7 : 1 },
              ]}
            >
              {isSigningIn ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signInButtonText}>Sign in</Text>
              )}
            </Pressable>
          </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    flex: 1,
    justifyContent: "flex-end",
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
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  dismissArea: {
    flex: 1,
  },
  errorText: {
    color: "#C93D2A",
    fontFamily: "AlanSans_400Regular",
    fontSize: 13,
    marginBottom: 12,
  },
  heading: {
    color: "#111111",
    fontFamily: "AlanSans_700Bold",
    fontSize: 20,
    marginBottom: 4,
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
  note: {
    color: "#777777",
    fontFamily: "AlanSans_400Regular",
    fontSize: 13,
    marginBottom: 16,
  },
  signInButton: {
    alignItems: "center",
    backgroundColor: "#A3CE26",
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 14,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontFamily: "AlanSans_700Bold",
    fontSize: 15,
  },
});
