import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const CommentScreen = ({ route }) => {
  const { user } = route.params;
  const db = useSQLiteContext();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const flatListRef = useRef();

  // Create comments table if it doesn't exist
  const createTable = async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT NOT NULL,
        comment TEXT NOT NULL
      );
    `);
  };

  const loadComments = async () => {
    const results = await db.getAllAsync(
      "SELECT * FROM comments ORDER BY id ASC"
    );
    setComments(results);

    // Scroll to bottom after loading
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    await db.runAsync(
      "INSERT INTO comments (user, comment) VALUES (?, ?)",
      [user, comment]
    );
    setComment("");
    loadComments();
  };

  useEffect(() => {
    createTable().then(() => loadComments());
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.comment}>
              <Text style={styles.user}>{item.user}:</Text>
              <Text>{item.comment}</Text>
            </View>
          )}
          contentContainerStyle={{ padding: 10 }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment"
            value={comment}
            onChangeText={setComment}
          />
          <Button title="Post" onPress={addComment} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  comment: {
    marginBottom: 8,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderRadius: 6,
  },
  user: { fontWeight: "bold", marginBottom: 2 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    backgroundColor: "#fff",
  },
});

export default CommentScreen;
