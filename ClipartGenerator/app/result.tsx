import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  PanResponder,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ResultCard } from "@/components/ui/ResultCard";
import { APP_COLORS } from "@/constants/styles";
import type { GenerationResult } from "@/hooks/useClipartGen";

const WIDTH = Dimensions.get("window").width;

export default function ResultsScreen() {
  const { cloudUrl, localUri, results: resultsJson } = useLocalSearchParams<{
    cloudUrl: string;
    localUri: string;
    results: string;
  }>();

  const results: GenerationResult[] = resultsJson ? JSON.parse(resultsJson) : [];
  const successResults = results.filter((r) => r.status === "success");

  const [sliderX, setSliderX] = useState(WIDTH / 2);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newX = Math.max(40, Math.min(WIDTH - 40, gestureState.moveX));
        setSliderX(newX);
      },
    })
  ).current;

  const [selectedResult, setSelectedResult] = useState<GenerationResult | null>(
    successResults[0] || null
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Cliparts</Text>

      {/* Before / After Slider */}
      {selectedResult?.imageUrl && localUri && (
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Before / After — drag to compare</Text>
          <View style={styles.sliderBox} {...panResponder.panHandlers}>
            {/* After (generated) */}
            <Image
              source={{ uri: selectedResult.imageUrl }}
              style={styles.sliderImage}
              resizeMode="cover"
            />
            {/* Before (original) clipped */}
            <View style={[styles.beforeOverlay, { width: sliderX }]}>
              <Image
                source={{ uri: localUri }}
                style={[styles.sliderImage, { width: WIDTH - 40 }]}
                resizeMode="cover"
              />
            </View>
            {/* Divider line */}
            <View style={[styles.divider, { left: sliderX - 20 }]}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerHandle}>
                <Text style={styles.dividerIcon}>⇔</Text>
              </View>
              <View style={styles.dividerLine} />
            </View>
          </View>

          {/* Style selector */}
          <FlatList
            data={successResults}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.styleList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.styleChip,
                  selectedResult?.id === item.id && styles.styleChipActive,
                ]}
                onPress={() => setSelectedResult(item)}
              >
                <Text style={styles.styleChipText}>
                  {item.emoji} {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Results Grid */}
      <Text style={styles.sectionTitle}>All Styles</Text>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={{ width: (WIDTH - 52) / 2 }}>
            <ResultCard result={item} onRetry={() => {}} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: APP_COLORS.text,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sliderContainer: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  sliderLabel: {
    color: APP_COLORS.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  sliderBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  sliderImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  beforeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    overflow: "hidden",
  },
  divider: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  dividerLine: {
    flex: 1,
    width: 2,
    backgroundColor: "white",
  },
  dividerHandle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dividerIcon: {
    fontSize: 14,
    color: APP_COLORS.background,
  },
  styleList: {
    gap: 8,
    paddingVertical: 4,
  },
  styleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.surfaceLight,
  },
  styleChipActive: {
    backgroundColor: APP_COLORS.primary,
    borderColor: APP_COLORS.primary,
  },
  styleChipText: {
    color: APP_COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: APP_COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  grid: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  row: {
    gap: 12,
  },
});