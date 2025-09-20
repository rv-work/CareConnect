// app/(tabs)/_layout.jsx
import { Tabs } from "expo-router";
import {
  AlertTriangle,
  FileText,
  Home,
  Plus,
  Shield,
} from "lucide-react-native";
import { Platform, StyleSheet, View } from "react-native";

export default function TabsLayoutUltraPremium() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: ultraPremiumStyles.tabBar,
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.65)",
        tabBarShowLabel: false, // Hide all labels/titles
        tabBarLabelStyle: ultraPremiumStyles.tabBarLabel,
        tabBarIconStyle: ultraPremiumStyles.tabBarIcon,
        tabBarItemStyle: ultraPremiumStyles.tabBarItem,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => (
          <View
            style={{
              flex: 1,
              backgroundColor: "transparent",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flex: 1,
                background:
                  "linear-gradient(135deg, rgba(37, 99, 235, 0.95) 0%, rgba(147, 51, 234, 0.95) 50%, rgba(20, 184, 166, 0.95) 100%)",
                backgroundColor: "rgba(37, 99, 235, 0.95)",
              }}
            />
            {/* Animated overlay */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(147, 51, 234, 0.2)",
                opacity: 0.8,
              }}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Home
              size={focused ? 28 : 24}
              color={color}
              strokeWidth={focused ? 3 : 2.5}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="addReport"
        options={{
          title: "Report",
          tabBarIcon: ({ color, focused }) => (
            <Plus
              size={focused ? 28 : 24}
              color={color}
              strokeWidth={focused ? 3 : 2.5}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <FileText
              size={focused ? 28 : 24}
              color={color}
              strokeWidth={focused ? 3 : 2.5}
            />
          ),
          // tabBarBadge: 5,
          tabBarBadgeStyle: ultraPremiumStyles.tabBarBadge,
        }}
      />

      <Tabs.Screen
        name="detect"
        options={{
          title: "Detect",
          tabBarIcon: ({ color, focused }) => (
            <AlertTriangle
              size={focused ? 28 : 24}
              color={focused ? "#fbbf24" : color} // amber-400 for better contrast
              strokeWidth={focused ? 3 : 2.5}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="emergency/index"
        options={{
          title: "SOS",
          tabBarIcon: ({ color, focused }) => (
            <Shield
              size={focused ? 28 : 24}
              color={focused ? "#ef4444" : color}
              strokeWidth={focused ? 3 : 2.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="emergency/matches/index"
        options={{ href: null }} // tab bar me hide ho jayega
      />
      <Tabs.Screen
        name="emergency/matches/critical-data/index"
        options={{ href: null }}
      />
      <Tabs.Screen name="emergency/camera" options={{ href: null }} />
    </Tabs>
  );
}

const ultraPremiumStyles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    // Gradient matching navbar theme: blue-600 via purple-600 to teal-600
    backgroundColor: "rgba(37, 99, 235, 0.95)", // blue-600 base
    borderTopWidth: 2,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: Platform.OS === "ios" ? 85 : 70,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    paddingTop: 8,
    paddingHorizontal: 20,
    shadowColor: "#3730a3", // Purple shadow
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 25,
    // Create gradient effect with overlay
    overflow: "hidden",
  },

  tabBarLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 0,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  tabBarIcon: {
    marginBottom: 2,
    // Enhanced shadow for icons
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  tabBarItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    // Add subtle inner glow
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  tabBarBadge: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ffffff",
    marginTop: -4,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },

  // Custom gradient overlay (if supported by your React Native version)
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // This would need LinearGradient component to work properly
    // For now using backgroundColor with opacity variations
  },
});
