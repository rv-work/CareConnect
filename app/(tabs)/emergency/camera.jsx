// app/(tabs)/emergency/camera.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  CheckCircle,
  Repeat,
  Shield,
} from "lucide-react-native"; // ⬅️ Repeat icon for flip
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function EmergencyCamera() {
  const router = useRouter();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [faceCaptureLoading, setFaceCaptureLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [facing, setFacing] = useState("front"); // ⬅️ Track camera direction

  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      })
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFacing = () => {
    setFacing((prev) => (prev === "front" ? "back" : "front"));
  };

  const captureAndProcessFace = async () => {
    if (!cameraRef.current) {
      setError("Camera not ready");
      return;
    }

    setFaceCaptureLoading(true);
    setError(null);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: false,
      });

      const formData = new FormData();
      formData.append("image", {
        uri: photo.uri,
        type: "image/jpeg",
        name: "face.jpg",
      });

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/emergency/match-face",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token || ""}`,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      if (!response.ok)
        throw new Error(`Face matching failed: ${response.status}`);

      const data = await response.json();

      if (data.success && data.matches && data.matches.length > 0) {
        setSuccessMessage(
          `${data.matches.length} trusted contacts found! Redirecting...`
        );
        setTimeout(() => {
          router.push({
            pathname: "/emergency/matches",
            params: { matches: JSON.stringify(data.matches) },
          });
        }, 2000);
      } else {
        setError(data.message || "No matching user found in the system.");
      }
    } catch (err) {
      console.error("Face verification error:", err);
      setError("Face verification failed. Please try again.");
    }

    setFaceCaptureLoading(false);
  };

  if (!permission) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#ef4444" />
        <Text className="text-white mt-4">
          Requesting camera permissions...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center p-6">
        <AlertTriangle size={64} color="#ef4444" />
        <Text className="text-white text-xl font-bold mt-4 text-center">
          Camera Access Required
        </Text>
        <Text className="text-gray-300 text-center mt-2">
          Please enable camera permissions to use emergency face recognition
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="mt-6 px-6 py-3 bg-red-600 rounded-xl"
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#0f172a", "#7f1d1d", "#000000"]}
      className="flex-1"
    >
      <View className="flex-1 px-6 py-12">
        {/* Camera View */}
        <View
          className="relative border-2 border-red-400/50 mb-6 bg-black/50 shadow-2xl overflow-hidden"
          style={{ borderRadius: 16, height: 300 }}
        >
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing={facing} // ⬅️ dynamic
            ratio="4:3"
          />

          {/* Flip Button */}
          <TouchableOpacity
            onPress={toggleFacing}
            className="absolute bottom-4 right-4 bg-black/50 p-3 rounded-full"
          >
            <Repeat size={24} color="white" />
          </TouchableOpacity>

          {/* Scanning Overlay */}
          <View className="absolute inset-0 pointer-events-none">
            <View
              className="absolute border-2 border-red-500/60"
              style={{
                top: 16,
                left: 16,
                right: 16,
                bottom: 16,
                borderRadius: 16,
              }}
            >
              <View className="absolute -top-1 -left-1 w-8 h-8 border-l-2 border-t-2 border-red-400" />
              <View className="absolute -top-1 -right-1 w-8 h-8 border-r-2 border-t-2 border-red-400" />
              <View className="absolute -bottom-1 -left-1 w-8 h-8 border-l-2 border-b-2 border-red-400" />
              <View className="absolute -bottom-1 -right-1 w-8 h-8 border-r-2 border-b-2 border-red-400" />
            </View>

            {/* Scanning line */}
            <Animated.View
              className="absolute left-8 right-8 h-0.5 bg-red-400"
              style={{
                top: scanLineAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [32, 268],
                }),
              }}
            />
          </View>

          {/* Processing Overlay */}
          {faceCaptureLoading && (
            <View className="absolute inset-0 bg-black/80 items-center justify-center">
              <ActivityIndicator size="large" color="#f87171" />
              <Text className="text-white font-medium text-center mt-4">
                Analyzing biometric data...
              </Text>
              <Text className="text-gray-300 text-sm mt-1 text-center">
                Please hold still
              </Text>
            </View>
          )}
        </View>

        {/* Capture Button */}
        <TouchableOpacity
          onPress={captureAndProcessFace}
          disabled={faceCaptureLoading}
          className="w-full shadow-xl"
        >
          <LinearGradient
            colors={
              faceCaptureLoading
                ? ["#6b7280", "#6b7280"]
                : ["#059669", "#059669", "#047857"]
            }
            style={{ borderRadius: 16 }}
            className="py-5 px-8 items-center"
          >
            <View className="flex-row items-center">
              {faceCaptureLoading ? (
                <ActivityIndicator size={24} color="white" />
              ) : (
                <Shield size={24} color="white" />
              )}
              <Text className="text-white font-semibold text-lg ml-3">
                {faceCaptureLoading
                  ? "Scanning & Processing..."
                  : "Start Emergency Scan"}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Messages */}
        {error && (
          <View
            className="mt-6 bg-red-500/10 border border-red-400/30 p-4"
            style={{ borderRadius: 16 }}
          >
            <View className="flex-row items-start">
              <AlertTriangle size={24} color="#f87171" />
              <View className="ml-3 flex-1">
                <Text className="text-red-300 font-semibold text-sm">
                  System Error
                </Text>
                <Text className="text-red-200 text-sm mt-1">{error}</Text>
              </View>
            </View>
          </View>
        )}

        {successMessage && (
          <View
            className="mt-6 bg-emerald-500/10 border border-emerald-400/30 p-4"
            style={{ borderRadius: 16 }}
          >
            <View className="flex-row items-start">
              <CheckCircle size={24} color="#34d399" />
              <View className="ml-3 flex-1">
                <Text className="text-emerald-300 font-semibold text-sm">
                  Success
                </Text>
                <Text className="text-emerald-200 text-sm mt-1">
                  {successMessage}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}
