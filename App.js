import "react-native-gesture-handler";
import React from "react";
import { SQLiteProvider } from "expo-sqlite";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Screens
import RegisterScreen from "./RegisterScreen";
import LoginScreen from "./LoginScreen";
import UserListScreen from "./UserListScreen";
import MessengerScreen from "./MessengerScreen";
import AboutScreen from "./screens/AboutScreen";
import CommentScreen from "./CommentScreen";

const Stack = createStackNavigator();

// ☀️ LIGHT MODE THEME (ONLY COLORS CHANGED)
const NeonDarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#ffffff",     // white background
    card: "#f2f2f2",           // light gray card
    text: "#000000",           // black text
    border: "#d1d1d1",         // soft border
    primary: "#2a8cff",        // light blue highlight
  },
};

export default function App() {
  return (
    <SQLiteProvider
      databaseName="authDatabase.db"
      onInit={async (db) => {
        // Users, Messages, Comments tables
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS auth_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            receiver TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT NOT NULL,
            comment TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );

          -- New table for bio & address
          CREATE TABLE IF NOT EXISTS user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            bio TEXT,
            address TEXT,
            FOREIGN KEY(user_id) REFERENCES auth_users(id)
          );
        `);
      }}
    >
      <NavigationContainer theme={NeonDarkTheme}>
        <Stack.Navigator
          initialRouteName="Register"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#f2f2f2",
              shadowColor: "#ccc",
            },
            headerTintColor: "#000000",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 22,
            },
          }}
        >
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "REGISTER" }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "LOGIN" }}
          />
          <Stack.Screen
            name="Users"
            component={UserListScreen}
            options={{ title: "USERS" }}
          />
          <Stack.Screen
            name="Messenger"
            component={MessengerScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Comments"
            component={CommentScreen}
            options={{ title: "COMMENTS" }}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
            options={{ title: "ABOUT" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}
