import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useImageProcessor } from "@/hooks/useImageProcessor";

const COLORS = {
  bg: "#F5F5F7",
  card: "rgba(255,255,255,0.85)",
  border: "rgba(255,255,255,0.6)",
  primary: "#6C63FF",
  primaryLight: "rgba(108,99,255,0.12)",
  text: "#1A1A2E",
  muted: "#8E8EA0",
  accent: "#FF6584",
  glass: "rgba(255,255,255,0.7)",
};

const FLOATING_CLIPARTS = ["🎨", "✨", "👾", "✏️", "🔷"];

export default function HomeScreen() {
  const router = useRouter();
  const {
    pickFromGallery,
    pickFromCamera,
    processAndUpload,
    isProcessing,
    error,
  } = useImageProcessor();
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  async function handleGallery() {
    const uri = await pickFromGallery();
    if (uri) setPreviewUri(uri);
  }

  async function handleCamera() {
    const uri = await pickFromCamera();
    if (uri) setPreviewUri(uri);
  }

  async function handleGenerate() {
    if (!previewUri) return;
    const cloudUrl = await processAndUpload(previewUri);
    if (cloudUrl) {
      router.push({
        pathname: "/generate",
        params: { cloudUrl, localUri: previewUri },
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AI Powered</Text>
          </View>
          <Text style={styles.title}>Clipart AI</Text>
          <Text style={styles.subtitle}>
            Transform yourself into stunning art styles
          </Text>
        </View>

        {/* Floating style pills */}
        <View style={styles.pillsRow}>
          {["Cartoon", "Anime", "Pixel", "Sketch", "Flat"].map((s) => (
            <View key={s} style={styles.pill}>
              <Text style={styles.pillText}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Image area */}
        {!previewUri ? (
          <View style={styles.uploadCard}>
            <View style={styles.uploadInner}>
              <Text style={styles.uploadEmoji}>🖼️</Text>
              <Text style={styles.uploadTitle}>Upload your photo</Text>
              <Text style={styles.uploadHint}>
                Best results with a clear face photo
              </Text>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.pickBtn}
                onPress={handleGallery}
              >
                <Text style={styles.pickEmoji}>🖼️</Text>
                <Text style={styles.pickBtnText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pickBtn}
                onPress={handleCamera}
              >
                <Text style={styles.pickEmoji}>📷</Text>
                <Text style={styles.pickBtnText}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.previewCard}>
            <Image
              source={{ uri: previewUri }}
              style={styles.preview}
              resizeMode="cover"
            />
            <View style={styles.previewOverlay}>
              <TouchableOpacity
                style={styles.changeBtn}
                onPress={() => setPreviewUri(null)}
              >
                <Text style={styles.changeBtnText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Generate button */}
        {previewUri && (
          <TouchableOpacity
            style={[
              styles.generateBtn,
              isProcessing && styles.generateBtnDisabled,
            ]}
            onPress={handleGenerate}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.generateEmoji}>✨</Text>
                <Text style={styles.generateBtnText}>
                  Generate All Styles
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Info cards */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>⚡</Text>
            <Text style={styles.infoTitle}>Fast</Text>
            <Text style={styles.infoDesc}>All 5 styles at once</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>🎨</Text>
            <Text style={styles.infoTitle}>5 Styles</Text>
            <Text style={styles.infoDesc}>Cartoon to pixel art</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>⬇️</Text>
            <Text style={styles.infoTitle}>Save</Text>
            <Text style={styles.infoDesc}>Download & share</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 20,
  },
  badge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 22,
  },
  pillsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  pill: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pillText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  uploadCard: {
    backgroundColor: COLORS.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#6C63FF",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  uploadInner: {
    alignItems: "center",
    paddingVertical: 32,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(108,99,255,0.15)",
    borderStyle: "dashed",
    marginBottom: 20,
    backgroundColor: COLORS.primaryLight,
  },
  uploadEmoji: {
    fontSize: 52,
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },
  uploadHint: {
    fontSize: 13,
    color: COLORS.muted,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
  },
  pickBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pickEmoji: {
    fontSize: 18,
  },
  pickBtnText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  previewCard: {
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    position: "relative",
  },
  preview: {
    width: "100%",
    aspectRatio: 1,
  },
  previewOverlay: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  changeBtn: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  changeBtnText: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: "rgba(255,101,132,0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,101,132,0.2)",
  },
  errorText: {
    color: COLORS.accent,
    fontSize: 13,
    textAlign: "center",
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  generateBtnDisabled: {
    opacity: 0.7,
  },
  generateEmoji: {
    fontSize: 20,
  },
  generateBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  infoEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: "center",
  },
});