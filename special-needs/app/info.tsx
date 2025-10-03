import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import Review from "@/components/Review";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { ReviewType } from "@/components/types/ReviewType";
import { Resource } from "@/components/types/Resource";

export default function Info() {
  const {
    resourceId,
    title,
    location: locationParam,
    contact,
    image,
    type,
    languages,
    website,
    notes,
  } = useLocalSearchParams();

  let locationObj: Resource["location"] = {
    address: "",
    city: "",
    state: "",
    lat: null,
    lng: null,
  };

  try {
    locationObj =
      typeof locationParam === "string"
        ? JSON.parse(locationParam)
        : locationParam;
  } catch (err) {
    console.warn("Failed to parse location param:", err);
  }

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    review: "",
    rating: 0,
  });

  const { userId } = useAuth();

  const formatDate = (isoDateString: string) => {
    const date = new Date(isoDateString);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/reviews/${resourceId}`
        );
        console.log("Reviews API response:", res.data);
        setReviews(res.data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    if (resourceId) fetchReviews();
  }, [resourceId]);

  const handleChange = (key: keyof typeof formData, value: string | number) => {
    setFormData({ ...formData, [key]: value });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const handleSubmit = async () => {
    if (!userId) {
      alert("You must be logged in to submit a review.");
      return;
    }

    if (!formData.review || rating === 0) {
      setReviewError("Please provide both a rating and review.");
      return;
    } else {
      setReviewError("");
    }

    setIsSubmitting(true);

    try {
      const userRes = await axios.get(
        `http://localhost:3001/api/users/${userId}`
      );
      if (!userRes.data) throw new Error("User not found");

      const { username, profilePicUrl } = userRes.data;

      const reviewData = {
        userId: userId,
        date: new Date().toISOString(),
        rating: rating,
        review: formData.review,
        resourceId: resourceId,
      };

      const response = await axios.post(
        "http://localhost:3001/api/reviews",
        reviewData
      );
      console.log("POST response:", response);

      if (response.status === 201) {
        const res = await axios.get(
          `http://localhost:3001/api/reviews/${resourceId}`
        );
        setReviews(res.data);

        setModalVisible(false);
        setFormData({ review: "", rating: 0 });
        setRating(0);
      } else {
        alert("Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Could not submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [rating, setRating] = useState(0);

  const handleSetRating = (value: number) => {
    setRating(value);
    handleChange("rating", value);
    if (formData.review && value !== 0) setReviewError("");
  };

  const [reviews, setReviews] = useState<ReviewType[]>([]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.realTitle}>{title}</Text>
      <View style={styles.infoContainer}>
        <View style={styles.imageContainer}>
          {image && (
            <Image source={{ uri: image as string }} style={styles.image} />
          )}
        </View>
        <View style={styles.textContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Resource Type</Text>
            <Text style={styles.value}>{type}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>
              {locationObj.address || locationObj.city || locationObj.state
                ? `${locationObj.address}, ${locationObj.city}, ${locationObj.state}`
                : "No location provided"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Contact</Text>
            <Text style={styles.value}>{contact}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Languages</Text>
            <Text style={styles.value}>{languages}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Website</Text>
            <Text style={styles.value}>{website}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.value}>{notes}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>ADD REVIEW</Text>
      </TouchableOpacity>
      <Text style={styles.realTitle}>Reviews</Text>
      <View style={styles.reviewsContainer}>
        {reviews.map((r) => (
          <Review
            key={r._id}
            profilePic={
              r.userId?.profilePicUrl
                ? { uri: r.userId.profilePicUrl }
                : require("@/assets/images/adaptive-icon.png")
            }
            username={
              r.userId?.profilePicUrl ? r.userId.username : "Unknown User"
            }
            date={formatDate(r.date)}
            rating={r.rating}
            review={r.review}
          />
        ))}
      </View>
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add a Rating or Review</Text>

            <View style={styles.starsView}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Image
                    source={
                      rating >= star
                        ? require("@/assets/images/star-fill.png")
                        : require("@/assets/images/star-outline.png")
                    }
                    style={styles.star}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Write a review..."
              style={[styles.input, reviewError ? styles.inputError : null]}
              value={formData.review}
              onChangeText={(text) => {
                handleChange("review", text);
                if (text && rating !== 0) setReviewError("");
              }}
            />
            {reviewError !== "" && (
              <Text style={styles.errorText}>{reviewError}</Text>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? "Submitting..." : "SUBMIT"}
                </Text>
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
    padding: 20,
  },
  infoContainer: {
    flexDirection: "row",
    marginVertical: 10,
  },
  imageContainer: {
    marginRight: 30,
  },
  row: {
    flexDirection: "row",
    marginBottom: 30,
    alignItems: "flex-start",
  },
  label: {
    fontWeight: "bold",
    width: 180,
    marginRight: 20,
    fontSize: 21,
  },
  value: {
    flex: 1,
    flexWrap: "wrap",
    fontSize: 21,
  },
  textContainer: {
    marginTop: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    marginRight: 40,
  },
  realTitle: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 20,
  },
  text: {
    fontSize: 14,
    marginRight: 30,
  },
  image: {
    width: 300,
    height: 300,
    marginVertical: 20,
    borderRadius: 10,
  },
  starsView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  star: {
    width: 40,
    height: 40,
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: "darkgreen",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 150,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "50%",
    borderRadius: 15,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
  buttonRow: {
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
  reviewsContainer: {
    marginTop: 5,
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    marginTop: -10,
  },
});
