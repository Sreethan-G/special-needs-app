import { SafeAreaView } from "react-native";
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
import { Dimensions } from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const screenWidth = Dimensions.get("window").width;
const isMobile = screenWidth < 600;

export default function Index() {
  const router = useRouter();
  const auth = getAuth();

  const { userId: mongoUserId, setUserId } = useAuth(); // MongoDB user ID
  const [firebaseUser, setFirebaseUser] = useState<any>(null); // Firebase user

  const handlePress = (
    resourceId: string,
    image: string,
    title: string,
    location: Resource["location"],
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
        location: JSON.stringify(location),
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
    location: {
      address: "",
      city: "",
      state: "",
      lat: "",
      lon: "",
    },
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

  const [selectedType, setSelectedType] = useState("All");

  const handleChange = (
    key: keyof typeof formData,
    value: string,
    subKey?: keyof typeof formData.location
  ) => {
    if (key === "location") {
      if (!subKey) {
        console.warn("Missing subKey for location update");
        return;
      }
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [subKey]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [key]: value,
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const uploadedImageUrl = await uploadToCloudinary(formData.image);

      if (!uploadedImageUrl) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          image: "Image upload failed.",
        }));
        return;
      }

      const finalFormData = {
        ...formData,
        image: uploadedImageUrl,
      };

      await axios.post("http://localhost:3001/api/resources", finalFormData);
      setModalVisible(false);
      setFormData({
        name: "",
        location: {
          address: "",
          city: "",
          state: "",
          lat: "",
          lon: "",
        },
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
    if (!formData.location.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.location.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.location.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.contact.trim()) newErrors.contact = "Contact is required";
    if (!formData.image.trim()) newErrors.image = "Image URL is required";
    if (!formData.type.trim()) newErrors.type = "Type is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const [imageUri, setImageUri] = useState<string | null>(null);

  const [resources, setResources] = useState<Resource[]>([]);

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        console.log("Firebase user detected:", user.email);
      } else {
        setUserId(null); // no MongoDB user
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const resourcesRes = await axios.get(
          "http://localhost:3001/api/resources"
        );
        setResources(resourcesRes.data);

        if (mongoUserId) {
          const favoritesRes = await axios.get(
            `http://localhost:3001/api/users/${mongoUserId}/favorites`
          );
          setFavoriteIds(favoritesRes.data);
        } else {
          setFavoriteIds([]);
        }
      } catch (err) {
        console.error("Failed to fetch resources or favorites:", err);
      }
    };

    fetchResources();
  }, [mongoUserId]);

  const filteredResources =
    selectedType === "All"
      ? resources
      : resources.filter((r) => r.type === selectedType);

  const toggleFavorite = async (resource: Resource) => {
    if (!mongoUserId) {
      alert("Please log in to favorite resources.");
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:3001/api/users/${mongoUserId}/favorites`,
        { resourceId: resource._id }
      );

      const isFavNew = response.data.isFav;
      setFavoriteIds((prev) =>
        isFavNew
          ? [resource._id, ...prev.filter((id) => id !== resource._id)]
          : prev.filter((id) => id !== resource._id)
      );
    } catch (err) {
      console.error("Failed to update favorite status:", err);
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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled
        >
          <Text style={styles.bigTitle}>Welcome to SpecialSearch!</Text>
          <Text style={styles.title}>My Favorites</Text>
          <View style={{ marginVertical: 10 }}>
            <ScrollView
              horizontal={isMobile} // horizontal scrolling only on mobile
              showsHorizontalScrollIndicator={isMobile}
              contentContainerStyle={styles.cardPane}
            >
              {favoriteIds.length === 0 ? (
                <Text>No favorites yet.</Text>
              ) : (
                resources
                  .filter((resource) => favoriteIds.includes(resource._id))
                  .map((resource) => (
                    <Card
                      key={resource._id}
                      image={{
                        uri:
                          resource.image || "https://via.placeholder.com/200",
                        width: 200,
                        height: 200,
                      }}
                      title={resource.name}
                      location={`${resource.location.address}, ${resource.location.city}, ${resource.location.state}`}
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
            </ScrollView>
          </View>

          <Text style={styles.title}>Available Resources</Text>
          <View style={{ marginVertical: 10 }}>
            <ScrollView
              horizontal={isMobile} // horizontal scrolling only on mobile
              showsHorizontalScrollIndicator={isMobile}
              contentContainerStyle={styles.cardPane}
            >
              {filteredResources.map((resource) => (
                <Card
                  key={resource._id}
                  image={{
                    uri: resource.image || "https://via.placeholder.com/200",
                    width: 200,
                    height: 200,
                  }}
                  title={resource.name}
                  location={`${resource.location.address}, ${resource.location.city}, ${resource.location.state}`}
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
            </ScrollView>
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
                    style={[styles.input, errors.address && styles.inputError]}
                    value={formData.location.address}
                    onChangeText={(text) =>
                      handleChange("location", text, "address")
                    }
                  />
                  {errors.address && (
                    <Text style={styles.errorText}>{errors.address}</Text>
                  )}

                  <Text style={styles.modalText}>City*</Text>
                  <TextInput
                    style={[styles.input, errors.city && styles.inputError]}
                    value={formData.location.city}
                    onChangeText={(text) =>
                      handleChange("location", text, "city")
                    }
                  />
                  {errors.city && (
                    <Text style={styles.errorText}>{errors.city}</Text>
                  )}

                  <Text style={styles.modalText}>State*</Text>
                  <Dropdown
                    options={usStates}
                    placeholder="Select a state"
                    onSelect={(option) =>
                      handleChange("location", String(option.value), "state")
                    }
                  />
                  {errors.state && (
                    <Text style={styles.errorText}>{errors.state}</Text>
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
                        console.log(
                          "Updated formData with image:",
                          newFormData
                        );
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
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/contact-us" })}
          style={styles.callIconButton}
        >
          <Image
            source={require("@/assets/images/call-icon.png")}
            style={styles.callIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    justifyContent: "flex-start",
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
    width: screenWidth < 600 ? "99.5%" : "100%",
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
  callIconButton: {
    position: "absolute",
    top: 10,
    right: 75,
    zIndex: 1000,
    padding: 5,
    borderRadius: 20,
  },
  callIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
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
});
