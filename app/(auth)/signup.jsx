// app/(auth)/signup.jsx
import { useRouter } from "expo-router";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Signup() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white px-4">
      <Text className="text-2xl font-bold mb-6">Sign Up</Text>

      <TextInput
        className="border w-full p-3 mb-4 rounded"
        placeholder="Name"
      />
      <TextInput
        className="border w-full p-3 mb-4 rounded"
        placeholder="Email"
      />
      <TextInput
        className="border w-full p-3 mb-6 rounded"
        placeholder="Password"
        secureTextEntry
      />

      <Button title="Sign Up" onPress={() => router.replace("/(tabs)/")} />

      <TouchableOpacity
        className="mt-4"
        onPress={() => router.push("/(auth)/login")}
      >
        <Text className="text-blue-600">Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}
