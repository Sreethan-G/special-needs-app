import ContactForm from "@/components/ContactForm";
import { router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Dimensions } from "react-native";
import { api } from "@/utils/api";

const screenWidth = Dimensions.get("window").width;
const isMobile = screenWidth < 600;

export default function ContactUs() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Contact Us</Text>
      <Text style={styles.subheader}>
        We’re here to help with any questions or concerns.
      </Text>

      <ContactForm apiUrl={api("/api/contact")} />

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => {
          router.replace({ pathname: "/home" });
        }}
      >
        <Text style={styles.buttonText}>RETURN TO HOME</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#D9F6D5",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#145A32",
    marginBottom: 10,
    textAlign: "center",
  },
  subheader: {
    fontSize: 18,
    color: "#2E7D32",
    marginBottom: 30,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    justifyContent: "center",
    width: screenWidth < 600 ? "80%" : "50%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#145A32",
  },
  link: {
    fontSize: 16,
    color: "#1B5E20",
    textDecorationLine: "underline",
  },
  homeButton: {
    backgroundColor: "#6495ED",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
    width: screenWidth < 600 ? "80%" : "50%",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});
