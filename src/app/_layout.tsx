import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { migrateDbIfNeeded } from "@/db";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Suspense
      fallback={
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      }
    >
      {/* 'myData.db' is the name of local database file */}
      <SQLiteProvider databaseName="myData.db" onInit={migrateDbIfNeeded}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <AnimatedSplashOverlay />
          <Slot />
        </ThemeProvider>
      </SQLiteProvider>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
