import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  MapPin,
  Phone,
  Pill,
  Ruler,
  Scale,
  Shield,
  Thermometer,
  User,
  UserCheck,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CriticalData = () => {
  const router = useRouter();
  const { emergencyId, patientId, patientName } = useLocalSearchParams();

  const [checkingApproval, setCheckingApproval] = useState(true);
  const [approved, setApproved] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Animations
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    if (emergencyId) {
      checkApprovalStatus(emergencyId);
    }

    // Start spin animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emergencyId]);

  useEffect(() => {
    if (approved) {
      // Fade in and scale animations when approved
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approved]);

  const checkApprovalStatus = async (emergencyId) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/emergency/check-approval/${emergencyId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to check status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "approved") {
        setCheckingApproval(false);
        setApproved(true);
        // Load real patient data when approved
        loadPatientData(data.patientId || patientId);
      } else if (data.status === "rejected") {
        setCheckingApproval(false);
        Alert.alert(
          "Request Rejected",
          `Emergency request was rejected${
            data.rejectedBy ? " by " + data.rejectedBy : ""
          }.`,
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else if (data.status === "pending") {
        setTimeout(() => checkApprovalStatus(emergencyId), 5000);
      }
    } catch (error) {
      console.error("Error checking approval status:", error);
      setTimeout(() => checkApprovalStatus(emergencyId), 5000);
    }
  };

  const loadPatientData = async (userId) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/user/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch patient data: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setPatientData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to fetch critical data");
      console.error("Error fetching critical data:", err);
    } finally {
      setLoading(false);
    }
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (checkingApproval) {
    return (
      <LinearGradient
        colors={["#fef3c7", "#ffffff", "#fed7aa"]}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            style={{
              transform: [{ rotate: spin }],
            }}
            className="mb-6"
          >
            <View
              className="h-16 w-16 border-4 border-orange-500 border-t-transparent"
              style={{ borderRadius: 32 }}
            />
          </Animated.View>

          <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Waiting for Approval
          </Text>
          <Text className="text-gray-600 mb-4 text-center">
            Emergency request sent to{" "}
            <Text className="font-bold">{patientName}</Text>
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            We&apos;ve notified their emergency contacts. Please wait for
            approval...
          </Text>

          <View
            className="mt-6 bg-yellow-50 border border-yellow-200 p-4"
            style={{ borderRadius: 12 }}
          >
            <Text className="text-sm text-yellow-700 text-center">
              The patient or their trusted contacts will approve or reject this
              request.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 px-4 py-2"
          >
            <Text className="text-gray-600 text-sm">Cancel Request</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (loading) {
    return (
      <LinearGradient
        colors={["#fef3c7", "#ffffff", "#fed7aa"]}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text className="text-xl font-bold text-gray-900 mt-4">
            Loading Emergency Data...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={["#fef3c7", "#ffffff", "#fed7aa"]}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={64} color="#dc2626" />
          <Text className="text-2xl font-bold text-red-800 mt-4 mb-2">
            Error
          </Text>
          <Text className="text-red-700 text-center">{error}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-red-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Critical data display after approval
  if (approved && patientData) {
    const {
      patientInfo,
      emergencyContacts = [],
      allergies = [],
      chronicConditions = [],
      currentMedications = [],
      latestVitals,
      latestWeight,
      latestHeight,
      recentSurgeries = [],
      surgicalHistory = [],
      immunizations = [],
    } = patientData;

    return (
      <LinearGradient
        colors={["#ecfdf5", "#ffffff", "#f0fdf4"]}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 py-12">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center"
            >
              <ArrowLeft size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-2">Back</Text>
            </TouchableOpacity>

            <View className="flex-row items-center">
              <Clock size={16} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-2">
                {currentTime.toLocaleTimeString()}
              </Text>
            </View>
          </View>

          {/* Success Banner */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <LinearGradient
              colors={["#059669", "#047857"]}
              style={{ borderRadius: 16 }}
              className="p-6 mb-6 shadow-lg"
            >
              <View className="flex-row items-center">
                <CheckCircle size={32} color="white" />
                <View className="ml-4 flex-1">
                  <Text className="text-white font-bold text-xl">
                    Access Approved
                  </Text>
                  <Text className="text-green-100 mt-1">
                    Critical medical data is now available
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Patient Header */}
          <View
            className="bg-white p-6 mb-6 shadow-lg border border-gray-100"
            style={{ borderRadius: 16 }}
          >
            <View className="flex-row items-center">
              <View
                className="w-16 h-16 bg-blue-100 items-center justify-center"
                style={{ borderRadius: 32 }}
              >
                <User size={32} color="#2563eb" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-2xl font-bold text-gray-900">
                  {patientInfo?.name || "Unknown Patient"}
                </Text>
                <Text className="text-gray-600 mt-1">
                  Age: {patientInfo?.age || "N/A"} •{" "}
                  {patientInfo?.gender || "N/A"} • Blood Type:{" "}
                  <Text className="font-bold text-red-600">
                    {patientInfo?.bloodGroup || "Unknown"}
                  </Text>
                </Text>
              </View>
              <View className="items-center">
                <Heart size={24} color="#ef4444" />
                <Text className="text-xs text-gray-500 mt-1">CRITICAL</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats - Vitals */}
          {latestVitals && (
            <View className="flex-row justify-between mb-6 space-x-3">
              {latestVitals.bloodPressure && (
                <View
                  className="bg-white p-4 flex-1 shadow-md border border-gray-100"
                  style={{ borderRadius: 12 }}
                >
                  <Thermometer size={24} color="#ef4444" />
                  <Text className="text-gray-600 text-xs mt-2">
                    Blood Pressure
                  </Text>
                  <Text className="font-bold text-gray-900">
                    {latestVitals.bloodPressure.systolic}/
                    {latestVitals.bloodPressure.diastolic}
                  </Text>
                </View>
              )}

              {latestVitals.heartRate && (
                <View
                  className="bg-white p-4 flex-1 shadow-md border border-gray-100"
                  style={{ borderRadius: 12 }}
                >
                  <Heart size={24} color="#f59e0b" />
                  <Text className="text-gray-600 text-xs mt-2">Heart Rate</Text>
                  <Text className="font-bold text-gray-900">
                    {latestVitals.heartRate.value} bpm
                  </Text>
                </View>
              )}

              {latestVitals.bloodSugar && (
                <View
                  className="bg-white p-4 flex-1 shadow-md border border-gray-100"
                  style={{ borderRadius: 12 }}
                >
                  <Activity size={24} color="#059669" />
                  <Text className="text-gray-600 text-xs mt-2">
                    Blood Sugar
                  </Text>
                  <Text className="font-bold text-gray-900">
                    {latestVitals.bloodSugar.value} mg/dL
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Physical Stats */}
          {(latestWeight || latestHeight) && (
            <View className="flex-row justify-between mb-6 space-x-3">
              {latestWeight && (
                <View
                  className="bg-white p-4 flex-1 shadow-md border border-gray-100"
                  style={{ borderRadius: 12 }}
                >
                  <Scale size={24} color="#3b82f6" />
                  <Text className="text-gray-600 text-xs mt-2">Weight</Text>
                  <Text className="font-bold text-gray-900">
                    {latestWeight.value} kg
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {formatDate(latestWeight.date)}
                  </Text>
                </View>
              )}

              {latestHeight && (
                <View
                  className="bg-white p-4 flex-1 shadow-md border border-gray-100"
                  style={{ borderRadius: 12 }}
                >
                  <Ruler size={24} color="#10b981" />
                  <Text className="text-gray-600 text-xs mt-2">Height</Text>
                  <Text className="font-bold text-gray-900">
                    {latestHeight.value} cm
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {formatDate(latestHeight.date)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Allergies - Critical Section */}
          <View
            className="bg-red-50 p-6 mb-6 shadow-lg border border-red-200"
            style={{ borderRadius: 16 }}
          >
            <View className="flex-row items-center mb-4">
              <AlertTriangle size={24} color="#dc2626" />
              <Text className="text-xl font-bold text-red-800 ml-3">
                ⚠️ ALLERGIES - CRITICAL
              </Text>
            </View>
            {allergies.length > 0 ? (
              allergies.map((allergy, index) => (
                <View
                  key={index}
                  className={`p-4 mb-3 border-2 ${
                    allergy.severity === "Severe"
                      ? "bg-red-100 border-red-500"
                      : allergy.severity === "Moderate"
                      ? "bg-orange-100 border-orange-500"
                      : "bg-yellow-100 border-yellow-500"
                  }`}
                  style={{ borderRadius: 12 }}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="font-bold text-lg text-gray-800 flex-1">
                      {allergy.allergen}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full ${
                        allergy.severity === "Severe"
                          ? "bg-red-500"
                          : allergy.severity === "Moderate"
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      <Text className="text-white text-xs font-bold">
                        {allergy.severity}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-700 mb-1">
                    {allergy.type}
                  </Text>
                  {allergy.reaction && (
                    <Text className="text-sm text-gray-600 mb-1">
                      <Text className="font-semibold">Reaction:</Text>{" "}
                      {allergy.reaction}
                    </Text>
                  )}
                  {allergy.emergencyMedication && (
                    <Text className="text-sm text-blue-700 font-semibold">
                      <Text className="font-bold">Emergency Med:</Text>{" "}
                      {allergy.emergencyMedication}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <Text className="text-gray-500 italic">No known allergies</Text>
            )}
          </View>

          {/* Chronic Conditions */}
          {chronicConditions.length > 0 && (
            <View
              className="bg-white p-6 mb-6 shadow-lg border border-gray-100"
              style={{ borderRadius: 16 }}
            >
              <View className="flex-row items-center mb-4">
                <Heart size={24} color="#7c3aed" />
                <Text className="text-xl font-bold text-gray-900 ml-3">
                  Chronic Conditions
                </Text>
              </View>
              {chronicConditions.map((condition, index) => (
                <View
                  key={index}
                  className="bg-purple-50 p-4 mb-3 border border-purple-200"
                  style={{ borderRadius: 12 }}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="font-bold text-gray-800 flex-1">
                      {condition.conditionName}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full ${
                        condition.severityLevel === "severe"
                          ? "bg-red-500"
                          : condition.severityLevel === "moderate"
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                    >
                      <Text className="text-white text-xs font-bold">
                        {condition.severityLevel}
                      </Text>
                    </View>
                  </View>
                  {condition.triggers && condition.triggers.length > 0 && (
                    <Text className="text-sm text-gray-600 mb-1">
                      <Text className="font-semibold">Triggers:</Text>{" "}
                      {condition.triggers.join(", ")}
                    </Text>
                  )}
                  {condition.precautions &&
                    condition.precautions.length > 0 && (
                      <Text className="text-sm text-red-700">
                        <Text className="font-semibold">Precautions:</Text>{" "}
                        {condition.precautions.join(", ")}
                      </Text>
                    )}
                </View>
              ))}
            </View>
          )}

          {/* Current Medications */}
          {currentMedications.length > 0 && (
            <View
              className="bg-white p-6 mb-6 shadow-lg border border-gray-100"
              style={{ borderRadius: 16 }}
            >
              <View className="flex-row items-center mb-4">
                <Pill size={24} color="#059669" />
                <Text className="text-xl font-bold text-gray-900 ml-3">
                  Current Medications
                </Text>
              </View>
              {currentMedications.map((med, index) => (
                <View
                  key={index}
                  className="bg-blue-50 p-4 mb-3 border border-blue-200"
                  style={{ borderRadius: 12 }}
                >
                  <Text className="font-bold text-gray-800 text-lg mb-2">
                    {med.name}
                  </Text>
                  <View className="space-y-1">
                    <Text className="text-sm">
                      <Text className="font-semibold">Dose:</Text> {med.dose}
                    </Text>
                    <Text className="text-sm">
                      <Text className="font-semibold">Frequency:</Text>{" "}
                      {med.frequency}
                    </Text>
                    {med.timing && (
                      <Text className="text-sm">
                        <Text className="font-semibold">Timing:</Text>{" "}
                        {med.timing.join(", ")}
                      </Text>
                    )}
                    {med.condition && (
                      <Text className="text-sm text-purple-700">
                        <Text className="font-semibold">For:</Text>{" "}
                        {med.condition}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Emergency Contacts */}
          {emergencyContacts.length > 0 && (
            <View
              className="bg-white p-6 mb-6 shadow-lg border border-gray-100"
              style={{ borderRadius: 16 }}
            >
              <View className="flex-row items-center mb-4">
                <UserCheck size={24} color="#f59e0b" />
                <Text className="text-xl font-bold text-gray-900 ml-3">
                  Emergency Contacts
                </Text>
              </View>
              {emergencyContacts.map((contact, index) => (
                <View
                  key={index}
                  className="bg-green-50 p-4 mb-3 border border-green-200"
                  style={{ borderRadius: 12 }}
                >
                  <Text className="font-semibold text-gray-800 text-lg">
                    {contact.name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Phone size={16} color="#059669" />
                    <Text className="text-green-700 ml-2 font-mono">
                      {contact.phone}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600">
                    {contact.relation}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Surgical History */}
          {(surgicalHistory.length > 0 || recentSurgeries.length > 0) && (
            <View
              className="bg-white p-6 mb-6 shadow-lg border border-gray-100"
              style={{ borderRadius: 16 }}
            >
              <View className="flex-row items-center mb-4">
                <FileText size={24} color="#f97316" />
                <Text className="text-xl font-bold text-gray-900 ml-3">
                  Surgical History
                </Text>
              </View>
              {surgicalHistory.slice(0, 5).map((surgery, index) => (
                <View
                  key={index}
                  className="bg-orange-50 p-4 mb-3 border border-orange-200"
                  style={{ borderRadius: 12 }}
                >
                  <Text className="font-bold text-gray-800 text-lg">
                    {surgery.procedure}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Calendar size={16} color="#f97316" />
                    <Text className="text-sm text-gray-600 ml-2">
                      {formatDate(surgery.date)}
                    </Text>
                  </View>
                  {surgery.surgeon && (
                    <Text className="text-sm text-gray-600">
                      Dr. {surgery.surgeon}
                    </Text>
                  )}
                  {surgery.hospital && (
                    <Text className="text-sm text-gray-600">
                      Hospital: {surgery.hospital}
                    </Text>
                  )}
                  {surgery.indication && (
                    <Text className="text-sm text-blue-700">
                      Indication: {surgery.indication}
                    </Text>
                  )}
                  {surgery.complications && (
                    <Text className="text-sm text-red-700">
                      <Text className="font-semibold">Complications:</Text>{" "}
                      {surgery.complications}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Immunizations */}
          {immunizations.length > 0 && (
            <View
              className="bg-white p-6 mb-6 shadow-lg border border-gray-100"
              style={{ borderRadius: 16 }}
            >
              <View className="flex-row items-center mb-4">
                <Shield size={24} color="#059669" />
                <Text className="text-xl font-bold text-gray-900 ml-3">
                  Immunizations
                </Text>
              </View>
              {immunizations.slice(0, 6).map((immunization, index) => (
                <View
                  key={index}
                  className={`p-4 mb-3 border-2 ${
                    immunization.status === "Current"
                      ? "bg-green-50 border-green-200"
                      : immunization.status === "Overdue"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                  style={{ borderRadius: 12 }}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="font-bold text-gray-800 flex-1">
                      {immunization.vaccine}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full ${
                        immunization.status === "Current"
                          ? "bg-green-500"
                          : immunization.status === "Overdue"
                          ? "bg-red-500"
                          : "bg-gray-500"
                      }`}
                    >
                      <Text className="text-white text-xs font-bold">
                        {immunization.status}
                      </Text>
                    </View>
                  </View>
                  {immunization.doses && (
                    <Text className="text-sm">
                      <Text className="font-semibold">Doses:</Text>{" "}
                      {immunization.doses}
                    </Text>
                  )}
                  {immunization.lastDate && (
                    <Text className="text-sm">
                      <Text className="font-semibold">Last Date:</Text>{" "}
                      {formatDate(immunization.lastDate)}
                    </Text>
                  )}
                  {immunization.nextDue && (
                    <Text
                      className={`text-sm ${
                        immunization.status === "Overdue"
                          ? "text-red-700 font-semibold"
                          : "text-blue-700"
                      }`}
                    >
                      <Text className="font-semibold">Next Due:</Text>{" "}
                      {formatDate(immunization.nextDue)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Critical Alert Footer */}
          <View
            className="bg-red-50 border border-red-200 p-6 mb-6"
            style={{ borderRadius: 16 }}
          >
            <View className="flex-row items-center mb-3">
              <AlertCircle size={24} color="#dc2626" />
              <Text className="text-lg font-semibold text-red-900 ml-2">
                Emergency Protocol Guidelines
              </Text>
            </View>
            <Text className="text-red-700 leading-6">
              This data is provided for emergency medical treatment only. Always
              verify critical information when possible. Contact emergency
              services immediately if patient condition deteriorates.
            </Text>
          </View>

          {/* Emergency Actions */}
          <View className="flex-row space-x-4">
            <TouchableOpacity className="flex-1">
              <LinearGradient
                colors={["#dc2626", "#b91c1c"]}
                style={{ borderRadius: 12 }}
                className="py-4 px-6 items-center"
              >
                <View className="flex-row items-center">
                  <Phone size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Call 911
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1">
              <LinearGradient
                colors={["#2563eb", "#1d4ed8"]}
                style={{ borderRadius: 12 }}
                className="py-4 px-6 items-center"
              >
                <View className="flex-row items-center">
                  <MapPin size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Share Location
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="bg-gray-800 p-4 rounded-xl mt-6">
            <View className="flex-row items-center justify-center mb-2">
              <Clock size={20} color="white" />
              <Text className="text-white text-sm ml-2">
                Data accessed at {currentTime.toLocaleString()}
              </Text>
            </View>
            <Text className="text-gray-300 text-xs text-center">
              For complete medical records, please contact the patient&apos;s
              primary healthcare provider
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // Fallback loading state
  return (
    <View className="flex-1 bg-gray-900 items-center justify-center">
      <ActivityIndicator size="large" color="#ef4444" />
      <Text className="text-white mt-4">Loading emergency data...</Text>
    </View>
  );
};

export default CriticalData;
