import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useClipartGen } from "@/hooks/useClipartGen";
import { ResultCard } from "@/components/ui/ResultCard";
import { APP_COLORS } from "@/constants/styles";

const COLUMN = 2;
const GAP = 12;
const WIDTH = (Dimensions.get("window").width - 40 - GAP) / COLUMN;

export default function GenerateScreen() {
  const { cloudUrl, localUri } = useLocalSearchParams<{
    cloudUrl: string;
    localUri: string;
  }>();
  const router = useRouter();
  const { results, isGenerating, generateAll, retryOne } = useClipartGen();

  useEffect(() => {
    if (cloudUrl) generateAll(cloudUrl);
  }, []);

  const doneCount = results.filter((r) => r.status !== "loading").length;
  const allDone = results.length > 0 && !isGenerating;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {allDone ? "Done! 🎉" : "Generating..."}
        </Text>
        <Text style={styles.subtitle}>
          {doneCount}/{results.length} styles ready
        </Text>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={{ width: WIDTH }}>
            <ResultCard
              result={item}
              onRetry={(id) => retryOne(id, cloudUrl)}
            />
          </View>
        )}
      />

      {allDone && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() =>
              router.push({
                pathname: "/results",
                params: {
                  cloudUrl,
                  localUri,
                  results: JSON.stringify(results),
                },
              })
            }
          >
            <Text style={styles.viewBtnText}>View All Results →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: APP_COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: APP_COLORS.textMuted,
    marginTop: 4,
  },
  grid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: GAP,
  },
  row: {
    gap: GAP,
  },
  footer: {
    padding: 20,
  },
  viewBtn: {
    backgroundColor: APP_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  viewBtnText: {
    color: APP_COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
});