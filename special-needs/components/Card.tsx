import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageSourcePropType,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";

interface CardProps {
  image: { uri: string; width: number; height: number };
  title: string;
  location: string;
  contact: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  locationStyle?: TextStyle;
  contactStyle?: TextStyle;
  onPress?: (event: GestureResponderEvent) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  averageRating?: number;
}

const Card: React.FC<CardProps> = ({
  image,
  title,
  location,
  contact,
  style,
  titleStyle,
  locationStyle,
  contactStyle,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  averageRating,
}) => {
  const heartFilled = require("../assets/images/heart-fill.png");
  const heartOutline = require("../assets/images/heart-outline.png");

  return (
    <View style={styles.view}>
      <TouchableOpacity onPress={onPress}>
        <View style={[styles.card, style]}>
          <Image source={image} style={styles.image} resizeMode="cover" />
          <TouchableOpacity style={styles.heartIcon} onPress={onToggleFavorite}>
            <Image
              source={isFavorite ? heartFilled : heartOutline}
              style={styles.heartIcon}
            />
          </TouchableOpacity>
          <View style={styles.textContainer}>
            <Text style={[styles.title, titleStyle]}>{title}</Text>
            <Text style={[styles.body, locationStyle]}>{location}</Text>
            <Text style={[styles.body, contactStyle]}>{contact}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>
              {averageRating !== undefined ? averageRating.toFixed(1) : "N/A"}
            </Text>
            <Image
              source={require("@/assets/images/star-fill.png")}
              style={styles.star}
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    height: 350,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    marginVertical: 8,
    width: 200,
    height: 300,
  },
  image: {
    width: 200,
    height: 150,
    position: "relative",
  },
  heartIcon: {
    width: 40,
    height: 40,
    position: "absolute",
    top: 3,
    left: 4,
  },
  textContainer: {
    padding: 12,
    width: 200,
    height: 105,
  },
  ratingContainer: {
    padding: 5,
    width: 200,
    height: 45,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  star: {
    width: 25,
    height: 25,
    marginHorizontal: 5,
    justifyContent: "flex-end",
  },
  rating: {
    fontSize: 16,
    textAlign: "right",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  body: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
});

export default Card;
