import { Tabs } from "expo-router";
import { APP_COLORS } from "@/constants/styles";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen name="index" />
    </Tabs>
  );
}