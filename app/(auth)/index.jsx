// app/index.jsx
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, StatusBar, Text, View } from "react-native";

export default function Start() {
  const { isLoggedIn, fetchLoggedInStatus } = useAuth();
  const [loading, setLoading] = useState(true);

  // Fix: Use useRef instead of useState for Animated.Value
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check login status
    if (fetchLoggedInStatus) {
      fetchLoggedInStatus();
    }

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ),
    ]).start();

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fadeAnim, scaleAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (loading) {
    return (
      <LinearGradient colors={["#667eea", "#764ba2"]} style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />

        {/* Floating Background Elements */}
        <FloatingElement
          size={60}
          color="rgba(255, 255, 255, 0.15)"
          top="15%"
          left="10%"
          duration={4000}
        />
        <FloatingElement
          size={40}
          color="rgba(255, 255, 255, 0.1)"
          top="25%"
          right="15%"
          duration={3500}
        />
        <FloatingElement
          size={80}
          color="rgba(255, 255, 255, 0.08)"
          bottom="30%"
          left="8%"
          duration={5000}
        />
        <FloatingElement
          size={50}
          color="rgba(255, 255, 255, 0.12)"
          bottom="20%"
          right="10%"
          duration={4500}
        />
        <FloatingElement
          size={35}
          color="rgba(255, 255, 255, 0.18)"
          top="40%"
          left="80%"
          duration={3000}
        />

        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
          }}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              alignItems: "center",
            }}
          >
            {/* Main Logo Container */}
            <View style={{ position: "relative", marginBottom: 48 }}>
              {/* Outer Ring with Rotation */}
              <Animated.View
                style={{
                  transform: [{ rotate: spin }],
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  borderWidth: 3,
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  borderStyle: "dashed",
                  position: "absolute",
                  top: -10,
                  left: -10,
                }}
              />

              {/* Main Logo Circle */}
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 15,
                }}
              >
                {/* Medical Cross */}
                <View style={{ position: "relative" }}>
                  <LinearGradient
                    colors={["#ff6b6b", "#ee5a24"]}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 15,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="medical" size={32} color="white" />
                  </LinearGradient>

                  {/* Pulse Animation */}
                  <PulseRing delay={0} size={60} />
                  <PulseRing delay={1000} size={60} />
                </View>

                {/* Floating Mini Icons */}
                <FloatingIcon
                  icon="heart"
                  color="#ff9a9e"
                  top={-5}
                  right={-5}
                  size={20}
                  delay={500}
                />
                <FloatingIcon
                  icon="shield-checkmark"
                  color="#4ade80"
                  bottom={-5}
                  left={-5}
                  size={18}
                  delay={1000}
                />
                <FloatingIcon
                  icon="star"
                  color="#fbbf24"
                  top={10}
                  left={-8}
                  size={16}
                  delay={1500}
                />
              </View>
            </View>

            {/* App Title */}
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: 8,
                  textShadowColor: "rgba(0, 0, 0, 0.3)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }}
              >
                MediCare+
              </Text>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: 18,
                  fontWeight: "500",
                  textShadowColor: "rgba(0, 0, 0, 0.2)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                Your Health Companion 💙
              </Text>

              {/* Version Badge */}
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 20,
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.3)",
                }}
              >
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  v2.0 Beta
                </Text>
              </View>
            </View>

            {/* Loading Section */}
            <View style={{ alignItems: "center" }}>
              {/* Custom Loading Spinner */}
              <View style={{ position: "relative", marginBottom: 24 }}>
                <Animated.View
                  style={{
                    transform: [{ rotate: spin }],
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    borderWidth: 3,
                    borderTopColor: "white",
                    borderRightColor: "transparent",
                    borderBottomColor: "white",
                    borderLeftColor: "transparent",
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    width: 50,
                    height: 50,
                  }}
                >
                  <Ionicons name="medical-outline" size={20} color="white" />
                </View>
              </View>

              {/* Loading Text */}
              <Text
                style={{
                  color: "white",
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 8,
                  textShadowColor: "rgba(0, 0, 0, 0.3)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                Checking login status... ⏳
              </Text>

              {/* Subtitle */}
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: 14,
                  textAlign: "center",
                  maxWidth: 280,
                  marginBottom: 24,
                  lineHeight: 20,
                  textShadowColor: "rgba(0, 0, 0, 0.2)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 1,
                }}
              >
                Please wait while we securely verify your authentication
              </Text>

              {/* Loading Dots Animation */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <LoadingDot delay={0} color="rgba(255, 255, 255, 0.9)" />
                <LoadingDot delay={300} color="rgba(255, 255, 255, 0.7)" />
                <LoadingDot delay={600} color="rgba(255, 255, 255, 0.5)" />
              </View>
            </View>

            {/* Progress Bar */}
            <View
              style={{
                width: 250,
                height: 4,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 2,
                marginTop: 32,
                overflow: "hidden",
              }}
            >
              <Animated.View
                style={{
                  height: "100%",
                  backgroundColor: "white",
                  borderRadius: 2,
                  width: "100%",
                  transform: [
                    {
                      translateX: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-250, 0],
                      }),
                    },
                  ],
                }}
              />
            </View>

            {/* Fun Messages */}
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: 12,
                marginTop: 16,
                fontStyle: "italic",
                textShadowColor: "rgba(0, 0, 0, 0.2)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 1,
              }}
            >
              &quot;Loading doses of care... 💊✨&quot;
            </Text>
          </Animated.View>
        </View>

        {/* Bottom Wave Design */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
          <WaveBottom />
        </View>
      </LinearGradient>
    );
  }

  return <Redirect href={isLoggedIn ? "/(tabs)/" : "/(auth)/login"} />;
}

function LoadingDot({ delay = 0, color = "#ff6b6b" }) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    const timeout = setTimeout(animate, delay);
    return () => clearTimeout(timeout);
  }, [scaleAnim, delay]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        backgroundColor: color,
        width: 8,
        height: 8,
        borderRadius: 4,
        shadowColor: color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 3,
      }}
    />
  );
}

// Floating background elements
function FloatingElement({
  size,
  color,
  top,
  bottom,
  left,
  right,
  duration = 4000,
}) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [floatAnim, duration]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        top,
        bottom,
        left,
        right,
        transform: [{ translateY }],
      }}
    />
  );
}

// Floating mini icons around logo
function FloatingIcon({
  icon,
  color,
  top,
  bottom,
  left,
  right,
  size = 20,
  delay = 0,
}) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    const timeout = setTimeout(animate, delay);
    return () => clearTimeout(timeout);
  }, [bounceAnim, delay]);

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top,
        bottom,
        left,
        right,
        transform: [{ translateY }],
        backgroundColor: color,
        width: size + 6,
        height: size + 6,
        borderRadius: (size + 6) / 2,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <Ionicons name={icon} size={size - 4} color="white" />
    </Animated.View>
  );
}

// Pulse ring animation
function PulseRing({ delay, size }) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        pulseAnim.setValue(0);
        animate();
      });
    };

    const timeout = setTimeout(animate, delay);
    return () => clearTimeout(timeout);
  }, [pulseAnim, delay]);

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#ff6b6b",
        transform: [{ scale }],
        opacity,
        top: 0,
        left: 0,
      }}
    />
  );
}

// Wave bottom design
function WaveBottom() {
  return (
    <View style={{ height: 100 }}>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 50,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          height: 30,
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: 15,
        }}
      />
    </View>
  );
}
