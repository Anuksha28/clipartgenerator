import { useState } from "react";
import { generateClipart } from "@/services/replicate";
import { CLIPART_STYLES } from "@/constants/styles";

export type GenerationResult = {
  id: string;
  label: string;
  emoji: string;
  status: "loading" | "success" | "error";
  imageUrl?: string;
  error?: string;
};

export function useClipartGen() {
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  function updateResult(id: string, update: Partial<GenerationResult>) {
    setResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...update } : r))
    );
  }

  async function generateAll(cloudinaryUrl: string) {
    setIsGenerating(true);

    // Initialize all as loading
    const initial: GenerationResult[] = CLIPART_STYLES.map((s) => ({
      id: s.id,
      label: s.label,
      emoji: s.emoji,
      status: "loading",
    }));
    setResults(initial);

    // Fire all 5 in parallel
    const promises = CLIPART_STYLES.map(async (style) => {
      try {
        const url = await generateClipart(cloudinaryUrl, style.prompt);
        updateResult(style.id, { status: "success", imageUrl: url });
      } catch {
        updateResult(style.id, {
          status: "error",
          error: "Failed. Tap to retry.",
        });
      }
    });

    await Promise.allSettled(promises);
    setIsGenerating(false);
  }

  async function retryOne(styleId: string, cloudinaryUrl: string) {
    const style = CLIPART_STYLES.find((s) => s.id === styleId);
    if (!style) return;

    updateResult(styleId, { status: "loading", error: undefined });

    try {
      const url = await generateClipart(cloudinaryUrl, style.prompt);
      updateResult(styleId, { status: "success", imageUrl: url });
    } catch {
      updateResult(styleId, {
        status: "error",
        error: "Failed. Tap to retry.",
      });
    }
  }

  return { results, isGenerating, generateAll, retryOne };
}