import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

type ReviewProps = {
  profilePic: any;
  username: string;
  date: string;
  rating: number;
  review: string;
};

const Review: React.FC<ReviewProps> = ({
  profilePic,
  username,
  date,
  rating,
  review,
}) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Image
          key={i}
          source={
            i <= rating
              ? require("@/assets/images/star-fill.png")
              : require("@/assets/images/star-outline.png")
          }
          style={styles.star}
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Image source={profilePic} style={styles.profilePic} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
      </View>

      <View style={styles.ratingRow}>{renderStars()}</View>

      <Text style={styles.reviewText}>{review}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    marginLeft: 12,
    flexDirection: "column",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  username: {
    fontWeight: "bold",
    fontSize: 18,
  },
  date: {
    color: "#666",
    fontSize: 14,
  },
  ratingRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  star: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  reviewText: {
    marginTop: 12,
    fontSize: 14,
    color: "#333",
  },
});

export default Review;
