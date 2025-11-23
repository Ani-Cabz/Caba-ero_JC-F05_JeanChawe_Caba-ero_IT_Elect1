import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const UserListScreen = () => {
  const db = useSQLiteContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const results = await db.getAllAsync("SELECT * FROM auth_users");
      setUsers(results);
    } catch (error) {
      console.error("DB Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadUsers} />}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.email}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No users found</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  name: { fontWeight: "bold" },
});

export default UserListScreen;
