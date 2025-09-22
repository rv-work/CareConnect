import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

const { width } = Dimensions.get("window");

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setIsLoggedIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    const payload = { email, password };

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const res = await fetch(
        "https://medlink-bh5c.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      console.log("data : ", data);

      if (data.success) {
        if (data.token) {
          await AsyncStorage.setItem("token", data.token);
          setIsLoggedIn(true);
          alert("Login successful!");
          router.replace("/(tabs)");
        } else {
          // Handle case where login is successful but token is missing
          console.error("Login successful but token is missing from response.");
          alert("Login failed. Missing authentication token.");
        }
      } else {
        alert(data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize animations with useRef but don't access .current during render
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Start animations after component mounts
    const animationTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    return () => clearTimeout(animationTimer);
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Define shadow styles separately to avoid inline style issues
  const cardShadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  };

  const formCardShadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 10,
  };

  const buttonShadowStyle = {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  };

  const emergencyButtonShadowStyle = {
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  };

  const trustIndicatorShadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  };

  const socialButtonShadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  };

  const getInputShadowStyle = (isFocused) => ({
    shadowColor: isFocused ? "#3B82F6" : "transparent",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isFocused ? 0.1 : 0,
    shadowRadius: 8,
    elevation: isFocused ? 2 : 0,
  });

  return (
    <View className="flex-1" style={{ backgroundColor: "#f8f6f0" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f6f0" />

      {/* Decorative Background Elements */}
      <View
        className="absolute top-20 right-8 w-24 h-24 rounded-full opacity-20"
        style={{ backgroundColor: "#ff9f7a" }}
      />
      <View
        className="absolute top-40 left-12 w-16 h-16 rounded-full opacity-15"
        style={{ backgroundColor: "#7fb3d5" }}
      />
      <View
        className="absolute bottom-32 right-12 w-20 h-20 rounded-full opacity-10"
        style={{ backgroundColor: "#85c88a" }}
      />
      <View
        className="absolute bottom-60 left-8 w-12 h-12 rounded-full opacity-25"
        style={{ backgroundColor: "#f7dc6f" }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            className="flex-1 px-6"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}
          >
            {/* Header Section with Illustration */}
            <View className="items-center pt-16 pb-8">
              {/* 3D Character Illustration */}
              <Animated.View
                className="relative mb-6"
                style={{ transform: [{ scale: scaleAnim }] }}
              >
                <View
                  className="items-center justify-center rounded-3xl"
                  style={[
                    {
                      width: width * 0.6,
                      height: width * 0.6,
                      backgroundColor: "#ffffff",
                    },
                    cardShadowStyle,
                  ]}
                >
                  <Image
                    source={require("../../assets/images/login.jpg")}
                    style={{
                      width: width * 0.5,
                      height: width * 0.5,
                      borderRadius: 20,
                    }}
                    resizeMode="cover"
                  />
                </View>

                {/* Floating Elements around image */}
                <View
                  className="absolute -top-4 -right-2 w-8 h-8 rounded-full"
                  style={{ backgroundColor: "#ff9f7a" }}
                >
                  <View className="w-full h-full rounded-full items-center justify-center">
                    <Ionicons name="heart" size={16} color="white" />
                  </View>
                </View>
                <View
                  className="absolute -bottom-2 -left-4 w-10 h-10 rounded-full"
                  style={{ backgroundColor: "#7fb3d5" }}
                >
                  <View className="w-full h-full rounded-full items-center justify-center">
                    <Ionicons name="medical" size={20} color="white" />
                  </View>
                </View>
                <View
                  className="absolute top-8 -left-2 w-6 h-6 rounded-full"
                  style={{ backgroundColor: "#85c88a" }}
                >
                  <View className="w-full h-full rounded-full items-center justify-center">
                    <Ionicons name="shield-checkmark" size={12} color="white" />
                  </View>
                </View>
              </Animated.View>

              {/* App Title */}
              <Text className="text-4xl font-bold text-gray-800 mb-2">
                CareConnect
              </Text>
              <Text className="text-gray-500 text-lg mb-4">
                Your Health Companion
              </Text>

              {/* Status Indicator */}
              <View className="flex-row items-center bg-green-50 px-4 py-2 rounded-full">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-green-600 text-sm font-medium">
                  Secure & Trusted Platform
                </Text>
              </View>
            </View>

            {/* Login Form Card */}
            <Animated.View
              className="mb-6"
              style={{ transform: [{ scale: scaleAnim }] }}
            >
              <View
                className="rounded-3xl p-8 mx-2"
                style={[
                  {
                    backgroundColor: "#ffffff",
                  },
                  formCardShadowStyle,
                ]}
              >
                {/* Welcome Text */}
                <Text className="text-3xl font-bold text-gray-800 text-center mb-2">
                  Welcome Back! 👋
                </Text>
                <Text className="text-gray-500 text-center mb-8 text-base">
                  Sign in to access your health records
                </Text>

                {/* Email Input */}
                <View className="mb-5">
                  <Text className="text-gray-700 text-sm font-semibold mb-3 ml-2">
                    Email Address
                  </Text>
                  <View
                    className={`rounded-2xl border-2 flex-row items-center px-5 transition-all duration-200 ${
                      isEmailFocused
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                    style={getInputShadowStyle(isEmailFocused)}
                  >
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                        isEmailFocused ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <Ionicons
                        name="mail"
                        size={20}
                        color={isEmailFocused ? "#3B82F6" : "#9CA3AF"}
                      />
                    </View>
                    <TextInput
                      className="flex-1 py-4 text-gray-800 text-base font-medium"
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="mb-6">
                  <Text className="text-gray-700 text-sm font-semibold mb-3 ml-2">
                    Password
                  </Text>
                  <View
                    className={`rounded-2xl border-2 flex-row items-center px-5 transition-all duration-200 ${
                      isPasswordFocused
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                    style={getInputShadowStyle(isPasswordFocused)}
                  >
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                        isPasswordFocused ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <Ionicons
                        name="lock-closed"
                        size={20}
                        color={isPasswordFocused ? "#3B82F6" : "#9CA3AF"}
                      />
                    </View>
                    <TextInput
                      className="flex-1 py-4 text-gray-800 text-base font-medium"
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center ml-2"
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={18}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity className="mb-6 self-end">
                  <Text className="text-blue-500 text-sm font-semibold">
                    Forgot Password? 🤔
                  </Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  className="mb-6 rounded-2xl overflow-hidden"
                  style={buttonShadowStyle}
                >
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingVertical: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    <Text className="text-white text-center font-bold text-lg">
                      {isLoading ? "Signing In... ⏳" : "Sign In 🚀"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center mb-6">
                  <View className="flex-1 h-px bg-gray-200" />
                  <Text className="text-gray-400 text-sm mx-4 bg-white px-2">
                    or continue with
                  </Text>
                  <View className="flex-1 h-px bg-gray-200" />
                </View>

                {/* Social Login */}
                <View className="flex-row space-x-4 mb-4">
                  <TouchableOpacity
                    className="flex-1 bg-white border-2 border-gray-100 rounded-2xl py-4 flex-row items-center justify-center"
                    style={socialButtonShadowStyle}
                  >
                    <Ionicons name="logo-google" size={22} color="#DB4437" />
                    <Text className="text-gray-700 text-base font-semibold ml-2">
                      Google
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-white border-2 border-gray-100 rounded-2xl py-4 flex-row items-center justify-center"
                    style={socialButtonShadowStyle}
                  >
                    <Ionicons name="logo-apple" size={22} color="#000" />
                    <Text className="text-gray-700 text-base font-semibold ml-2">
                      Apple
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center mb-6">
              <Text className="text-gray-500 text-base">
                Don&apos;t have an account?
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/signup")}
                className="ml-2"
              >
                <Text className="text-blue-600 font-bold text-base">
                  Sign Up ✨
                </Text>
              </TouchableOpacity>
            </View>

            {/* Emergency Button */}
            <TouchableOpacity
              onPress={() => router.push("/emergency")}
              className="rounded-2xl overflow-hidden mb-6"
              style={emergencyButtonShadowStyle}
            >
              <LinearGradient
                colors={["#ff6b6b", "#ee5a24"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="medical" size={24} color="white" />
                <Text className="text-white font-bold text-lg ml-3">
                  Emergency Services 🚨
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Trust Indicators */}
            <View
              className="flex-row justify-between mx-4 mb-8 bg-white rounded-2xl p-4"
              style={trustIndicatorShadowStyle}
            >
              <View className="items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-2">
                  <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                </View>
                <Text className="text-gray-600 text-xs font-medium">
                  Secure
                </Text>
              </View>
              <View className="items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-2">
                  <Ionicons name="lock-closed" size={24} color="#3B82F6" />
                </View>
                <Text className="text-gray-600 text-xs font-medium">
                  Encrypted
                </Text>
              </View>
              <View className="items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mb-2">
                  <Ionicons name="medical" size={24} color="#8B5CF6" />
                </View>
                <Text className="text-gray-600 text-xs font-medium">HIPAA</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
