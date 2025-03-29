import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "@/components/CustomButton";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useEffect, useState } from "react";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import Ionicons from "@expo/vector-icons/Ionicons";

const splashImage = require("@/assets/images/splash.png"); // Your full-screen splash image

const slides = [
  { image: require("@/assets/images/Frame.png") },
  { image: require("@/assets/images/Frame2.png") },
  { image: require("@/assets/images/Frame3.png") },
];

const slideTexts = [
  { text1: "Welcome to Yason", text2: "Store Delivery Application" },
  { text1: "We provide", text2: "Consumption products" },
  { text1: "Delivery on your", text2: "Door step" },
];

const Welcome = () => {
  const colorScheme = useColorScheme();
  const { loading, isLogged } = useGlobalContext();

  // State for onboarding status; null indicates still loading.
  const [showOnboarding, setShowOnboarding] = useState(null);
  // State for showing the initial splash screen.
  const [showSplash, setShowSplash] = useState(true);
  // For the slider
  const [currentSlide, setCurrentSlide] = useState(0);

  // Check if onboarding has been completed
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem("@onboardingCompleted");
        console.log("Retrieved onboarding status: ", value);
        setShowOnboarding(value !== "true"); // If "true", onboarding is complete.
      } catch (e) {
        setShowOnboarding(true);
      }
    };
    checkOnboarding();
  }, []);

  // Auto-dismiss splash after 5 seconds if not tapped
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && isLogged) {
      router.push("/(tabs)/home");
    }
  }, [loading, isLogged]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("@onboardingCompleted", "true");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const handleCreateAccount = async () => {
    await completeOnboarding();
    router.push("/sign-up");
  };

  const handleSignIn = async () => {
    await completeOnboarding();
    router.push("/(auth)/sign-in");
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  // While checking onboarding status, show nothing (or a loader)
  if (showOnboarding === null) return null;
  // If user is logged in, redirect to home.
  if (!loading && isLogged) return <Redirect href="/(tabs)/home" />;
  // If onboarding is complete, redirect to sign-in.
  if (!showOnboarding) return <Redirect href="/(auth)/sign-in" />;

  // If the splash should be shown, render it full screen.
  if (showSplash) {
    return (
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={() => setShowSplash(false)}
      >
        <Image
          source={splashImage}
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            resizeMode: "cover",
          }}
        />
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </TouchableOpacity>
    );
  }

  // Render the onboarding slider if splash is dismissed.
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "black" : "white",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        {/* Back Button */}
        {currentSlide > 0 && (
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              left: 20,
              zIndex: 10,
              padding: 10,
            }}
            onPress={handleBack}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color={colorScheme === "dark" ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        )}

        {/* Onboarding Content */}
        <TouchableOpacity
          style={{ flex: 1, width: "100%" }}
          activeOpacity={0.9}
          onPress={handleNext}
        >
          <Image
            source={slides[currentSlide].image}
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "contain",
              paddingHorizontal: 10,
            }}
          />
        </TouchableOpacity>

        {/* Slide Texts */}
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text style={{ fontSize: 32, fontWeight: "bold" }}>
            {slideTexts[currentSlide].text1}
          </Text>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 32 }}>
            {slideTexts[currentSlide].text2}
          </Text>
        </View>

        {/* Indicators */}
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 24 }}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={{
                width: 24,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  currentSlide === index
                    ? colorScheme === "dark"
                      ? "#fff"
                      : "#12B76A"
                    : "#ccc",
                transitionDuration: "300ms",
              }}
            />
          ))}
        </View>

        {/* Bottom Buttons */}
        {currentSlide === slides.length - 1 ? (
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <CustomButton
              title="CREATE AN ACCOUNT"
              handlePress={handleCreateAccount}
              containerStyles="w-80 mb-4"
              textStyles="text-2xl"
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSignIn}
              style={{
                backgroundColor: "white",
                borderWidth: 2,
                borderColor: "#445399",
                height: 62,
                borderRadius: 32,
                width: 354,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#445399",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                SIGN IN
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CustomButton
            title="NEXT"
            handlePress={handleNext}
            containerStyles="w-80 mb-12"
            textStyles="text-lg"
          />
        )}

        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Welcome;
