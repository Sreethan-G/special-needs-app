import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

interface ContactFormProps {
  apiUrl: string; // Backend endpoint for contact form
}

export default function ContactForm({ apiUrl }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    setSuccessMsg("");
    setErrorMsg("");

    // Validate inputs
    if (!name || !email || !message) {
      setErrorMsg("All fields are required.");
      return;
    }
    if (!validateEmail(email)) {
      setErrorMsg("Invalid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("Message sent successfully!");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setErrorMsg(data.error || "Failed to send message.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.header}>Submission Form</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={(text) => {
            setName(text);
            setErrorMsg("");
          }}
          style={styles.input}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorMsg("");
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Message</Text>
        <TextInput
          value={message}
          onChangeText={(text) => {
            setMessage(text);
            setErrorMsg("");
          }}
          multiline
          numberOfLines={4}
          style={[styles.input, { height: 100 }]}
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>SEND MESSAGE</Text>
        )}
      </TouchableOpacity>

      {successMsg !== "" && (
        <Text style={styles.successText}>{successMsg}</Text>
      )}
      {errorMsg !== "" && <Text style={styles.errorText}>{errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#145A32",
    marginBottom: 10,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: screenWidth < 600 ? "80%" : "50%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  inputGroup: { width: "100%", marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  submitButton: {
    backgroundColor: "#66bb6a",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  submitButtonText: {
    color: "white",
    fontSize: 14,
  },
  successText: {
    color: "green",
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
  },
});
