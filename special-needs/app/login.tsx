import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { setUserId } = useAuth();
  const API_URL = "http://localhost:3001";
  const auth = getAuth();

  const handleLogin = async () => {
    let hasError = false;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is required.");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Password is required.");
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);

    try {
      // Step 1: Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      if (!firebaseUser) {
        setPasswordError("Firebase login failed.");
        return;
      }

      // Step 2: MongoDB login
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.field === "email")
          setEmailError(data.error || "Invalid email");
        else if (data.field === "password")
          setPasswordError(data.error || "Invalid password");
        else setPasswordError(data.error || "Login failed.");
        return;
      }

      if (data.user && data.user._id) {
        // Save MongoDB userId
        setUserId(data.user._id);
        router.push("/home");
      } else {
        setPasswordError("Login succeeded but user data is incomplete.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code && error.code.startsWith("auth/")) {
        // Firebase errors
        if (error.code === "auth/user-not-found")
          setEmailError("User not found in Firebase.");
        else if (error.code === "auth/wrong-password")
          setPasswordError("Incorrect password.");
        else setPasswordError("Firebase login error.");
      } else {
        setPasswordError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SpecialSearch</Text>
      <Text style={styles.subtitle}>
        An app to find special needs resources.
      </Text>

      <TextInput
        style={[styles.input, emailError && styles.inputError]}
        placeholder="Enter your email address"
        placeholderTextColor="#888"
        onChangeText={(text) => {
          setEmail(text);
          if (emailError) setEmailError("");
        }}
        value={email}
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <TextInput
        style={[styles.input, passwordError && styles.inputError]}
        placeholder="Enter your password"
        placeholderTextColor="#888"
        secureTextEntry
        onChangeText={(text) => {
          setPassword(text);
          if (passwordError) setPasswordError("");
        }}
        value={password}
      />
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}

      <TouchableOpacity onPress={() => router.push("/forgot-password")}>
        <Text style={styles.forgot}>Forgot your password?</Text>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButtonLeft}
          onPress={() => {
            setEmail("");
            setPassword("");
          }}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButtonRight}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/create-account")}
      >
        <Text style={styles.primaryButtonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d4f5d0",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#004d00",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 22,
    color: "#2e7d32",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: "65%",
    marginBottom: 15,
    elevation: 2,
    fontSize: 16,
  },
  forgot: {
    color: "#1b5e20",
    marginBottom: 20,
    textDecorationLine: "underline",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    width: "65%",
    marginBottom: 15,
  },
  secondaryButtonLeft: {
    flex: 1,
    backgroundColor: "#66bb6a",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  secondaryButtonRight: {
    flex: 1,
    backgroundColor: "#66bb6a",
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  primaryButton: {
    width: "65%",
    backgroundColor: "#388e3c",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
  },
  errorText: {
    color: "red",
    marginTop: -10,
    marginBottom: 10,
    fontSize: 14,
    alignSelf: "flex-start",
    paddingLeft: "18%",
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
});
