import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, TouchableOpacity } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message"; // Import Toast component
import Header from "@/components/Header"; // Import the Header component
import SearchComp from "@/components/SearchComp";
import ErrorBoundary from "@/components/ErrorBoundary";
import GlobalProvider from "@/context/GlobalProvider";
import { CartProvider } from "@/context/CartProvider";
import { View } from "react-native";
import { Text } from "react-native";
import { FA5Style } from "@expo/vector-icons/build/FontAwesome5";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaView
          style={[
            styles.safeArea,
            { backgroundColor: colorScheme === "dark" ? "#000" : "#fff" },
          ]}
        >
          {/* <Header /> */}
          <ErrorBoundary>
            <GlobalProvider>
              <CartProvider>
                <Stack>
                  <Stack.Screen
                    name="(auth)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="index" options={{ headerShown: false }} />

                  <Stack.Screen
                    name="carddetail"
                    options={{
                      headerShown: false,
                      // header: ({ navigation }) => (
                      //   <View
                      //     style={{
                      //       height: 60,
                      //       backgroundColor: "#fff",
                      //       flexDirection: "row",
                      //       alignItems: "center",
                      //       paddingHorizontal: 10,
                      //     }}
                      //   >
                      //     <TouchableOpacity
                      //       onPress={() => navigation.goBack()}
                      //       style={{ marginRight: 10, paddingHorizontal: 12 }}
                      //     >
                      //       <Ionicons
                      //         name="arrow-back"
                      //         size={24}
                      //         color="gray"
                      //       />
                      //     </TouchableOpacity>
                      //     <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      //       Product Detail
                      //     </Text>
                      //   </View>
                      // ),
                    }}
                  />
                  <Stack.Screen
                    name="cartscreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="checkout"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="directpayment"
                    options={{
                      headerShown: false,
                    }}
                  />

                  <Stack.Screen name="+not-found" />
                </Stack>
                <Toast />
              </CartProvider>
            </GlobalProvider>
          </ErrorBoundary>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
