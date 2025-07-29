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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/users/${userId}`
        );
        const user = response.data;
        setUsername(user.username);
        setEmail(user.email);
        setProfilePic(user.profilePicUrl || null);
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleSave = async () => {
    if (!userId) {
      alert("User not logged in");
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        username,
        email,
        password,
        profilePicUrl: profilePic, // make sure this is a URL (Cloudinary, etc.)
      };

      console.log("Saving to:", `http://localhost:3001/api/users/${userId}`);

      const response = await axios.patch(
        `http://localhost:3001/api/users/${userId}`,
        updateData
      );

      console.log("Updated user:", response.data);

      setIsSaving(false);
      setSavedMessageVisible(true);

      setTimeout(() => {
        setSavedMessageVisible(false);
      }, 1500);
    } catch (error) {
      setIsSaving(false);
      console.error("Failed to update user:", error);
      alert("Failed to save changes.");
    }
  };

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

      <TouchableOpacity
        style={styles.contactBtn}
        onPress={() => router.push({ pathname: "/contact-us" })}
      >
        <Text style={styles.saveButtonText}>CONTACT US</Text>
      </TouchableOpacity>
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
    marginBottom: 30,
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
    marginBottom: 25,
  },
  logOutBtn: {
    backgroundColor: "#D32F2F",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "stretch",
    alignItems: "center",
    marginBottom: 25,
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
});
