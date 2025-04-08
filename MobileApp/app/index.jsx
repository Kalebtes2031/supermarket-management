import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router";
import { View, Text, Image, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import { Ionicons } from "@expo/vector-icons"; // Named import
import { useEffect, useRef, useState } from "react";
import CustomButton from "@/components/CustomButton";
import { useGlobalContext } from "@/context/GlobalProvider";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const Welcome = () => {
  const colorScheme = useColorScheme();
  const { t } = useTranslation("welcome");
  const { loading, isLogged } = useGlobalContext();
  const [showOnboarding, setShowOnboarding] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef(null);

  const slides = [
    {
      id: 1,
      image: require("@/assets/images/Frame.png"),
      title: t("onboarding.slide1.title"),
      subtitle: t("onboarding.slide1.subtitle"),
    },
    {
      id: 2,
      image: require("@/assets/images/Frame2.png"),
      title: t("onboarding.slide2.title"),
      subtitle: t("onboarding.slide2.subtitle"),
    },
    {
      id: 3,
      image: require("@/assets/images/Frame3.png"),
      title: t("onboarding.slide3.title"),
      subtitle: t("onboarding.slide3.subtitle"),
    },
  ];

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await SecureStore.getItemAsync("onboardingCompleted");
        setShowOnboarding(value !== "true");
      } catch (e) {
        setShowOnboarding(true);
      }
    };

    checkOnboarding();
    preloadImages();
  }, []);

  useEffect(() => {
    if (!loading && isLogged) {
      router.replace("/(tabs)/home");
      // router.replace("/(tabs)/orderdelivery");
    }
  }, [loading, isLogged]);

  const preloadImages = async () => {
    slides.forEach(async (slide) => {
      await Image.prefetch(slide.image);
    });
  };

  const completeOnboarding = async () => {
    try {
      await SecureStore.setItemAsync("onboardingCompleted", "true");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("errors.generic"),
      });
    }
  };

  const handleSignIn = async () => {
    await completeOnboarding();
    router.replace("/(auth)/sign-in");
  };

  const handleCreateAccount = async () => {
    await completeOnboarding();
    router.replace("/(auth)/sign-up");
  };

  const handleSkip = () => {
    flatListRef.current.scrollToIndex({ index: slides.length - 1 });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentSlide(viewableItems[0].index);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  if (showOnboarding === null) return null;
  if (!loading && isLogged) return <Redirect href="/(tabs)/home" />;
  // if (!loading && isLogged) return <Redirect href="/(tabs)/orderdelivery" />;
  if (!showOnboarding) return <Redirect href="/(auth)/sign-in" />;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
      }}
    >
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
          }}
        >
          {currentSlide > 0 && (
            <TouchableOpacity onPress={() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToIndex({ index: currentSlide - 1 });
              }
            }}>
              <Ionicons
                name="arrow-back"
                size={28}
                color={colorScheme === "dark" ? "#fff" : "#000"}
                accessibilityLabel={t("accessibility.back")}
              />
            </TouchableOpacity>
          )}
          {currentSlide < slides.length - 1 && (
            <TouchableOpacity onPress={handleSkip}>
              <Text style={{ color: "#445399", fontSize: 16 }}>
                {t("onboarding.skip")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Carousel using FlatList */}
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfigRef.current}
          renderItem={({ item }) => (
            <View
              style={{
                width: SCREEN_WIDTH * 0.9,
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <Image
                source={item.image}
                style={{
                  width: SCREEN_WIDTH * 0.8,
                  height: 300,
                  resizeMode: "contain",
                }}
                accessibilityLabel={item.title}
              />
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: colorScheme === "dark" ? "#fff" : "#000",
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "600",
                  color: colorScheme === "dark" ? "#ccc" : "#666",
                  textAlign: "center",
                  marginBottom: 30,
                }}
              >
                {item.subtitle}
              </Text>
            </View>
          )}
        />

        {/* Indicators */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 24 }}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={{
                width: currentSlide === index ? 24 : 8,
                height: 8,
                backgroundColor:
                  currentSlide === index
                    ? colorScheme === "dark"
                      ? "#fff"
                      : "#12B76A"
                    : "#ccc",
                borderRadius: 4,
                marginHorizontal: 4,
              }}
            />
          ))}
        </View>

        {/* Footer */}
        <View style={{ marginBottom: 32 }}>
          {currentSlide === slides.length - 1 ? (
            <>
              <CustomButton
                title={t("onboarding.createAccount")}
                handlePress={handleCreateAccount}
                containerStyles="w-full mb-4"
                textStyles="text-2xl"
              />
              <TouchableOpacity
                onPress={handleSignIn}
                style={{
                  backgroundColor: "transparent",
                  borderWidth: 2,
                  borderColor: "#445399",
                  borderRadius: 32,
                  paddingVertical: 16,
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
                  {t("onboarding.signIn")}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <CustomButton
              title={t("onboarding.next")}
              handlePress={() => {
                if (flatListRef.current) {
                  flatListRef.current.scrollToIndex({ index: currentSlide + 1 });
                }
              }}
              containerStyles="w-full"
              textStyles="text-xl"
            />
          )}
        </View>
      </View>

      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Toast />
    </SafeAreaView>
  );
};

export default Welcome;
