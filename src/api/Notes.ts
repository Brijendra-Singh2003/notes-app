import { SQLiteDatabase } from "expo-sqlite";

export interface NoteBase {
  id: number;
  title: string;
  createdAt: string;
}

export interface Note extends NoteBase {
  content: string;
}

async function loadNotes(db: SQLiteDatabase) {
  const result = (await db.getAllAsync(
    "SELECT id, title, createdAt FROM notes ORDER BY id DESC",
  )) as NoteBase[];

  return groupByDate(result);
}

async function getNote(db: SQLiteDatabase, id: number) {
  return db.getFirstAsync<Note>(
    "SELECT id, title, content, createdAt FROM notes WHERE id = ?;",
    id,
  );
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

async function createNote(
  db: SQLiteDatabase,
  title: string,
  content: string,
): Promise<number> {
  const result = await db.runAsync(
    "INSERT INTO notes (title, content, createdAt) VALUES (?, ?, ?);",
    title.trim() || content.trim(),
    content,
    todayLabel(),
  );
  return result.lastInsertRowId;
}

async function updateNote(
  db: SQLiteDatabase,
  id: number,
  title: string,
  content: string,
) {
  await db.runAsync(
    "UPDATE notes SET title = ?, content = ? WHERE id = ?;",
    title.trim() || "Untitled",
    content,
    id,
  );
}

async function deleteNote(db: SQLiteDatabase, id: number) {
  await db.runAsync("DELETE FROM notes WHERE id = ?;", id);
}

function groupByDate(notes: NoteBase[]) {
  const map = notes.reduce(
    (acc, note) => {
      const key = note.createdAt || "Other";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(note);
      return acc;
    },
    {} as Record<string, NoteBase[]>,
  );
  return Object.entries(map).map(([title, data = []]) => ({ title, data }));
}

export default {
  loadNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
};