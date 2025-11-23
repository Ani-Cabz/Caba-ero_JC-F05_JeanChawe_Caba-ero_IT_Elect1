import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  StatusBar,
  Image,
  Platform,
  Keyboard,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";

const MessengerScreen = ({ route, navigation }) => {
  const { currentUser, chatWithUser } = route.params;
  const db = useSQLiteContext();
  const flatListRef = useRef();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserPic, setCurrentUserPic] = useState(null);
  const [chatWithUserPic, setChatWithUserPic] = useState(null);

  const loadUserPics = async () => {
    try {
      const current = await db.getFirstAsync(
        "SELECT profileUri FROM auth_users WHERE name = ?",
        [currentUser.name]
      );
      const chatWith = await db.getFirstAsync(
        "SELECT profileUri FROM auth_users WHERE name = ?",
        [chatWithUser.name]
      );
      setCurrentUserPic(current?.profileUri || null);
      setChatWithUserPic(chatWith?.profileUri || null);
    } catch (err) {
      console.error("Load user pics error:", err);
    }
  };

  const createTable = async () => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sender TEXT NOT NULL,
          receiver TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error) {
      console.error("DB Error:", error);
    }
  };

  const loadMessages = async () => {
    try {
      const results = await db.getAllAsync(
        `SELECT * FROM messages
         WHERE (sender = ? AND receiver = ?)
            OR (sender = ? AND receiver = ?)
         ORDER BY created_at ASC`,
        [currentUser.name, chatWithUser.name, chatWithUser.name, currentUser.name]
      );
      setMessages(results);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Load Messages Error:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await db.runAsync(
        "INSERT INTO messages (sender, receiver, message) VALUES (?, ?, ?)",
        [currentUser.name, chatWithUser.name, newMessage.trim()]
      );
      setNewMessage("");
      loadMessages();
    } catch (error) {
      console.error("Send Message Error:", error);
    }
  };

  useEffect(() => {
    createTable().then(() => {
      loadMessages();
      loadUserPics();
    });

    const showListener = Keyboard.addListener("keyboardDidShow", () => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
    const hideListener = Keyboard.addListener("keyboardDidHide", () => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const renderItem = ({ item }) => {
    const isMe = item.sender === currentUser.name;
    const profilePic = isMe ? currentUserPic : chatWithUserPic;

    return (
      <View style={[styles.messageRow, isMe ? styles.rowRight : styles.rowLeft]}>
        {!isMe && (
          <Image
            source={profilePic ? { uri: profilePic } : require("./assets/default.png")}
            style={styles.chatHeadImage}
          />
        )}
        <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
          <Text style={isMe ? styles.myMessageText : styles.otherMessageText}>
            {item.message}
          </Text>
        </View>
        {isMe && (
          <Image
            source={profilePic ? { uri: profilePic } : require("./assets/default.png")}
            style={styles.chatHeadImage}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>◀ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerName}>{chatWithUser.name}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Messages + Input */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 8 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#777"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    elevation: 4,
  },

  backButton: { padding: 4 },
  backText: { color: "#007aff", fontSize: 16, fontWeight: "bold" },

  headerName: {
    color: "#333",
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
  },

  messageRow: { flexDirection: "row", alignItems: "flex-end", marginVertical: 6 },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },

  chatHeadImage: {
    width: 38,
    height: 38,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: "70%",
  },

  myMessage: {
    backgroundColor: "#4a90e2",
    borderWidth: 1,
    borderColor: "#3b7dcc",
    marginLeft: 6,
  },

  myMessageText: { color: "#fff", fontSize: 16 },

  otherMessage: {
    backgroundColor: "#eaeaea",
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 6,
  },

  otherMessageText: { color: "#333", fontSize: 16 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    color: "#000",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    maxHeight: 100,
  },

  sendButton: {
    backgroundColor: "#4a90e2",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
  },

  sendText: { color: "#fff", fontWeight: "bold" },
});

export default MessengerScreen;
