import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Text,
  Modal,
  Animated,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedView } from "./ThemedView";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useRouter } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useCart } from "@/context/CartProvider";
import { LayoutAnimation, UIManager, Platform } from "react-native";



const Header = () => {
  const route = useRouter();
  const { cart, setCart, loadCartData, removeItemFromCart } = useCart();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const [isModalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current; // Fix here
  const { user, isLogged, logout } = useGlobalContext();
  // State for the shopping-cart modal
  const [cartModalVisible, setCartModalVisible] = useState(false);
  // Animated value for sliding in from the right; starting off-screen (e.g., 300px to the right)
  const cartSlideAnim = useRef(new Animated.Value(300)).current;

  // Function to toggle the modal
  const toggleModal = () => {
    if (!isModalVisible) {
      setModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true, // Enable native driver for better performance
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  };
 

  const handleLogout = () => {
    console.log("logout");
    console.log("user is : ", user);
    console.log("isLogged is : ", isLogged);
    logout();
    router.replace("/(auth)/sign-in");
  };
  useEffect(() => {
    console.log("cart is : ", cart);
  }, []);

 
// Modify your handleDeleteProduct function
const handleDeleteProduct = async (itemId) => {
  try {
    await removeItemFromCart(itemId);
  } catch (error) {
    console.error("Error deleting item:", error);
  }
};
  
  return (
    <SafeAreaView
      style={[
        styles.header,
        { backgroundColor: colorScheme === "dark" ? "#333" : "gray" },
      ]}
    >
      <ThemedView
        style={[
          styles.headerContainer,
          { backgroundColor: colorScheme === "dark" ? "#333" : "#fff" },
        ]}
      >
        {/* Menu and logo on the left */}
        <View style={styles.menulogo}>
          <Pressable onPress={toggleModal}>
            <Ionicons name="menu" size={34} color="#445399" />
          </Pressable>
          {/* <Image
            source={require("../assets/images/malhibfooterlogo.png")}
            style={styles.logo}
            resizeMode="contain"
          /> */}
        </View>

        {/* Icons on the right */}
        {/* Icons on the right */}
        <ThemedView
          style={[
            styles.iconContainer,
            { backgroundColor: colorScheme === "dark" ? "#333" : "#fff" },
          ]}
        >
          <MaterialIcons name="search" size={24} style={{ color: colorScheme === "dark" ? "#fff" : "#445399" }} />

          <View style={styles.iconWrapper}>
            <TouchableOpacity>
              <MaterialIcons name="favorite-border" size={24} color="#445399" />
            </TouchableOpacity>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>0</Text>
            </View>
          </View>

          <TouchableOpacity>
          <Ionicons name="person" size={24} color="#445399" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Slide-in menu Modal in left side */}
      <Modal transparent visible={isModalVisible} animationType="none">
        {/* Overlay for closing the modal */}
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleModal}
          activeOpacity={1}
        />
        {/* Animated Modal Content */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateX: slideAnim }],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
            },
          ]}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 10,
              height: 70,
              width: "100%",
            }}
          >
            <Image
              source={require("../assets/images/malhiblogo.png")}
              style={styles.logo}
              resizeMode="contain"
              className="bg-red-700"
            />
            <View>
              <Text className="font-bold">Welcome 👋 </Text>
              <Text className="font-bold uppercase">{user?.username}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.link}
            onPress={() => route.push("home")}
          >
            <Text style={styles.linkText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.link}
            onPress={() => route.push("shop")}
          >
            <Text style={styles.linkText}>Shop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.link}
            onPress={() => route.push("order")}
          >
            <Text style={styles.linkText}>Track Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.link}
            onPress={() => route.push("explore")}
          >
            <Text style={styles.linkText}>About Us</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.link}
            onPress={() => route.push("home")}
          >
            <Text style={styles.linkText}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link} onPress={handleLogout}>
            <Text style={styles.linkText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    height: 70,
    width: "100%",
    // position: "absolute",
    // top: 0,
    // zIndex: 1000,
  },
  logo: {
    width: 95,
    height: 40,
    marginLeft: 12,
    marginVertical: 10,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 100,
    marginRight: 10,
  },
  iconWrapper: {
    position: "relative",
  },

  badge: {
    position: "absolute",
    top: -8,
    right: -10,
    backgroundColor: "#445399",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    // zIndex: 10, // Ensures the badge is on top
  },

  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },

  menulogo: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Slightly dimmed background
  },
  modalContent: {
    width: 280,
    height: "100%",
    backgroundColor: "white",
    position: "absolute",
    left: 0,
    top: 0,
  },
  modalHeading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000", // Black text for heading
    padding: 20,
  },
  link: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd", // Divider between links
    paddingLeft: 20,
  },
  linkText: {
    fontSize: 18,
    color: "#000", // Black text for links
  },
  cartOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    // alignSelf: "flex-end",
  },
  cartModalContent: {
    width: 280,
    height: "100%",
    backgroundColor: "white",
    position: "absolute",
    right: 0,
    top: 0,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
});

export default Header;
