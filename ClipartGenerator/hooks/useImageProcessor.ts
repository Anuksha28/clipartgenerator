import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { uploadImageToCloudinary } from "@/services/cloudinary";

export function useImageProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function compressImage(uri: string): Promise<string> {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    return result.uri;
  }

  async function pickFromGallery(): Promise<string | null> {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Gallery permission is required");
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (result.canceled) return null;
    return result.assets[0].uri;
  }

  async function pickFromCamera(): Promise<string | null> {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Camera permission is required");
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (result.canceled) return null;
    return result.assets[0].uri;
  }

  async function processAndUpload(
    localUri: string
  ): Promise<string | null> {
    try {
      setIsProcessing(true);
      setError(null);
      const compressed = await compressImage(localUri);
      const cloudUrl = await uploadImageToCloudinary(compressed);
      return cloudUrl;
    } catch (err) {
      setError("Failed to process image. Please try again.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  }

  return {
    pickFromGallery,
    pickFromCamera,
    processAndUpload,
    isProcessing,
    error,
  };
}