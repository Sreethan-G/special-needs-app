import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

export default function Settings() {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { userId } = useAuth();
  const { logout } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);

  const [location, setLocation] = useState({
    address: "",
    city: "",
    state: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedMessageVisible, setSavedMessageVisible] = useState(false);

  const handleImagePick = async () => {
    try {
      const response = await launchImageLibrary({ mediaType: "photo" });

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (!asset.uri) {
          alert("Selected image has no URI.");
          return;
        }

        // Upload to Cloudinary using your utility function
        const cloudinaryUrl = await uploadToCloudinary(asset.uri);

        if (cloudinaryUrl) {
          setProfilePic(cloudinaryUrl);
        } else {
          alert("Failed to upload image to Cloudinary.");
        }
      }
    } catch (error) {
      console.error("Error picking or uploading image:", error);
      alert("Error picking or uploading image.");
    }
  };

  // ------------------ FETCH USER ------------------
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const { data: user } = await axios.get(
          `http://localhost:3001/api/users/${userId}`
        );

        setUsername(user.username || "");
        setEmail(user.email || "");
        setProfilePic(user.profilePicUrl || null);
        setLocation({
          address: user.location?.address || "",
          city: user.location?.city || "",
          state: user.location?.state || "",
        });
      } catch (err) {
        console.error("Failed to load user data:", err);
      }
    };

    fetchUser();
  }, [userId]);

  // ------------------ GENERIC UPDATE ------------------
  const updateUser = async (updateData: any, closeModal = false) => {
    if (!userId) {
      alert("User not logged in");
      return;
    }

    setIsSaving(true);
    try {
      const { data } = await axios.patch(
        `http://localhost:3001/api/users/${userId}`,
        updateData
      );
      const updatedUser = data.user;

      if (updatedUser) {
        setUsername(updatedUser.username || "");
        setEmail(updatedUser.email || "");
        setProfilePic(updatedUser.profilePicUrl || null);
        setLocation({
          address: updatedUser.location?.address || "",
          city: updatedUser.location?.city || "",
          state: updatedUser.location?.state || "",
        });
      }

      setIsSaving(false);
      setSavedMessageVisible(true);
      if (closeModal) setModalVisible(false);

      setTimeout(() => setSavedMessageVisible(false), 1500);
    } catch (err) {
      setIsSaving(false);
      console.error("Failed to update user:", err);
      alert("Failed to save changes.");
    }
  };

  // ------------------ SAVE LOCATION ONLY ------------------
  const handleSaveLocation = () => updateUser({ location }, true);

  // ------------------ SAVE ENTIRE USER ------------------
  const handleSave = () =>
    updateUser({
      username,
      email,
      password,
      profilePicUrl: profilePic,
      location,
    });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Account Settings</Text>
      <TouchableOpacity onPress={handleImagePick}>
        <Text style={styles.biggerLabel}>Profile Picture</Text>
        <Image
          source={
            profilePic
              ? { uri: profilePic }
              : require("@/assets/images/adaptive-icon.png")
          }
          style={styles.profilePic}
        />
      </TouchableOpacity>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Location</Text>
        <View style={styles.locContainer}>
          <TouchableOpacity
            style={styles.locationBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.locationText}>
              {location?.address || location?.city || location?.state
                ? `${location.address}, ${location.city}, ${location.state}`
                : "Click to select location"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="white" />
        ) : savedMessageVisible ? (
          <Text style={styles.saveButtonText}>Changes saved!</Text>
        ) : (
          <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logOutBtn}
        onPress={() => {
          logout();
          router.replace({ pathname: "/login" });
        }}
      >
        <Text style={styles.saveButtonText}>LOG OUT</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity
        style={styles.contactBtn}
        onPress={() => router.push({ pathname: "/contact-us" })}
      >
        <Text style={styles.saveButtonText}>CONTACT US</Text>
      </TouchableOpacity> */}

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Location</Text>

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.inputModal}
              value={location.address}
              onChangeText={(text) =>
                setLocation({ ...location, address: text })
              }
            />
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.inputModal}
              value={location.city}
              onChangeText={(text) => setLocation({ ...location, city: text })}
            />
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.inputModal}
              value={location.state}
              onChangeText={(text) => setLocation({ ...location, state: text })}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSaveLocation} // saves location to DB
                disabled={isSaving}
              >
                <Text style={styles.buttonText}>SUBMIT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "lightgreen",
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 20,
  },
  profilePic: {
    width: 200,
    height: 200,
    borderRadius: 120,
    backgroundColor: "#ccc",
    marginTop: 3,
    marginBottom: 20,
  },
  changePicText: {
    color: "#007AFF",
    marginBottom: 20,
    fontSize: 14,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "left",
  },
  biggerLabel: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#388E3C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "stretch",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 5,
  },
  logOutBtn: {
    backgroundColor: "#D32F2F",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "stretch",
    alignItems: "center",
    marginBottom: 20,
  },
  contactBtn: {
    backgroundColor: "#8595FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "stretch",
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  locContainer: {
    flexDirection: "column",
    width: "100%",
  },
  locationBtn: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  locationText: {
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
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
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
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
});
