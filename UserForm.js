import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const UserForm = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const db = useSQLiteContext();

  const handleSubmit = async () => {
    try {
      const { firstName, lastName, email, phone } = form;

      // ✅ Validation
      if (!firstName || !lastName || !email || !phone) {
        Alert.alert("Validation Error", "All fields are required.");
        return;
      }

      // ✅ Insert data using async API
      await db.runAsync(
        `INSERT INTO users (firstName, lastName, email, phone) VALUES (?, ?, ?, ?)`,
        [firstName, lastName, email, phone]
      );

      Alert.alert("Success", "User added successfully!");

      // ✅ Clear form
      setForm({ firstName: "", lastName: "", email: "", phone: "" });
    } catch (err) {
      console.error("SQLite Error:", err);
      Alert.alert("Error", err.message || "Failed to add user.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={form.firstName}
        onChangeText={(text) => setForm({ ...form, firstName: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={form.lastName}
        onChangeText={(text) => setForm({ ...form, lastName: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={(text) => setForm({ ...form, phone: text })}
      />
      <Button title="Add User" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    margin: 16,
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
});

export default UserForm;
