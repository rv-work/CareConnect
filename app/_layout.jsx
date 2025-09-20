import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../contexts/AuthContext";
import { Web3Provider } from "../contexts/Web3Context";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Web3Provider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <Toast />
        </AuthProvider>
      </Web3Provider>
    </SafeAreaProvider>
  );
}
