import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Dimensions } from "react-native";
import axios from "axios";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { api } from "@/utils/api";

const screenWidth = Dimensions.get("window").width;

export default function ForgotPassword() {
  const [emailAddress, setEmailAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());

  useEffect(() => {
    const timer: ReturnType<typeof setTimeout> = setTimeout(
      () => setSuccessMessage(""),
      4000
    );
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleSendResetEmail = async () => {
    setEmailError("");
    setSuccessMessage("");

    if (!emailAddress) return setEmailError("Email is required");
    if (!validateEmail(emailAddress))
      return setEmailError("Invalid email format");

    setLoading(true);
    try {
      // First, check if the email exists in MongoDB
      const response = await axios.post(api("/api/users/check-email"), {
        email: emailAddress,
      });

      if (!response.data.exists) {
        setEmailError("This email does not exist in our system.");
        return;
      }

      // Send Firebase password reset email
      await sendPasswordResetEmail(auth, emailAddress);

      setSuccessMessage(
        "Password reset email sent! Check your inbox and follow the instructions. If it's not there, check your spam folder."
      );
      setEmailAddress("");
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setEmailError(
        error?.message || "Failed to send reset email. Try again later."
      );
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
          setSuccessMessage("");
        }}
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {emailError.length > 0 && (
        <Text style={styles.errorText}>{emailError}</Text>
      )}

      {successMessage.length > 0 && (
        <Text style={styles.successText}>{successMessage}</Text>
      )}

      <View style={styles.buttonRowMain}>
        <TouchableOpacity
          style={[styles.primaryButtonMain, loading && styles.disabledButton]}
          onPress={handleSendResetEmail}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Sending..." : "Send Reset Email"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButtonMain}
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
    width: screenWidth < 600 ? "80%" : "65%",
    marginBottom: 15,
    fontSize: 16,
  },
  errorInput: { borderWidth: 2, borderColor: "red" },
  errorText: { color: "red", marginBottom: 10, fontSize: 14 },
  successText: { color: "green", marginBottom: 10, fontSize: 14 },
  buttonRowMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: screenWidth < 600 ? "80%" : "65%",
    marginVertical: 5,
  },
  primaryButtonMain: {
    flex: 1,
    backgroundColor: "#66bb6a",
    padding: 10,
    borderRadius: 8,
    marginRight: 5,
    alignItems: "center",
  },
  secondaryButtonMain: {
    flex: 1,
    backgroundColor: "#388e3c",
    padding: 10,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: "center",
  },
  primaryButtonText: { color: "white", fontSize: screenWidth < 600 ? 16 : 18 },
  disabledButton: { backgroundColor: "#8bc34a" },
});
