import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";

export default function ForgotPassword() {
  const [emailAddress, setEmailAddress] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [otpVerified, setOtpVerified] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());

  // Send reset code
  const handleSendResetCode = async () => {
    setEmailError("");
    if (!emailAddress) return setEmailError("Email is required");
    if (!validateEmail(emailAddress))
      return setEmailError("Invalid email format");

    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:3001/api/users/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailAddress }),
        }
      );
      const data = await res.json();
      if (!res.ok) setEmailError(data.error || "Failed to send reset code");
      else setModalVisible(true);
    } catch {
      setEmailError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    setOtpError("");
    if (!otp) return setOtpError("Verification code is required");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/users/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailAddress, otp }),
      });
      const data = await res.json();
      if (!res.ok) setOtpError(data.error || "Invalid verification code");
      else {
        setOtpVerified(true);
        setModalVisible(false);
      }
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    setPasswordError("");
    if (!newPassword) return setPasswordError("New password is required");
    if (newPassword !== confirmPassword)
      return setPasswordError("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:3001/api/users/reset-password",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailAddress, otp, newPassword }),
        }
      );
      const data = await res.json();
      if (!res.ok) setPasswordError(data.error || "Reset failed");
      else router.push("/login");
    } catch {
      setPasswordError("Network error. Try again.");
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
        editable={!otpVerified}
      />
      {emailError.length > 0 && (
        <Text style={styles.errorText}>{emailError}</Text>
      )}

      {otpVerified && (
        <>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#888"
          />
          {passwordError.length > 0 && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}
        </>
      )}

      <View style={styles.buttonRowMain}>
        <TouchableOpacity
          style={[styles.primaryButtonMain, loading && styles.disabledButton]}
          onPress={otpVerified ? handleResetPassword : handleSendResetCode}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading
              ? otpVerified
                ? "Updating..."
                : "Sending..."
              : otpVerified
              ? "Reset Password"
              : "Send Reset Code"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButtonMain}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.primaryButtonText}>Back To Login</Text>
        </TouchableOpacity>
      </View>

      {/* OTP Modal */}
      <Modal
        visible={modalVisible}
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Verification Code</Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Verification Code"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              placeholderTextColor="#888"
            />
            {otpError.length > 0 && (
              <Text style={styles.errorText}>{otpError}</Text>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Verifying..." : "Verify Code"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 16,
  },
  errorInput: { borderWidth: 2, borderColor: "red" },
  errorText: { color: "red", marginBottom: 10, fontSize: 14 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "60%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "stretch",
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#004d00",
  },
  inputModal: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    fontSize: 14,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: "#388E3C",
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  buttonRowMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "65%",
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
  primaryButtonText: { color: "white", fontWeight: "bold", fontSize: 18 },
  disabledButton: { backgroundColor: "#8bc34a" },
});
