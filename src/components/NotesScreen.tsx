import Notes, { useNotesStore } from "@/api/Notes";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  SectionList,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedSectionList = Animated.createAnimatedComponent(
  SectionList,
) as unknown as typeof SectionList;

export default function NotesScreen(props: {
  contentContainerStyle?: StyleProp<ViewStyle>;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}) {
  const db = useSQLiteContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const notes = useNotesStore((state) => state.notes);
  const refreshNotes = useNotesStore((state) => state.refresh);

  const refresh = useCallback(() => {
    void refreshNotes(db);
  }, [db, refreshNotes]);

  useFocusEffect(refresh);

  const handleDelete = async (id: number) => {
    await Notes.deleteNote(db, id);
    refresh();
  };

  const goToAddNote = () => router.push("/note");

  return (
    <>
      <AnimatedSectionList
        sections={notes}
        keyExtractor={(item) => item.id.toString()}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        onScroll={props.onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.listContent,
          notes.length === 0 && styles.emptyContent,
          props.contentContainerStyle,
        ]}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.headerTitle, { color: theme.muted }]}>
            {title}
          </Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.noteCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.text,
              },
            ]}
            onPress={() =>
              router.push({ pathname: "/note", params: { id: item.id } })
            }
          >
            <View style={styles.noteBody}>
              <Text
                style={[styles.noteTitle, { color: theme.text }]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.deleteButton,
                { backgroundColor: theme.dangerSoft },
              ]}
              onPress={() => handleDelete(item.id)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Delete note ${item.title}`}
            >
              <Ionicons name="trash-outline" size={18} color={theme.danger} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconWrap,
                { backgroundColor: theme.border + "40" },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={40}
                color={theme.accent}
              />
            </View>
            <ThemedText style={styles.emptyTitle}>No notes yet</ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: theme.muted }]}>
              Create Notes to view them here.
            </ThemedText>
          </View>
        }
      />

      <TouchableOpacity
        style={[
          styles.fab,
          {
            bottom: insets.bottom + 20,
            backgroundColor: theme.accent,
            shadowColor: theme.accent,
          },
        ]}
        onPress={goToAddNote}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Add note"
      >
        <Ionicons name="add" size={30} color={theme.background} />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  // Section header
  headerTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },

  // Note card
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  noteBody: {
    flex: 1,
    marginRight: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 24,
  },

  // Floating action button
  fab: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
});
