import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Bed,
  Calendar,
  CheckCircle,
  Cigarette,
  Droplet,
  Dumbbell,
  Edit3,
  FileText,
  Heart,
  Info,
  Mail,
  Phone,
  Plus,
  Scale,
  Scissors,
  Settings,
  Shield,
  Sparkles,
  Stethoscope,
  Syringe,
  Target,
  TrendingUp,
  User,
  UserCheck,
  Utensils,
  XCircle,
  Zap,
} from "lucide-react-native";
import { LineChart } from "react-native-chart-kit";

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/user/dashboard",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Complete API Response: ", data);

      setUserData(data.user || data);
      setError(null);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(error.message);
      Alert.alert("Error", "Failed to load health data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUserData();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLatestValue = (records) => {
    if (!records || records.length === 0) return null;
    return records[records.length - 1];
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getBMIStatus = (bmi) => {
    if (!bmi) return "Unknown";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const getBPStatus = (systolic, diastolic) => {
    if (!systolic || !diastolic) return "Unknown";
    if (systolic < 120 && diastolic < 80) return "Normal";
    if (systolic < 140 && diastolic < 90) return "Elevated";
    return "High";
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "severe":
        return "bg-red-100 border-red-200";
      case "moderate":
        return "bg-yellow-100 border-yellow-200";
      case "mild":
        return "bg-green-100 border-green-200";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "current":
        return "bg-green-100";
      case "completed":
        return "bg-blue-100";
      case "overdue":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  // Chart configuration
  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#f8fafc",
    backgroundGradientTo: "#e2e8f0",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 65, 85, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#6366f1",
    },
  };

  // Prepare chart data
  const prepareChartData = (records, label) => {
    if (!records || records.length === 0) return null;

    const sortedRecords = records
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      labels: sortedRecords.map((record) =>
        new Date(record.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      ),
      datasets: [
        {
          data: sortedRecords.map((record) => record.value || record.systolic),
          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          strokeWidth: 3,
        },
      ],
      legend: [label],
    };
  };

  const prepareBPChartData = (records) => {
    if (!records || records.length === 0) return null;

    const sortedRecords = records
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      labels: sortedRecords.map((record) =>
        new Date(record.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      ),
      datasets: [
        {
          data: sortedRecords.map((record) => record.systolic),
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          strokeWidth: 3,
        },
        {
          data: sortedRecords.map((record) => record.diastolic),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 3,
        },
      ],
      legend: ["Systolic", "Diastolic"],
    };
  };

  const handleAddNew = (section) => {
    Alert.alert(
      "Add New",
      `Add new ${section} functionality would be implemented here`
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#0f172a", "#6b21a8", "#0f172a"]}
        className="flex-1 justify-center items-center"
      >
        <View className="items-center p-4">
          <View className="relative mb-8">
            <LinearGradient
              colors={["#3b82f6", "#8b5cf6", "#ec4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="w-32 h-32 items-center justify-center"
              style={{ borderRadius: 9999 }}
            >
              <Heart size={48} color="#ef4444" />
            </LinearGradient>
            <View className="absolute -top-2 -right-2">
              <Sparkles size={24} color="#fbbf24" />
            </View>
            <View className="absolute -bottom-2 -left-2">
              <Zap size={20} color="#06b6d4" />
            </View>
          </View>

          <Text className="text-4xl font-bold text-white mb-4 text-center">
            Initializing Health Dashboard
          </Text>
          <Text className="text-gray-300 text-lg mb-8 text-center">
            Analyzing your health data with AI insights...
          </Text>

          <View className="flex-row gap-x-2 mb-4">
            <View className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" />
            <View className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" />
            <View className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" />
            <View className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" />
          </View>

          <ActivityIndicator size="large" color="#8b5cf6" className="mt-4" />

          <Text className="text-sm text-gray-400 mt-4">
            Powered by Advanced AI Analytics
          </Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={["#fef2f2", "#fce7f3"]}
        className="flex-1 justify-center items-center"
      >
        <View className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <View className="text-center">
            <XCircle size={64} color="#ef4444" />
            <Text className="text-2xl font-bold text-gray-800 mt-4 mb-2">
              Connection Error
            </Text>
            <Text className="text-red-600 mb-4">Error: {error}</Text>
            <TouchableOpacity
              onPress={() => {
                setLoading(true);
                setError(null);
                fetchUserData();
              }}
              className="bg-red-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-bold">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  if (!userData) {
    return (
      <LinearGradient
        colors={["#fef2f2", "#fce7f3"]}
        className="flex-1 justify-center items-center"
      >
        <View className="text-center">
          <AlertTriangle size={64} color="#ef4444" />
          <Text className="text-2xl font-bold text-gray-800 mt-4 mb-2">
            Unable to Load Data
          </Text>
          <Text className="text-gray-600 mb-4">
            Please try refreshing the page
          </Text>
          <TouchableOpacity
            onPress={() => {
              setLoading(true);
              fetchUserData();
            }}
            className="bg-blue-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Calculate derived data
  const age = calculateAge(userData.dob);
  const latestWeight = getLatestValue(userData?.weightRecords);
  const latestHeight = getLatestValue(userData?.heightRecords);
  const latestBMI = getLatestValue(userData?.vitals?.bmi);
  const latestBP = getLatestValue(userData?.vitals?.bloodPressure);
  const latestHeartRate = getLatestValue(userData?.vitals?.heartRate);
  const latestBloodSugar = getLatestValue(userData?.vitals?.bloodSugar);
  const latestCholesterol = getLatestValue(userData?.vitals?.cholesterol);

  // Calculate BMI if not available
  const calculatedBMI =
    latestWeight?.value && latestHeight?.value
      ? (latestWeight.value / Math.pow(latestHeight.value / 100, 2)).toFixed(1)
      : null;

  const finalBMI = latestBMI?.value || calculatedBMI;

  return (
    <LinearGradient
      colors={["#f8fafc", "#eff6ff", "#e0e7ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-y-6">
          <LinearGradient
            colors={["#4f46e5", "#7c3aed", "#ec4899"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="pt-16 p-8 relative overflow-hidden"
            style={{
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
            }}
          >
            <View className="absolute top-2 right-2 w-16 h-16 border-2 border-white/20 rounded-full" />
            <View className="absolute bottom-2 left-2 w-12 h-12 bg-white/10 rounded-lg transform rotate-45" />

            <View className="flex-row items-center gap-x-4 mb-6">
              <View className="relative">
                <View className="w-24 h-24 bg-white/20 rounded-2xl items-center justify-center border-2 border-white/30">
                  {userData.profilePicture ? (
                    <Image
                      source={{ uri: userData.profilePicture }}
                      className="w-full h-full rounded-2xl"
                    />
                  ) : (
                    <User size={32} color="white" />
                  )}
                </View>
                <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                  <View className="w-2 h-2 bg-white rounded-full" />
                </View>
                <View className="absolute -top-1 -left-1">
                  <Sparkles size={16} color="#fbbf24" />
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-3xl font-bold text-white mb-1">
                  Welcome back, {userData.name}
                </Text>
                <View className="flex-row items-center mb-2">
                  <Award size={16} color="white" />
                  <Text className="text-blue-100 ml-2">
                    Your Health Dashboard
                  </Text>
                </View>

                {/* Contact Info */}
                <View className="gap-y-1">
                  <View className="flex-row items-center">
                    <Mail size={14} color="#bfdbfe" />
                    <Text className="text-blue-100 text-sm ml-2 font-medium">
                      {userData.email}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Phone size={14} color="#bfdbfe" />
                    <Text className="text-blue-100 text-sm ml-2 font-medium">
                      {userData.phone}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Enhanced Stats Grid */}
            <View className="flex-row flex-wrap justify-between">
              <View className="bg-white/15 rounded-2xl p-4 w-[48%] mb-3 border border-white/30">
                <View className="flex-row items-center mb-2">
                  <Calendar size={16} color="#bfdbfe" />
                  <Text className="text-blue-100 text-sm ml-2 font-medium">
                    Age
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-white">
                  {age} years
                </Text>
              </View>

              <View className="bg-white/15 rounded-2xl p-4 w-[48%] mb-3 border border-white/30">
                <View className="flex-row items-center mb-2">
                  <Droplet size={16} color="#fca5a5" />
                  <Text className="text-blue-100 text-sm ml-2 font-medium">
                    Blood Group
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-white">
                  {userData.bloodGroup}
                </Text>
              </View>

              <View className="bg-white/15 rounded-2xl p-4 w-[48%] border border-white/30">
                <View className="flex-row items-center mb-2">
                  <Scale size={16} color="#86efac" />
                  <Text className="text-blue-100 text-sm ml-2 font-medium">
                    BMI
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-white">
                  {finalBMI || "N/A"}
                </Text>
                <Text className="text-xs text-blue-200 mt-1">
                  {finalBMI ? getBMIStatus(parseFloat(finalBMI)) : "No data"}
                </Text>
              </View>

              <View className="bg-white/15 rounded-2xl p-4 w-[48%] border border-white/30">
                <View className="flex-row items-center mb-2">
                  <Heart size={16} color="#c4b5fd" />
                  <Text className="text-blue-100 text-sm ml-2 font-medium">
                    Heart Rate
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-white">
                  {latestHeartRate?.value || "N/A"}
                  {latestHeartRate?.value && (
                    <Text className="text-sm"> BPM</Text>
                  )}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View className="p-4 gap-y-6">
            <LinearGradient
              colors={["#ffffff", "#f1f5f9"]}
              className="p-6 shadow-xl border border-gray-200/50"
              style={{ borderRadius: 24 }}
            >
              <View className="flex-row items-center mb-4">
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                  style={{ borderRadius: 8 }}
                >
                  <Activity size={16} color="white" />
                </LinearGradient>
                <Text className="text-xl font-bold text-gray-800">
                  Latest Vitals at a Glance
                </Text>
              </View>

              <View className="flex-row flex-wrap justify-between gap-y-3">
                {/* Blood Pressure Badge */}
                <LinearGradient
                  colors={["#fef2f2", "#fce7f3"]}
                  className="p-4 w-[48%] border border-red-200"
                  style={{ borderRadius: 16 }}
                >
                  <View className="flex-row items-center mb-2">
                    <Heart size={16} color="#dc2626" />
                    <Text className="text-sm font-medium text-gray-700 ml-2">
                      Blood Pressure
                    </Text>
                  </View>
                  <Text className="text-xl font-bold text-gray-800">
                    {latestBP
                      ? `${latestBP.systolic}/${latestBP.diastolic}`
                      : "N/A"}
                  </Text>
                  <View className="flex-row items-center justify-between mt-1">
                    <Text className="text-xs text-gray-500">
                      {latestBP ? formatDate(latestBP.date) : "No data"}
                    </Text>
                    {latestBP && (
                      <View
                        className={`px-2 py-1 rounded-full ${
                          latestBP.systolic < 120 && latestBP.diastolic < 80
                            ? "bg-green-100"
                            : "bg-yellow-100"
                        }`}
                      >
                        <Text className="text-xs font-bold">
                          {getBPStatus(latestBP.systolic, latestBP.diastolic)}
                        </Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>

                {/* Blood Sugar Badge */}
                <LinearGradient
                  colors={["#eff6ff", "#dbeafe"]}
                  className="p-4 w-[48%] border border-blue-200"
                  style={{ borderRadius: 16 }}
                >
                  <View className="flex-row items-center mb-2">
                    <Droplet size={16} color="#2563eb" />
                    <Text className="text-sm font-medium text-gray-700 ml-2">
                      Blood Sugar
                    </Text>
                  </View>
                  <Text className="text-xl font-bold text-gray-800">
                    {latestBloodSugar?.value || "N/A"}
                    {latestBloodSugar?.value && (
                      <Text className="text-sm"> mg/dL</Text>
                    )}
                  </Text>
                  <View className="flex-row items-center justify-between mt-1">
                    <Text className="text-xs text-gray-500">
                      {latestBloodSugar
                        ? formatDate(latestBloodSugar.date)
                        : "No data"}
                    </Text>
                    {latestBloodSugar && (
                      <View
                        className={`px-2 py-1 rounded-full ${
                          latestBloodSugar.value < 100
                            ? "bg-green-100"
                            : latestBloodSugar.value < 126
                            ? "bg-yellow-100"
                            : "bg-red-100"
                        }`}
                      >
                        <Text className="text-xs font-bold">
                          {latestBloodSugar.value < 100
                            ? "Normal"
                            : latestBloodSugar.value < 126
                            ? "Elevated"
                            : "High"}
                        </Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>

                {/* Cholesterol Badge */}
                <LinearGradient
                  colors={["#fffbeb", "#fef3c7"]}
                  className="p-4 w-[48%] border border-yellow-200"
                  style={{ borderRadius: 16 }}
                >
                  <View className="flex-row items-center mb-2">
                    <Target size={16} color="#ea580c" />
                    <Text className="text-sm font-medium text-gray-700 ml-2">
                      Cholesterol
                    </Text>
                  </View>
                  <Text className="text-xl font-bold text-gray-800">
                    {latestCholesterol?.value || "N/A"}
                    {latestCholesterol?.value && (
                      <Text className="text-sm"> mg/dL</Text>
                    )}
                  </Text>
                  <View className="flex-row items-center justify-between mt-1">
                    <Text className="text-xs text-gray-500">
                      {latestCholesterol
                        ? formatDate(latestCholesterol.date)
                        : "No data"}
                    </Text>
                    {latestCholesterol && (
                      <View
                        className={`px-2 py-1 rounded-full ${
                          latestCholesterol.value < 200
                            ? "bg-green-100"
                            : latestCholesterol.value < 240
                            ? "bg-yellow-100"
                            : "bg-red-100"
                        }`}
                      >
                        <Text className="text-xs font-bold">
                          {latestCholesterol.value < 200
                            ? "Good"
                            : latestCholesterol.value < 240
                            ? "Borderline"
                            : "High"}
                        </Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>

                {/* Weight Badge */}
                <LinearGradient
                  colors={["#faf5ff", "#f3e8ff"]}
                  className="p-4 w-[48%] border border-purple-200"
                  style={{ borderRadius: 16 }}
                >
                  <View className="flex-row items-center mb-2">
                    <Scale size={16} color="#7c3aed" />
                    <Text className="text-sm font-medium text-gray-700 ml-2">
                      Weight
                    </Text>
                  </View>
                  <Text className="text-xl font-bold text-gray-800">
                    {latestWeight?.value || "N/A"}
                    {latestWeight?.value && (
                      <Text className="text-sm"> kg</Text>
                    )}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {latestWeight ? formatDate(latestWeight.date) : "No data"}
                  </Text>
                </LinearGradient>
              </View>
            </LinearGradient>

            {/* Charts Section */}
            <View className="gap-y-6">
              <View className="flex-row items-center mb-2">
                <BarChart3 size={24} color="#4f46e5" />
                <Text className="text-2xl font-bold text-gray-800 ml-3">
                  Health Trends & Analytics
                </Text>
              </View>

              {/* Weight Chart */}
              {userData?.weightRecords && userData.weightRecords.length > 1 && (
                <View
                  className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                  style={{ borderRadius: 24 }}
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <Scale size={20} color="#8b5cf6" />
                      <Text className="text-xl font-bold text-gray-800 ml-2">
                        Weight Trends
                      </Text>
                    </View>
                    <View className="bg-purple-100 px-3 py-1 rounded-full">
                      <Text className="text-xs font-bold text-purple-700">
                        {userData.weightRecords.length} Records
                      </Text>
                    </View>
                  </View>
                  <LineChart
                    data={prepareChartData(
                      userData.weightRecords,
                      "Weight (kg)"
                    )}
                    width={screenWidth - 60}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                    }}
                  />
                </View>
              )}

              {/* Blood Pressure Chart */}
              {userData?.vitals?.bloodPressure &&
                userData.vitals.bloodPressure.length > 1 && (
                  <View
                    className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                    style={{ borderRadius: 24 }}
                  >
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center">
                        <Heart size={20} color="#ef4444" />
                        <Text className="text-xl font-bold text-gray-800 ml-2">
                          Blood Pressure Trends
                        </Text>
                      </View>
                      <View className="bg-red-100 px-3 py-1 rounded-full">
                        <Text className="text-xs font-bold text-red-700">
                          {userData.vitals.bloodPressure.length} Records
                        </Text>
                      </View>
                    </View>
                    <LineChart
                      data={prepareBPChartData(userData.vitals.bloodPressure)}
                      width={screenWidth - 60}
                      height={220}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                      }}
                      bezier
                      style={{
                        marginVertical: 8,
                        borderRadius: 16,
                      }}
                    />
                  </View>
                )}

              {/* Heart Rate Chart */}
              {userData?.vitals?.heartRate &&
                userData.vitals.heartRate.length > 1 && (
                  <View
                    className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                    style={{ borderRadius: 24 }}
                  >
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center">
                        <Activity size={20} color="#ec4899" />
                        <Text className="text-xl font-bold text-gray-800 ml-2">
                          Heart Rate Trends
                        </Text>
                      </View>
                      <View className="bg-pink-100 px-3 py-1 rounded-full">
                        <Text className="text-xs font-bold text-pink-700">
                          {userData.vitals.heartRate.length} Records
                        </Text>
                      </View>
                    </View>
                    <LineChart
                      data={prepareChartData(
                        userData.vitals.heartRate,
                        "Heart Rate (BPM)"
                      )}
                      width={screenWidth - 60}
                      height={220}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) =>
                          `rgba(236, 72, 153, ${opacity})`,
                      }}
                      bezier
                      style={{
                        marginVertical: 8,
                        borderRadius: 16,
                      }}
                    />
                  </View>
                )}

              {/* BMI Chart */}
              {userData?.vitals?.bmi && userData.vitals.bmi.length > 1 && (
                <View
                  className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                  style={{ borderRadius: 24 }}
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <Target size={20} color="#10b981" />
                      <Text className="text-xl font-bold text-gray-800 ml-2">
                        BMI Trends
                      </Text>
                    </View>
                    <View className="bg-green-100 px-3 py-1 rounded-full">
                      <Text className="text-xs font-bold text-green-700">
                        {userData.vitals.bmi.length} Records
                      </Text>
                    </View>
                  </View>
                  <LineChart
                    data={prepareChartData(userData.vitals.bmi, "BMI")}
                    width={screenWidth - 60}
                    height={220}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                    }}
                    bezier
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                    }}
                  />
                </View>
              )}
            </View>

            {/* Detailed Data Sections */}
            <View className="gap-y-6">
              <View className="flex-row items-center">
                <Info size={24} color="#4f46e5" />
                <Text className="text-2xl font-bold text-gray-800 ml-3">
                  Complete Health Profile
                </Text>
              </View>

              {/* All Weight Records */}
              {userData?.weightRecords && userData.weightRecords.length > 0 && (
                <View
                  className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                  style={{ borderRadius: 24 }}
                >
                  <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center">
                      <Scale size={20} color="#8b5cf6" />
                      <Text className="text-xl font-bold text-gray-800 ml-2">
                        Complete Weight History
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleAddNew("weight")}
                      className="bg-purple-500 p-2 rounded-lg"
                    >
                      <Plus size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                  <View className="gap-y-3">
                    {userData.weightRecords
                      .slice()
                      .reverse()
                      .map((record, index) => (
                        <LinearGradient
                          key={record._id || index}
                          colors={["#faf5ff", "#f3e8ff"]}
                          className="p-4 border-l-4 border-purple-500"
                          style={{ borderRadius: 16 }}
                        >
                          <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-2xl font-bold text-purple-700">
                              {record.value} kg
                            </Text>
                            <View className="bg-white px-3 py-1 rounded-full shadow-sm">
                              <Text className="text-sm text-gray-600 font-medium">
                                {formatDateTime(record.date)}
                              </Text>
                            </View>
                          </View>
                          <View className="flex-row items-center">
                            <Calendar size={14} color="#6b7280" />
                            <Text className="text-sm text-gray-600 ml-2">
                              Weight Record
                            </Text>
                          </View>
                        </LinearGradient>
                      ))}
                  </View>
                </View>
              )}

              {/* All Height Records */}
              {userData?.heightRecords && userData.heightRecords.length > 0 && (
                <View
                  className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                  style={{ borderRadius: 24 }}
                >
                  <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center">
                      <TrendingUp size={20} color="#10b981" />
                      <Text className="text-xl font-bold text-gray-800 ml-2">
                        Complete Height History
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleAddNew("height")}
                      className="bg-green-500 p-2 rounded-lg"
                    >
                      <Plus size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                  <View className="gap-y-3">
                    {userData.heightRecords
                      .slice()
                      .reverse()
                      .map((record, index) => (
                        <LinearGradient
                          key={record._id || index}
                          colors={["#f0fdfa", "#ccfbf1"]}
                          className="p-4 border-l-4 border-green-500"
                          style={{ borderRadius: 16 }}
                        >
                          <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-2xl font-bold text-green-700">
                              {record.value} cm
                            </Text>
                            <View className="bg-white px-3 py-1 rounded-full shadow-sm">
                              <Text className="text-sm text-gray-600 font-medium">
                                {formatDateTime(record.date)}
                              </Text>
                            </View>
                          </View>
                          <View className="flex-row items-center">
                            <Calendar size={14} color="#6b7280" />
                            <Text className="text-sm text-gray-600 ml-2">
                              Height Record
                            </Text>
                          </View>
                        </LinearGradient>
                      ))}
                  </View>
                </View>
              )}

              {/* Complete Vitals - Detailed */}
              <View className="gap-y-4">
                <Text className="text-2xl font-bold text-gray-800 px-2">
                  Complete Vitals Data
                </Text>

                {/* Blood Pressure Records */}
                {userData?.vitals?.bloodPressure &&
                  userData.vitals.bloodPressure.length > 0 && (
                    <View
                      className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                      style={{ borderRadius: 24 }}
                    >
                      <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center">
                          <Heart size={20} color="#ef4444" />
                          <Text className="text-xl font-bold text-gray-800 ml-2">
                            Complete Blood Pressure History
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleAddNew("blood pressure")}
                          className="bg-red-500 p-2 rounded-lg"
                        >
                          <Plus size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                      <View className="gap-y-4">
                        {userData.vitals.bloodPressure
                          .slice()
                          .reverse()
                          .map((record, index) => (
                            <LinearGradient
                              key={record._id || index}
                              colors={["#fef2f2", "#fce7f3"]}
                              className="p-5 border-l-4 border-red-500"
                              style={{ borderRadius: 16 }}
                            >
                              <View className="flex-row justify-between items-center mb-3">
                                <Text className="font-bold text-red-700 text-2xl">
                                  {record.systolic}/{record.diastolic} mmHg
                                </Text>
                                <View
                                  className={`px-3 py-2 rounded-full ${
                                    record.systolic < 120 &&
                                    record.diastolic < 80
                                      ? "bg-green-100 border border-green-300"
                                      : record.systolic < 140 &&
                                        record.diastolic < 90
                                      ? "bg-yellow-100 border border-yellow-300"
                                      : "bg-red-100 border border-red-300"
                                  }`}
                                >
                                  <Text className="text-sm font-bold">
                                    {getBPStatus(
                                      record.systolic,
                                      record.diastolic
                                    )}
                                  </Text>
                                </View>
                              </View>
                              <View className="gap-y-2">
                                <View className="flex-row items-center">
                                  <Calendar size={14} color="#6b7280" />
                                  <Text className="text-sm text-gray-600 ml-2 font-medium">
                                    Recorded: {formatDateTime(record.date)}
                                  </Text>
                                </View>
                              </View>
                            </LinearGradient>
                          ))}
                      </View>
                    </View>
                  )}

                {/* Blood Sugar Records */}
                {userData?.vitals?.bloodSugar &&
                  userData.vitals.bloodSugar.length > 0 && (
                    <View
                      className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                      style={{ borderRadius: 24 }}
                    >
                      <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center">
                          <Droplet size={20} color="#2563eb" />
                          <Text className="text-xl font-bold text-gray-800 ml-2">
                            Complete Blood Sugar History
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleAddNew("blood sugar")}
                          className="bg-blue-500 p-2 rounded-lg"
                        >
                          <Plus size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                      <View className="gap-y-4">
                        {userData.vitals.bloodSugar
                          .slice()
                          .reverse()
                          .map((record, index) => (
                            <LinearGradient
                              key={record._id || index}
                              colors={["#eff6ff", "#dbeafe"]}
                              className="p-5 border-l-4 border-blue-500"
                              style={{ borderRadius: 16 }}
                            >
                              <View className="flex-row justify-between items-center mb-3">
                                <Text className="font-bold text-blue-700 text-2xl">
                                  {record.value} mg/dL
                                </Text>
                                <View
                                  className={`px-3 py-2 rounded-full ${
                                    record.value < 100
                                      ? "bg-green-100 border border-green-300"
                                      : record.value < 126
                                      ? "bg-yellow-100 border border-yellow-300"
                                      : "bg-red-100 border border-red-300"
                                  }`}
                                >
                                  <Text className="text-sm font-bold">
                                    {record.value < 100
                                      ? "Normal"
                                      : record.value < 126
                                      ? "Elevated"
                                      : "High"}
                                  </Text>
                                </View>
                              </View>
                              <View className="gap-y-2">
                                <View className="flex-row items-center">
                                  <Calendar size={14} color="#6b7280" />
                                  <Text className="text-sm text-gray-600 ml-2 font-medium">
                                    Recorded: {formatDateTime(record.date)}
                                  </Text>
                                </View>
                              </View>
                            </LinearGradient>
                          ))}
                      </View>
                    </View>
                  )}

                {/* Heart Rate Records */}
                {userData?.vitals?.heartRate &&
                  userData.vitals.heartRate.length > 0 && (
                    <View
                      className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                      style={{ borderRadius: 24 }}
                    >
                      <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center">
                          <Activity size={20} color="#ec4899" />
                          <Text className="text-xl font-bold text-gray-800 ml-2">
                            Complete Heart Rate History
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleAddNew("heart rate")}
                          className="bg-pink-500 p-2 rounded-lg"
                        >
                          <Plus size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                      <View className="gap-y-4">
                        {userData.vitals.heartRate
                          .slice()
                          .reverse()
                          .map((record, index) => (
                            <LinearGradient
                              key={record._id || index}
                              colors={["#fdf2f8", "#fce7f3"]}
                              className="p-5 border-l-4 border-pink-500"
                              style={{ borderRadius: 16 }}
                            >
                              <View className="flex-row justify-between items-center mb-3">
                                <Text className="font-bold text-pink-700 text-2xl">
                                  {record.value} BPM
                                </Text>
                                <View
                                  className={`px-3 py-2 rounded-full ${
                                    record.value >= 60 && record.value <= 100
                                      ? "bg-green-100 border border-green-300"
                                      : "bg-yellow-100 border border-yellow-300"
                                  }`}
                                >
                                  <Text className="text-sm font-bold">
                                    {record.value >= 60 && record.value <= 100
                                      ? "Normal"
                                      : "Monitor"}
                                  </Text>
                                </View>
                              </View>
                              <View className="gap-y-2">
                                <View className="flex-row items-center">
                                  <Calendar size={14} color="#6b7280" />
                                  <Text className="text-sm text-gray-600 ml-2 font-medium">
                                    Recorded: {formatDateTime(record.date)}
                                  </Text>
                                </View>
                              </View>
                            </LinearGradient>
                          ))}
                      </View>
                    </View>
                  )}

                {/* Cholesterol Records */}
                {userData?.vitals?.cholesterol &&
                  userData.vitals.cholesterol.length > 0 && (
                    <View
                      className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                      style={{ borderRadius: 24 }}
                    >
                      <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center">
                          <Target size={20} color="#ea580c" />
                          <Text className="text-xl font-bold text-gray-800 ml-2">
                            Complete Cholesterol History
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleAddNew("cholesterol")}
                          className="bg-orange-500 p-2 rounded-lg"
                        >
                          <Plus size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                      <View className="gap-y-4">
                        {userData.vitals.cholesterol
                          .slice()
                          .reverse()
                          .map((record, index) => (
                            <LinearGradient
                              key={record._id || index}
                              colors={["#fffbeb", "#fef3c7"]}
                              className="p-5 border-l-4 border-orange-500"
                              style={{ borderRadius: 16 }}
                            >
                              <View className="flex-row justify-between items-center mb-3">
                                <Text className="font-bold text-orange-700 text-2xl">
                                  {record.value} mg/dL
                                </Text>
                                <View
                                  className={`px-3 py-2 rounded-full ${
                                    record.value < 200
                                      ? "bg-green-100 border border-green-300"
                                      : record.value < 240
                                      ? "bg-yellow-100 border border-yellow-300"
                                      : "bg-red-100 border border-red-300"
                                  }`}
                                >
                                  <Text className="text-sm font-bold">
                                    {record.value < 200
                                      ? "Good"
                                      : record.value < 240
                                      ? "Borderline"
                                      : "High"}
                                  </Text>
                                </View>
                              </View>
                              <View className="gap-y-2">
                                <View className="flex-row items-center">
                                  <Calendar size={14} color="#6b7280" />
                                  <Text className="text-sm text-gray-600 ml-2 font-medium">
                                    Recorded: {formatDateTime(record.date)}
                                  </Text>
                                </View>
                              </View>
                            </LinearGradient>
                          ))}
                      </View>
                    </View>
                  )}

                {/* BMI Records */}
                {userData?.vitals?.bmi && userData.vitals.bmi.length > 0 && (
                  <View
                    className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                    style={{ borderRadius: 24 }}
                  >
                    <View className="flex-row items-center justify-between mb-6">
                      <View className="flex-row items-center">
                        <Scale size={20} color="#7c3aed" />
                        <Text className="text-xl font-bold text-gray-800 ml-2">
                          Complete BMI History
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleAddNew("bmi")}
                        className="bg-purple-500 p-2 rounded-lg"
                      >
                        <Plus size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                    <View className="gap-y-4">
                      {userData.vitals.bmi
                        .slice()
                        .reverse()
                        .map((record, index) => (
                          <LinearGradient
                            key={record._id || index}
                            colors={["#faf5ff", "#f3e8ff"]}
                            className="p-5 border-l-4 border-purple-500"
                            style={{ borderRadius: 16 }}
                          >
                            <View className="flex-row justify-between items-center mb-3">
                              <Text className="font-bold text-purple-700 text-2xl">
                                {record.value}
                              </Text>
                              <View
                                className={`px-3 py-2 rounded-full ${
                                  record.value < 18.5
                                    ? "bg-blue-100 border border-blue-300"
                                    : record.value < 25
                                    ? "bg-green-100 border border-green-300"
                                    : record.value < 30
                                    ? "bg-yellow-100 border border-yellow-300"
                                    : "bg-red-100 border border-red-300"
                                }`}
                              >
                                <Text className="text-sm font-bold">
                                  {getBMIStatus(record.value)}
                                </Text>
                              </View>
                            </View>
                            <View className="gap-y-2">
                              <View className="flex-row items-center">
                                <Calendar size={14} color="#6b7280" />
                                <Text className="text-sm text-gray-600 ml-2 font-medium">
                                  Recorded: {formatDateTime(record.date)}
                                </Text>
                              </View>
                            </View>
                          </LinearGradient>
                        ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Complete Medical History */}
              <View className="gap-y-4">
                <Text className="text-2xl font-bold text-gray-800 px-2">
                  Complete Medical History
                </Text>

                {/* Allergies - Enhanced Detail */}
                {userData?.medicalHistory?.allergies &&
                  userData.medicalHistory.allergies.length > 0 && (
                    <View
                      className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                      style={{ borderRadius: 24 }}
                    >
                      <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center">
                          <AlertTriangle size={20} color="#ef4444" />
                          <Text className="text-xl font-bold text-gray-800 ml-2">
                            Complete Allergies & Reactions
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleAddNew("allergy")}
                          className="bg-red-500 p-2 rounded-lg"
                        >
                          <Plus size={16} color="white" />
                        </TouchableOpacity>
                      </View>

                      <View className="gap-y-6">
                        {userData.medicalHistory.allergies.map(
                          (allergy, index) => (
                            <LinearGradient
                              key={allergy._id || index}
                              colors={["#fef2f2", "#fff7ed"]}
                              className="p-6 border border-red-200 shadow-lg"
                              style={{ borderRadius: 24 }}
                            >
                              <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-1">
                                  <Text className="font-bold text-2xl text-red-800 mb-2">
                                    {allergy.allergen}
                                  </Text>
                                  <View className="flex-row items-center mb-2">
                                    <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                                    <Text className="text-sm text-gray-700 font-medium">
                                      Type: {allergy.type}
                                    </Text>
                                  </View>
                                  <View className="flex-row items-center">
                                    <Calendar size={14} color="#6b7280" />
                                    <Text className="text-sm text-gray-600 ml-2">
                                      Diagnosed: {formatDate(allergy.onsetDate)}
                                    </Text>
                                  </View>
                                </View>
                                <View
                                  className={`px-4 py-2 rounded-full ${getSeverityColor(
                                    allergy.severity
                                  )} border-2`}
                                >
                                  <Text className="text-sm font-bold capitalize">
                                    {allergy.severity}
                                  </Text>
                                </View>
                              </View>

                              <View className="bg-white/70 p-4 rounded-xl mb-4">
                                <Text className="text-sm font-bold text-gray-700 mb-2">
                                  Reaction Details:
                                </Text>
                                <Text className="text-gray-800 leading-relaxed">
                                  {allergy.reaction}
                                </Text>
                              </View>

                              {allergy.medicines &&
                                allergy.medicines.length > 0 && (
                                  <View className="gap-y-3">
                                    <Text className="text-sm font-bold text-gray-700 mb-2">
                                      Current Medications:
                                    </Text>
                                    {allergy.medicines.map((med, medIndex) => (
                                      <View
                                        key={medIndex}
                                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                                      >
                                        <Text className="font-bold text-gray-800 text-lg mb-1">
                                          {med.name}
                                        </Text>
                                        <View className="flex-row flex-wrap gap-2">
                                          <View className="bg-blue-100 px-2 py-1 rounded-full">
                                            <Text className="text-xs font-medium text-blue-700">
                                              {med.form}
                                            </Text>
                                          </View>
                                          <View className="bg-green-100 px-2 py-1 rounded-full">
                                            <Text className="text-xs font-medium text-green-700">
                                              {med.dose}
                                            </Text>
                                          </View>
                                          <View className="bg-purple-100 px-2 py-1 rounded-full">
                                            <Text className="text-xs font-medium text-purple-700">
                                              {med.frequency}
                                            </Text>
                                          </View>
                                        </View>
                                      </View>
                                    ))}
                                  </View>
                                )}
                            </LinearGradient>
                          )
                        )}
                      </View>
                    </View>
                  )}

                {/* Chronic Conditions - Enhanced Detail */}
                {userData?.medicalHistory?.chronicConditions &&
                  userData.medicalHistory.chronicConditions.length > 0 && (
                    <View
                      className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                      style={{ borderRadius: 24 }}
                    >
                      <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center">
                          <Stethoscope size={20} color="#0891b2" />
                          <Text className="text-xl font-bold text-gray-800 ml-2">
                            Complete Chronic Conditions
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleAddNew("condition")}
                          className="bg-cyan-500 p-2 rounded-lg"
                        >
                          <Plus size={16} color="white" />
                        </TouchableOpacity>
                      </View>

                      <View className="gap-y-6">
                        {userData.medicalHistory.chronicConditions.map(
                          (condition, index) => (
                            <LinearGradient
                              key={condition._id || index}
                              colors={["#ecfeff", "#cffafe"]}
                              className="p-6 border border-cyan-200 shadow-lg"
                              style={{ borderRadius: 24 }}
                            >
                              <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-1">
                                  <Text className="font-bold text-2xl text-cyan-800 mb-2">
                                    {condition.conditionName}
                                  </Text>
                                  <View className="flex-row items-center">
                                    <Calendar size={14} color="#6b7280" />
                                    <Text className="text-sm text-gray-600 ml-2">
                                      Diagnosed:{" "}
                                      {formatDate(condition.diagnosedOn)}
                                    </Text>
                                  </View>
                                </View>
                                <View
                                  className={`px-4 py-2 rounded-full ${getSeverityColor(
                                    condition.severityLevel
                                  )} border-2`}
                                >
                                  <Text className="text-sm font-bold capitalize">
                                    {condition.severityLevel}
                                  </Text>
                                </View>
                              </View>

                              {condition.triggers &&
                                condition.triggers.length > 0 && (
                                  <View className="bg-white/70 p-4 rounded-xl mb-4">
                                    <Text className="text-sm font-bold text-gray-700 mb-3">
                                      Known Triggers:
                                    </Text>
                                    <View className="flex-row flex-wrap gap-2">
                                      {condition.triggers.map(
                                        (trigger, triggerIndex) => (
                                          <View
                                            key={triggerIndex}
                                            className="bg-yellow-100 px-3 py-1 rounded-full border border-yellow-300"
                                          >
                                            <Text className="text-xs font-medium text-yellow-800">
                                              {trigger}
                                            </Text>
                                          </View>
                                        )
                                      )}
                                    </View>
                                  </View>
                                )}

                              {condition.medicines &&
                                condition.medicines.length > 0 && (
                                  <View className="gap-y-3">
                                    <Text className="text-sm font-bold text-gray-700 mb-2">
                                      Current Medications:
                                    </Text>
                                    {condition.medicines.map(
                                      (med, medIndex) => (
                                        <View
                                          key={medIndex}
                                          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                                        >
                                          <Text className="font-bold text-gray-800 text-lg mb-1">
                                            {med.name}
                                          </Text>
                                          <View className="flex-row flex-wrap gap-2">
                                            <View className="bg-blue-100 px-2 py-1 rounded-full">
                                              <Text className="text-xs font-medium text-blue-700">
                                                {med.form}
                                              </Text>
                                            </View>
                                            <View className="bg-green-100 px-2 py-1 rounded-full">
                                              <Text className="text-xs font-medium text-green-700">
                                                {med.dose}
                                              </Text>
                                            </View>
                                            <View className="bg-purple-100 px-2 py-1 rounded-full">
                                              <Text className="text-xs font-medium text-purple-700">
                                                {med.frequency}
                                              </Text>
                                            </View>
                                          </View>
                                        </View>
                                      )
                                    )}
                                  </View>
                                )}
                            </LinearGradient>
                          )
                        )}
                      </View>
                    </View>
                  )}

                {/* Surgical History - Enhanced Detail */}
                {userData?.medicalHistory?.surgicalHistory &&
                  userData.medicalHistory.surgicalHistory.length > 0 && (
                    <View
                      className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                      style={{ borderRadius: 24 }}
                    >
                      <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center">
                          <Scissors size={20} color="#dc2626" />
                          <Text className="text-xl font-bold text-gray-800 ml-2">
                            Complete Surgical History
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleAddNew("surgery")}
                          className="bg-red-500 p-2 rounded-lg"
                        >
                          <Plus size={16} color="white" />
                        </TouchableOpacity>
                      </View>

                      <View className="gap-y-4">
                        {userData.medicalHistory.surgicalHistory.map(
                          (surgery, index) => (
                            <LinearGradient
                              key={surgery._id || index}
                              colors={["#fef2f2", "#fce7f3"]}
                              className="p-5 border border-red-200 shadow-lg"
                              style={{ borderRadius: 16 }}
                            >
                              <Text className="font-bold text-red-800 text-xl mb-2">
                                {surgery.procedure}
                              </Text>

                              <View className="grid grid-cols-1 gap-y-3">
                                <View className="flex-row items-center">
                                  <Calendar size={14} color="#6b7280" />
                                  <Text className="text-sm text-gray-600 ml-2 font-medium">
                                    Date: {formatDate(surgery.date)}
                                  </Text>
                                </View>

                                <View className="flex-row items-center">
                                  <UserCheck size={14} color="#6b7280" />
                                  <Text className="text-sm text-gray-600 ml-2 font-medium">
                                    Surgeon: {surgery.surgeon}
                                  </Text>
                                </View>

                                {surgery.hospital && (
                                  <View className="flex-row items-center">
                                    <Shield size={14} color="#6b7280" />
                                    <Text className="text-sm text-gray-600 ml-2 font-medium">
                                      Hospital: {surgery.hospital}
                                    </Text>
                                  </View>
                                )}

                                {surgery.indication && (
                                  <View className="bg-white/70 p-3 rounded-lg mt-2">
                                    <Text className="text-sm font-bold text-gray-700 mb-1">
                                      Indication:
                                    </Text>
                                    <Text className="text-sm text-gray-800">
                                      {surgery.indication}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </LinearGradient>
                          )
                        )}
                      </View>
                    </View>
                  )}

                {/* Immunizations - Enhanced Detail */}
                {userData?.medicalHistory?.immunizations &&
                  userData.medicalHistory.immunizations.length > 0 && (
                    <View
                      className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                      style={{ borderRadius: 24 }}
                    >
                      <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center">
                          <Syringe size={20} color="#059669" />
                          <Text className="text-xl font-bold text-gray-800 ml-2">
                            Complete Immunization Records
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleAddNew("immunization")}
                          className="bg-green-500 p-2 rounded-lg"
                        >
                          <Plus size={16} color="white" />
                        </TouchableOpacity>
                      </View>

                      <View className="gap-y-4">
                        {userData.medicalHistory.immunizations.map(
                          (immunization, index) => (
                            <LinearGradient
                              key={immunization._id || index}
                              colors={["#f0fdf4", "#dcfce7"]}
                              className="p-5 border border-green-200 shadow-lg"
                              style={{ borderRadius: 16 }}
                            >
                              <View className="flex-row justify-between items-start mb-4">
                                <Text className="font-bold text-green-800 text-xl">
                                  {immunization.vaccine}
                                </Text>
                                <View
                                  className={`px-3 py-1 rounded-full ${getStatusColor(
                                    immunization.status
                                  )} border-2`}
                                >
                                  <Text className="text-xs font-bold capitalize">
                                    {immunization.status}
                                  </Text>
                                </View>
                              </View>

                              <View className="gap-y-3">
                                <View className="flex-row items-center">
                                  <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                                  <Text className="text-sm text-gray-600 font-medium">
                                    Total Doses: {immunization.doses}
                                  </Text>
                                </View>

                                <View className="flex-row items-center">
                                  <Calendar size={14} color="#6b7280" />
                                  <Text className="text-sm text-gray-600 ml-2 font-medium">
                                    Last Dose:{" "}
                                    {formatDate(immunization.lastDate)}
                                  </Text>
                                </View>

                                {immunization.nextDue && (
                                  <View className="flex-row items-center">
                                    <AlertTriangle size={14} color="#f59e0b" />
                                    <Text className="text-sm text-amber-600 ml-2 font-medium">
                                      Next Due:{" "}
                                      {formatDate(immunization.nextDue)}
                                    </Text>
                                  </View>
                                )}

                                {immunization.provider && (
                                  <View className="flex-row items-center">
                                    <Shield size={14} color="#6b7280" />
                                    <Text className="text-sm text-gray-600 ml-2 font-medium">
                                      Provider: {immunization.provider}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </LinearGradient>
                          )
                        )}
                      </View>
                    </View>
                  )}
              </View>

              {/* Complete Lifestyle Data - Enhanced */}
              {userData?.lifestyle && (
                <View
                  className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                  style={{ borderRadius: 24 }}
                >
                  <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center">
                      <Activity size={20} color="#7c3aed" />
                      <Text className="text-xl font-bold text-gray-800 ml-2">
                        Complete Lifestyle Profile
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleAddNew("lifestyle")}
                      className="bg-purple-500 p-2 rounded-lg"
                    >
                      <Edit3 size={16} color="white" />
                    </TouchableOpacity>
                  </View>

                  <View className="gap-y-4">
                    <LinearGradient
                      colors={["#fef2f2", "#fce7f3"]}
                      className="p-4 border border-red-200"
                      style={{ borderRadius: 12 }}
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                          <Cigarette size={16} color="#dc2626" />
                          <Text className="text-sm text-gray-600 font-bold ml-2">
                            Smoking Status
                          </Text>
                        </View>
                        <View className="bg-white px-3 py-1 rounded-full">
                          <Text className="font-bold text-gray-800 capitalize">
                            {userData.lifestyle.smokingStatus}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>

                    <LinearGradient
                      colors={["#f0fdf4", "#dcfce7"]}
                      className="p-4 border border-green-200"
                      style={{ borderRadius: 12 }}
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                          <Dumbbell size={16} color="#059669" />
                          <Text className="text-sm text-gray-600 font-bold ml-2">
                            Exercise Frequency
                          </Text>
                        </View>
                        <View className="bg-white px-3 py-1 rounded-full">
                          <Text className="font-bold text-gray-800 capitalize">
                            {userData.lifestyle.exerciseFrequency}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>

                    <LinearGradient
                      colors={["#fff7ed", "#fed7aa"]}
                      className="p-4 border border-orange-200"
                      style={{ borderRadius: 12 }}
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                          <Utensils size={16} color="#ea580c" />
                          <Text className="text-sm text-gray-600 font-bold ml-2">
                            Diet Type
                          </Text>
                        </View>
                        <View className="bg-white px-3 py-1 rounded-full">
                          <Text className="font-bold text-gray-800 capitalize">
                            {userData.lifestyle.dietType}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>

                    <LinearGradient
                      colors={["#eff6ff", "#dbeafe"]}
                      className="p-4 border border-blue-200"
                      style={{ borderRadius: 12 }}
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                          <Bed size={16} color="#2563eb" />
                          <Text className="text-sm text-gray-600 font-bold ml-2">
                            Sleep Duration
                          </Text>
                        </View>
                        <View className="bg-white px-3 py-1 rounded-full">
                          <Text className="font-bold text-gray-800">
                            {userData.lifestyle.sleepDuration}h/night
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>

                    <LinearGradient
                      colors={["#faf5ff", "#f3e8ff"]}
                      className="p-4 border border-purple-200"
                      style={{ borderRadius: 12 }}
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                          <Droplet size={16} color="#9333ea" />
                          <Text className="text-sm text-gray-600 font-bold ml-2">
                            Alcohol Consumption
                          </Text>
                        </View>
                        <View className="bg-white px-3 py-1 rounded-full">
                          <Text className="font-bold text-gray-800 capitalize">
                            {userData.lifestyle.alcoholConsumption}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>

                  <View className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <Text className="text-sm text-gray-600 font-medium mb-2">
                      Lifestyle Profile Details:
                    </Text>
                    <View className="gap-y-1">
                      <Text className="text-xs text-gray-500">
                        Complete lifestyle tracking enabled
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Complete Emergency Contacts - Enhanced */}
              {userData?.emergencyContacts &&
                userData.emergencyContacts.length > 0 && (
                  <View
                    className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                    style={{ borderRadius: 24 }}
                  >
                    <View className="flex-row items-center justify-between mb-6">
                      <View className="flex-row items-center">
                        <Phone size={20} color="#dc2626" />
                        <Text className="text-xl font-bold text-gray-800 ml-2">
                          Complete Emergency Contacts
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleAddNew("emergency contact")}
                        className="bg-red-500 p-2 rounded-lg"
                      >
                        <Plus size={16} color="white" />
                      </TouchableOpacity>
                    </View>

                    <View className="gap-y-4">
                      {userData.emergencyContacts.map((contact, index) => (
                        <LinearGradient
                          key={contact._id || index}
                          colors={["#fef2f2", "#fce7f3"]}
                          className="p-5 border border-red-200 shadow-lg"
                          style={{ borderRadius: 16 }}
                        >
                          <View className="flex-row items-center mb-4">
                            <LinearGradient
                              colors={["#ef4444", "#ec4899"]}
                              className="w-12 h-12 rounded-full items-center justify-center mr-4"
                              style={{ borderRadius: 24 }}
                            >
                              <User size={20} color="white" />
                            </LinearGradient>
                            <View className="flex-1">
                              <Text className="font-bold text-gray-800 text-lg">
                                {contact.name}
                              </Text>
                              <View className="flex-row items-center">
                                <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                                <Text className="text-sm text-gray-600 capitalize font-medium">
                                  {contact.relation}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <LinearGradient
                            colors={["#10b981", "#059669"]}
                            className="p-3"
                            style={{ borderRadius: 12 }}
                          >
                            <TouchableOpacity>
                              <Text className="text-white text-center font-bold">
                                📞 {contact.phone}
                              </Text>
                            </TouchableOpacity>
                          </LinearGradient>

                          <View className="mt-4 p-3 bg-white/70 rounded-lg">
                            <Text className="text-sm text-gray-600 font-medium mb-1">
                              Emergency contact ready for quick access
                            </Text>
                          </View>
                        </LinearGradient>
                      ))}
                    </View>
                  </View>
                )}

              {/* Wallet Address - Enhanced */}
              {userData?.walletAddress && (
                <View
                  className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                  style={{ borderRadius: 24 }}
                >
                  <View className="flex-row items-center mb-6">
                    <Shield size={20} color="#7c3aed" />
                    <Text className="text-xl font-bold text-gray-800 ml-2">
                      Blockchain Wallet Integration
                    </Text>
                  </View>

                  <LinearGradient
                    colors={["#faf5ff", "#f3e8ff"]}
                    className="p-5 border border-purple-200"
                    style={{ borderRadius: 16 }}
                  >
                    <View className="flex-row items-center mb-3">
                      <LinearGradient
                        colors={["#8b5cf6", "#6366f1"]}
                        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                        style={{ borderRadius: 8 }}
                      >
                        <Shield size={16} color="white" />
                      </LinearGradient>
                      <Text className="text-lg font-bold text-purple-800">
                        Secure Wallet Address
                      </Text>
                    </View>

                    <View className="bg-white p-4 rounded-xl border-2 border-purple-300">
                      <Text className="text-sm text-gray-600 font-medium mb-2">
                        Ethereum Wallet Address:
                      </Text>
                      <Text className="font-mono text-sm text-purple-700 bg-purple-50 p-3 rounded-lg">
                        {userData.walletAddress}
                      </Text>
                    </View>

                    <View className="flex-row items-center mt-4">
                      <CheckCircle size={16} color="#10b981" />
                      <Text className="text-sm text-green-700 ml-2 font-medium">
                        Wallet Verified & Secure
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              )}

              {/* Reports - Enhanced */}
              {userData?.reports && userData.reports.length > 0 && (
                <View
                  className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                  style={{ borderRadius: 24 }}
                >
                  <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center">
                      <FileText size={20} color="#2563eb" />
                      <Text className="text-xl font-bold text-gray-800 ml-2">
                        Medical Reports Library
                      </Text>
                    </View>
                    <View className="bg-blue-100 px-3 py-1 rounded-full">
                      <Text className="text-sm font-bold text-blue-700">
                        {userData.reports.length} Reports
                      </Text>
                    </View>
                  </View>

                  <View className="gap-y-3">
                    {userData.reports.map((reportId, index) => (
                      <LinearGradient
                        key={index}
                        colors={["#eff6ff", "#dbeafe"]}
                        className="p-4 border border-blue-200 shadow-sm"
                        style={{ borderRadius: 12 }}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <Text className="font-bold text-blue-800 mb-1">
                              Medical Report #{index + 1}
                            </Text>
                            <Text className="text-sm text-gray-600">
                              Digital report available
                            </Text>
                          </View>
                          <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg">
                            <Text className="text-white text-sm font-medium">
                              View
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    ))}
                  </View>
                </View>
              )}

              {/* Account Information - Enhanced */}
              <View
                className="bg-white/90 p-6 shadow-xl border border-gray-200/50"
                style={{ borderRadius: 24 }}
              >
                <View className="flex-row items-center mb-6">
                  <Settings size={20} color="#6b7280" />
                  <Text className="text-xl font-bold text-gray-800 ml-2">
                    Complete Account Information
                  </Text>
                </View>

                <View className="gap-y-4">
                  <View className="bg-gray-50 p-4 rounded-xl">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-500 font-medium">
                        Gender:
                      </Text>
                      <Text className="text-sm text-gray-800 capitalize font-medium">
                        {userData.gender}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-gray-50 p-4 rounded-xl">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-500 font-medium">
                        Date of Birth:
                      </Text>
                      <Text className="text-sm text-gray-800 font-medium">
                        {formatDate(userData.dob)}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-gray-50 p-4 rounded-xl">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-500 font-medium">
                        Account Created:
                      </Text>
                      <Text className="text-sm text-gray-800 font-medium">
                        {formatDateTime(userData.createdAt)}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-gray-50 p-4 rounded-xl">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-500 font-medium">
                        Last Updated:
                      </Text>
                      <Text className="text-sm text-gray-800 font-medium">
                        {formatDateTime(userData.updatedAt)}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-gray-50 p-4 rounded-xl">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-500 font-medium">
                        Emergency Services:
                      </Text>
                      <View className="flex-row items-center">
                        {userData.emergencyEnabled ? (
                          <>
                            <CheckCircle size={16} color="#10b981" />
                            <Text className="text-sm text-green-700 font-medium ml-1">
                              Enabled
                            </Text>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} color="#ef4444" />
                            <Text className="text-sm text-red-700 font-medium ml-1">
                              Disabled
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>

                  <View className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-500 font-medium">
                        Account Status:
                      </Text>
                      <View className="flex-row items-center">
                        <CheckCircle size={16} color="#10b981" />
                        <Text className="text-sm text-green-700 font-bold ml-1">
                          Active & Complete
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* AI Health Insights - Enhanced */}
              <LinearGradient
                colors={["#6366f1", "#8b5cf6", "#ec4899"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="p-6 shadow-2xl"
                style={{ borderRadius: 24 }}
              >
                <View className="flex-row items-center mb-6">
                  <Sparkles size={24} color="white" />
                  <Text className="text-2xl font-bold text-white ml-3">
                    AI Health Insights & Analytics
                  </Text>
                </View>

                <View className="gap-y-6">
                  {/* Health Score */}
                  <View
                    className="bg-white/15 p-5 border border-white/20"
                    style={{ borderRadius: 16 }}
                  >
                    <View className="flex-row items-center mb-4">
                      <Target size={24} color="#10b981" />
                      <Text className="font-bold text-2xl text-white ml-3">
                        Overall Health Score
                      </Text>
                    </View>

                    <View className="items-center mb-6">
                      <Text className="text-6xl font-bold text-white mb-2">
                        85%
                      </Text>
                      <Text className="text-white/80 text-lg">
                        Excellent Health Rating
                      </Text>
                    </View>

                    <View className="bg-white/20 rounded-full h-4 mb-3">
                      <View
                        className="w-4/5 h-4 rounded-full"
                        style={{ backgroundColor: "#10b981" }}
                      />
                    </View>
                    <Text className="text-sm text-white/70 text-center">
                      Based on comprehensive analysis of your vitals, lifestyle,
                      and medical history
                    </Text>
                  </View>

                  {/* Detailed Health Metrics */}
                  <View
                    className="bg-white/15 p-5 border border-white/20"
                    style={{ borderRadius: 16 }}
                  >
                    <View className="flex-row items-center mb-4">
                      <Activity size={20} color="#60a5fa" />
                      <Text className="font-bold text-xl text-white ml-3">
                        Health Metrics Analysis
                      </Text>
                    </View>

                    <View className="gap-y-3">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-white/90">BMI Status:</Text>
                        <Text className="font-bold text-white text-lg">
                          {finalBMI
                            ? getBMIStatus(parseFloat(finalBMI))
                            : "Unknown"}
                        </Text>
                      </View>

                      {latestBP && (
                        <View className="flex-row justify-between items-center">
                          <Text className="text-white/90">Blood Pressure:</Text>
                          <Text className="font-bold text-white text-lg">
                            {getBPStatus(latestBP.systolic, latestBP.diastolic)}
                          </Text>
                        </View>
                      )}

                      {latestHeartRate && (
                        <View className="flex-row justify-between items-center">
                          <Text className="text-white/90">Heart Rate:</Text>
                          <Text className="font-bold text-white text-lg">
                            {latestHeartRate.value >= 60 &&
                            latestHeartRate.value <= 100
                              ? "Normal"
                              : "Monitor"}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* AI Recommendations */}
                  <View
                    className="bg-white/15 p-5 border border-white/20"
                    style={{ borderRadius: 16 }}
                  >
                    <View className="flex-row items-center mb-4">
                      <Zap size={20} color="#fbbf24" />
                      <Text className="font-bold text-xl text-white ml-3">
                        Personalized Recommendations
                      </Text>
                    </View>
                    <View className="gap-y-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 bg-blue-400 rounded-full mr-3" />
                        <Text className="text-white/90 flex-1">
                          Continue monitoring blood pressure regularly - current
                          levels are optimal
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 bg-yellow-400 rounded-full mr-3" />
                        <Text className="text-white/90 flex-1">
                          Maintain current{" "}
                          {userData.lifestyle?.exerciseFrequency} exercise
                          routine
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 bg-green-400 rounded-full mr-3" />
                        <Text className="text-white/90 flex-1">
                          Your {userData.lifestyle?.dietType} diet is supporting
                          good health
                        </Text>
                      </View>
                      {userData.lifestyle?.sleepDuration < 7 && (
                        <View className="flex-row items-center">
                          <View className="w-3 h-3 bg-red-400 rounded-full mr-3" />
                          <Text className="text-white/90 flex-1">
                            Consider increasing sleep duration to 7-8 hours for
                            optimal health
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Health Achievements */}
                  <View
                    className="bg-white/15 p-5 border border-white/20"
                    style={{ borderRadius: 16 }}
                  >
                    <View className="flex-row items-center mb-4">
                      <Award size={20} color="#fbbf24" />
                      <Text className="font-bold text-xl text-white ml-3">
                        Health Achievements
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <View className="items-center flex-1">
                        <Award size={32} color="#fbbf24" />
                        <Text className="text-sm text-yellow-400 mt-2 text-center">
                          Health Warrior
                        </Text>
                        <Text className="text-xs text-white/70 text-center">
                          Complete Profile
                        </Text>
                      </View>
                      <View className="items-center flex-1">
                        <Heart size={32} color="#10b981" />
                        <Text className="text-sm text-green-400 mt-2 text-center">
                          Heart Healthy
                        </Text>
                        <Text className="text-xs text-white/70 text-center">
                          Normal Vitals
                        </Text>
                      </View>
                      <View className="items-center flex-1">
                        <Shield size={32} color="#a855f7" />
                        <Text className="text-sm text-purple-400 mt-2 text-center">
                          Data Guardian
                        </Text>
                        <Text className="text-xs text-white/70 text-center">
                          Blockchain Secure
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              {/* Action Buttons */}
              <View className="gap-y-4">
                <LinearGradient
                  colors={["#3b82f6", "#8b5cf6", "#4f46e5"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="shadow-xl"
                  style={{ borderRadius: 24 }}
                >
                  <TouchableOpacity
                    className="p-5 flex-row items-center justify-center gap-x-3"
                    onPress={() => handleAddNew("record")}
                  >
                    <Plus size={28} color="white" />
                    <Text className="text-white font-bold text-xl">
                      Add New Health Record
                    </Text>
                    <Sparkles size={24} color="white" />
                  </TouchableOpacity>
                </LinearGradient>

                <View className="flex-row gap-x-4">
                  <LinearGradient
                    colors={["#22c55e", "#10b981", "#0d9488"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="flex-1 shadow-xl"
                    style={{ borderRadius: 24 }}
                  >
                    <TouchableOpacity
                      className="p-4 flex-row items-center justify-center gap-x-2"
                      onPress={() => handleAddNew("profile")}
                    >
                      <Edit3 size={20} color="white" />
                      <Text className="text-white font-bold">
                        Update Profile
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>

                  <LinearGradient
                    colors={["#ef4444", "#ec4899", "#e11d48"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="flex-1 shadow-xl"
                    style={{ borderRadius: 24 }}
                  >
                    <TouchableOpacity
                      className="p-4 flex-row items-center justify-center gap-x-2"
                      onPress={() =>
                        Alert.alert(
                          "Emergency",
                          "Emergency services would be contacted immediately. Continue?",
                          [
                            { text: "Cancel", style: "cancel" },
                            { text: "Emergency!", style: "destructive" },
                          ]
                        )
                      }
                    >
                      <Heart size={20} color="white" />
                      <Text className="text-white font-bold">Emergency</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </View>

              {/* Footer Stats */}
              <View className="py-8">
                <View className="flex-row justify-center items-center gap-x-8 mb-4">
                  <View className="flex-row items-center gap-x-2">
                    <View className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <Text className="text-sm font-medium text-gray-600">
                      System Online
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-x-2">
                    <Zap size={16} color="#eab308" />
                    <Text className="text-sm font-medium text-gray-600">
                      AI Powered
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-x-2">
                    <Shield size={16} color="#3b82f6" />
                    <Text className="text-sm font-medium text-gray-600">
                      Blockchain Secured
                    </Text>
                  </View>
                </View>

                <Text className="text-xs text-gray-500 text-center">
                  Last updated: {formatDateTime(new Date().toISOString())}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Dashboard;
