// app/note.tsx  →  route "/note" (new)  or  "/note?id=12" (edit)
import Notes from "@/api/Notes";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AUTOSAVE_DELAY = 800; // ms of inactivity before saving

type Draft = { title: string; content: string };
type SaveStatus = "idle" | "saving" | "saved";

export default function NoteEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loaded, setLoaded] = useState(!id);
  const [status, setStatus] = useState<SaveStatus>("idle");

  // Refs hold the "truth" so flush() never reads stale state
  const noteId = useRef<number | null>(id ? Number(id) : null);
  const latest = useRef<Draft>({ title: "", content: "" });
  const lastSaved = useRef<Draft>({ title: "", content: "" });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Saves run one after another, so a new note can never be inserted twice
  const queue = useRef<Promise<void>>(Promise.resolve());

  // Load existing note
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    Notes.getNote(db, Number(id)).then((note) => {
      if (cancelled) return;
      if (note) {
        latest.current = lastSaved.current = {
          title: note.title,
          content: note.content,
        };
        setTitle(note.title);
        setContent(note.content);
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [db, id]);

  // Save right now (if anything changed). Safe to call repeatedly.
  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    queue.current = queue.current
      .then(async () => {
        const draft = latest.current;
        const saved = lastSaved.current;
        if (draft.title === saved.title && draft.content === saved.content) {
          return;
        }
        // Don't create empty notes
        if (
          noteId.current == null &&
          !draft.title.trim() &&
          !draft.content.trim()
        ) {
          return;
        }

        setStatus("saving");
        if (noteId.current == null) {
          noteId.current = await Notes.createNote(
            db,
            draft.title,
            draft.content,
          );
        } else {
          await Notes.updateNote(
            db,
            noteId.current,
            draft.title,
            draft.content,
          );
        }
        lastSaved.current = draft;
        setStatus("saved");
      })
      .catch((e) => console.error("Failed to save note", e));

    return queue.current;
  }, [db]);

  const scheduleSave = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, AUTOSAVE_DELAY);
  }, [flush]);

  const onChangeTitle = (text: string) => {
    setTitle(text);
    latest.current = { ...latest.current, title: text };
    scheduleSave();
  };

  const onChangeContent = (text: string) => {
    setContent(text);
    latest.current = { ...latest.current, content: text };
    scheduleSave();
  };

  // Save when app goes to background / is about to be killed
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") flush();
    });
    return () => sub.remove();
  }, [flush]);

  // Save on unmount (covers swipe-back and Android hardware back)
  useEffect(() => {
    return () => {
      flush();
    };
  }, [flush]);

  const goBack = async () => {
    await flush();
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const muted = theme.muted;
  const textColor = theme.text;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={goBack}
            style={styles.backButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={26} color={textColor} />
          </TouchableOpacity>

          <TextInput
            value={title}
            onChangeText={onChangeTitle}
            placeholder="Title"
            placeholderTextColor={muted}
            editable={loaded}
            maxLength={120}
            returnKeyType="next"
            style={[styles.titleInput, { color: textColor }]}
          />

          <Text style={[styles.status, { color: textColor }]}>
            {status === "saving"
              ? "Saving…"
              : status === "saved"
                ? "Saved"
                : ""}
          </Text>
        </View>

        <TextInput
          value={content}
          onChangeText={onChangeContent}
          placeholder="Start writing…"
          placeholderTextColor={muted}
          editable={loaded}
          multiline
          scrollEnabled
          textAlignVertical="top"
          autoFocus={!id}
          style={[
            styles.contentInput,
            { color: textColor, paddingBottom: insets.bottom + 16 },
          ]}
        />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  titleInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: "600",
    paddingVertical: 8,
  },
  status: {
    minWidth: 56,
    textAlign: "right",
    fontSize: 12,
  },
  contentInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    fontSize: 17,
    lineHeight: 25,
  },
});
