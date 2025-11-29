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
  SafeAreaView,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import Dropdown from "@/components/Dropdown";
import {
  getAuth,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

export default function Settings() {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { userId } = useAuth();
  const { logout } = useAuth();

  const usStates = [
    { label: "Alabama", value: "AL" },
    { label: "Alaska", value: "AK" },
    { label: "Arizona", value: "AZ" },
    { label: "Arkansas", value: "AR" },
    { label: "California", value: "CA" },
    { label: "Colorado", value: "CO" },
    { label: "Connecticut", value: "CT" },
    { label: "Delaware", value: "DE" },
    { label: "Florida", value: "FL" },
    { label: "Georgia", value: "GA" },
    { label: "Hawaii", value: "HI" },
    { label: "Idaho", value: "ID" },
    { label: "Illinois", value: "IL" },
    { label: "Indiana", value: "IN" },
    { label: "Iowa", value: "IA" },
    { label: "Kansas", value: "KS" },
    { label: "Kentucky", value: "KY" },
    { label: "Louisiana", value: "LA" },
    { label: "Maine", value: "ME" },
    { label: "Maryland", value: "MD" },
    { label: "Massachusetts", value: "MA" },
    { label: "Michigan", value: "MI" },
    { label: "Minnesota", value: "MN" },
    { label: "Mississippi", value: "MS" },
    { label: "Missouri", value: "MO" },
    { label: "Montana", value: "MT" },
    { label: "Nebraska", value: "NE" },
    { label: "Nevada", value: "NV" },
    { label: "New Hampshire", value: "NH" },
    { label: "New Jersey", value: "NJ" },
    { label: "New Mexico", value: "NM" },
    { label: "New York", value: "NY" },
    { label: "North Carolina", value: "NC" },
    { label: "North Dakota", value: "ND" },
    { label: "Ohio", value: "OH" },
    { label: "Oklahoma", value: "OK" },
    { label: "Oregon", value: "OR" },
    { label: "Pennsylvania", value: "PA" },
    { label: "Rhode Island", value: "RI" },
    { label: "South Carolina", value: "SC" },
    { label: "South Dakota", value: "SD" },
    { label: "Tennessee", value: "TN" },
    { label: "Texas", value: "TX" },
    { label: "Utah", value: "UT" },
    { label: "Vermont", value: "VT" },
    { label: "Virginia", value: "VA" },
    { label: "Washington", value: "WA" },
    { label: "West Virginia", value: "WV" },
    { label: "Wisconsin", value: "WI" },
    { label: "Wyoming", value: "WY" },
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<
    "email" | "password" | "location" | null
  >(null);

  const [location, setLocation] = useState({
    address: "",
    city: "",
    state: "",
  });

  const [modalError, setModalError] = useState(""); // error for email/password modal

  const [isSaving, setIsSaving] = useState(false);
  const [savedMessageVisible, setSavedMessageVisible] = useState(false);

  const [tempEmail, setTempEmail] = useState(""); // For email modal
  const [currentPassword, setCurrentPassword] = useState(""); // For both modals
  const [newPassword, setNewPassword] = useState(""); // For password modal

  const handleImagePick = async () => {
    try {
      const response = await launchImageLibrary({ mediaType: "photo" });

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (!asset.uri) {
          alert("Selected image has no URI.");
          return;
        }

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

  const handleSaveLocation = () => updateUser({ location }, true);

  const handleSaveEmail = async () => {
    if (!currentPassword) {
      setModalError("Please enter your current password.");
      return;
    }

    try {
      // First, verify with MongoDB
      const verifyRes = await axios.post(
        "http://localhost:3001/api/users/verify-password",
        { userId, password: currentPassword }
      );

      if (!verifyRes.data.success) {
        setModalError("Incorrect current password. Email not updated.");
        return;
      }

      // Reauthenticate with Firebase
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && user.email) {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);

        await firebaseUpdateEmail(user, tempEmail);
      }

      // Update MongoDB as usual
      await updateUser({ email: tempEmail });
      setModalVisible(false);
      setCurrentPassword("");
      setModalError("");
    } catch (err: any) {
      console.error(err);
      setModalError(
        err.message || "Failed to verify password. Email not updated."
      );
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword) {
      setModalError("Please enter your current password.");
      return;
    }

    try {
      // Verify MongoDB password
      const verifyRes = await axios.post(
        "http://localhost:3001/api/users/verify-password",
        { userId, password: currentPassword }
      );

      if (!verifyRes.data.success) {
        setModalError("Incorrect current password. Password not updated.");
        return;
      }

      // Reauthenticate and update Firebase password
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && user.email) {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);

        await firebaseUpdatePassword(user, newPassword);
      }

      // Update MongoDB as usual
      await updateUser({ password: newPassword });
      setModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setModalError("");
    } catch (err: any) {
      console.error(err);
      setModalError(
        err.message || "Failed to verify password. Password not updated."
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
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

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* Email Button */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => {
                setTempEmail(email);
                setModalType("email");
                setModalVisible(true);
              }}
            >
              <Text style={styles.inputButtonText}>{email}</Text>
            </TouchableOpacity>
          </View>

          {/* Password Button */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => {
                setModalType("password");
                setModalVisible(true);
              }}
            >
              <Text style={styles.inputButtonText}>••••••••</Text>
            </TouchableOpacity>
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.locContainer}>
              <TouchableOpacity
                style={styles.locationBtn}
                onPress={() => {
                  setModalType("location");
                  setModalVisible(true);
                }}
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
            onPress={() =>
              updateUser({
                username,
                profilePicUrl: profilePic,
                location,
              })
            }
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
            style={styles.homeButton}
            onPress={() => {
              router.replace({ pathname: "/home" });
            }}
          >
            <Text style={styles.saveButtonText}>RETURN TO HOME</Text>
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

          {/* Modal */}
          <Modal
            visible={modalVisible}
            transparent
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.overlay}>
              <View style={styles.modalContent}>
                {modalType === "location" && (
                  <>
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
                      onChangeText={(text) =>
                        setLocation({ ...location, city: text })
                      }
                    />
                    <Text style={styles.label}>State</Text>
                    <Dropdown
                      options={usStates}
                      placeholder="Select a state"
                      onSelect={(option) =>
                        setLocation({
                          ...location,
                          state: String(option.value),
                        })
                      }
                    />
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSaveLocation}
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
                  </>
                )}

                {modalType === "email" && (
                  <>
                    <Text style={styles.modalTitle}>Change Email</Text>
                    <Text style={styles.label}>New Email</Text>
                    <TextInput
                      style={styles.inputModal}
                      value={tempEmail}
                      onChangeText={setTempEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <Text style={styles.label}>Current Password</Text>
                    <TextInput
                      style={styles.inputModal}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry
                    />
                    {modalError !== "" && (
                      <Text
                        style={{
                          color: "red",
                          marginBottom: 10,
                          textAlign: "center",
                        }}
                      >
                        {modalError}
                      </Text>
                    )}
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSaveEmail}
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
                  </>
                )}

                {modalType === "password" && (
                  <>
                    <Text style={styles.modalTitle}>Change Password</Text>
                    <Text style={styles.label}>New Password</Text>
                    <TextInput
                      style={styles.inputModal}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                    />
                    <Text style={styles.label}>Current Password</Text>
                    <TextInput
                      style={styles.inputModal}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry
                    />
                    {modalError !== "" && (
                      <Text
                        style={{
                          color: "red",
                          marginBottom: 10,
                          textAlign: "center",
                        }}
                      >
                        {modalError}
                      </Text>
                    )}
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSavePassword}
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
                  </>
                )}
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "lightgreen",
    padding: 20,
    alignItems: "center",
  },
  title: { fontSize: 40, fontWeight: "bold", marginBottom: 20 },
  profilePic: {
    width: 200,
    height: 200,
    borderRadius: 120,
    backgroundColor: "#ccc",
    marginTop: 3,
    marginBottom: 20,
  },
  inputGroup: { width: "100%", marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
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
  inputButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  inputButtonText: { fontSize: 14 },
  saveButton: {
    backgroundColor: "#388E3C",
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "stretch",
    alignItems: "center",
    marginBottom: 20,
  },
  logOutBtn: {
    backgroundColor: "#D32F2F",
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "stretch",
    alignItems: "center",
    marginBottom: 20,
  },
  homeButton: {
    backgroundColor: "#6495ED",
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "stretch",
    alignItems: "center",
    marginBottom: 20,
  },
  saveButtonText: { color: "white", fontSize: 16 },
  locContainer: { flexDirection: "column", width: "100%" },
  locationBtn: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  locationText: { fontSize: 14 },
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
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
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
