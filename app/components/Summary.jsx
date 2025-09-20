import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import {
  AlertTriangle,
  Check,
  Clock,
  Heart,
  Info,
  Languages,
  Pause,
  Pill,
  Play,
  Shield,
  Sparkles,
  Square,
  Star,
  Volume2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// eslint-disable-next-line no-unused-vars
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MedicationSummaryDisplay = ({ summaryResult }) => {
  const [speechState, setSpeechState] = useState({});
  const [globalSpeechState, setGlobalSpeechState] = useState("stopped");
  const [currentLanguage, setCurrentLanguage] = useState({});
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const handleSpeak = async (medication, index) => {
    try {
      await Speech.stop();

      const text = `
        Medicine: ${medication.medicineName}.
        Quantity: ${medication.quantity}.
        Reason: ${medication.whyGiven}.
        Uses: ${medication.uses}.
        Best Way To Take: ${medication.bestWayToTake}.
        Benefits: ${medication.benefits}.
        Side Effects: ${medication.sideEffects}.
        Precautions: ${medication.precautions}.
        ${
          medication.anyOtherInfo
            ? `Additional Info: ${medication.anyOtherInfo}.`
            : ""
        }
      `;

      setGlobalSpeechState("playing");
      setSpeechState((prev) => ({ ...prev, [index]: "playing" }));
      setCurrentLanguage((prev) => ({ ...prev, [index]: "english" }));

      await Speech.speak(text, {
        language: "en-IN",
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          setGlobalSpeechState("stopped");
          setSpeechState((prev) => ({ ...prev, [index]: "stopped" }));
        },
        onError: () => {
          setGlobalSpeechState("stopped");
          setSpeechState((prev) => ({ ...prev, [index]: "stopped" }));
        },
      });
    } catch (error) {
      Alert.alert("Error", "Speech synthesis failed");
      console.log("Error: ", error);
    }
  };

  const handleHindiSpeak = async (medication, index) => {
    try {
      await Speech.stop();

      const text = medication.hindiSummary || "हिंदी सारांश उपलब्ध नहीं है।";

      setGlobalSpeechState("playing");
      setSpeechState((prev) => ({ ...prev, [index]: "playing" }));
      setCurrentLanguage((prev) => ({ ...prev, [index]: "hindi" }));

      await Speech.speak(text, {
        language: "hi-IN",
        pitch: 1.0,
        rate: 0.8,
        onDone: () => {
          setGlobalSpeechState("stopped");
          setSpeechState((prev) => ({ ...prev, [index]: "stopped" }));
        },
        onError: () => {
          setGlobalSpeechState("stopped");
          setSpeechState((prev) => ({ ...prev, [index]: "stopped" }));
        },
      });
    } catch (error) {
      Alert.alert("Error", "Hindi speech synthesis failed");
      console.log("Error: ", error);
    }
  };

  const handlePause = async () => {
    try {
      await Speech.pause();
      setGlobalSpeechState("paused");
    } catch (error) {
      console.log("Pause error:", error);
    }
  };

  const handleResume = async () => {
    try {
      await Speech.resume();
      setGlobalSpeechState("playing");
    } catch (error) {
      console.log("Resume error:", error);
    }
  };

  const handleStop = async () => {
    try {
      await Speech.stop();
      setGlobalSpeechState("stopped");
      setSpeechState({});
      setCurrentLanguage({});
    } catch (error) {
      console.log("Stop error:", error);
    }
  };

  const toggleCardExpansion = (index) => {
    setExpandedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Sample data for demonstration
  const sampleData = [
    {
      medicineName: "Paracetamol 500mg",
      quantity: "20 tablets",
      whyGiven: "For fever and pain relief",
      uses: "Reduces fever and relieves mild to moderate pain",
      bestWayToTake: "Take 1-2 tablets with water after meals, every 4-6 hours",
      benefits: "Quick relief from fever and headache",
      sideEffects: "Rare: nausea, skin rash, liver damage with overdose",
      precautions: "Do not exceed 4g per day. Avoid alcohol",
      anyOtherInfo: "Store in cool, dry place",
      hindiSummary:
        "पैरासिटामोल 500 मिलीग्राम। बुखार और दर्द के लिए। खाने के बाद 1-2 गोली पानी के साथ लें। दिन में 4 गोली से अधिक न लें। शराब से बचें।",
    },
    {
      medicineName: "Amoxicillin 250mg",
      quantity: "14 capsules",
      whyGiven: "Antibiotic for bacterial infection",
      uses: "Treats bacterial infections of respiratory tract, skin, and urinary tract",
      bestWayToTake: "Take 1 capsule every 8 hours with water",
      benefits: "Effective against various bacterial infections",
      sideEffects: "Nausea, diarrhea, allergic reactions",
      precautions: "Complete the full course. Inform doctor about allergies",
      anyOtherInfo: "Take with food to reduce stomach upset",
      hindiSummary:
        "एमोक्सिसिलिन 250 मिलीग्राम। बैक्टीरियल संक्रमण के लिए एंटीबायोटिक। हर 8 घंटे में 1 कैप्सूल लें। पूरा कोर्स करें। खाने के साथ लें।",
    },
  ];

  const displayData = summaryResult || sampleData;

  // Card Component
  const Card = ({ children, style = {} }) => (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </View>
  );

  // Info Section Component
  const InfoSection = ({
    icon: Icon,
    title,
    content,
    iconColor = "#6B7280",
  }) => (
    <View style={{ marginBottom: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: `${iconColor}15`,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Icon size={16} color={iconColor} />
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#1F2937",
          }}
        >
          {title}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 15,
          color: "#4B5563",
          lineHeight: 22,
          paddingLeft: 44,
        }}
      >
        {content}
      </Text>
    </View>
  );

  // Speech Controls Component
  const SpeechControls = ({ medication, index }) => {
    const currentState = speechState[index] || "stopped";
    const currentLang = currentLanguage[index];
    const isActive = currentState === "playing";

    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {/* English Speech Button */}
        <TouchableOpacity
          onPress={() => handleSpeak(medication, index)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor:
              isActive && currentLang === "english"
                ? "#FEF3C7"
                : "rgba(255, 255, 255, 0.2)",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor:
              isActive && currentLang === "english"
                ? "#F59E0B"
                : "rgba(255, 255, 255, 0.3)",
          }}
        >
          <Volume2
            size={18}
            color={
              isActive && currentLang === "english" ? "#F59E0B" : "#FFFFFF"
            }
          />
        </TouchableOpacity>

        {/* Hindi Speech Button */}
        {medication.hindiSummary && (
          <TouchableOpacity
            onPress={() => handleHindiSpeak(medication, index)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor:
                isActive && currentLang === "hindi"
                  ? "#FEF3C7"
                  : "rgba(255, 255, 255, 0.2)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor:
                isActive && currentLang === "hindi"
                  ? "#F59E0B"
                  : "rgba(255, 255, 255, 0.3)",
            }}
          >
            <Languages
              size={18}
              color={
                isActive && currentLang === "hindi" ? "#F59E0B" : "#FFFFFF"
              }
            />
          </TouchableOpacity>
        )}

        {/* Stop Button */}
        {isActive && (
          <TouchableOpacity
            onPress={handleStop}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(239, 68, 68, 0.3)",
            }}
          >
            <Square size={16} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Header */}
        <View
          style={{
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <LinearGradient
            colors={["#A855F7", "#EC4899"]}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Sparkles size={28} color="#FFFFFF" />
          </LinearGradient>

          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: "#1F2937",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            AI Medication Analysis
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: "#6B7280",
              textAlign: "center",
              paddingHorizontal: 32,
              lineHeight: 24,
            }}
          >
            Comprehensive analysis of your prescribed medications
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#ECFDF5",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              marginTop: 16,
              borderWidth: 1,
              borderColor: "#BBF7D0",
            }}
          >
            <Check size={16} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={{ color: "#059669", fontWeight: "600", fontSize: 14 }}>
              {displayData.length} medications analyzed
            </Text>
          </View>

          {/* Audio Guide */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 12,
              gap: 24,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Volume2 size={14} color="#6B7280" style={{ marginRight: 6 }} />
              <Text
                style={{ color: "#6B7280", fontSize: 12, fontWeight: "500" }}
              >
                English Audio
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Languages size={14} color="#6B7280" style={{ marginRight: 6 }} />
              <Text
                style={{ color: "#6B7280", fontSize: 12, fontWeight: "500" }}
              >
                हिंदी ऑडियो
              </Text>
            </View>
          </View>
        </View>

        {/* Global Audio Controls */}
        {globalSpeechState !== "stopped" && (
          <Card style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 20,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor:
                      globalSpeechState === "playing" ? "#10B981" : "#F59E0B",
                    marginRight: 12,
                  }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#1F2937",
                  }}
                >
                  {globalSpeechState === "playing"
                    ? "Playing Audio"
                    : "Audio Paused"}
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 8 }}>
                {globalSpeechState === "playing" && (
                  <TouchableOpacity
                    onPress={handlePause}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#F59E0B",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                    }}
                  >
                    <Pause
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
                      Pause
                    </Text>
                  </TouchableOpacity>
                )}

                {globalSpeechState === "paused" && (
                  <TouchableOpacity
                    onPress={handleResume}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#10B981",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                    }}
                  >
                    <Play
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
                      Resume
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={handleStop}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#EF4444",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                  }}
                >
                  <Square
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
                    Stop
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}

        {/* Medications List */}
        <View style={{ gap: 16 }}>
          {displayData.map((medication, index) => {
            const isExpanded = expandedCards[index];
            const isCurrentlyPlaying = speechState[index] === "playing";
            const currentLang = currentLanguage[index];

            return (
              <Card
                key={index}
                style={{
                  borderWidth: isCurrentlyPlaying ? 2 : 0,
                  borderColor: isCurrentlyPlaying ? "#10B981" : "transparent",
                }}
              >
                {/* Header */}
                <LinearGradient
                  colors={
                    index % 2 === 0
                      ? ["#3B82F6", "#1E40AF"]
                      : ["#10B981", "#059669"]
                  }
                  style={{ padding: 20 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 16 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Pill
                          size={24}
                          color="#FFFFFF"
                          style={{ marginRight: 12 }}
                        />
                        <View
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                            borderRadius: 12,
                          }}
                        >
                          <Text
                            style={{
                              color: "#FFFFFF",
                              fontSize: 12,
                              fontWeight: "600",
                            }}
                          >
                            {medication.quantity}
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "700",
                          color: "#FFFFFF",
                          marginBottom: 4,
                        }}
                      >
                        {medication.medicineName}
                      </Text>

                      <Text
                        style={{
                          fontSize: 14,
                          color: "rgba(255, 255, 255, 0.9)",
                        }}
                      >
                        {medication.whyGiven}
                      </Text>
                    </View>

                    <SpeechControls medication={medication} index={index} />
                  </View>

                  {/* Playing Indicator */}
                  {isCurrentlyPlaying && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 8,
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", gap: 2, marginRight: 8 }}
                      >
                        {[0, 1, 2].map((i) => (
                          <View
                            key={i}
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: "rgba(255, 255, 255, 0.8)",
                            }}
                          />
                        ))}
                      </View>
                      <Text
                        style={{
                          color: "rgba(255, 255, 255, 0.9)",
                          fontSize: 12,
                          fontWeight: "500",
                        }}
                      >
                        Playing in{" "}
                        {currentLang === "hindi" ? "हिंदी" : "English"}
                      </Text>
                    </View>
                  )}
                </LinearGradient>

                {/* Content */}
                <View style={{ padding: 20 }}>
                  {/* Quick Info - Always Visible */}
                  <InfoSection
                    icon={Heart}
                    title="Uses"
                    content={medication.uses}
                    iconColor="#EF4444"
                  />

                  <InfoSection
                    icon={Clock}
                    title="How to Take"
                    content={medication.bestWayToTake}
                    iconColor="#3B82F6"
                  />

                  {/* Expandable Content */}
                  {isExpanded && (
                    <>
                      <InfoSection
                        icon={Star}
                        title="Benefits"
                        content={medication.benefits}
                        iconColor="#10B981"
                      />

                      <InfoSection
                        icon={AlertTriangle}
                        title="Side Effects"
                        content={medication.sideEffects}
                        iconColor="#F59E0B"
                      />

                      <InfoSection
                        icon={Shield}
                        title="Precautions"
                        content={medication.precautions}
                        iconColor="#EF4444"
                      />

                      {medication.anyOtherInfo && (
                        <InfoSection
                          icon={Info}
                          title="Additional Information"
                          content={medication.anyOtherInfo}
                          iconColor="#6366F1"
                        />
                      )}

                      {/* Hindi Summary */}
                      {medication.hindiSummary && (
                        <View
                          style={{
                            backgroundColor: "#FEF3C7",
                            padding: 16,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: "#FDE68A",
                            marginTop: 8,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <Languages
                              size={16}
                              color="#D97706"
                              style={{ marginRight: 8 }}
                            />
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "600",
                                color: "#92400E",
                              }}
                            >
                              हिंदी सारांश
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontSize: 15,
                              color: "#A16207",
                              lineHeight: 22,
                            }}
                          >
                            {medication.hindiSummary}
                          </Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* Expand/Collapse Button */}
                  <TouchableOpacity
                    onPress={() => toggleCardExpansion(index)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#F3F4F6",
                      paddingVertical: 12,
                      borderRadius: 8,
                      marginTop: 16,
                    }}
                  >
                    <Text
                      style={{
                        color: "#6B7280",
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {isExpanded ? "Show Less" : "Show More Details"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Disclaimer */}
        <Card style={{ marginTop: 24 }}>
          <View style={{ padding: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#DBEAFE",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <Info size={20} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#1E40AF",
                    marginBottom: 8,
                  }}
                >
                  Important Medical Disclaimer
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#1E40AF",
                    lineHeight: 20,
                    marginBottom: 12,
                  }}
                >
                  This AI-generated medication summary is for informational
                  purposes only. Always consult your healthcare provider before
                  making any changes to your medication regimen.
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#1E40AF",
                    lineHeight: 20,
                  }}
                >
                  यह AI द्वारा तैयार दवा सारांश केवल जानकारी के लिए है। कोई भी
                  दवा संबंधी बदलाव से पहले अपने डॉक्टर से सलाह अवश्य लें।
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

export default MedicationSummaryDisplay;
