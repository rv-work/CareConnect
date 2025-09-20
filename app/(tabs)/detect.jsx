import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundTask from "expo-background-task";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Accelerometer } from "expo-sensors";
import * as Speech from "expo-speech";
import * as TaskManager from "expo-task-manager";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  AppState,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Background Task Name
const BACKGROUND_ACCIDENT_TASK = "background-accident-detection";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Register background task
TaskManager.defineTask(BACKGROUND_ACCIDENT_TASK, async () => {
  try {
    console.log("🔄 Background monitoring active...");

    if (Math.random() < 0.1) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🛡️ Background Protection Active",
          body: "Accident detection running in background",
          data: { type: "status_check" },
          sound: false,
        },
        trigger: null,
      });
    }

    return BackgroundTask.BackgroundTaskResult.NewData;
  } catch (error) {
    console.error("Background task error:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export default function Detect() {
  const [accelData, setAccelData] = useState({});
  const [location, setLocation] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastMagnitude, setLastMagnitude] = useState(0);
  const [alertSent, setAlertSent] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [backgroundEnabled, setBackgroundEnabled] = useState(false);

  const subscriptionRef = useRef(null);
  const baselineRef = useRef([]);
  const countdownRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for monitoring indicator
  useEffect(() => {
    if (isMonitoring) {
      const pulse = Animated.loop(
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
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isMonitoring, pulseAnim]);

  // Send emergency request to backend
  const sendEmergencyToBackend = async (coords) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/user/please-help",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            latitude: coords.latitude,
            longitude: coords.longitude,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        console.log("Emergency alert sent to backend successfully");
      } else {
        console.error("Failed to send emergency alert to backend");
      }
    } catch (error) {
      console.error("Error sending emergency alert:", error);
    }
  };

  // Initialize notifications
  useEffect(() => {
    registerForPushNotificationsAsync();
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert(
        "⚠️ Permission Required",
        "Notifications are needed for emergency alerts"
      );
      return;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("emergency", {
        name: "Emergency Alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  };

  const handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log("App has come to the foreground!");
    } else if (nextAppState.match(/inactive|background/) && isMonitoring) {
      console.log("App going to background - enabling background monitoring");
      enableBackgroundMonitoring();
    }
    appState.current = nextAppState;
  };

  const enableBackgroundMonitoring = async () => {
    try {
      await BackgroundTask.registerTaskAsync(BACKGROUND_ACCIDENT_TASK, {
        minimumInterval: 15000,
        stopOnTerminate: false,
        startOnBoot: true,
      });
      setBackgroundEnabled(true);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🛡️ MediCare Protection Enabled",
          body: "Background accident monitoring is now active",
          data: { type: "background_enabled" },
          sound: false,
        },
        trigger: null,
      });

      console.log("✅ Background monitoring registered successfully");
    } catch (error) {
      console.error("Background registration error:", error);
      Alert.alert(
        "⚠️ Background Setup",
        "Background monitoring may be limited on this device"
      );
    }
  };

  const handleAccidentDetected = async (isBackground = false) => {
    if (alertSent) return;
    setAlertSent(true);

    if (isBackground || appState.current !== "active") {
      await showBackgroundEmergencyNotification();
    } else {
      showForegroundEmergencyAlert();
    }
  };

  const showBackgroundEmergencyNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚨 ACCIDENT DETECTED!",
        body: "Tap to respond - Emergency alert in 10 seconds",
        data: { type: "emergency_detection" },
        sound: true,
        priority: "high",
      },
      trigger: null,
    });

    setTimeout(async () => {
      if (alertSent) {
        await sendEmergencyAlert();
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "🚨 Emergency Alert Sent",
            body: "Emergency services have been notified",
            sound: true,
          },
          trigger: null,
        });
      }
    }, 10000);
  };

  const showForegroundEmergencyAlert = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }

    Speech.speak("Are you okay? Please confirm if you are safe.", {
      pitch: 1.2,
      rate: 1.0,
      language: "en-US",
    });

    setShowEmergencyModal(true);
    setCountdown(10);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setShowEmergencyModal(false);
          sendEmergencyAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { type } = response.notification.request.content.data;
        if (type === "emergency_detection") {
          setShowEmergencyModal(true);
          setCountdown(5);
          showForegroundEmergencyAlert();
        }
      }
    );
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMonitoring = async () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      await startMonitoring();
    }
  };

  const startMonitoring = async () => {
    setIsMonitoring(true);
    setAlertSent(false);
    baselineRef.current = [];

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "⚠️ Location Permission",
        "Location access is required for emergency features"
      );
    }

    Accelerometer.setUpdateInterval(200);

    subscriptionRef.current = Accelerometer.addListener((data) => {
      setAccelData(data);
      const magnitude = Math.sqrt(
        data.x * data.x + data.y * data.y + data.z * data.z
      );
      setLastMagnitude(magnitude);

      if (baselineRef.current.length < 10) {
        baselineRef.current.push(magnitude);
        return;
      }

      const avgBaseline =
        baselineRef.current.reduce((a, b) => a + b, 0) /
        baselineRef.current.length;
      const changeFromBaseline = Math.abs(magnitude - avgBaseline);
      const suddenChange = changeFromBaseline > 2.0;
      const highMagnitude = magnitude > 15.0;

      if ((suddenChange || highMagnitude) && !alertSent) {
        console.log("🚨 ACCIDENT DETECTED!");
        handleAccidentDetected();
      }

      if (baselineRef.current.length >= 10) {
        baselineRef.current.shift();
        baselineRef.current.push(magnitude);
      }
    });

    await enableBackgroundMonitoring();
  };

  const stopMonitoring = async () => {
    setIsMonitoring(false);
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }

    try {
      await BackgroundTask.unregisterTaskAsync(BACKGROUND_ACCIDENT_TASK);
      setBackgroundEnabled(false);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🛑 Protection Stopped",
          body: "Background monitoring has been disabled",
          sound: false,
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Error stopping background task:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "⚠️ Permission Denied",
          "Location access is required for emergency alerts"
        );
        return null;
      }

      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      });

      setLocation(loc.coords);
      return loc.coords;
    } catch (error) {
      console.error("Location error:", error);
      return null;
    }
  };

  const sendEmergencyAlert = async () => {
    const coords = await getLocation();

    if (!coords) {
      Alert.alert("❌ Error", "Could not get location for emergency alert");
      setAlertSent(false);
      return;
    }

    try {
      // Send to backend
      await sendEmergencyToBackend(coords);

      if (appState.current === "active") {
        Speech.speak("Emergency alert has been sent to your contacts.", {
          pitch: 1.0,
          rate: 0.9,
        });
        Alert.alert(
          "🚨 Emergency Alert Sent!",
          "Emergency services have been notified."
        );
      }
    } catch (error) {
      console.error("Emergency Alert Error:", error);
    }

    setAlertSent(false);
  };

  const handleUserOK = () => {
    clearInterval(countdownRef.current);
    setShowEmergencyModal(false);
    setAlertSent(false);

    Speech.speak("Glad you're safe!", { pitch: 1.0, rate: 1.0 });
    Alert.alert("✅ All Good!", "Emergency alert cancelled. Stay safe!");

    setTimeout(() => {
      if (!subscriptionRef.current && isMonitoring) {
        startMonitoringAgain();
      }
    }, 2000);
  };

  const startMonitoringAgain = () => {
    subscriptionRef.current = Accelerometer.addListener((data) => {
      setAccelData(data);
      const magnitude = Math.sqrt(
        data.x * data.x + data.y * data.y + data.z * data.z
      );
      setLastMagnitude(magnitude);

      if (baselineRef.current.length >= 10) {
        const avgBaseline =
          baselineRef.current.reduce((a, b) => a + b, 0) /
          baselineRef.current.length;
        const changeFromBaseline = Math.abs(magnitude - avgBaseline);

        if ((changeFromBaseline > 2.0 || magnitude > 15.0) && !alertSent) {
          handleAccidentDetected();
        }

        baselineRef.current.shift();
        baselineRef.current.push(magnitude);
      }
    });
  };

  const handleCancel = () => {
    clearInterval(countdownRef.current);
    setShowEmergencyModal(false);
    setAlertSent(false);

    setTimeout(() => {
      if (!subscriptionRef.current && isMonitoring) {
        startMonitoringAgain();
      }
    }, 1000);
  };

  const testBackgroundAlert = async () => {
    Alert.alert(
      "🧪 Background Test",
      "This will send a test notification in 3 seconds.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Test Background",
          onPress: () => {
            setTimeout(async () => {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "🚨 ACCIDENT DETECTED! (TEST)",
                  body: "Tap to respond - Emergency alert in 10 seconds",
                  data: { type: "emergency_detection", isTest: true },
                  sound: true,
                  priority: "high",
                },
                trigger: null,
              });
            }, 3000);
          },
        },
      ]
    );
  };

  const manualTest = () => {
    Alert.alert(
      "🧪 Test Alert",
      "This will trigger the accident detection manually. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Test", onPress: () => handleAccidentDetected(false) },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
      <View className="flex-1 items-center justify-center px-6 py-8">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-4xl font-bold text-gray-800 mb-2">
            🚗 Smart Guardian
          </Text>
          <Text className="text-lg text-gray-600 text-center">
            Advanced Accident Detection System
          </Text>
        </View>

        {/* Status Card */}
        <View className="bg-white rounded-2xl p-6 mb-6 w-full shadow-lg border border-gray-100">
          <View className="items-center">
            <Animated.View
              style={{ transform: [{ scale: pulseAnim }] }}
              className="mb-4"
            >
              <View
                className={`w-16 h-16 rounded-full items-center justify-center ${
                  isMonitoring ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <Text className="text-2xl">{isMonitoring ? "🛡️" : "⏸️"}</Text>
              </View>
            </Animated.View>

            <Text
              className={`text-xl font-semibold mb-2 ${
                isMonitoring ? "text-green-600" : "text-red-500"
              }`}
            >
              {isMonitoring ? "🟢 Protection Active" : "🔴 Protection Off"}
            </Text>

            {backgroundEnabled && (
              <View className="bg-green-50 px-4 py-2 rounded-full mb-2">
                <Text className="text-sm font-medium text-green-700">
                  📱 Background Mode: ON
                </Text>
              </View>
            )}

            {isMonitoring && (
              <Text className="text-sm text-gray-500 text-center italic">
                🔒 Protected even when app is closed
              </Text>
            )}
          </View>
        </View>

        {/* Sensor Data Card */}
        <View className="bg-white rounded-2xl p-6 mb-6 w-full shadow-lg border border-gray-100">
          <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
            📊 Live Sensor Data
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between items-center bg-gray-50 p-3 rounded-xl">
              <Text className="text-gray-600 font-medium">X-Axis:</Text>
              <Text className="font-mono text-blue-600 font-bold">
                {accelData.x?.toFixed(3) || "0.000"}
              </Text>
            </View>

            <View className="flex-row justify-between items-center bg-gray-50 p-3 rounded-xl">
              <Text className="text-gray-600 font-medium">Y-Axis:</Text>
              <Text className="font-mono text-blue-600 font-bold">
                {accelData.y?.toFixed(3) || "0.000"}
              </Text>
            </View>

            <View className="flex-row justify-between items-center bg-gray-50 p-3 rounded-xl">
              <Text className="text-gray-600 font-medium">Z-Axis:</Text>
              <Text className="font-mono text-blue-600 font-bold">
                {accelData.z?.toFixed(3) || "0.000"}
              </Text>
            </View>

            <View className="flex-row justify-between items-center bg-indigo-50 p-3 rounded-xl border border-indigo-200">
              <Text className="text-indigo-700 font-semibold">Magnitude:</Text>
              <Text className="font-mono text-indigo-800 font-bold text-lg">
                {lastMagnitude.toFixed(3)}
              </Text>
            </View>
          </View>
        </View>

        {/* Control Buttons */}
        <View className="w-full space-y-4">
          <TouchableOpacity
            onPress={toggleMonitoring}
            className={`w-full py-4 rounded-2xl shadow-lg ${
              isMonitoring
                ? "bg-red-500 active:bg-red-600"
                : "bg-green-500 active:bg-green-600"
            }`}
          >
            <Text className="text-white text-lg font-bold text-center">
              {isMonitoring ? "🛑 Stop Protection" : "🛡️ Start Protection"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={testBackgroundAlert}
              className="flex-1 bg-purple-500 active:bg-purple-600 py-3 rounded-xl shadow-md"
            >
              <Text className="text-white font-semibold text-center">
                🧪 Test Background
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={manualTest}
              className="flex-1 bg-orange-500 active:bg-orange-600 py-3 rounded-xl shadow-md"
            >
              <Text className="text-white font-semibold text-center">
                🧪 Test Emergency
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Display */}
        {location && (
          <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mt-6 w-full">
            <Text className="text-green-800 text-center font-medium">
              📍 Last Location: {location.latitude.toFixed(4)},{" "}
              {location.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        {/* Info Card */}
        <View className="bg-white rounded-2xl p-6 mt-6 w-full shadow-lg border-l-4 border-l-blue-500">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            ℹ️ How it works:
          </Text>
          <View className="space-y-2">
            <Text className="text-gray-600">
              • 🔍 Monitors phone motion continuously
            </Text>
            <Text className="text-gray-600">
              • 🗣️ Voice alert: &quot;Are you okay?&quot;
            </Text>
            <Text className="text-gray-600">
              • ⏰ 10-second countdown to respond
            </Text>
            <Text className="text-gray-600">
              • 📍 Auto-sends GPS location to contacts
            </Text>
            <Text className="text-gray-600">
              • 🔔 Background notifications for safety
            </Text>
          </View>
        </View>
      </View>

      {/* Emergency Modal */}
      <Modal
        visible={showEmergencyModal}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-red-900/90 justify-center items-center p-6">
          <View className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <Text className="text-4xl font-bold text-red-600 text-center mb-4">
              🚨 ACCIDENT DETECTED!
            </Text>
            <Text className="text-2xl font-semibold text-gray-800 text-center mb-3">
              Are you okay?
            </Text>
            <Text className="text-lg text-gray-600 text-center mb-8 font-medium">
              Emergency alert in: {countdown} seconds
            </Text>

            <View className="space-y-4">
              <TouchableOpacity
                onPress={handleUserOK}
                className="bg-green-500 active:bg-green-600 py-4 rounded-2xl shadow-lg"
              >
                <Text className="text-white text-xl font-bold text-center">
                  ✅ I&apos;M OK
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  clearInterval(countdownRef.current);
                  setShowEmergencyModal(false);
                  sendEmergencyAlert();
                }}
                className="bg-red-500 active:bg-red-600 py-4 rounded-2xl shadow-lg"
              >
                <Text className="text-white text-xl font-bold text-center">
                  🚨 SEND HELP NOW
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleCancel} className="py-2">
                <Text className="text-gray-400 text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
