// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Animated,
//   RefreshControl,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useWeb3 } from "../../contexts/Web3Context";

// const ReportsScreen = () => {
//   const router = useRouter();
//   const [userReportsWeb2, setUserReportsWeb2] = useState([]);
//   const [userReportsWeb3, setUserReportsWeb3] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [activeTab, setActiveTab] = useState("web2");
//   const [fadeAnim] = useState(new Animated.Value(0));

//   const { contractInstance, connectWallet } = useWeb3();

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 1000,
//       useNativeDriver: true,
//     }).start();

//     fetchReports();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const fetchReports = async () => {
//     if (!refreshing) setLoading(true);

//     try {
//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         Alert.alert("Error", "No authentication token found");
//         setLoading(false);
//         return;
//       }

//       const response = await fetch(
//         "https://medlink-bh5c.onrender.com/api/user/reports",
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         setUserReportsWeb2(data.web2Reports || []);

//         const web3BackendReports = data.web3Reports || [];
//         console.log("Backend Web3 reports:", web3BackendReports);

//         if (contractInstance && data.userId) {
//           try {
//             const reportsOnChain = await contractInstance.getReports(
//               data.userId,
//               0
//             );
//             const parsedOnChain = reportsOnChain.map((r) => ({
//               ipfsHash: r.ipfsHash,
//               reportId: r.reportId,
//               timestamp: Number(r.timestamp),
//               files: r.files || [],
//               fileCount: Number(r.fileCount),
//               hasMultipleFiles: r.hasMultipleFiles,
//             }));

//             const mergedReports = parsedOnChain.map((onChain) => {
//               const match = web3BackendReports.find(
//                 (r) => r._id === onChain.reportId
//               );

//               return {
//                 ...onChain,
//                 ...match,
//                 isWeb3: true,
//               };
//             });

//             setUserReportsWeb3(mergedReports);
//             console.log("Merged Web3 reports:", mergedReports);
//           } catch (contractError) {
//             console.log("Contract not ready or error:", contractError);
//             setUserReportsWeb3(
//               web3BackendReports.map((r) => ({ ...r, isWeb3: true }))
//             );
//           }
//         } else {
//           if (!contractInstance) {
//             connectWallet();
//           }
//           setUserReportsWeb3(
//             web3BackendReports.map((r) => ({ ...r, isWeb3: true }))
//           );
//         }
//       } else {
//         Alert.alert("Error", data.message || "Failed to fetch reports");
//       }
//     } catch (error) {
//       console.error("Error fetching reports:", error);
//       Alert.alert("Error", "Network error. Please try again.");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchReports();
//   };

//   const formatDate = (timestamp) => {
//     const date = new Date(timestamp * 1000);
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const getReportTypeIcon = (reportType) => {
//     switch (reportType?.toLowerCase()) {
//       case "blood test":
//         return "water-outline";
//       case "x-ray":
//         return "radio-outline";
//       case "mri":
//         return "scan-outline";
//       case "prescription":
//         return "medical-outline";
//       default:
//         return "document-text-outline";
//     }
//   };

//   const ReportCard = ({ report, isWeb3 = false }) => {
//     const cardColors = isWeb3
//       ? ["#8B5CF6", "#06B6D4", "#10B981"]
//       : ["#3B82F6", "#8B5CF6", "#EC4899"];

//     return (
//       <TouchableOpacity activeOpacity={0.8} className="mb-6">
//         <LinearGradient
//           colors={cardColors}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           style={{
//             borderRadius: 20,
//             padding: 1,
//           }}
//         >
//           <View
//             className="bg-white p-6 relative overflow-hidden"
//             style={{ borderRadius: 19 }}
//           >
//             {/* Background Pattern */}
//             <View
//               className="absolute -top-10 -right-10 w-20 h-20 rounded-full opacity-10"
//               style={{ backgroundColor: cardColors[0] }}
//             />
//             <View
//               className="absolute -bottom-5 -left-5 w-16 h-16 rounded-full opacity-5"
//               style={{ backgroundColor: cardColors[1] }}
//             />

//             {/* Header */}
//             <View className="flex-row justify-between items-start mb-4">
//               <View className="flex-1">
//                 <Text className="text-xl font-bold text-gray-800 mb-1">
//                   {report.reportType || report.type || "Medical Report"}
//                 </Text>
//                 <Text className="text-sm text-gray-500">
//                   {report.hospitalName ||
//                     report.hospital ||
//                     "Healthcare Provider"}
//                 </Text>
//               </View>
//               <View className="flex-row items-center">
//                 <LinearGradient
//                   colors={
//                     isWeb3 ? ["#8B5CF6", "#06B6D4"] : ["#3B82F6", "#8B5CF6"]
//                   }
//                   style={{
//                     borderRadius: 12,
//                     padding: 8,
//                     marginRight: 8,
//                   }}
//                 >
//                   <Ionicons
//                     name={getReportTypeIcon(report.reportType || report.type)}
//                     size={20}
//                     color="white"
//                   />
//                 </LinearGradient>
//                 {isWeb3 && (
//                   <View
//                     className="px-2 py-1"
//                     style={{
//                       backgroundColor: "#10B981",
//                       borderRadius: 8,
//                     }}
//                   >
//                     <Ionicons name="shield-checkmark" size={12} color="white" />
//                   </View>
//                 )}
//               </View>
//             </View>

//             {/* Report Details */}
//             <View className="space-y-3">
//               <View className="flex-row items-center">
//                 <Ionicons name="calendar-outline" size={16} color="#6B7280" />
//                 <Text className="text-gray-600 ml-2">
//                   {formatDate(
//                     report.timestamp || report.createdAt || Date.now() / 1000
//                   )}
//                 </Text>
//               </View>

//               {report.doctorName && (
//                 <View className="flex-row items-center">
//                   <Ionicons name="person-outline" size={16} color="#6B7280" />
//                   <Text className="text-gray-600 ml-2">
//                     {report.doctorName}
//                   </Text>
//                 </View>
//               )}

//               {report.fileCount && Number(report.fileCount) > 0 && (
//                 <View className="flex-row items-center">
//                   <MaterialIcons name="attach-file" size={16} color="#6B7280" />
//                   <Text className="text-gray-600 ml-2">
//                     {report.fileCount} file
//                     {Number(report.fileCount) > 1 ? "s" : ""}
//                   </Text>
//                 </View>
//               )}

//               {isWeb3 && report.ipfsHash && (
//                 <View className="flex-row items-center">
//                   <Ionicons name="cloud-outline" size={16} color="#6B7280" />
//                   <Text className="text-gray-600 ml-2 flex-1" numberOfLines={1}>
//                     IPFS: {report.ipfsHash.substring(0, 20)}...
//                   </Text>
//                 </View>
//               )}
//             </View>

//             {/* Status Badge */}
//             <View className="flex-row justify-between items-center mt-4">
//               <View className="flex-row items-center">
//                 <View
//                   className="w-2 h-2 rounded-full mr-2"
//                   style={{ backgroundColor: "#10B981" }}
//                 />
//                 <Text className="text-sm text-green-600 font-medium">
//                   {isWeb3 ? "Blockchain Secured" : "Securely Stored"}
//                 </Text>
//               </View>

//               <TouchableOpacity
//                 onPress={() =>
//                   router.push(`/(pages)/ReportInDetail/${report._id}`)
//                 }
//                 className="px-4 py-2"
//                 style={{
//                   backgroundColor: "#F3F4F6",
//                   borderRadius: 12,
//                 }}
//               >
//                 <Text className="text-sm font-medium text-gray-700">
//                   View Details
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </LinearGradient>
//       </TouchableOpacity>
//     );
//   };

//   const EmptyState = ({ isWeb3 }) => (
//     <View className="items-center justify-center py-20">
//       <LinearGradient
//         colors={isWeb3 ? ["#8B5CF6", "#06B6D4"] : ["#3B82F6", "#8B5CF6"]}
//         style={{
//           borderRadius: 40,
//           padding: 20,
//           marginBottom: 16,
//         }}
//       >
//         <Ionicons
//           name={isWeb3 ? "shield-outline" : "document-text-outline"}
//           size={40}
//           color="white"
//         />
//       </LinearGradient>

//       <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
//         No Reports Found
//       </Text>
//       <Text className="text-gray-500 text-center px-8">
//         Your {isWeb3 ? "blockchain-secured" : "traditional"} medical reports
//         will appear here once uploaded.
//       </Text>
//     </View>
//   );

//   if (loading && !refreshing) {
//     return (
//       <LinearGradient
//         colors={["#1E293B", "#0F172A"]}
//         className="flex-1 justify-center items-center"
//       >
//         <View className="items-center">
//           <ActivityIndicator size="large" color="#8B5CF6" />
//           <Text className="text-white text-lg font-medium mt-4">
//             Loading your medical reports...
//           </Text>
//           <Text className="text-gray-400 text-sm mt-2">
//             Fetching data from Web2 and Web3 sources
//           </Text>
//         </View>
//       </LinearGradient>
//     );
//   }

//   return (
//     <LinearGradient
//       colors={["#1E293B", "#0F172A", "#1E293B"]}
//       className="flex-1"
//     >
//       <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
//         {/* Header */}
//         <View className="px-6 pt-16 pb-8">
//           <Text className="text-3xl font-bold text-white mb-2">
//             Medical Reports
//           </Text>
//           <Text className="text-gray-300">
//             Manage your health records securely
//           </Text>
//         </View>

//         {/* Tab Navigation */}
//         <View className="px-6 mb-6">
//           <View
//             className="bg-white/10 p-1 flex-row"
//             style={{ borderRadius: 16 }}
//           >
//             <TouchableOpacity
//               onPress={() => setActiveTab("web2")}
//               className={`flex-1 py-4 px-6 flex-row items-center justify-center ${
//                 activeTab === "web2" ? "" : ""
//               }`}
//               style={{
//                 borderRadius: 12,
//                 backgroundColor:
//                   activeTab === "web2" ? "#3B82F6" : "transparent",
//               }}
//             >
//               <Ionicons
//                 name="globe-outline"
//                 size={20}
//                 color={activeTab === "web2" ? "white" : "#9CA3AF"}
//               />
//               <Text
//                 className={`ml-2 font-bold ${
//                   activeTab === "web2" ? "text-white" : "text-gray-400"
//                 }`}
//               >
//                 Traditional
//               </Text>
//               <View
//                 className="ml-2 px-2 py-1"
//                 style={{
//                   borderRadius: 10,
//                   backgroundColor:
//                     activeTab === "web2"
//                       ? "rgba(255,255,255,0.2)"
//                       : "rgba(59,130,246,0.2)",
//                 }}
//               >
//                 <Text
//                   className={`text-xs font-bold ${
//                     activeTab === "web2" ? "text-white" : "text-blue-400"
//                   }`}
//                 >
//                   {userReportsWeb2.length}
//                 </Text>
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={() => setActiveTab("web3")}
//               className="flex-1 py-4 px-6 flex-row items-center justify-center"
//               style={{
//                 borderRadius: 12,
//                 backgroundColor:
//                   activeTab === "web3" ? "#8B5CF6" : "transparent",
//               }}
//             >
//               <Ionicons
//                 name="shield-outline"
//                 size={20}
//                 color={activeTab === "web3" ? "white" : "#9CA3AF"}
//               />
//               <Text
//                 className={`ml-2 font-bold ${
//                   activeTab === "web3" ? "text-white" : "text-gray-400"
//                 }`}
//               >
//                 Blockchain
//               </Text>
//               <View
//                 className="ml-2 px-2 py-1"
//                 style={{
//                   borderRadius: 10,
//                   backgroundColor:
//                     activeTab === "web3"
//                       ? "rgba(255,255,255,0.2)"
//                       : "rgba(139,92,246,0.2)",
//                 }}
//               >
//                 <Text
//                   className={`text-xs font-bold ${
//                     activeTab === "web3" ? "text-white" : "text-purple-400"
//                   }`}
//                 >
//                   {userReportsWeb3.length}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Reports List */}
//         <ScrollView
//           className="flex-1 px-6"
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor="#8B5CF6"
//               colors={["#8B5CF6"]}
//             />
//           }
//           showsVerticalScrollIndicator={false}
//         >
//           {activeTab === "web2" ? (
//             userReportsWeb2.length === 0 ? (
//               <EmptyState isWeb3={false} />
//             ) : (
//               <View>
//                 {userReportsWeb2.map((report, index) => (
//                   <ReportCard key={index} report={report} isWeb3={false} />
//                 ))}
//               </View>
//             )
//           ) : userReportsWeb3.length === 0 ? (
//             <EmptyState isWeb3={true} />
//           ) : (
//             <View>
//               {userReportsWeb3.map((report, index) => (
//                 <ReportCard key={index} report={report} isWeb3={true} />
//               ))}
//             </View>
//           )}

//           {/* Bottom spacing */}
//           <View className="h-20" />
//         </ScrollView>

//         {/* Bottom Features */}
//         <View className="px-6 pb-8">
//           <View className="flex-row justify-between">
//             <View className="flex-1 items-center mr-2">
//               <LinearGradient
//                 colors={["#06B6D4", "#3B82F6"]}
//                 style={{ borderRadius: 12, padding: 12, marginBottom: 8 }}
//               >
//                 <Ionicons name="flash" size={20} color="white" />
//               </LinearGradient>
//               <Text className="text-white text-xs font-medium text-center">
//                 Real-time
//               </Text>
//             </View>

//             <View className="flex-1 items-center mx-2">
//               <LinearGradient
//                 colors={["#10B981", "#059669"]}
//                 style={{ borderRadius: 12, padding: 12, marginBottom: 8 }}
//               >
//                 <Ionicons name="shield-checkmark" size={20} color="white" />
//               </LinearGradient>
//               <Text className="text-white text-xs font-medium text-center">
//                 Secure
//               </Text>
//             </View>

//             <View className="flex-1 items-center ml-2">
//               <LinearGradient
//                 colors={["#8B5CF6", "#7C3AED"]}
//                 style={{ borderRadius: 12, padding: 12, marginBottom: 8 }}
//               >
//                 <Ionicons name="heart" size={20} color="white" />
//               </LinearGradient>
//               <Text className="text-white text-xs font-medium text-center">
//                 Health Focus
//               </Text>
//             </View>
//           </View>
//         </View>
//       </Animated.View>
//     </LinearGradient>
//   );
// };

// export default ReportsScreen;

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useWeb3 } from "../../contexts/Web3Context";

const ReportsScreen = () => {
  const router = useRouter();
  const [userReportsWeb2, setUserReportsWeb2] = useState([]);
  const [userReportsWeb3, setUserReportsWeb3] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("web2");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isOffline, setIsOffline] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const { contractInstance, connectWallet } = useWeb3();

  // Cache keys for Web2 reports only
  const CACHE_KEYS = {
    WEB2_REPORTS: "cached_web2_reports",
    LAST_SYNC_WEB2: "last_sync_web2_time",
    USER_TOKEN: "cached_user_token",
  };

  // Cache expiry time (6 hours for medical data)
  const CACHE_EXPIRY_TIME = 6 * 60 * 60 * 1000;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Setup network listener
    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasOffline = isOffline;
      setIsOffline(!state.isConnected);

      // If coming back online after being offline, fetch fresh data
      if (state.isConnected && wasOffline) {
        console.log("Back online - refreshing data");
        fetchReports(true);
      }
    });

    // Initial data load
    initializeReports();

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize reports with offline-first approach
  const initializeReports = async () => {
    try {
      // First load cached Web2 data immediately
      await loadCachedWeb2Reports();

      // Check network status
      const networkState = await NetInfo.fetch();
      setIsOffline(!networkState.isConnected);

      if (networkState.isConnected) {
        // Check if cache needs refresh
        const shouldRefresh = await shouldRefreshWeb2Cache();
        if (shouldRefresh) {
          console.log("Cache expired or empty - fetching fresh data");
          await fetchReports();
        } else {
          console.log("Using cached data - still fresh");
          setLoading(false);
        }

        // Always fetch Web3 data online (no offline support)
        await fetchWeb3Reports();
      } else {
        console.log("Offline - using cached Web2 data only");
        setLoading(false);
        // Clear Web3 data when offline
        setUserReportsWeb3([]);
      }
    } catch (error) {
      console.error("Error initializing reports:", error);
      setLoading(false);
    }
  };

  // Check if Web2 cache should be refreshed
  const shouldRefreshWeb2Cache = async () => {
    try {
      const lastSync = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC_WEB2);
      if (!lastSync) return true;

      const lastSyncTime = parseInt(lastSync);
      const currentTime = Date.now();

      return currentTime - lastSyncTime > CACHE_EXPIRY_TIME;
    } catch (error) {
      console.error("Error checking cache freshness:", error);
      return true;
    }
  };

  // Load cached Web2 reports
  const loadCachedWeb2Reports = async () => {
    try {
      const [cachedWeb2, lastSync] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEYS.WEB2_REPORTS),
        AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC_WEB2),
      ]);

      if (cachedWeb2) {
        const parsedReports = JSON.parse(cachedWeb2);
        setUserReportsWeb2(parsedReports);
        console.log(`Loaded ${parsedReports.length} cached Web2 reports`);
      }

      if (lastSync) {
        setLastSyncTime(new Date(parseInt(lastSync)));
      }
    } catch (error) {
      console.error("Error loading cached Web2 reports:", error);
    }
  };

  // Cache Web2 reports data
  const cacheWeb2Reports = async (web2Reports) => {
    try {
      const currentTime = Date.now().toString();

      await Promise.all([
        AsyncStorage.setItem(
          CACHE_KEYS.WEB2_REPORTS,
          JSON.stringify(web2Reports)
        ),
        AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC_WEB2, currentTime),
      ]);

      setLastSyncTime(new Date(parseInt(currentTime)));
      console.log(`Cached ${web2Reports.length} Web2 reports`);
    } catch (error) {
      console.error("Error caching Web2 reports:", error);
    }
  };

  // Fetch Web3 reports (online only - no caching)
  const fetchWeb3Reports = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/user/reports",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        const web3BackendReports = data.web3Reports || [];

        if (contractInstance && data.userId) {
          try {
            const reportsOnChain = await contractInstance.getReports(
              data.userId,
              0
            );
            const parsedOnChain = reportsOnChain.map((r) => ({
              ipfsHash: r.ipfsHash,
              reportId: r.reportId,
              timestamp: Number(r.timestamp),
              files: r.files || [],
              fileCount: Number(r.fileCount),
              hasMultipleFiles: r.hasMultipleFiles,
            }));

            const mergedReports = parsedOnChain.map((onChain) => {
              const match = web3BackendReports.find(
                (r) => r._id === onChain.reportId
              );
              return { ...onChain, ...match, isWeb3: true };
            });

            setUserReportsWeb3(mergedReports);
          } catch (contractError) {
            console.log("Contract error:", contractError);
            setUserReportsWeb3(
              web3BackendReports.map((r) => ({ ...r, isWeb3: true }))
            );
          }
        } else {
          if (!contractInstance) {
            connectWallet();
          }
          setUserReportsWeb3(
            web3BackendReports.map((r) => ({ ...r, isWeb3: true }))
          );
        }
      }
    } catch (error) {
      console.error("Error fetching Web3 reports:", error);
    }
  };

  // Main fetch function
  const fetchReports = async (forceRefresh = false) => {
    if (!refreshing && !forceRefresh) setLoading(true);

    try {
      // Check network connectivity first
      const networkState = await NetInfo.fetch();
      const currentlyOffline = !networkState.isConnected;

      if (currentlyOffline) {
        console.log("No network - showing cached data");
        if (!refreshing && !forceRefresh) setLoading(false);
        setRefreshing(false);

        if (forceRefresh) {
          Alert.alert(
            "No Internet Connection",
            "Cannot refresh data while offline. Showing cached reports.",
            [{ text: "OK" }]
          );
        }
        return;
      }

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No authentication token found");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log("Fetching fresh data from server...");

      // Fetch data from server
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/user/reports",
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
      const data = await response.json();

      if (data.success) {
        const web2Reports = data.web2Reports || [];
        setUserReportsWeb2(web2Reports);

        // Cache Web2 reports for offline use
        await cacheWeb2Reports(web2Reports);

        // Handle Web3 reports (online only)
        const web3BackendReports = data.web3Reports || [];

        if (contractInstance && data.userId) {
          try {
            const reportsOnChain = await contractInstance.getReports(
              data.userId,
              0
            );
            const parsedOnChain = reportsOnChain.map((r) => ({
              ipfsHash: r.ipfsHash,
              reportId: r.reportId,
              timestamp: Number(r.timestamp),
              files: r.files || [],
              fileCount: Number(r.fileCount),
              hasMultipleFiles: r.hasMultipleFiles,
            }));

            const mergedReports = parsedOnChain.map((onChain) => {
              const match = web3BackendReports.find(
                (r) => r._id === onChain.reportId
              );
              return { ...onChain, ...match, isWeb3: true };
            });

            setUserReportsWeb3(mergedReports);
          } catch (contractError) {
            console.log("Contract not ready:", contractError);
            setUserReportsWeb3(
              web3BackendReports.map((r) => ({ ...r, isWeb3: true }))
            );
          }
        } else {
          if (!contractInstance) {
            connectWallet();
          }
          setUserReportsWeb3(
            web3BackendReports.map((r) => ({ ...r, isWeb3: true }))
          );
        }

        console.log(
          `Fetched ${web2Reports.length} Web2 and ${userReportsWeb3.length} Web3 reports`
        );
      } else {
        throw new Error(data.message || "Failed to fetch reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);

      if (error.name === "AbortError") {
        Alert.alert("Timeout", "Request timed out. Showing cached data.");
      } else {
        const networkState = await NetInfo.fetch();
        if (!networkState.isConnected) {
          Alert.alert(
            "Connection Lost",
            "Internet connection lost. Showing cached data."
          );
        } else {
          Alert.alert(
            "Error",
            "Failed to fetch latest data. Showing cached reports."
          );
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports(true);
  };

  // Clear cache function
  const clearOfflineCache = async () => {
    Alert.alert(
      "Clear Offline Cache",
      "This will remove all cached medical reports. You'll need internet to view reports until they're cached again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Cache",
          style: "destructive",
          onPress: async () => {
            try {
              await Promise.all([
                AsyncStorage.removeItem(CACHE_KEYS.WEB2_REPORTS),
                AsyncStorage.removeItem(CACHE_KEYS.LAST_SYNC_WEB2),
              ]);

              setUserReportsWeb2([]);
              setLastSyncTime(null);

              Alert.alert(
                "Cache Cleared",
                "Offline cache has been cleared successfully."
              );
            } catch (error) {
              console.error("Error clearing cache:", error);
              Alert.alert("Error", "Failed to clear cache.");
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getReportTypeIcon = (reportType) => {
    switch (reportType?.toLowerCase()) {
      case "blood test":
        return "water-outline";
      case "x-ray":
        return "radio-outline";
      case "mri":
        return "scan-outline";
      case "prescription":
        return "medical-outline";
      default:
        return "document-text-outline";
    }
  };

  const ReportCard = ({ report, isWeb3 = false }) => {
    const cardColors = isWeb3
      ? ["#8B5CF6", "#06B6D4", "#10B981"]
      : ["#3B82F6", "#8B5CF6", "#EC4899"];

    const isOfflineReport = isOffline && !isWeb3;

    return (
      <TouchableOpacity activeOpacity={0.8} className="mb-6">
        <LinearGradient
          colors={cardColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            padding: 1,
          }}
        >
          <View
            className="bg-white p-6 relative overflow-hidden"
            style={{ borderRadius: 19 }}
          >
            {/* Offline indicator for Web2 reports */}
            {isOfflineReport && (
              <View className="absolute top-3 right-3 z-10">
                <View className="bg-orange-500 px-2 py-1 rounded-full flex-row items-center">
                  <Ionicons name="download-outline" size={12} color="white" />
                  <Text className="text-white text-xs font-bold ml-1">
                    CACHED
                  </Text>
                </View>
              </View>
            )}

            {/* Background Pattern */}
            <View
              className="absolute -top-10 -right-10 w-20 h-20 rounded-full opacity-10"
              style={{ backgroundColor: cardColors[0] }}
            />
            <View
              className="absolute -bottom-5 -left-5 w-16 h-16 rounded-full opacity-5"
              style={{ backgroundColor: cardColors[1] }}
            />

            {/* Header */}
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 pr-4">
                <Text className="text-xl font-bold text-gray-800 mb-1">
                  {report.reportType || report.type || "Medical Report"}
                </Text>
                <Text className="text-sm text-gray-500">
                  {report.hospitalName ||
                    report.hospital ||
                    "Healthcare Provider"}
                </Text>
              </View>
              <View className="flex-row items-center">
                <LinearGradient
                  colors={
                    isWeb3 ? ["#8B5CF6", "#06B6D4"] : ["#3B82F6", "#8B5CF6"]
                  }
                  style={{
                    borderRadius: 12,
                    padding: 8,
                    marginRight: 8,
                  }}
                >
                  <Ionicons
                    name={getReportTypeIcon(report.reportType || report.type)}
                    size={20}
                    color="white"
                  />
                </LinearGradient>
                {isWeb3 && (
                  <View
                    className="px-2 py-1"
                    style={{
                      backgroundColor: "#10B981",
                      borderRadius: 8,
                    }}
                  >
                    <Ionicons name="shield-checkmark" size={12} color="white" />
                  </View>
                )}
              </View>
            </View>

            {/* Report Details */}
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-2">
                  {formatDate(
                    report.timestamp || report.createdAt || Date.now() / 1000
                  )}
                </Text>
              </View>

              {report.doctorName && (
                <View className="flex-row items-center">
                  <Ionicons name="person-outline" size={16} color="#6B7280" />
                  <Text className="text-gray-600 ml-2">
                    {report.doctorName}
                  </Text>
                </View>
              )}

              {report.fileCount && Number(report.fileCount) > 0 && (
                <View className="flex-row items-center">
                  <MaterialIcons name="attach-file" size={16} color="#6B7280" />
                  <Text className="text-gray-600 ml-2">
                    {report.fileCount} file
                    {Number(report.fileCount) > 1 ? "s" : ""}
                  </Text>
                </View>
              )}

              {isWeb3 && report.ipfsHash && (
                <View className="flex-row items-center">
                  <Ionicons name="cloud-outline" size={16} color="#6B7280" />
                  <Text className="text-gray-600 ml-2 flex-1" numberOfLines={1}>
                    IPFS: {report.ipfsHash.substring(0, 20)}...
                  </Text>
                </View>
              )}
            </View>

            {/* Status Badge */}
            <View className="flex-row justify-between items-center mt-4">
              <View className="flex-row items-center">
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{
                    backgroundColor: isOfflineReport
                      ? "#F59E0B"
                      : isWeb3
                      ? "#10B981"
                      : "#3B82F6",
                  }}
                />
                <Text
                  className={`text-sm font-medium ${
                    isOfflineReport
                      ? "text-orange-600"
                      : isWeb3
                      ? "text-green-600"
                      : "text-blue-600"
                  }`}
                >
                  {isOfflineReport
                    ? "Offline Available"
                    : isWeb3
                    ? "Blockchain Secured"
                    : "Cloud Secured"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  router.push(`/(pages)/ReportInDetail/${report._id}`)
                }
                className="px-4 py-2"
                style={{
                  backgroundColor: "#F3F4F6",
                  borderRadius: 12,
                }}
              >
                <Text className="text-sm font-medium text-gray-700">
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const EmptyState = ({ isWeb3 }) => (
    <View className="items-center justify-center py-20">
      <LinearGradient
        colors={isWeb3 ? ["#8B5CF6", "#06B6D4"] : ["#3B82F6", "#8B5CF6"]}
        style={{
          borderRadius: 40,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <Ionicons
          name={isWeb3 ? "shield-outline" : "document-text-outline"}
          size={40}
          color="white"
        />
      </LinearGradient>

      <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
        No Reports Found
      </Text>

      {isWeb3 ? (
        <View className="px-8">
          <Text className="text-gray-500 text-center mb-4">
            Blockchain reports require internet connection to access smart
            contracts.
          </Text>
          {isOffline && (
            <View className="p-4 bg-orange-100 rounded-lg">
              <Text className="text-orange-600 text-sm text-center font-medium">
                🔗 Web3 reports not available offline
              </Text>
              <Text className="text-orange-500 text-xs text-center mt-1">
                Connect to internet to view blockchain-secured reports
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View className="px-8">
          <Text className="text-gray-500 text-center">
            Your medical reports will appear here once uploaded.
          </Text>
          {isOffline && (
            <View className="mt-4 p-4 bg-blue-100 rounded-lg">
              <Text className="text-blue-600 text-sm text-center font-medium">
                📱 Reports available offline once cached
              </Text>
              <Text className="text-blue-500 text-xs text-center mt-1">
                Connect to internet to sync latest reports
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <LinearGradient
        colors={["#1E293B", "#0F172A"]}
        className="flex-1 justify-center items-center"
      >
        <View className="items-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="text-white text-lg font-medium mt-4">
            {isOffline
              ? "Loading cached reports..."
              : "Loading your medical reports..."}
          </Text>
          <Text className="text-gray-400 text-sm mt-2">
            {isOffline
              ? "Offline mode - showing cached data"
              : "Fetching latest data from server"}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#1E293B", "#0F172A", "#1E293B"]}
      className="flex-1"
    >
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Header */}
        <View className="px-6 pt-16 pb-8">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white mb-2">
                Medical Reports
              </Text>
              <Text className="text-gray-300">
                Manage your health records securely
              </Text>
            </View>

            {/* Connection Status */}
            <View className="items-end">
              <View
                className={`px-3 py-1 rounded-full flex-row items-center ${
                  isOffline ? "bg-orange-500" : "bg-green-500"
                }`}
              >
                <Ionicons
                  name={
                    isOffline ? "cloud-offline-outline" : "cloud-done-outline"
                  }
                  size={12}
                  color="white"
                />
                <Text className="text-white text-xs font-bold ml-1">
                  {isOffline ? "OFFLINE" : "ONLINE"}
                </Text>
              </View>
              {lastSyncTime && (
                <Text className="text-gray-400 text-xs mt-1">
                  Last sync: {lastSyncTime.toLocaleTimeString()}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="px-6 mb-6">
          <View
            className="bg-white/10 p-1 flex-row"
            style={{ borderRadius: 16 }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab("web2")}
              className={`flex-1 py-4 px-6 flex-row items-center justify-center`}
              style={{
                borderRadius: 12,
                backgroundColor:
                  activeTab === "web2" ? "#3B82F6" : "transparent",
              }}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={activeTab === "web2" ? "white" : "#9CA3AF"}
              />
              <Text
                className={`ml-2 font-bold ${
                  activeTab === "web2" ? "text-white" : "text-gray-400"
                }`}
              >
                Traditional
              </Text>
              {!isOffline && (
                <View
                  className="ml-2 px-2 py-1"
                  style={{
                    borderRadius: 10,
                    backgroundColor:
                      activeTab === "web2"
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(59,130,246,0.2)",
                  }}
                >
                  <Text
                    className={`text-xs font-bold ${
                      activeTab === "web2" ? "text-white" : "text-blue-400"
                    }`}
                  >
                    {userReportsWeb2.length}
                  </Text>
                </View>
              )}
              {/* Offline available indicator for Web2 */}
              {isOffline && userReportsWeb2.length > 0 && (
                <Ionicons
                  name="download"
                  size={14}
                  color={activeTab === "web2" ? "white" : "#9CA3AF"}
                  className="ml-1"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("web3")}
              className="flex-1 py-4 px-6 flex-row items-center justify-center"
              style={{
                borderRadius: 12,
                backgroundColor:
                  activeTab === "web3" ? "#8B5CF6" : "transparent",
                opacity: isOffline ? 0.6 : 1,
              }}
              disabled={isOffline}
            >
              <Ionicons
                name="shield-outline"
                size={20}
                color={activeTab === "web3" ? "white" : "#9CA3AF"}
              />
              <Text
                className={`ml-2 font-bold ${
                  activeTab === "web3" ? "text-white" : "text-gray-400"
                }`}
              >
                Blockchain
              </Text>
              {!isOffline && (
                <View
                  className="ml-2 px-2 py-1"
                  style={{
                    borderRadius: 10,
                    backgroundColor:
                      activeTab === "web3"
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(139,92,246,0.2)",
                  }}
                >
                  <Text
                    className={`text-xs font-bold ${
                      activeTab === "web3" ? "text-white" : "text-purple-400"
                    }`}
                  >
                    {userReportsWeb3.length}
                  </Text>
                </View>
              )}
              {/* Online only indicator for Web3 */}
              {isOffline && (
                <Ionicons
                  name="wifi-outline"
                  size={14}
                  color="#9CA3AF"
                  className="ml-1"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Reports List */}
        <ScrollView
          className="flex-1 px-6"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
              colors={["#8B5CF6"]}
              title={isOffline ? "Connect to sync" : "Pull to refresh"}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Offline Status Banner */}
          {isOffline && (
            <View className="mb-6 p-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">
                  Offline Mode Active
                </Text>
              </View>
              <Text className="text-orange-100 text-sm leading-5">
                • Web2 reports: Available from cache{"\n"}• Web3 reports:
                Require internet connection{"\n"}• Connect to internet to sync
                latest data
              </Text>
            </View>
          )}

          {/* Web3 Offline Warning */}
          {isOffline && activeTab === "web3" && (
            <View className="mb-6 p-4 bg-purple-500 rounded-xl">
              <View className="flex-row items-center mb-2">
                <Ionicons name="shield-outline" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">
                  Blockchain Reports Unavailable
                </Text>
              </View>
              <Text className="text-purple-100 text-sm">
                Web3 reports require internet connection to access smart
                contracts and IPFS data.
              </Text>
            </View>
          )}

          {activeTab === "web2" ? (
            userReportsWeb2.length === 0 ? (
              <EmptyState isWeb3={false} />
            ) : (
              <View>
                {userReportsWeb2.map((report, index) => (
                  <ReportCard
                    key={`web2-${index}-${report._id}`}
                    report={report}
                    isWeb3={false}
                  />
                ))}
              </View>
            )
          ) : isOffline ? (
            <EmptyState isWeb3={true} />
          ) : userReportsWeb3.length === 0 ? (
            <EmptyState isWeb3={true} />
          ) : (
            <View>
              {userReportsWeb3.map((report, index) => (
                <ReportCard
                  key={`web3-${index}-${report._id}`}
                  report={report}
                  isWeb3={true}
                />
              ))}
            </View>
          )}

          {/* Cache Management Button */}
          {!isOffline && userReportsWeb2.length > 0 && activeTab === "web2" && (
            <View className="mt-6 mb-4">
              <TouchableOpacity
                onPress={clearOfflineCache}
                className="bg-gray-800 p-4 rounded-xl border border-gray-600"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text className="text-red-400 font-medium ml-2">
                    Clear Offline Cache
                  </Text>
                </View>
                <Text className="text-gray-400 text-xs text-center mt-1">
                  Remove cached reports to free up storage
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom spacing */}
          <View className="h-20" />
        </ScrollView>

        {/* Bottom Features */}
        <View className="px-6 pb-8">
          <View className="flex-row justify-between">
            <View className="flex-1 items-center mr-2">
              <LinearGradient
                colors={
                  isOffline ? ["#F59E0B", "#D97706"] : ["#06B6D4", "#3B82F6"]
                }
                style={{ borderRadius: 12, padding: 12, marginBottom: 8 }}
              >
                <Ionicons
                  name={isOffline ? "download-outline" : "flash"}
                  size={20}
                  color="white"
                />
              </LinearGradient>
              <Text className="text-white text-xs font-medium text-center">
                {isOffline ? "Cached" : "Real-time"}
              </Text>
            </View>

            <View className="flex-1 items-center mx-2">
              <LinearGradient
                colors={["#10B981", "#059669"]}
                style={{ borderRadius: 12, padding: 12, marginBottom: 8 }}
              >
                <Ionicons name="shield-checkmark" size={20} color="white" />
              </LinearGradient>
              <Text className="text-white text-xs font-medium text-center">
                Secure
              </Text>
            </View>

            <View className="flex-1 items-center ml-2">
              <LinearGradient
                colors={["#8B5CF6", "#7C3AED"]}
                style={{ borderRadius: 12, padding: 12, marginBottom: 8 }}
              >
                <Ionicons name="heart" size={20} color="white" />
              </LinearGradient>
              <Text className="text-white text-xs font-medium text-center">
                Health Focus
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

export default ReportsScreen;
