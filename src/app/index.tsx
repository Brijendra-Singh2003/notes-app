import { StyleSheet, useWindowDimensions } from "react-native";

import NotesScreen from "@/components/NotesScreen";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const HEADER_MAX_HEIGHT = 240; // Samsung-style large title height
const HEADER_MIN_HEIGHT = 60; // Collapsed compact header height
const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function HomeScreen() {
  const scrollY = useSharedValue(0);
  const theme = useTheme();
  const windowDimentions = useWindowDimensions();

  // Track scroll position on UI thread
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolation.CLAMP,
    );
    return { height };
  });

  const largeTitleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [2, 1],
      Extrapolation.CLAMP,
    );
    return { transform: [{ scale }] };
  });

  return (
    <SafeAreaView style={{ backgroundColor: theme.background }}>
      <ThemedView>
        <Animated.View
          style={[
            styles.header,
            headerStyle,
            { backgroundColor: theme.background },
          ]}
        >
          {/* Large Title */}
          <Animated.View style={[styles.largeTitleContainer, largeTitleStyle]}>
            <ThemedText style={styles.largeTitleText}>Notes</ThemedText>
          </Animated.View>
        </Animated.View>

        <NotesScreen
          onScroll={scrollHandler}
          contentContainerStyle={{
            paddingTop: HEADER_MAX_HEIGHT,
            paddingBottom: windowDimentions.height,
            height: "auto",
          }}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: BottomTabInset,
    maxWidth: MaxContentWidth,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  largeTitleContainer: {
    position: "absolute",
    padding: 0,
    height: SCROLL_DISTANCE,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  largeTitleText: {
    fontSize: 22,
    fontWeight: 100,
  },
});
