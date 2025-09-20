import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { ArrowRight, ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [splash, setSplash] = useState(true);
  const [current, setCurrent] = useState(0);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  const slides = [
    {
      id: 1,
      title: "Store Reports",
      desc: "Securely save all your medical reports on Web2 & Web3 cloud with military-grade encryption.",
      img: require("../assets/images/report.png"),
      gradient: ["#667eea", "#764ba2"],
      bgColor: "#f8faff",
    },
    {
      id: 2,
      title: "Emergency Access",
      desc: "Access records instantly via face scan or QR code in emergencies. Every second counts.",
      img: require("../assets/images/emergency.png"),
      gradient: ["#f093fb", "#f5576c"],
      bgColor: "#fff8f8",
    },
    {
      id: 3,
      title: "Find Blood Near You",
      desc: "Locate nearby donors quickly in urgent situations. Save lives, be a hero.",
      img: require("../assets/images/blood.png"),
      gradient: ["#4facfe", "#00f2fe"],
      bgColor: "#f0fcff",
    },
    {
      id: 4,
      title: "Medicine Reminders",
      desc: "Track treatment, set smart reminders, and never miss a dose. Your health, our priority.",
      img: require("../assets/images/reminder.png"),
      gradient: ["#43e97b", "#38f9d7"],
      bgColor: "#f0fff4",
    },
  ];

  useEffect(() => {
    // Animate slide transition
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: current * -width,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    // Show splash screen for 3s
    const timer = setTimeout(() => {
      setSplash(false);
      checkOnboarding();
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkOnboarding = async () => {
    const seen = await AsyncStorage.getItem("hasSeenOnboarding");
    if (seen) {
      router.replace("/(auth)");
    } else {
      setShowOnboarding(true);
    }
    setLoading(false);
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/(auth)");
  };

  const nextSlide = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    }
  };

  const prevSlide = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  // Enhanced Splash Screen
  if (splash) {
    return (
      <LinearGradient colors={["#667eea", "#764ba2"]} style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <View className="flex-1 items-center justify-center">
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <LottieView
              source={require("../assets/animation/med.json")}
              autoPlay
              loop={false}
              style={{ width: 300, height: 300 }}
            />
          </Animated.View>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text className="text-3xl font-bold text-white mt-6 text-center">
              CareConnect
            </Text>
            <Text className="text-lg text-white/80 mt-2 text-center">
              Your Health Companion
            </Text>
          </Animated.View>
          <View className="mt-8">
            <ActivityIndicator size="large" color="white" />
          </View>

          {/* Floating elements */}
          <View className="absolute top-20 right-8 w-4 h-4 bg-white/20 rounded-full" />
          <View className="absolute top-32 left-12 w-6 h-6 bg-white/10 rounded-full" />
          <View className="absolute bottom-40 left-8 w-3 h-3 bg-white/30 rounded-full" />
          <View className="absolute bottom-60 right-16 w-5 h-5 bg-white/15 rounded-full" />
        </View>
      </LinearGradient>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!showOnboarding) return null;

  return (
    <View
      style={{ backgroundColor: slides[current].bgColor }}
      className="flex-1"
    >
      <StatusBar barStyle="dark-content" />

      {/* Progress Dots */}
      <View className="flex-row justify-center items-center pt-16 pb-4">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`mx-1 rounded-full transition-all duration-300 ${
              index === current ? "w-8 h-2 opacity-100" : "w-2 h-2 opacity-30"
            }`}
            style={{
              backgroundColor:
                index === current ? slides[current].gradient[0] : "#ccc",
            }}
          />
        ))}
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
          className="items-center"
        >
          {/* Image Container with Gradient Background */}
          <View className="relative mb-8">
            <LinearGradient
              colors={slides[current].gradient}
              style={{
                width: 280,
                height: 280,
                borderRadius: 140,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: slides[current].gradient[0],
                shadowOffset: { width: 0, height: 15 },
                shadowOpacity: 0.4,
                shadowRadius: 25,
                elevation: 10,
              }}
            >
              <View
                className="bg-white/30 backdrop-blur-sm items-center justify-center"
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 110,
                }}
              >
                <View
                  className="bg-white/50 items-center justify-center overflow-hidden"
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 90,
                  }}
                >
                  <Image
                    source={slides[current].img}
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: 90,
                    }}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </LinearGradient>

            {/* Decorative elements */}
            <View
              className="absolute -top-6 -right-6 w-12 h-12 rounded-full opacity-70"
              style={{ backgroundColor: slides[current].gradient[1] }}
            />
            <View
              className="absolute -bottom-8 -left-8 w-10 h-10 rounded-full opacity-50"
              style={{ backgroundColor: slides[current].gradient[0] }}
            />
            <View
              className="absolute top-8 -left-4 w-6 h-6 rounded-full opacity-60"
              style={{ backgroundColor: slides[current].gradient[1] }}
            />
            <View
              className="absolute -top-2 right-12 w-4 h-4 rounded-full opacity-80"
              style={{ backgroundColor: slides[current].gradient[0] }}
            />
          </View>

          {/* Title */}
          <Text className="text-3xl font-bold text-center text-gray-800 mb-4">
            {slides[current].title}
          </Text>

          {/* Description */}
          <Text className="text-center text-gray-600 text-base leading-6 px-4 mb-8">
            {slides[current].desc}
          </Text>
        </Animated.View>
      </View>

      {/* Navigation Buttons */}
      <View className="px-6 pb-8">
        <View className="flex-row items-center justify-between">
          {/* Back Button */}
          {current > 0 ? (
            <TouchableOpacity
              onPress={prevSlide}
              className="flex-row items-center justify-center w-12 h-12 bg-gray-100 rounded-full shadow-sm"
            >
              <ChevronLeft color="#666" size={24} />
            </TouchableOpacity>
          ) : (
            <View className="w-12" />
          )}

          {/* Skip Button */}
          <TouchableOpacity onPress={finishOnboarding} className="px-4 py-2">
            <Text className="text-gray-500 text-base font-medium">Skip</Text>
          </TouchableOpacity>

          {/* Next/Get Started Button */}
          <TouchableOpacity
            onPress={current < slides.length - 1 ? nextSlide : finishOnboarding}
            className="shadow-lg"
          >
            <LinearGradient
              colors={slides[current].gradient}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 25,
                minWidth: 120,
                justifyContent: "center",
              }}
            >
              <Text className="text-white text-base font-semibold mr-2">
                {current < slides.length - 1 ? "Next" : "Get Started"}
              </Text>
              <ArrowRight color="white" size={20} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Background Elements */}
      <View className="absolute top-24 left-4 w-20 h-20 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20" />
      <View className="absolute bottom-32 right-8 w-16 h-16 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-25" />
      <View className="absolute top-1/2 right-4 w-12 h-12 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-15" />
    </View>
  );
}
