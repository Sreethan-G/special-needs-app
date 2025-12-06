import { Platform } from "react-native";

const getMimeType = (uri: string) => {
  const extension = uri.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "heic":
      return "image/heic";      
    case "avif":
      return "image/avif";
    default:
      return "image/jpeg"; // fallback
  }
};

const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

export const uploadToCloudinary = async (imageUri: string): Promise<string | null> => {

  if (!imageUri) {
    console.error("No image URI provided for upload.");
    return null;
  }

  const mimeType = getMimeType(imageUri);
  const fileName = imageUri.split("/").pop() || `upload.${mimeType.split("/")[1]}`;

  const formData = new FormData();

  if (Platform.OS === "web") {
    // Convert URI to Blob for web
    try {
      const blob = await uriToBlob(imageUri);
      // Blob doesn't have 'name', so we wrap it in File
      const file = new File([blob], fileName, { type: mimeType });
      formData.append("file", file);
    } catch (error) {
      console.error("Failed to convert URI to Blob on web:", error);
      return null;
    }
  } else {
    // For native platforms, React Native supports this style object
    formData.append("file", {
      uri: imageUri,
      type: mimeType,
      name: fileName,
    } as any);
  }

  const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_PRESET || "";

  formData.append("upload_preset", UPLOAD_PRESET); // your unsigned preset name

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
        // Do NOT set 'Content-Type' header — fetch handles it for FormData
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("Upload succeeded:", result.secure_url);
      return result.secure_url;
    } else {
      console.error("Upload failed with response:", JSON.stringify(result, null, 2));
      alert("Upload failed: " + (result.error?.message || "Unknown error"));
      return null;
    }
  } catch (error: any) {
    console.error("Cloudinary upload error:", error.message || error);
    alert("Cloudinary upload failed: " + (error.message || error));
    return null;
  }
};
