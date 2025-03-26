import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router";
import { View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// import { images } from "@constants";
import CustomButton from "@/components/CustomButton";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useEffect } from "react";
import { useColorScheme } from "@/hooks/useColorScheme.web";

const Welcome = () => {
  const colorScheme = useColorScheme();
  const { loading, isLogged } = useGlobalContext();
  // useEffect(() => {
  //   if (!loading && isLogged) {
  //     router.push("/home");
  //   }
  // }, [loading, isLogged, router]);
  if (!loading && isLogged) return <Redirect href="/home" />;
  return (
    <SafeAreaView
      style={{ 
        flex: 1, 
        backgroundColor: colorScheme === "dark" ? "black" : "white" 
      }}
      className="bg-primary h-full"
    >
      <ScrollView
        contentContainerStyle={{
          height: "100%",
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 40,
          }}
          // className="w-full flex gap-y-12 justify-center items-center h-full px-4"
        >
          <Image
            source={colorScheme==="dark" ? require("@/assets/images/malhibfooterlogo.png") :require("@/assets/images/malhiblogo.png")}
            style={{ width: 150, height: 90, marginBottom: 50 }}
            resizeMode="contain"
          />

          <Image
            source={require("@/assets/images/trackdelivery5.jpg")}
            style={{ width: 680, height: 298 }}
            className="w-full h-[298px]"
            resizeMode="contain"
          />

          <View className="relative mt-5" style={{ marginBottom: 32 }}>
            <Text
              className="text-3xl font-bold text-center"
              style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}
            >
              Tracking Deliveries {"\n"}
              in Real-time with{" "}
              <Text className="text-secondary-200">Yason</Text>
            </Text>

            <Image
              source={require("@/assets/images/path.png")}
              className="w-[136px] h-[15px] absolute -bottom-2 -right-8"
              resizeMode="contain"
            />
          </View>

          {/* <Text className="text-sm font-pregular text-gray-100 mt-7 text-center">
            Where Creativity Meets Innovation: Embark on a Journey of Limitless
            Exploration with Kabth
          </Text> */}
          <CustomButton
            title="Continue with Email"
            handlePress={() => router.push("/sign-in")}
            containerStyles="w-full mt-7 text-white"
            textStyles={`text-white`}
          />
        </View>
      </ScrollView>

      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
};

export default Welcome;
