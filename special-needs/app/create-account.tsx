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

export default function CreateAccount() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCreateAccount = async () => {
    setEmailError("");
    setUsernameError("");
    setPasswordError("");

    let hasError = false;

    if (!email) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email");
      hasError = true;
    }

    if (!username) {
      setUsernameError("Username is required");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, profilePicUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmail("");
        setUsername("");
        setPassword("");
        setProfilePicUrl("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        if (data.error?.includes("Email"))
          setEmailError("Email already in use");
        else if (data.error?.includes("username"))
          setUsernameError("Username taken");
        else {
          setEmailError(" ");
          setUsernameError(" ");
          setPasswordError(" ");
        }
      }
    } catch (error: unknown) {
      setEmailError(" ");
      setUsernameError(" ");
      setPasswordError(" ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={[styles.input, emailError ? styles.errorInput : null]}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailError("");
        }}
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {emailError.trim() !== "" && (
        <Text style={styles.errorText}>{emailError}</Text>
      )}

      <TextInput
        style={[styles.input, usernameError ? styles.errorInput : null]}
        placeholder="Username"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          setUsernameError("");
        }}
        placeholderTextColor="#888"
        autoCapitalize="none"
      />
      {usernameError.trim() !== "" && (
        <Text style={styles.errorText}>{usernameError}</Text>
      )}

      <TextInput
        style={[styles.input, passwordError ? styles.errorInput : null]}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setPasswordError("");
        }}
        placeholderTextColor="#888"
      />
      {passwordError.trim() !== "" && (
        <Text style={styles.errorText}>{passwordError}</Text>
      )}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleCreateAccount}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : success ? (
          <Text style={styles.primaryButtonText}>Account created!</Text>
        ) : (
          <Text style={styles.primaryButtonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.primaryButtonText}>Back To Login</Text>
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
    marginBottom: 20,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: "65%",
    marginBottom: 10,
    elevation: 2,
    fontSize: 16,
  },
  errorInput: {
    borderWidth: 2,
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 14,
  },
  primaryButton: {
    width: "65%",
    backgroundColor: "#66bb6a",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  secondaryBtn: {
    width: "65%",
    backgroundColor: "#388e3c",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
