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

export default function ForgotPassword() {
  const [emailAddress, setEmailAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const handleSubmit = async () => {
    setEmailError("");

    if (!emailAddress) {
      setEmailError("Email is required");
      return;
    } else if (!validateEmail(emailAddress)) {
      setEmailError("Invalid email format");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3001/api/users/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailAddress }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setEmailError(data.error || "Failed to send reset code");
      } else {
        // success → move to reset-password screen, pass email along
        router.push({
          pathname: "/reset-password",
          params: { email: emailAddress },
        });
      }
    } catch (error) {
      setEmailError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      <TextInput
        style={[styles.input, emailError ? styles.errorInput : null]}
        placeholder="Email Address"
        value={emailAddress}
        onChangeText={(text) => {
          setEmailAddress(text);
          setEmailError("");
        }}
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError.trim() !== "" && (
        <Text style={styles.errorText}>{emailError}</Text>
      )}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Sending..." : "Send Reset Code"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.primaryButtonText}>Back To Login</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 42,
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
    marginBottom: 15,
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
    flex: 1,
    backgroundColor: "#66bb6a",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#8bc34a",
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#388e3c",
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  buttonRow: {
    flexDirection: "row",
    width: "65%",
    marginBottom: 15,
  },
});
