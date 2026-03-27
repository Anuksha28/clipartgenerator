import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

export function useImageProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickFromGallery(): Promise<string | null> {
    try {
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
        quality: 0.8,
        base64: false,
      });
      if (result.canceled) return null;
      return result.assets[0].uri;
    } catch (e) {
      setError("Failed to open gallery");
      return null;
    }
  }

  async function pickFromCamera(): Promise<string | null> {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setError("Camera permission is required");
        return null;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });
      if (result.canceled) return null;
      return result.assets[0].uri;
    } catch (e) {
      setError("Failed to open camera");
      return null;
    }
  }

  async function processAndUpload(
    localUri: string
  ): Promise<string | null> {
    try {
      setIsProcessing(true);
      setError(null);

      // Compress image
      const compressed = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: 768 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!compressed.base64) {
        throw new Error("Failed to get base64");
      }

      return `data:image/jpeg;base64,${compressed.base64}`;
    } catch (err: any) {
      setError("Failed to process image: " + err.message);
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