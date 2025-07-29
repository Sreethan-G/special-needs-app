import { useState } from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  Button,
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import Card from "@/components/Card";
import Dropdown from "@/components/Dropdown";
import { useRouter } from "expo-router";
import ImageSelector from "@/components/ImageSelector";
import axios from "axios";
import { useEffect } from "react";
import { Resource } from "@/components/types/Resource";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { useAuth } from "@/contexts/AuthContext";
import { ReviewType } from "@/components/types/ReviewType";

export default function Index() {
  const router = useRouter();

  const handlePress = (
    resourceId: string,
    image: string,
    title: string,
    location: string,
    contact: string,
    type: string,
    languages?: string,
    website?: string,
    notes?: string
  ) => {
    router.push({
      pathname: "/info",
      params: {
        resourceId,
        image,
        title,
        location,
        contact,
        type,
        languages,
        website,
        notes,
      },
    });
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    contact: "",
    languages: "",
    website: "",
    notes: "",
    image: "",
    type: "",
  });

  const searchOptions = [
    { label: "ABA Therapy Centers", value: "ABA Therapy Center" },
    { label: "Advocacy and Support", value: "Advocacy and Support" },
    {
      label: "Comprehensive Therapy Centers",
      value: "Comprehensive Therapy Center",
    },
    { label: "Family Support Services", value: "Family Support Service" },
    { label: "Medical Centers", value: "Medical Center" },
    { label: "Occupational Therapy", value: "Occupational Therapy" },
    { label: "Parent Support Groups", value: "Parent Support Group" },
    { label: "Sensory Therapy", value: "Sensory Therapy" },
    { label: "Special Education Schools", value: "Special Education School" },
    { label: "Miscellaneous", value: "Miscellaneous" },
    { label: "All", value: "All" },
  ];

  const modalOptions = [
    { label: "ABA Therapy Centers", value: "ABA Therapy Center" },
    { label: "Advocacy and Support", value: "Advocacy and Support" },
    {
      label: "Comprehensive Therapy Centers",
      value: "Comprehensive Therapy Center",
    },
    { label: "Family Support Services", value: "Family Support Service" },
    { label: "Medical Centers", value: "Medical Center" },
    { label: "Occupational Therapy", value: "Occupational Therapy" },
    { label: "Parent Support Groups", value: "Parent Support Group" },
    { label: "Sensory Therapy", value: "Sensory Therapy" },
    { label: "Special Education Schools", value: "Special Education School" },
    { label: "Miscellaneous", value: "Miscellaneous" },
  ];

  const [selectedType, setSelectedType] = useState("All");

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // First upload image to Cloudinary
      const uploadedImageUrl = await uploadToCloudinary(formData.image);

      if (!uploadedImageUrl) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          image: "Image upload failed.",
        }));
        return;
      }

      // Replace local URI with cloud URL
      const finalFormData = {
        ...formData,
        image: uploadedImageUrl,
      };

      // Then submit form with Cloudinary URL
      await axios.post("http://localhost:3001/api/resources", finalFormData);
      setModalVisible(false);
      setFormData({
        name: "",
        location: "",
        contact: "",
        languages: "",
        website: "",
        notes: "",
        image: "",
        type: "",
      });
      setErrors({});
    } catch (err) {
      console.error("Error submitting resource:", err);
    }
  };

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.location.trim()) newErrors.location = "Address is required";
    if (!formData.contact.trim()) newErrors.contact = "Contact is required";
    if (!formData.image.trim()) newErrors.image = "Image URL is required";
    if (!formData.type.trim()) newErrors.type = "Type is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const [imageUri, setImageUri] = useState<string | null>(null);

  const [resources, setResources] = useState<Resource[]>([]);

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const { userId } = useAuth();

  useEffect(() => {
    console.log("Current userId:", userId);
    const fetchResources = async () => {
      try {
        const resourcesRes = await axios.get(
          "http://localhost:3001/api/resources"
        );
        setResources(resourcesRes.data);

        if (userId) {
          const favoritesRes = await axios.get(
            `http://localhost:3001/api/users/${userId}/favorites`
          );
          setFavoriteIds(favoritesRes.data);
        } else {
          setFavoriteIds([]); // no user, no favorites
        }
      } catch (error) {
        console.error("Failed to fetch resources or favorites:", error);
      }
    };

    fetchResources();
  }, [userId]);

  const filteredResources =
    selectedType === "All"
      ? resources
      : resources.filter((r) => r.type === selectedType);

  const toggleFavorite = async (resource: Resource) => {
    try {
      if (!userId) {
        alert("Please log in to favorite resources.");
        return;
      }

      const url = `http://localhost:3001/api/users/${userId}/favorites`;
      console.log("PATCH URL:", url);

      // Call backend to toggle favorite for user
      const response = await axios.patch(
        `http://localhost:3001/api/users/${userId}/favorites`,
        {
          resourceId: resource._id,
        }
      );

      const isFavNew = response.data.isFav;

      setFavoriteIds((prev) =>
        isFavNew
          ? [resource._id, ...prev.filter((id) => id !== resource._id)]
          : prev.filter((id) => id !== resource._id)
      );
    } catch (error) {
      console.error("Failed to update favorite status:", error);
    }
  };

  const [reviews, setReviews] = useState<ReviewType[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/reviews");
        setReviews(res.data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  const getAverageRating = (resourceId: string): number | undefined => {
    const resourceReviews = reviews.filter(
      (review) => String(review.resourceId) === String(resourceId)
    );

    if (resourceReviews.length === 0) return undefined;

    const total = resourceReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    return parseFloat((total / resourceReviews.length).toFixed(1));
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.bigTitle}>Welcome to the Special Needs App!</Text>
        <Text style={styles.title}>My Favorites</Text>
        <View style={styles.cardPane}>
          {favoriteIds.length === 0 ? (
            <Text>No favorites yet.</Text>
          ) : (
            resources
              .filter((resource) => favoriteIds.includes(resource._id))
              .map((resource) => (
                <Card
                  key={resource._id}
                  image={{
                    uri: resource.image || "https://via.placeholder.com/200",
                    width: 200,
                    height: 200,
                  }}
                  title={resource.name}
                  location={resource.location}
                  contact={resource.contact}
                  style={styles.card}
                  isFavorite={true}
                  onToggleFavorite={() => toggleFavorite(resource)}
                  onPress={() =>
                    handlePress(
                      resource._id,
                      resource.image || "",
                      resource.name,
                      resource.location,
                      resource.contact,
                      resource.type,
                      resource.languages,
                      resource.website,
                      resource.notes
                    )
                  }
                  averageRating={getAverageRating(resource._id)}
                />
              ))
          )}
        </View>

        <Text style={styles.title}>Available Resources</Text>
        <View style={styles.cardPane}>
          {filteredResources.map((resource) => (
            <Card
              key={resource._id}
              image={{
                uri: resource.image || "https://via.placeholder.com/200",
                width: 200,
                height: 200,
              }}
              title={resource.name}
              location={resource.location}
              contact={resource.contact}
              style={styles.card}
              isFavorite={favoriteIds.includes(resource._id)}
              onToggleFavorite={() => toggleFavorite(resource)}
              onPress={() =>
                handlePress(
                  resource._id,
                  resource.image || "",
                  resource.name,
                  resource.location,
                  resource.contact,
                  resource.type,
                  resource.languages,
                  resource.website,
                  resource.notes
                )
              }
              averageRating={getAverageRating(resource._id)}
            />
          ))}
        </View>

        <Dropdown
          options={searchOptions}
          placeholder="Search for a specific resource type"
          onSelect={(option) => setSelectedType(String(option.value))}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>ADD RESOURCE</Text>
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modalContent}>
              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.modalTitle}>Add New Resource</Text>
                <Text style={styles.modalText}>Name*</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={(text) => handleChange("name", text)}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
                <Text style={styles.modalText}>Address*</Text>
                <TextInput
                  style={[styles.input, errors.location && styles.inputError]}
                  value={formData.location}
                  onChangeText={(text) => handleChange("location", text)}
                />
                {errors.location && (
                  <Text style={styles.errorText}>{errors.location}</Text>
                )}
                <Text style={styles.modalText}>Contact*</Text>
                <TextInput
                  style={[styles.input, errors.contact && styles.inputError]}
                  value={formData.contact}
                  onChangeText={(text) => handleChange("contact", text)}
                />
                {errors.contact && (
                  <Text style={styles.errorText}>{errors.contact}</Text>
                )}
                <Text style={styles.modalText}>Languages Supported</Text>
                <TextInput
                  style={styles.input}
                  value={formData.languages}
                  onChangeText={(text) => handleChange("languages", text)}
                />
                <Text style={styles.modalText}>Website Link</Text>
                <TextInput
                  style={styles.input}
                  value={formData.website}
                  onChangeText={(text) => handleChange("website", text)}
                />
                <Text style={styles.modalText}>Notes</Text>
                <TextInput
                  style={styles.input}
                  value={formData.notes}
                  onChangeText={(text) => handleChange("notes", text)}
                />
                <Text style={styles.modalText}>Image*</Text>
                <ImageSelector
                  onImageSelected={(uri) => {
                    console.log("Selected Image URI:", uri);
                    setImageUri(uri);
                    setFormData((prev) => {
                      const newFormData = { ...prev, image: uri || "" };
                      console.log("Updated formData with image:", newFormData);
                      return newFormData;
                    });
                  }}
                />

                {errors.image && (
                  <Text style={styles.errorText}>{errors.image}</Text>
                )}
                <Text style={styles.modalText}>Resource Type*</Text>
                <Dropdown
                  options={modalOptions}
                  placeholder="—"
                  onSelect={(option) =>
                    handleChange("type", String(option.value))
                  }
                />
                {errors.type && (
                  <Text style={styles.errorText}>{errors.type}</Text>
                )}

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.buttonText}>SUBMIT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setModalVisible(false);
                      setErrors({});
                    }}
                  >
                    <Text style={styles.buttonText}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/settings" })}
        style={styles.gearIconButton}
      >
        <Image
          source={require("@/assets/images/gear-icon.png")}
          style={styles.gearIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1 },
  container: {
    flexGrow: 1,
    backgroundColor: "lightgreen",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cardPane: {
    flexWrap: "wrap",
    flexDirection: "row",
    minHeight: 300,
  },
  card: {
    marginRight: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
  },
  bigTitle: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 15,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    minWidth: "85%",
    maxHeight: "80%",
    borderRadius: 15,
    padding: 20,
    elevation: 10,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
  buttonRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  submitButton: {
    backgroundColor: "#388E3C",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: "#D32F2F",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  button: {
    backgroundColor: "darkgreen",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  errorText: {
    color: "red",
    marginTop: -8,
    marginBottom: 8,
  },
  inputError: {
    borderColor: "red",
  },
  gearIconButton: {
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 1000,
    padding: 5,
    borderRadius: 20,
  },
  gearIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
});
