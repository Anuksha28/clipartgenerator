import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { APP_COLORS } from "@/constants/styles";

export function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.imagePlaceholder} />
      <View style={styles.labelPlaceholder} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: APP_COLORS.surface,
    padding: 8,
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surfaceLight,
  },
  labelPlaceholder: {
    height: 14,
    width: "60%",
    borderRadius: 7,
    backgroundColor: APP_COLORS.surfaceLight,
    marginTop: 8,
    alignSelf: "center",
  },
});