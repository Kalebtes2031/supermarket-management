import React, { useEffect } from "react";
import { StyleSheet, Platform } from "react-native";
import { Tabs, useRouter, Slot, useSegments } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider"; // Ensure this is your context provider

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import AntDesign from "@expo/vector-icons/AntDesign";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isLogged } = useGlobalContext();
  const router = useRouter();
  const segments = useSegments();

  const hideTabs = segments[0] === "(auth)";

  // Redirect to the sign-in page if not logged in
  useEffect(() => {
    if (!isLogged) {
      router.replace("/(auth)/sign-in");
    }
  }, [isLogged]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="shop" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cartscreen"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => (
            <AntDesign name="shoppingcart" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="trackorder"
        options={{
          title: "Track Order",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="work-history" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          title: "Category",
          tabBarItemStyle: { display: "none" },
          gestureEnabled: false,
        }}
      />
      <Tabs.Screen
        name="categorydetail"
        options={{
          title: "Category Detail",
          tabBarItemStyle: { display: "none" },
          gestureEnabled: false,
        }}
      />
    </Tabs>
  );
}
