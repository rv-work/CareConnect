import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const EmergencyMatches = () => {
  const router = useRouter();
  const { matches: matchesParam } = useLocalSearchParams();

  const [matches, setMatches] = useState([]);
  const [requestingHelp, setRequestingHelp] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [emergencyFormData, setEmergencyFormData] = useState({
    hospitalName: "",
    address: "",
    situation: "",
    description: "",
    photoUri: null,
    coordinates: null,
  });

  useEffect(() => {
    if (matchesParam) {
      try {
        const parsedMatches = JSON.parse(matchesParam);
        setMatches(parsedMatches);
      } catch (error) {
        console.error("Error parsing matches:", error);
      }
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [matchesParam]);

  const getRankSuffix = (index) => {
    const rank = index + 1;
    if (rank === 1) return "st";
    if (rank === 2) return "nd";
    if (rank === 3) return "rd";
    return "th";
  };

  const getScoreColor = (score) => {
    if (score >= 0.9) return { bg: "#d1fae5", text: "#059669" };
    if (score >= 0.8) return { bg: "#dbeafe", text: "#2563eb" };
    if (score >= 0.7) return { bg: "#fef3c7", text: "#d97706" };
    return { bg: "#f3f4f6", text: "#6b7280" };
  };

  const getScoreLabel = (score) => {
    if (score >= 0.9) return "Excellent Match";
    if (score >= 0.8) return "Good Match";
    if (score >= 0.7) return "Fair Match";
    return "Low Match";
  };

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location permission is required for emergency alerts"
        );
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setEmergencyFormData((prev) => ({
        ...prev,
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      }));
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Unable to get location. Please try again.");
    }
    setLoadingLocation(false);
  };

  const handlePhotoUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setEmergencyFormData((prev) => ({
        ...prev,
        photoUri: result.assets[0].uri,
      }));
    }
  };

  const handleSendRequest = (match) => {
    setSelectedMatch(match);
    setShowEmergencyForm(true);
    getCurrentLocation();
  };

  const handleSendEmergencyAlert = async () => {
    if (
      !emergencyFormData.hospitalName ||
      !emergencyFormData.situation ||
      !emergencyFormData.coordinates
    ) {
      Alert.alert(
        "Missing Information",
        "Please fill all required fields and get location"
      );
      return;
    }

    try {
      setRequestingHelp((prev) => ({ ...prev, [selectedMatch.userId]: true }));

      const doctorName =
        (await AsyncStorage.getItem("doctorName")) ||
        (await AsyncStorage.getItem("userName")) ||
        "Dr. Unknown";

      const formData = new FormData();
      formData.append("hospitalName", emergencyFormData.hospitalName);
      formData.append("address", emergencyFormData.address);
      formData.append("situation", emergencyFormData.situation);
      formData.append("description", emergencyFormData.description);
      formData.append(
        "coordinates",
        JSON.stringify(emergencyFormData.coordinates)
      );
      formData.append("patientName", selectedMatch.name);
      formData.append("doctorName", doctorName);

      if (emergencyFormData.photoUri) {
        formData.append("photo", {
          uri: emergencyFormData.photoUri,
          type: "image/jpeg",
          name: "emergency.jpg",
        });
      }

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/emergency/send-alert/${selectedMatch.userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token || ""}`,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        setShowEmergencyForm(false);
        router.push({
          pathname: "/emergency/matches/critical-data",
          params: {
            emergencyId: data.emergencyId,
            patientId: selectedMatch.userId,
            patientName: selectedMatch.name,
          },
        });
      } else {
        throw new Error(data.message || "Failed to send emergency alert");
      }
    } catch (error) {
      console.error("Error sending emergency alert:", error);
      Alert.alert("Error", `Failed to send emergency alert: ${error.message}`);
    } finally {
      setRequestingHelp((prev) => ({ ...prev, [selectedMatch.userId]: false }));
    }
  };

  return (
    <LinearGradient
      colors={["#fef2f2", "#ffffff", "#fdf2f8"]}
      className="flex-1"
    >
      <ScrollView className="flex-1 px-4 py-12">
        {/* Header */}
        <View className="items-center mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-0 left-0 flex-row items-center"
          >
            <ArrowLeft size={20} color="#6b7280" />
            <Text className="text-gray-600 ml-2">Back to Scanner</Text>
          </TouchableOpacity>

          <View className="items-center justify-center mb-6">
            <View className="relative">
              <LinearGradient
                colors={["#ef4444", "#f43f5e"]}
                style={{ borderRadius: 20 }}
                className="p-4 shadow-xl"
              >
                <Shield size={40} color="white" />
              </LinearGradient>
              <View
                className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 items-center justify-center"
                style={{ borderRadius: 12 }}
              >
                <Heart size={12} color="white" />
              </View>
            </View>
          </View>

          <Text className="text-4xl font-bold text-gray-900 mb-3 text-center">
            Emergency Assistance Ready
          </Text>
          <Text className="text-gray-600 text-lg text-center">
            Found{" "}
            <Text className="font-semibold text-red-600">{matches.length}</Text>{" "}
            trusted contacts nearby who can help you
          </Text>

          <View className="flex-row items-center mt-4">
            <Clock size={16} color="#6b7280" />
            <Text className="text-gray-500 text-sm ml-2">
              Last updated: {currentTime.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Emergency Status Alert */}
        <View
          className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 shadow-lg"
          style={{ borderTopRightRadius: 16, borderBottomRightRadius: 16 }}
        >
          <View className="flex-row items-center">
            <View
              className="w-12 h-12 bg-red-100 items-center justify-center"
              style={{ borderRadius: 24 }}
            >
              <AlertTriangle size={24} color="#dc2626" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-semibold text-red-800">
                Emergency Mode Active
              </Text>
              <Text className="text-red-700 mt-1">
                Your location has been shared. Send emergency requests to your
                most trusted connections for immediate assistance.
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Bar */}
        <View className="flex-row justify-between mb-8 space-x-4">
          <View
            className="bg-white p-4 shadow-md border border-gray-100 flex-1"
            style={{ borderRadius: 12 }}
          >
            <View className="flex-row items-center">
              <Phone size={32} color="#2563eb" />
              <View className="ml-3">
                <Text className="font-semibold text-gray-900">Call 911</Text>
                <Text className="text-sm text-gray-600">
                  Emergency Services
                </Text>
              </View>
            </View>
          </View>

          <View
            className="bg-white p-4 shadow-md border border-gray-100 flex-1"
            style={{ borderRadius: 12 }}
          >
            <View className="flex-row items-center">
              <MapPin size={32} color="#059669" />
              <View className="ml-3">
                <Text className="font-semibold text-gray-900">
                  Share Location
                </Text>
                <Text className="text-sm text-gray-600">GPS Coordinates</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Matches List */}
        <View className="space-y-6">
          {matches.map((match, index) => {
            const scoreColor = getScoreColor(match.score);
            const rankColors = [
              ["#fbbf24", "#f59e0b"],
              ["#9ca3af", "#6b7280"],
              ["#fb923c", "#ea580c"],
              ["#3b82f6", "#1d4ed8"],
            ];

            return (
              <View
                key={match.userId}
                className="bg-white shadow-xl border border-gray-100"
                style={{ borderRadius: 16 }}
              >
                <View className="p-6">
                  <View className="flex-row items-center space-x-6">
                    {/* Rank Badge */}
                    <View className="items-center">
                      <LinearGradient
                        colors={rankColors[Math.min(index, 3)]}
                        style={{ borderRadius: 28 }}
                        className="w-14 h-14 items-center justify-center shadow-lg"
                      >
                        <Text className="text-white font-bold text-xl">
                          {index + 1}
                        </Text>
                      </LinearGradient>
                    </View>

                    {/* Profile Section */}
                    <View className="relative">
                      {match.profilePicture ? (
                        <Image
                          source={{ uri: match.profilePicture }}
                          className="w-20 h-20 border-4 border-gray-200 shadow-lg"
                          style={{ borderRadius: 40 }}
                        />
                      ) : (
                        <View
                          className="w-20 h-20 bg-gray-200 items-center justify-center shadow-lg"
                          style={{ borderRadius: 40 }}
                        >
                          <User size={40} color="#6b7280" />
                        </View>
                      )}
                      <View
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white"
                        style={{ borderRadius: 12 }}
                      />
                    </View>

                    {/* User Information */}
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-2xl font-bold text-gray-900 flex-1">
                          {match.name}
                        </Text>
                      </View>

                      <View className="flex-row items-center mb-2">
                        <Text className="text-sm text-gray-500 mr-2">
                          {index + 1}
                          {getRankSuffix(index)} closest match
                        </Text>
                      </View>

                      <View className="flex-row items-center space-x-4">
                        <View
                          className="px-3 py-1"
                          style={{
                            borderRadius: 12,
                            backgroundColor: scoreColor.bg,
                          }}
                        >
                          <Text
                            className="text-sm font-medium"
                            style={{ color: scoreColor.text }}
                          >
                            {getScoreLabel(match.score)}
                          </Text>
                        </View>
                        <Text className="text-sm text-gray-600">
                          Trust Score: {(match.score * 100).toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    onPress={() => handleSendRequest(match)}
                    disabled={requestingHelp[match.userId]}
                    className="mt-4 w-full shadow-lg"
                  >
                    <LinearGradient
                      colors={
                        requestingHelp[match.userId]
                          ? ["#f3f4f6", "#f3f4f6"]
                          : ["#dc2626", "#b91c1c"]
                      }
                      style={{ borderRadius: 12 }}
                      className="py-4 px-6 items-center"
                    >
                      <View className="flex-row items-center">
                        {requestingHelp[match.userId] ? (
                          <>
                            <ActivityIndicator size={20} color="#6b7280" />
                            <Text className="text-gray-400 font-semibold text-lg ml-3">
                              Sending Alert...
                            </Text>
                          </>
                        ) : (
                          <>
                            <MessageSquare size={20} color="white" />
                            <Text className="text-white font-semibold text-lg ml-3">
                              Send Emergency Alert
                            </Text>
                            <ChevronRight size={20} color="white" />
                          </>
                        )}
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Status Bar */}
                <LinearGradient
                  colors={["#f9fafb", "#f3f4f6"]}
                  className="px-6 py-4 border-t border-gray-100"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center space-x-4">
                      <View className="flex-row items-center">
                        <View
                          className="w-2 h-2 bg-green-500 mr-2"
                          style={{ borderRadius: 4 }}
                        />
                        <Text className="text-sm text-gray-600">
                          Available Now
                        </Text>
                      </View>
                      <Text className="text-sm text-gray-600">
                        Verified Emergency Contact
                      </Text>
                    </View>
                    <Text className="text-sm text-gray-500">
                      Match Confidence: {Math.round(match.score * 100)}%
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View className="mt-12">
          <View
            className="bg-blue-50 border border-blue-200 p-6 mx-4"
            style={{ borderRadius: 16 }}
          >
            <View className="flex-row items-center justify-center mb-3">
              <Shield size={24} color="#2563eb" />
              <Text className="text-lg font-semibold text-blue-900 ml-2">
                Emergency Protocol Active
              </Text>
            </View>
            <Text className="text-blue-700 text-center leading-6">
              Emergency requests include your current location, contact
              information, and timestamp. Your trusted contacts will receive
              immediate notifications about your situation.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Emergency Form Modal */}
      <Modal
        visible={showEmergencyForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="p-6 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-gray-900">
                Emergency Alert Details
              </Text>
              <TouchableOpacity
                onPress={() => setShowEmergencyForm(false)}
                className="p-2"
              >
                <Text className="text-gray-400 text-2xl">×</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-gray-600 mt-2">
              Sending emergency alert to:{" "}
              <Text className="font-semibold">{selectedMatch?.name}</Text>
            </Text>
          </View>

          <ScrollView className="flex-1 p-6">
            <View className="space-y-6">
              {/* Hospital Name */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Hospital Name *
                </Text>
                <TextInput
                  value={emergencyFormData.hospitalName}
                  onChangeText={(text) =>
                    setEmergencyFormData((prev) => ({
                      ...prev,
                      hospitalName: text,
                    }))
                  }
                  className="w-full px-3 py-3 border border-gray-300 text-gray-900"
                  style={{ borderRadius: 8 }}
                  placeholder="Enter hospital name"
                />
              </View>

              {/* Address */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Hospital Address
                </Text>
                <TextInput
                  value={emergencyFormData.address}
                  onChangeText={(text) =>
                    setEmergencyFormData((prev) => ({
                      ...prev,
                      address: text,
                    }))
                  }
                  className="w-full px-3 py-3 border border-gray-300 text-gray-900"
                  style={{ borderRadius: 8 }}
                  placeholder="Enter hospital address"
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Situation */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Emergency Situation *
                </Text>
                <View className="space-y-2">
                  {[
                    { value: "car_accident", label: "Car Accident" },
                    { value: "heart_attack", label: "Heart Attack" },
                    { value: "stroke", label: "Stroke" },
                    { value: "fall_injury", label: "Fall Injury" },
                    {
                      value: "breathing_difficulty",
                      label: "Breathing Difficulty",
                    },
                    { value: "severe_bleeding", label: "Severe Bleeding" },
                    { value: "other", label: "Other" },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() =>
                        setEmergencyFormData((prev) => ({
                          ...prev,
                          situation: option.value,
                        }))
                      }
                      className={`p-3 border ${
                        emergencyFormData.situation === option.value
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      style={{ borderRadius: 8 }}
                    >
                      <Text
                        className={
                          emergencyFormData.situation === option.value
                            ? "text-red-700 font-medium"
                            : "text-gray-700"
                        }
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Description */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Description
                </Text>
                <TextInput
                  value={emergencyFormData.description}
                  onChangeText={(text) =>
                    setEmergencyFormData((prev) => ({
                      ...prev,
                      description: text,
                    }))
                  }
                  className="w-full px-3 py-3 border border-gray-300 text-gray-900"
                  style={{ borderRadius: 8 }}
                  placeholder="Brief description of the emergency"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Photo Upload */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Emergency Photo
                </Text>
                <TouchableOpacity
                  onPress={handlePhotoUpload}
                  className="flex-row items-center px-4 py-3 border border-gray-300"
                  style={{ borderRadius: 8 }}
                >
                  <Camera size={16} color="#6b7280" />
                  <Text className="text-gray-700 ml-2">
                    {emergencyFormData.photoUri
                      ? "Photo Selected"
                      : "Upload Photo"}
                  </Text>
                </TouchableOpacity>

                {emergencyFormData.photoUri && (
                  <Image
                    source={{ uri: emergencyFormData.photoUri }}
                    className="w-full h-32 mt-2"
                    style={{ borderRadius: 8 }}
                    resizeMode="cover"
                  />
                )}
              </View>

              {/* Location */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Location Coordinates *
                </Text>
                <TouchableOpacity
                  onPress={getCurrentLocation}
                  disabled={loadingLocation}
                  className="flex-row items-center px-4 py-3 bg-blue-600"
                  style={{ borderRadius: 8 }}
                >
                  {loadingLocation ? (
                    <ActivityIndicator size={16} color="white" />
                  ) : (
                    <MapPin size={16} color="white" />
                  )}
                  <Text className="text-white ml-2">
                    {loadingLocation
                      ? "Getting Location..."
                      : "Get Current Location"}
                  </Text>
                </TouchableOpacity>

                {emergencyFormData.coordinates && (
                  <Text className="text-sm text-green-600 mt-2">
                    Location:{" "}
                    {emergencyFormData.coordinates.latitude.toFixed(4)},{" "}
                    {emergencyFormData.coordinates.longitude.toFixed(4)}
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>

          <View className="p-6 border-t border-gray-200 flex-row justify-between space-x-4">
            <TouchableOpacity
              onPress={() => setShowEmergencyForm(false)}
              className="flex-1 px-6 py-3 border border-gray-300"
              style={{ borderRadius: 8 }}
            >
              <Text className="text-gray-700 text-center font-medium">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSendEmergencyAlert}
              className="flex-1 px-6 py-3 bg-red-600"
              style={{ borderRadius: 8 }}
            >
              <View className="flex-row items-center justify-center">
                <AlertTriangle size={16} color="white" />
                <Text className="text-white font-medium ml-2">Send Alert</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default EmergencyMatches;
