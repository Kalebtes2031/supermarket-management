import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import CustomButton from "@/components/CustomButton";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import { ThemedText } from "@/components/ThemedText";

const { width } = Dimensions.get("window");

const SignUp = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    username: "",
    email: "",
    password: "",
  });

  const colorScheme = useColorScheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 24,
        }}
      >
        {/* Hero Image */}
        <Image
          source={require("@/assets/images/signup.png")}
          resizeMode="cover"
          style={{
            width: "100%",
            height: 240,
          }}
        />

        {/* Form Container */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 12,
            backgroundColor: colorScheme === "dark" ? "#121212" : "#fff",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            marginTop: -28,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colorScheme === "dark" ? "#fff" : "#000",
              marginBottom: 16,
              fontFamily:"Poppins-Medium"
            }}
          >
            Create your account
          </Text>
          <ThemedText
            type="title"
            fontFamily="Poppins-Medium"
            style={{
              fontSize: 20, // Override default title size
              marginBottom: 10,
            }}
          >
            Custom Title
          </ThemedText>

          {/* Name Row */}
          <View
            style={{
              flexDirection: "row",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
                // backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFF",
                borderRadius: 12,
                // borderRadius: 24,
                // borderWidth: 2,
                // borderColor: colorScheme === "dark" ? "#1E1E1E" : "#445399",
                padding: 14,
                fontSize: 14,
                color: colorScheme === "dark" ? "#fff" : "#000",
                height: 48,
              }}
              placeholder="First name"
              placeholderTextColor="#888"
              value={form.firstName}
              onChangeText={(text) => setForm({ ...form, firstName: text })}
            />

            <TextInput
              style={{
                flex: 1,
                backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
                borderRadius: 12,
                padding: 14,
                fontSize: 14,
                color: colorScheme === "dark" ? "#fff" : "#000",
                height: 48,
              }}
              placeholder="Last name"
              placeholderTextColor="#888"
              value={form.lastName}
              onChangeText={(text) => setForm({ ...form, lastName: text })}
            />
          </View>

          {/* Phone Number */}
          <TextInput
            style={{
              backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
              borderRadius: 12,
              padding: 14,
              fontSize: 14,
              color: colorScheme === "dark" ? "#fff" : "#000",
              marginBottom: 20,
              height: 48,
            }}
            placeholder="Phone number"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            value={form.phoneNumber}
            onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
          />

          {/* Username */}
          <TextInput
            style={{
              backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
              borderRadius: 12,
              padding: 14,
              fontSize: 14,
              color: colorScheme === "dark" ? "#fff" : "#000",
              marginBottom: 20,
              height: 48,
            }}
            placeholder="Username"
            placeholderTextColor="#888"
            value={form.username}
            onChangeText={(text) => setForm({ ...form, username: text })}
          />

          {/* Email */}
          <TextInput
            style={{
              backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
              borderRadius: 12,
              padding: 14,
              fontSize: 14,
              color: colorScheme === "dark" ? "#fff" : "#000",
              marginBottom: 20,
              height: 48,
            }}
            placeholder="Email address"
            placeholderTextColor="#888"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />

          {/* Password */}
          <TextInput
            style={{
              backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
              borderRadius: 12,
              padding: 14,
              fontSize: 14,
              color: colorScheme === "dark" ? "#fff" : "#000",
              marginBottom: 16,
              height: 48,
            }}
            placeholder="Create password"
            placeholderTextColor="#888"
            secureTextEntry
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
          />

          {/* Terms Text */}
          <Text
            style={{
              fontSize: 12,
              color: colorScheme === "dark" ? "#888" : "#666",
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 16,
              paddingHorizontal: 24,
            }}
          >
            By tapping Sign up, you agree to our{" "}
            <Text
              style={{
                color: "#7E0201",
                textDecorationLine: "underline",
              }}
              onPress={() => router.push("/terms")}
            >
              Terms & Conditions
            </Text>
          </Text>

          {/* Sign Up Button */}
          <CustomButton
            title="Sign Up"
            containerStyles={{
              backgroundColor: "#7E0201",
              borderRadius: 12,
              height: 48,
              justifyContent: "center",
            }}
            textStyles={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "600",
            }}
            isLoading={isSubmitting}
          />

          {/* Login Link */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 24,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: colorScheme === "dark" ? "#888" : "#666",
              }}
            >
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/sign-in")}>
              <Text
                style={{
                  fontSize: 14,
                  color: "#7E0201",
                  fontWeight: "600",
                }}
              >
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
