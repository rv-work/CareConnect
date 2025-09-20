// app/(tabs)/emergency/index.jsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Camera as CameraIcon, Clock, Shield, Zap } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

const EmergencyMain = () => {
  const router = useRouter();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [modelLoadingProgress, setModelLoadingProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadModels();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadModels = async () => {
    try {
      setIsModelLoaded(false);
      setModelLoadingProgress(0);

      const stages = [
        { progress: 25 },
        { progress: 50 },
        { progress: 75 },
        { progress: 100 },
      ];

      for (const stage of stages) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setModelLoadingProgress(stage.progress);

        Animated.timing(progressAnim, {
          toValue: stage.progress / 100,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }

      setIsModelLoaded(true);
    } catch (error) {
      console.error("Model loading error:", error);
      setModelLoadingProgress(0);
    }
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#7f1d1d", "#000000"]}
      className="flex-1"
    >
      <View className="flex-1 items-center justify-center px-6 py-12">
        {/* Header */}
        <View className="items-center mb-8">
          <Animated.View
            style={{ transform: [{ scale: pulseAnim }] }}
            className="relative items-center justify-center w-20 h-20 mb-6"
          >
            <View
              className="absolute inset-0 bg-red-500/20 rounded-full"
              style={{ borderRadius: 40 }}
            />
            <View
              className="absolute inset-2 bg-red-500/30 rounded-full"
              style={{ borderRadius: 32 }}
            />
            <Shield size={40} color="#f87171" />
          </Animated.View>

          <Text className="text-4xl font-bold text-white mb-3 text-center">
            Emergency Access
          </Text>
          <Text className="text-gray-300 text-lg text-center">
            AI-Powered Face Recognition Security
          </Text>

          <View className="flex-row items-center mt-4">
            <Clock size={16} color="#9ca3af" />
            <Text className="text-gray-400 text-sm ml-2">
              {currentTime.toLocaleTimeString()}
            </Text>
          </View>
        </View>

        <View
          className="bg-white/5 border border-white/10 p-8 shadow-2xl w-full max-w-sm"
          style={{ borderRadius: 24 }}
        >
          {/* Model Loading */}
          {!isModelLoaded && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Zap size={16} color="#d1d5db" />
                  <Text className="text-sm text-gray-300 ml-2">
                    Loading AI Models
                  </Text>
                </View>
                <Text className="text-sm text-gray-300 font-mono">
                  {modelLoadingProgress}%
                </Text>
              </View>

              <View
                className="w-full bg-gray-700/50 h-3 overflow-hidden"
                style={{ borderRadius: 6 }}
              >
                <Animated.View
                  className="h-3 shadow-lg"
                  style={{
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                    borderRadius: 6,
                    backgroundColor: "#ef4444",
                  }}
                />
              </View>

              <Text className="text-xs text-gray-400 mt-2 text-center">
                Initializing neural networks...
              </Text>
            </View>
          )}

          {/* Ready State */}
          {isModelLoaded && (
            <View className="items-center">
              <View className="mb-8">
                <View className="relative mx-auto w-24 h-24 mb-6 items-center justify-center">
                  <CameraIcon size={96} color="#9ca3af" />
                  <View
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500"
                    style={{ borderRadius: 12 }}
                  />
                </View>

                <Text className="text-xl font-semibold text-white mb-3 text-center">
                  Ready for Face Scan
                </Text>
                <Text className="text-gray-300 text-center leading-6">
                  Position your face in the camera frame for emergency contact
                  identification
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/emergency/camera")}
                className="w-full py-5 px-8 shadow-xl"
              >
                <LinearGradient
                  colors={["#dc2626", "#dc2626", "#b91c1c"]}
                  style={{ borderRadius: 16 }}
                  className="py-5 px-8 items-center"
                >
                  <View className="flex-row items-center">
                    <CameraIcon size={24} color="white" />
                    <Text className="text-white font-semibold text-lg ml-3">
                      Activate Emergency Scanner
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="items-center mt-8">
          <View className="flex-row items-center">
            <Shield size={16} color="#9ca3af" />
            <Text className="text-gray-400 text-sm ml-2">
              Secure AI-powered emergency response system
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default EmergencyMain;
