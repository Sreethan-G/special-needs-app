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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const handleSubmit = async () => {
    setEmailError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    let hasError = false;

    if (!emailAddress) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!validateEmail(emailAddress)) {
      setEmailError("Invalid email format");
      hasError = true;
    }

    if (!newPassword) {
      setNewPasswordError("New password is required");
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your new password");
      hasError = true;
    } else if (newPassword && confirmPassword !== newPassword) {
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3001/api/users/reset-password",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailAddress,
            newPassword: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes("email")) {
          setEmailError(data.error);
        } else {
          // generic fallback error
          setEmailError("Failed to reset password");
        }
      } else {
        // Success - clear fields
        setEmailAddress("");
        setNewPassword("");
        setConfirmPassword("");
        // Optionally: show success message or redirect
        router.push("/login");
      }
    } catch (error) {
      setEmailError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>

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

      <TextInput
        style={[styles.input, newPasswordError ? styles.errorInput : null]}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={(text) => {
          setNewPassword(text);
          setNewPasswordError("");
        }}
        placeholderTextColor="#888"
      />
      {newPasswordError.trim() !== "" && (
        <Text style={styles.errorText}>{newPasswordError}</Text>
      )}

      <TextInput
        style={[styles.input, confirmPasswordError ? styles.errorInput : null]}
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          setConfirmPasswordError("");
        }}
        placeholderTextColor="#888"
      />
      {confirmPasswordError.trim() !== "" && (
        <Text style={styles.errorText}>{confirmPasswordError}</Text>
      )}

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? "Updating..." : "Submit"}
        </Text>
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
    width: "65%",
    backgroundColor: "#66bb6a",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  disabledButton: {
    backgroundColor: "#8bc34a",
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
