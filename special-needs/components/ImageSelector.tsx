import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

interface ImageSelectorProps {
  onImageSelected: (uri: string | null) => void;
}

export default function ImageSelector({ onImageSelected }: ImageSelectorProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission is required to access files.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      Image.getSize(uri, (width, height) => {
        const maxWidth = screenWidth - 40; // safe margin for layout
        const scale = width > maxWidth ? maxWidth / width : 1;
        setImageSize({
          width: width * scale * 0.25,
          height: height * scale * 0.25,
        });
        setImageUri(uri);
        onImageSelected(uri);
      });
    }
  };

  const removeImage = () => {
    setImageUri(null);
    setImageSize(null);
    onImageSelected(null);
  };

  const containerStyle = [
    styles.container,
    imageSize
      ? { height: imageSize.height + 20 } // 20 for padding
      : { height: 40 }, // same as input
  ];

  return (
    <TouchableOpacity onPress={pickImage} activeOpacity={0.9}>
      <View style={containerStyle}>
        {imageUri && imageSize ? (
          <>
            <Image
              source={{ uri: imageUri }}
              style={{
                width: "100%",
                height: imageSize.height,
                borderRadius: 8,
                resizeMode: "contain",
              }}
            />
            <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.placeholder}>Click to upload an image</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    justifyContent: "center",
    backgroundColor: "#F9F9F9",
    width: "100%",
    position: "relative",
  },
  placeholder: {
    color: "#777",
    textAlign: "center",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "white",
    borderRadius: 10,
  },
});
