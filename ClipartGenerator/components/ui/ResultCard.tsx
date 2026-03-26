import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { APP_COLORS } from "@/constants/styles";
import { SkeletonCard } from "./SkeletonCard";
import type { GenerationResult } from "@/hooks/useClipartGen";

type Props = {
  result: GenerationResult;
  onRetry: (id: string) => void;
};

export function ResultCard({ result, onRetry }: Props) {
  async function handleDownload() {
    if (!result.imageUrl) return;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") return;
    const fileUri = FileSystem.documentDirectory + `${result.id}.png`;
    await FileSystem.downloadAsync(result.imageUrl, fileUri);
    await MediaLibrary.saveToLibraryAsync(fileUri);
    alert("Saved to gallery!");
  }

  async function handleShare() {
    if (!result.imageUrl) return;
    const fileUri = FileSystem.documentDirectory + `${result.id}.png`;
    await FileSystem.downloadAsync(result.imageUrl, fileUri);
    await Sharing.shareAsync(fileUri);
  }

  if (result.status === "loading") {
    return <SkeletonCard />;
  }

  if (result.status === "error") {
    return (
      <TouchableOpacity
        style={styles.errorCard}
        onPress={() => onRetry(result.id)}
      >
        <Text style={{ fontSize: 28 }}>⚠️</Text>
        <Text style={styles.errorText}>{result.error}</Text>
        <View style={styles.retryBadge}>
          <Text style={{ fontSize: 12 }}>🔄</Text>
          <Text style={styles.retryText}>Retry</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: result.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.footer}>
        <Text style={styles.label}>
          {result.emoji} {result.label}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Text style={{ fontSize: 16 }}>↗️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleDownload}>
            <Text style={{ fontSize: 16 }}>⬇️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: APP_COLORS.surface,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  label: {
    color: APP_COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    backgroundColor: APP_COLORS.surfaceLight,
    padding: 8,
    borderRadius: 8,
  },
  errorCard: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: APP_COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: APP_COLORS.accent,
    borderStyle: "dashed",
  },
  errorText: {
    color: APP_COLORS.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  retryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: APP_COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  retryText: {
    color: APP_COLORS.text,
    fontSize: 12,
  },
});