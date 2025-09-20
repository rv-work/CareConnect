import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Activity,
  AlertCircle,
  Building,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Heart,
  Lock,
  MessageCircle,
  Pill,
  Scale,
  Share2,
  Shield,
  Sparkles,
  Stethoscope,
  Thermometer,
  TrendingUp,
  User,
  WifiOff,
  Zap,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useWeb3 } from "../../../contexts/Web3Context";
import MedicationSummaryDisplay from "../../components/Summary";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_MARGIN = 16;
const CARD_PADDING = 20;

const ReportDetailScreen = () => {
  const [report, setReport] = useState(null);
  const [web3Files, setWeb3Files] = useState([]);
  const [summaryResult, setSummaryResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentMedicineIndex, setCurrentMedicineIndex] = useState(0);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isLoadedFromCache, setIsLoadedFromCache] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const { contractInstance, connectWallet } = useWeb3();

  // Cache keys for individual reports
  const CACHE_KEYS = {
    REPORT_DETAIL: `report_detail_${id}`,
    REPORT_SUMMARY: `report_summary_${id}`,
    WEB3_FILES: `web3_files_${id}`,
    LAST_FETCH: `report_fetch_${id}`,
  };

  // Cache expiry time (2 hours for detailed reports)
  const CACHE_EXPIRY_TIME = 2 * 60 * 60 * 1000;

  useEffect(() => {
    // Setup network listener
    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasOffline = isOffline;
      setIsOffline(!state.isConnected);

      // If coming back online and we had loaded from cache, refresh
      if (state.isConnected && wasOffline && isLoadedFromCache) {
        console.log("Back online - refreshing report data");
        fetchReport(true);
      }
    });

    // Initialize data loading
    initializeReportData();

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.goBack();
        return true;
      }
    );

    return () => {
      unsubscribe();
      backHandler.remove();
    };
  }, [id]);

  useEffect(() => {
    if (
      report?.type === "web3" &&
      contractInstance &&
      !web3Files.length &&
      !isOffline
    ) {
      fetchWeb3Files(report.userId || report.owner?._id, report._id);
    }
  }, [contractInstance, report, isOffline]);

  // Initialize report data with offline-first approach
  const initializeReportData = async () => {
    try {
      // Check network status first
      const networkState = await NetInfo.fetch();
      setIsOffline(!networkState.isConnected);

      // Always try to load cached data first
      const cachedLoaded = await loadCachedReportData();

      if (networkState.isConnected) {
        // Check if we need to refresh cache
        const shouldRefresh = await shouldRefreshCache();
        if (shouldRefresh || !cachedLoaded) {
          console.log("Fetching fresh report data");
          await fetchReport();
        } else {
          console.log("Using cached report data");
          setLoading(false);
        }
      } else {
        console.log("Offline - using cached data only");
        if (!cachedLoaded) {
          setError(
            "No cached data available for this report. Please connect to internet."
          );
        }
        setLoading(false);
      }
    } catch (error) {
      console.error("Error initializing report data:", error);
      setLoading(false);
    }
  };

  // Check if cache should be refreshed
  const shouldRefreshCache = async () => {
    try {
      const lastFetch = await AsyncStorage.getItem(CACHE_KEYS.LAST_FETCH);
      if (!lastFetch) return true;

      const lastFetchTime = parseInt(lastFetch);
      const currentTime = Date.now();

      return currentTime - lastFetchTime > CACHE_EXPIRY_TIME;
    } catch (error) {
      return true;
    }
  };

  // Load cached report data
  const loadCachedReportData = async () => {
    try {
      const [cachedReport, cachedSummary, cachedWeb3Files, lastFetch] =
        await Promise.all([
          AsyncStorage.getItem(CACHE_KEYS.REPORT_DETAIL),
          AsyncStorage.getItem(CACHE_KEYS.REPORT_SUMMARY),
          AsyncStorage.getItem(CACHE_KEYS.WEB3_FILES),
          AsyncStorage.getItem(CACHE_KEYS.LAST_FETCH),
        ]);

      let dataLoaded = false;

      if (cachedReport) {
        const reportData = JSON.parse(cachedReport);
        setReport(reportData);
        setIsLoadedFromCache(true);
        dataLoaded = true;
        console.log("Loaded cached report data");
      }

      if (cachedSummary) {
        const summaryData = JSON.parse(cachedSummary);
        setSummaryResult(summaryData);
        console.log("Loaded cached summary data");
      }

      if (cachedWeb3Files) {
        const filesData = JSON.parse(cachedWeb3Files);
        setWeb3Files(filesData);
        console.log("Loaded cached Web3 files");
      }

      if (lastFetch) {
        setLastSyncTime(new Date(parseInt(lastFetch)));
      }

      return dataLoaded;
    } catch (error) {
      console.error("Error loading cached report data:", error);
      return false;
    }
  };

  // Cache report data
  const cacheReportData = async (
    reportData,
    summaryData = null,
    filesData = null
  ) => {
    try {
      const currentTime = Date.now().toString();
      const cachePromises = [
        AsyncStorage.setItem(
          CACHE_KEYS.REPORT_DETAIL,
          JSON.stringify(reportData)
        ),
        AsyncStorage.setItem(CACHE_KEYS.LAST_FETCH, currentTime),
      ];

      if (summaryData) {
        cachePromises.push(
          AsyncStorage.setItem(
            CACHE_KEYS.REPORT_SUMMARY,
            JSON.stringify(summaryData)
          )
        );
      }

      if (filesData) {
        cachePromises.push(
          AsyncStorage.setItem(CACHE_KEYS.WEB3_FILES, JSON.stringify(filesData))
        );
      }

      await Promise.all(cachePromises);
      setLastSyncTime(new Date(parseInt(currentTime)));
      console.log("Report data cached successfully");
    } catch (error) {
      console.error("Error caching report data:", error);
    }
  };

  const fetchReport = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) setLoading(true);
      setError(null);

      // Check network connectivity
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        setLoading(false);
        if (forceRefresh) {
          Toast.show({
            type: "error",
            text1: "No Internet",
            text2: "Cannot refresh data while offline",
          });
        }
        return;
      }

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log(`Fetching report with ID: ${id}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/user/reports/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Report data received:", data);

      setReport(data.report);
      setIsLoadedFromCache(false);

      // Cache the fresh data
      await cacheReportData(data.report);

      // Handle Web3 report file fetching (only when online)
      if (data.report.type === "web3") {
        if (!contractInstance) {
          console.log("Contract instance not available, connecting wallet...");
          await connectWallet();
        } else {
          await fetchWeb3Files(
            data.userId || data.report.userId,
            data.report._id
          );
        }
      }
    } catch (error) {
      console.error("Error fetching report:", error);

      if (error.name === "AbortError") {
        setError("Request timed out. Showing cached data.");
        Toast.show({
          type: "error",
          text1: "Timeout",
          text2: "Request timed out. Showing cached data.",
        });
      } else {
        setError(error.message);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message || "Failed to fetch report",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWeb3Files = async (userId, reportId) => {
    try {
      setFilesLoading(true);
      setError(null);

      // Skip Web3 files if offline
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        console.log("Offline - skipping Web3 files fetch");
        setFilesLoading(false);
        return;
      }

      if (!contractInstance) {
        throw new Error("Contract instance not available");
      }

      console.log(
        `Fetching Web3 files for user: ${userId}, report: ${reportId}`
      );

      const reportFiles = await contractInstance.getReportFiles(
        userId,
        reportId
      );
      console.log("Raw blockchain files:", reportFiles);

      const formattedFiles = reportFiles.map((file, index) => {
        let cleanHash = file.ipfsHash;
        if (cleanHash.startsWith("ipfs://")) {
          cleanHash = cleanHash.replace("ipfs://", "");
        }

        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
        const fallbackUrl = `https://ipfs.io/ipfs/${cleanHash}`;

        return {
          id: index,
          fileName: file.fileName || `File ${index + 1}`,
          fileType: file.fileType || "unknown",
          ipfsHash: file.ipfsHash,
          ipfsUrl: ipfsUrl,
          fallbackUrl: fallbackUrl,
          isReportFile: file.fileName !== "Medicine List",
          isMedicineFile: file.fileName === "Medicine List",
        };
      });

      setWeb3Files(formattedFiles);

      // Cache Web3 files
      await cacheReportData(report, null, formattedFiles);

      console.log("Formatted Web3 files:", formattedFiles);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: `Loaded ${formattedFiles.length} files from blockchain`,
      });
    } catch (error) {
      console.error("Error fetching Web3 files:", error);
      Toast.show({
        type: "error",
        text1: "Blockchain Error",
        text2: "Web3 files require internet connection",
      });
    } finally {
      setFilesLoading(false);
    }
  };

  const handleGetSummary = async () => {
    try {
      // Check network first
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        Toast.show({
          type: "error",
          text1: "No Internet",
          text2: "AI summary requires internet connection",
        });
        return;
      }

      setSummaryLoading(true);
      console.log("Getting summary for reportID:", report._id);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/user/report-summary?reportId=${report._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to get summary: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Summary response:", data);

      const summaryData = data.summary || [];
      setSummaryResult(summaryData);

      // Cache the summary
      await AsyncStorage.setItem(
        CACHE_KEYS.REPORT_SUMMARY,
        JSON.stringify(summaryData)
      );

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "AI summary generated successfully",
      });
    } catch (error) {
      console.error("Error getting summary:", error);

      if (error.name === "AbortError") {
        Toast.show({
          type: "error",
          text1: "Timeout",
          text2: "AI summary request timed out",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "AI summary requires internet connection",
        });
      }
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleDownloadFile = async (fileUrl, fileName) => {
    try {
      // Check if offline and it's a Web3 file
      if (isOffline && fileUrl?.includes("ipfs")) {
        Toast.show({
          type: "error",
          text1: "Offline",
          text2: "IPFS files require internet connection",
        });
        return;
      }

      Alert.alert("Download File", `Would you like to download ${fileName}?`, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Download",
          onPress: async () => {
            try {
              Linking.openURL(fileUrl);
              Toast.show({
                type: "success",
                text1: "Success",
                text2: "File download started",
              });
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: isOffline
                  ? "Download requires internet connection"
                  : "Failed to download file",
              });
              console.error("Download error:", error);
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const openBlockchainUrl = (txHash) => {
    if (isOffline) {
      Toast.show({
        type: "error",
        text1: "Offline",
        text2: "Blockchain explorer requires internet connection",
      });
      return;
    }

    const url = `https://sepolia.etherscan.io/tx/${txHash}`;
    Linking.openURL(url);
  };

  // Clear report cache function
  const clearReportCache = async () => {
    Alert.alert("Clear Cache", "Remove cached data for this report?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          try {
            await Promise.all([
              AsyncStorage.removeItem(CACHE_KEYS.REPORT_DETAIL),
              AsyncStorage.removeItem(CACHE_KEYS.REPORT_SUMMARY),
              AsyncStorage.removeItem(CACHE_KEYS.WEB3_FILES),
              AsyncStorage.removeItem(CACHE_KEYS.LAST_FETCH),
            ]);

            Toast.show({
              type: "success",
              text1: "Cache Cleared",
              text2: "Report cache cleared successfully",
            });

            // Navigate back since we cleared the data
            navigation.goBack();
          } catch (error) {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Failed to clear cache",
            });
          }
        },
      },
    ]);
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "?"
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getReportFiles = () => {
    if (report?.type === "web3") {
      return web3Files.filter((file) => file.isReportFile);
    }
    return report?.reportFiles || [];
  };

  const getMedicineFiles = () => {
    if (report?.type === "web3") {
      return web3Files.filter((file) => file.isMedicineFile);
    }
    return report?.medicineListFiles || [];
  };

  const reportFiles = getReportFiles();
  const medicineFiles = getMedicineFiles();

  // Loading Screen
  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
        <LinearGradient
          colors={["#1F2937", "#111827"]}
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 24,
                borderWidth: 2,
                borderColor: "rgba(59, 130, 246, 0.3)",
              }}
            >
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#FFFFFF",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {error
                ? "Something went wrong"
                : isOffline
                ? "Loading Cached Report"
                : "Loading Report"}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#9CA3AF",
                textAlign: "center",
                paddingHorizontal: 40,
                lineHeight: 24,
              }}
            >
              {error ||
                (isOffline
                  ? "Loading offline data"
                  : "Please wait while we fetch your medical data")}
            </Text>
            {error && (
              <TouchableOpacity
                onPress={() => {
                  setError(null);
                  initializeReportData();
                }}
                style={{
                  marginTop: 24,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  backgroundColor: "#3B82F6",
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  Try Again
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Card Component
  const Card = ({ children, style = {} }) => (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        marginHorizontal: CARD_MARGIN,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        ...style,
      }}
    >
      {children}
    </View>
  );

  // Section Header Component
  const SectionHeader = ({ icon: Icon, title, color, children }) => (
    <View
      style={{
        backgroundColor: color,
        paddingHorizontal: CARD_PADDING,
        paddingVertical: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Icon size={22} color="#FFFFFF" />
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: "600",
            marginLeft: 12,
          }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );

  // Info Row Component
  const InfoRow = ({ icon: Icon, label, value, iconColor = "#6B7280" }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        marginBottom: 8,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "#FFFFFF",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <Icon size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 12,
            color: "#6B7280",
            marginBottom: 2,
            fontWeight: "500",
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#1F2937",
            fontWeight: "500",
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />

      {/* Header */}
      <LinearGradient
        colors={["#1F2937", "#111827"]}
        style={{
          paddingTop: 44,
          paddingBottom: 20,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 20,
                fontWeight: "700",
              }}
            >
              Medical Report
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
                backgroundColor:
                  report?.type === "web3"
                    ? "rgba(16, 185, 129, 0.2)"
                    : "rgba(59, 130, 246, 0.2)",
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              {isOffline ? (
                <WifiOff size={14} color="#F59E0B" />
              ) : report?.type === "web3" ? (
                <Shield size={14} color="#10B981" />
              ) : (
                <Globe size={14} color="#3B82F6" />
              )}
              <Text
                style={{
                  color: isOffline
                    ? "#F59E0B"
                    : report?.type === "web3"
                    ? "#10B981"
                    : "#3B82F6",
                  fontSize: 12,
                  fontWeight: "600",
                  marginLeft: 6,
                }}
              >
                {isOffline
                  ? "Offline Mode"
                  : report?.type === "web3"
                  ? "Blockchain Secured"
                  : "Standard Report"}
              </Text>
            </View>
            {lastSyncTime && isLoadedFromCache && (
              <Text style={{ color: "#9CA3AF", fontSize: 10, marginTop: 2 }}>
                Cached: {lastSyncTime.toLocaleTimeString()}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={clearReportCache}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Share2 size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
      >
        {/* Offline Status Banner */}
        {isOffline && (
          <View style={{ marginHorizontal: CARD_MARGIN, marginBottom: 16 }}>
            <View
              style={{
                backgroundColor: "#F59E0B",
                padding: 16,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <WifiOff size={20} color="#FFFFFF" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text
                  style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 14 }}
                >
                  Offline Mode
                </Text>
                <Text style={{ color: "#FEF3C7", fontSize: 12 }}>
                  {isLoadedFromCache
                    ? "Showing cached data • Some features unavailable"
                    : "Limited functionality available"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Patient Information */}
        {report && (
          <Card>
            <SectionHeader
              icon={User}
              title="Patient Information"
              color="#3B82F6"
            />
            <View style={{ padding: CARD_PADDING }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <LinearGradient
                  colors={["#3B82F6", "#1D4ED8"]}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 16,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 22,
                      fontWeight: "700",
                    }}
                  >
                    {getInitials(report.patientName)}
                  </Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: "#1F2937",
                      marginBottom: 4,
                    }}
                  >
                    {report.patientName}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                      fontWeight: "500",
                    }}
                  >
                    Patient ID: #{report._id.slice(-8).toUpperCase()}
                  </Text>
                  {report.ageAtReport && (
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#6B7280",
                        marginTop: 2,
                      }}
                    >
                      Age: {report.ageAtReport} years
                    </Text>
                  )}
                  {isLoadedFromCache && (
                    <View
                      style={{
                        backgroundColor: "#F59E0B",
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 8,
                        marginTop: 4,
                        alignSelf: "flex-start",
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 10,
                          fontWeight: "600",
                        }}
                      >
                        CACHED DATA
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <InfoRow
                icon={Stethoscope}
                label="Doctor"
                value={report.doctorName}
                iconColor="#3B82F6"
              />
              <InfoRow
                icon={Building}
                label="Hospital"
                value={report.hospital}
                iconColor="#8B5CF6"
              />
              {report.department && (
                <InfoRow
                  icon={FileText}
                  label="Department"
                  value={report.department}
                  iconColor="#6366F1"
                />
              )}
              {report.reportType && (
                <InfoRow
                  icon={Activity}
                  label="Report Type"
                  value={report.reportType}
                  iconColor="#059669"
                />
              )}
              <InfoRow
                icon={Calendar}
                label="Report Date"
                value={formatDate(report.dateOfReport)}
                iconColor="#14B8A6"
              />
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        {report && (
          <Card>
            <SectionHeader icon={Zap} title="Quick Actions" color="#6366F1" />
            <View style={{ padding: CARD_PADDING, gap: 12 }}>
              {/* Refresh Data Button */}
              {!isOffline && (
                <TouchableOpacity
                  onPress={() => fetchReport(true)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#059669",
                    paddingVertical: 14,
                    borderRadius: 12,
                    shadowColor: "#059669",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Download
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Refresh Data
                  </Text>
                </TouchableOpacity>
              )}

              {report.type === "web3" && report.blockchainTxHash && (
                <TouchableOpacity
                  onPress={() => openBlockchainUrl(report.blockchainTxHash)}
                  disabled={isOffline}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isOffline ? "#9CA3AF" : "#10B981",
                    paddingVertical: 14,
                    borderRadius: 12,
                    shadowColor: isOffline ? "#9CA3AF" : "#10B981",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <ExternalLink
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    {isOffline ? "Requires Internet" : "View on Blockchain"}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("AskAI", { reportId: report._id })
                }
                disabled={isOffline}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isOffline ? "#9CA3AF" : "#EC4899",
                  paddingVertical: 14,
                  borderRadius: 12,
                  shadowColor: isOffline ? "#9CA3AF" : "#EC4899",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <MessageCircle
                  size={20}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}
                >
                  {isOffline ? "Requires Internet" : "Ask AI About Report"}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Vitals */}
        {report?.vitals && Object.keys(report.vitals).length > 0 && (
          <Card>
            <SectionHeader icon={Heart} title="Vital Signs" color="#EF4444" />
            <View style={{ padding: CARD_PADDING }}>
              {report.vitals.bloodPressure && (
                <InfoRow
                  icon={TrendingUp}
                  label="Blood Pressure"
                  value={`${report.vitals.bloodPressure} mmHg`}
                  iconColor="#EF4444"
                />
              )}
              {report.vitals.heartRate && (
                <InfoRow
                  icon={Heart}
                  label="Heart Rate"
                  value={`${report.vitals.heartRate} bpm`}
                  iconColor="#DC2626"
                />
              )}
              {report.vitals.temperature && (
                <InfoRow
                  icon={Thermometer}
                  label="Temperature"
                  value={`${report.vitals.temperature}°F`}
                  iconColor="#F59E0B"
                />
              )}
              {report.vitals.oxygenSaturation && (
                <InfoRow
                  icon={Zap}
                  label="Oxygen Saturation"
                  value={`${report.vitals.oxygenSaturation}%`}
                  iconColor="#3B82F6"
                />
              )}
              {report.vitals.weight && (
                <InfoRow
                  icon={Scale}
                  label="Weight"
                  value={`${report.vitals.weight} kg`}
                  iconColor="#059669"
                />
              )}
              {report.vitals.height && (
                <InfoRow
                  icon={TrendingUp}
                  label="Height"
                  value={`${report.vitals.height} cm`}
                  iconColor="#7C3AED"
                />
              )}
              {report.vitals.bmi && (
                <InfoRow
                  icon={Activity}
                  label="BMI"
                  value={report.vitals.bmi}
                  iconColor="#4F46E5"
                />
              )}
            </View>
          </Card>
        )}

        {/* Diagnosis Summary */}
        {report?.diagnosisSummary && (
          <Card>
            <SectionHeader
              icon={AlertCircle}
              title="Diagnosis Summary"
              color="#F59E0B"
            />
            <View style={{ padding: CARD_PADDING }}>
              <Text
                style={{
                  fontSize: 16,
                  color: "#374151",
                  lineHeight: 24,
                  fontWeight: "400",
                }}
              >
                {report.diagnosisSummary}
              </Text>
            </View>
          </Card>
        )}

        {/* Reason for Checkup */}
        {report?.reasonOfCheckup && (
          <Card>
            <SectionHeader
              icon={Clock}
              title="Reason for Checkup"
              color="#8B5CF6"
            />
            <View style={{ padding: CARD_PADDING }}>
              <Text
                style={{
                  fontSize: 16,
                  color: "#374151",
                  lineHeight: 24,
                  fontWeight: "400",
                }}
              >
                {report.reasonOfCheckup}
              </Text>
            </View>
          </Card>
        )}

        {/* Prescription */}
        {report?.prescription && (
          <Card>
            <SectionHeader
              icon={Pill}
              title="Prescription & Treatment"
              color="#10B981"
            />
            <View style={{ padding: CARD_PADDING }}>
              <Text
                style={{
                  fontSize: 16,
                  color: "#374151",
                  lineHeight: 24,
                  fontWeight: "400",
                }}
              >
                {report.prescription}
              </Text>
            </View>
          </Card>
        )}

        {/* Report Files */}
        {(reportFiles.length > 0 || filesLoading) && (
          <Card>
            <SectionHeader
              icon={FileText}
              title="Medical Report Files"
              color="#7C3AED"
            >
              {reportFiles.length > 1 && (
                <View
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {currentFileIndex + 1} of {reportFiles.length}
                  </Text>
                </View>
              )}
            </SectionHeader>
            <View style={{ padding: CARD_PADDING }}>
              {filesLoading ? (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <ActivityIndicator size="large" color="#7C3AED" />
                  <Text
                    style={{ color: "#6B7280", marginTop: 12, fontSize: 16 }}
                  >
                    Loading files from blockchain...
                  </Text>
                </View>
              ) : reportFiles.length > 0 ? (
                <View>
                  <View
                    style={{
                      backgroundColor: "#F8FAFC",
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: "#7C3AED",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 16,
                        }}
                      >
                        <FileText size={24} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#1F2937",
                            marginBottom: 2,
                          }}
                        >
                          {reportFiles[currentFileIndex]?.fileName ||
                            reportFiles[currentFileIndex]?.name ||
                            `Report File ${currentFileIndex + 1}`}
                        </Text>
                        <Text style={{ fontSize: 14, color: "#6B7280" }}>
                          {reportFiles[currentFileIndex]?.fileType ||
                            reportFiles[currentFileIndex]?.type ||
                            "Unknown type"}
                        </Text>
                        {report.type === "web3" && (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginTop: 4,
                            }}
                          >
                            <Shield size={12} color="#10B981" />
                            <Text
                              style={{
                                fontSize: 12,
                                color: "#10B981",
                                fontWeight: "600",
                                marginLeft: 4,
                              }}
                            >
                              {isOffline
                                ? "Needs Internet"
                                : "Blockchain Secured"}
                            </Text>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          const fileUrl =
                            report.type === "web3"
                              ? reportFiles[currentFileIndex]?.ipfsUrl
                              : reportFiles[currentFileIndex]?.fileUrl;
                          const fileName =
                            reportFiles[currentFileIndex]?.fileName ||
                            reportFiles[currentFileIndex]?.name ||
                            `Report_File_${currentFileIndex + 1}`;
                          handleDownloadFile(fileUrl, fileName);
                        }}
                        disabled={isOffline && report.type === "web3"}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor:
                            isOffline && report.type === "web3"
                              ? "#9CA3AF"
                              : "#10B981",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Download size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Navigation for multiple files */}
                  {reportFiles.length > 1 && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 16,
                        gap: 12,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          setCurrentFileIndex(Math.max(0, currentFileIndex - 1))
                        }
                        disabled={currentFileIndex === 0}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor:
                            currentFileIndex === 0 ? "#F3F4F6" : "#7C3AED",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <ChevronLeft
                          size={20}
                          color={currentFileIndex === 0 ? "#9CA3AF" : "#FFFFFF"}
                        />
                      </TouchableOpacity>

                      <Text
                        style={{
                          fontSize: 14,
                          color: "#6B7280",
                          fontWeight: "500",
                        }}
                      >
                        {currentFileIndex + 1} of {reportFiles.length}
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          setCurrentFileIndex(
                            Math.min(
                              reportFiles.length - 1,
                              currentFileIndex + 1
                            )
                          )
                        }
                        disabled={currentFileIndex === reportFiles.length - 1}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor:
                            currentFileIndex === reportFiles.length - 1
                              ? "#F3F4F6"
                              : "#7C3AED",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <ChevronRight
                          size={20}
                          color={
                            currentFileIndex === reportFiles.length - 1
                              ? "#9CA3AF"
                              : "#FFFFFF"
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Image preview - only if online or non-IPFS file */}
                  {reportFiles[currentFileIndex]?.fileType
                    ?.toLowerCase()
                    .includes("image") &&
                    (!isOffline ||
                      !reportFiles[currentFileIndex]?.ipfsUrl?.includes(
                        "ipfs"
                      )) && (
                      <View style={{ marginTop: 16 }}>
                        <Image
                          source={{
                            uri:
                              report.type === "web3"
                                ? reportFiles[currentFileIndex]?.ipfsUrl
                                : reportFiles[currentFileIndex]?.fileUrl,
                          }}
                          style={{
                            width: "100%",
                            height: 200,
                            borderRadius: 12,
                            backgroundColor: "#F3F4F6",
                          }}
                          resizeMode="cover"
                        />
                      </View>
                    )}
                </View>
              ) : (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <FileText size={48} color="#9CA3AF" />
                  <Text
                    style={{ color: "#6B7280", marginTop: 12, fontSize: 16 }}
                  >
                    No report files available
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Medicine List Files */}
        {(medicineFiles.length > 0 ||
          (report?.type === "web3" && filesLoading)) && (
          <Card>
            <SectionHeader
              icon={Pill}
              title="Medicine List Files"
              color="#10B981"
            >
              {medicineFiles.length > 1 && (
                <View
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {currentMedicineIndex + 1} of {medicineFiles.length}
                  </Text>
                </View>
              )}
            </SectionHeader>
            <View style={{ padding: CARD_PADDING }}>
              {filesLoading ? (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text
                    style={{ color: "#6B7280", marginTop: 12, fontSize: 16 }}
                  >
                    Loading medicine files...
                  </Text>
                </View>
              ) : medicineFiles.length > 0 ? (
                <View>
                  <View
                    style={{
                      backgroundColor: "#F0FDF4",
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: "#BBF7D0",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: "#10B981",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 16,
                        }}
                      >
                        <Pill size={24} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#1F2937",
                            marginBottom: 2,
                          }}
                        >
                          {medicineFiles[currentMedicineIndex]?.fileName ||
                            medicineFiles[currentMedicineIndex]?.name ||
                            `Medicine List ${currentMedicineIndex + 1}`}
                        </Text>
                        <Text style={{ fontSize: 14, color: "#6B7280" }}>
                          {medicineFiles[currentMedicineIndex]?.fileType ||
                            medicineFiles[currentMedicineIndex]?.type ||
                            "Unknown type"}
                        </Text>
                        {report.type === "web3" && (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginTop: 4,
                            }}
                          >
                            <Shield size={12} color="#10B981" />
                            <Text
                              style={{
                                fontSize: 12,
                                color: "#10B981",
                                fontWeight: "600",
                                marginLeft: 4,
                              }}
                            >
                              {isOffline
                                ? "Needs Internet"
                                : "Blockchain Secured"}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => {
                            const fileUrl =
                              report.type === "web3"
                                ? medicineFiles[currentMedicineIndex]?.ipfsUrl
                                : medicineFiles[currentMedicineIndex]?.fileUrl;

                            if (isOffline && report.type === "web3") {
                              Toast.show({
                                type: "error",
                                text1: "Offline",
                                text2: "Web3 files require internet connection",
                              });
                              return;
                            }

                            Linking.openURL(fileUrl);
                          }}
                          disabled={isOffline && report.type === "web3"}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor:
                              isOffline && report.type === "web3"
                                ? "#9CA3AF"
                                : "#059669",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Eye size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            const fileUrl =
                              report.type === "web3"
                                ? medicineFiles[currentMedicineIndex]?.ipfsUrl
                                : medicineFiles[currentMedicineIndex]?.fileUrl;
                            const fileName =
                              medicineFiles[currentMedicineIndex]?.fileName ||
                              medicineFiles[currentMedicineIndex]?.name ||
                              `Medicine_List_${currentMedicineIndex + 1}`;
                            handleDownloadFile(fileUrl, fileName);
                          }}
                          disabled={isOffline && report.type === "web3"}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor:
                              isOffline && report.type === "web3"
                                ? "#9CA3AF"
                                : "#14B8A6",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Download size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Navigation for multiple medicine files */}
                  {medicineFiles.length > 1 && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 16,
                        gap: 12,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          setCurrentMedicineIndex(
                            Math.max(0, currentMedicineIndex - 1)
                          )
                        }
                        disabled={currentMedicineIndex === 0}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor:
                            currentMedicineIndex === 0 ? "#F3F4F6" : "#10B981",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <ChevronLeft
                          size={20}
                          color={
                            currentMedicineIndex === 0 ? "#9CA3AF" : "#FFFFFF"
                          }
                        />
                      </TouchableOpacity>

                      <Text
                        style={{
                          fontSize: 14,
                          color: "#6B7280",
                          fontWeight: "500",
                        }}
                      >
                        {currentMedicineIndex + 1} of {medicineFiles.length}
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          setCurrentMedicineIndex(
                            Math.min(
                              medicineFiles.length - 1,
                              currentMedicineIndex + 1
                            )
                          )
                        }
                        disabled={
                          currentMedicineIndex === medicineFiles.length - 1
                        }
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor:
                            currentMedicineIndex === medicineFiles.length - 1
                              ? "#F3F4F6"
                              : "#10B981",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <ChevronRight
                          size={20}
                          color={
                            currentMedicineIndex === medicineFiles.length - 1
                              ? "#9CA3AF"
                              : "#FFFFFF"
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Image preview for medicine files - only if online or non-IPFS */}
                  {medicineFiles[currentMedicineIndex]?.fileType
                    ?.toLowerCase()
                    .includes("image") &&
                    (!isOffline ||
                      !medicineFiles[currentMedicineIndex]?.ipfsUrl?.includes(
                        "ipfs"
                      )) && (
                      <View style={{ marginTop: 16 }}>
                        <Image
                          source={{
                            uri:
                              report.type === "web3"
                                ? medicineFiles[currentMedicineIndex]?.ipfsUrl
                                : medicineFiles[currentMedicineIndex]?.fileUrl,
                          }}
                          style={{
                            width: "100%",
                            height: 200,
                            borderRadius: 12,
                            backgroundColor: "#F3F4F6",
                          }}
                          resizeMode="cover"
                        />
                      </View>
                    )}
                </View>
              ) : (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <Pill size={48} color="#9CA3AF" />
                  <Text
                    style={{ color: "#6B7280", marginTop: 12, fontSize: 16 }}
                  >
                    No medicine files available
                  </Text>
                  {isOffline && (
                    <Text
                      style={{ color: "#F59E0B", marginTop: 4, fontSize: 12 }}
                    >
                      Web3 files require internet connection
                    </Text>
                  )}
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Prescribed Medicines */}
        {report?.medicines && report.medicines.length > 0 && (
          <Card>
            <SectionHeader
              icon={Pill}
              title="Prescribed Medicines"
              color="#06B6D4"
            >
              <TouchableOpacity
                onPress={handleGetSummary}
                disabled={summaryLoading || isOffline}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: isOffline ? 0.5 : 1,
                }}
              >
                {summaryLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Sparkles
                      size={16}
                      color="#FFFFFF"
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {isOffline ? "Needs Internet" : "AI Summary"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </SectionHeader>
            <View style={{ padding: CARD_PADDING }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  {/* Modern Table Header */}
                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: "#F8FAFC",
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                      paddingVertical: 16,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    {[
                      { label: "Medicine", width: 140 },
                      { label: "Dose", width: 80 },
                      { label: "Frequency", width: 100 },
                      { label: "Quantity", width: 80 },
                      { label: "Timing", width: 120 },
                    ].map((column, index) => (
                      <View
                        key={column.label}
                        style={{
                          width: column.width,
                          paddingHorizontal: 16,
                          borderRightWidth: index < 4 ? 1 : 0,
                          borderRightColor: "#E2E8F0",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: "#374151",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          {column.label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Table Body */}
                  {report.medicines.map((medicine, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        backgroundColor:
                          index % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                        paddingVertical: 16,
                        borderLeftWidth: 1,
                        borderRightWidth: 1,
                        borderBottomWidth:
                          index === report.medicines.length - 1 ? 1 : 0,
                        borderColor: "#E2E8F0",
                        borderBottomLeftRadius:
                          index === report.medicines.length - 1 ? 12 : 0,
                        borderBottomRightRadius:
                          index === report.medicines.length - 1 ? 12 : 0,
                      }}
                    >
                      <View style={{ width: 140, paddingHorizontal: 16 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "600",
                            color: "#1F2937",
                          }}
                        >
                          {medicine.name}
                        </Text>
                      </View>
                      <View style={{ width: 80, paddingHorizontal: 16 }}>
                        <Text style={{ fontSize: 14, color: "#6B7280" }}>
                          {medicine.dose}
                        </Text>
                      </View>
                      <View style={{ width: 100, paddingHorizontal: 16 }}>
                        <Text style={{ fontSize: 14, color: "#6B7280" }}>
                          {medicine.frequency}
                        </Text>
                      </View>
                      <View style={{ width: 80, paddingHorizontal: 16 }}>
                        <Text style={{ fontSize: 14, color: "#6B7280" }}>
                          {medicine.quantity}
                        </Text>
                      </View>
                      <View style={{ width: 120, paddingHorizontal: 16 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 4,
                          }}
                        >
                          {medicine.timing.map((time, timeIndex) => (
                            <View
                              key={timeIndex}
                              style={{
                                backgroundColor: "#DBEAFE",
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: "#93C5FD",
                              }}
                            >
                              <Text
                                style={{
                                  color: "#1E40AF",
                                  fontSize: 12,
                                  fontWeight: "600",
                                }}
                              >
                                {time}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </Card>
        )}

        {/* AI Summary */}
        {summaryResult.length > 0 && (
          <Card>
            <SectionHeader
              icon={Sparkles}
              title="AI Medication Analysis"
              color="#7C3AED"
            />
            <View style={{ padding: CARD_PADDING }}>
              <MedicationSummaryDisplay summaryResult={summaryResult} />
            </View>
          </Card>
        )}

        {/* Blockchain Details */}
        {report?.type === "web3" && (
          <Card>
            <SectionHeader
              icon={Shield}
              title="Blockchain Details"
              color="#6366F1"
            />
            <View style={{ padding: CARD_PADDING }}>
              {report.blockchainTxHash && (
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                      fontWeight: "600",
                      marginBottom: 8,
                    }}
                  >
                    Transaction Hash
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#F3F4F6",
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        color: "#374151",
                        lineHeight: 16,
                      }}
                    >
                      {report.blockchainTxHash}
                    </Text>
                  </View>
                </View>
              )}

              {web3Files.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                      fontWeight: "600",
                      marginBottom: 8,
                    }}
                  >
                    IPFS Storage
                  </Text>
                  <View style={{ gap: 8 }}>
                    {web3Files.map((file) => (
                      <View
                        key={file.id}
                        style={{
                          backgroundColor: "#F3F4F6",
                          padding: 12,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "#E5E7EB",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#1F2937",
                            marginBottom: 4,
                          }}
                        >
                          {file.fileName}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "monospace",
                            fontSize: 12,
                            color: "#6B7280",
                          }}
                        >
                          {file.ipfsHash}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isOffline ? "#FEF3C7" : "#ECFDF5",
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: isOffline ? "#FCD34D" : "#BBF7D0",
                }}
              >
                <Lock
                  size={16}
                  color={isOffline ? "#F59E0B" : "#059669"}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: isOffline ? "#F59E0B" : "#059669",
                    flex: 1,
                    fontWeight: "500",
                  }}
                >
                  {isOffline
                    ? "Blockchain verification requires internet connection"
                    : "This report is cryptographically secured on the blockchain"}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Report Owner */}
        {report?.owner && (
          <Card>
            <SectionHeader icon={User} title="Report Owner" color="#14B8A6" />
            <View style={{ padding: CARD_PADDING }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <LinearGradient
                  colors={["#14B8A6", "#06B6D4"]}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 16,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 18,
                      fontWeight: "700",
                    }}
                  >
                    {getInitials(report.owner.name)}
                  </Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#1F2937",
                      marginBottom: 2,
                    }}
                  >
                    {report.owner.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                    }}
                  >
                    {report.owner.email}
                  </Text>
                </View>
              </View>

              {report.owner.walletAddress && (
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                      fontWeight: "600",
                      marginBottom: 8,
                    }}
                  >
                    Wallet Address
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#F3F4F6",
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        color: "#374151",
                      }}
                    >
                      {report.owner.walletAddress}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

export default ReportDetailScreen;
