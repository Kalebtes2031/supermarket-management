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
  useEffect(() => {
    if (cartModalVisible) {
      loadCartData();
      // console.log("content of cart is : ", loadCartData);
    }
  }, [cartModalVisible, loadCartData]);

  // Function to toggle the cart modal
  const toggleCartModal = () => {
    if (!cartModalVisible) {
      setCartModalVisible(true);
      Animated.timing(cartSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(cartSlideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setCartModalVisible(false));
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
        { backgroundColor: colorScheme === "dark" ? "#333" : "#fff" },
      ]}
    >
      <ThemedView
        style={[
          styles.headerContainer,
          { backgroundColor: colorScheme === "dark" ? "#333" : "#7E0201" },
        ]}
      >
        {/* Menu and logo on the left */}
        <View style={styles.menulogo}>
          <Pressable onPress={toggleModal}>
            <Ionicons name="menu" size={24} color="white" />
          </Pressable>
          <Image
            source={require("../assets/images/malhibfooterlogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Icons on the right */}
        {/* Icons on the right */}
        <ThemedView
          style={[
            styles.iconContainer,
            { backgroundColor: colorScheme === "dark" ? "#333" : "#7E0201" },
          ]}
        >
          <View style={styles.iconWrapper}>
            <Pressable onPress={toggleCartModal}>
              <MaterialIcons name="shopping-cart" size={24} color="white" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cart.total_items}</Text>
            </View>
            </Pressable>
          </View>

          <View style={styles.iconWrapper}>
            <TouchableOpacity>
              <MaterialIcons name="favorite-border" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>0</Text>
            </View>
          </View>

          <TouchableOpacity>
            <Ionicons name="globe-outline" size={24} color="white" />
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
      {/* Slide-in cart Modal in right side */}
      <Modal transparent visible={cartModalVisible} animationType="none">
        {/* Overlay to close the cart modal */}
        <TouchableOpacity
          style={styles.cartOverlay}
          onPress={toggleCartModal}
          activeOpacity={1}
        />
        {/* Animated cart modal content sliding from the right */}
        <Animated.View
  style={[
    styles.cartModalContent,
    {
      transform: [{ translateX: cartSlideAnim }],
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
  ]}
>
  <View style={{ position: "relative", height: "100%" }}>
    {/* Header */}
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        height: 70,
        width: "100%",
      }}
    >
      <Text style={{ padding: 20, fontWeight: "600", fontSize: 12 }}>
        Shopping Cart
      </Text>
      <TouchableOpacity onPress={toggleCartModal}>
        <Ionicons name="close" size={24} color="black" />
      </TouchableOpacity>
    </View>

    {/* Scrollable Cart Items Container */}
    <View style={{ height: 500 /* fixed height, adjust as needed */ }}>
      <ScrollView>
        {cart.items && cart.items.length > 0 ? (
          cart.items.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#ddd",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={{
                    uri:
                      item.product?.image ||
                      "https://via.placeholder.com/60",
                  }}
                  style={styles.productImage}
                />
                <View>
                  <Text style={{ width: 135 }}>
                    {item.product.item_name}
                  </Text>
                  <Text>
                    {item.quantity} X {item.product.price}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDeleteProduct(item.id)}>
                <Ionicons name="trash" size={24} color="black" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View>
            <Text>No items in cart</Text>
          </View>
        )}
      </ScrollView>
    </View>

    {/* Bottom Part */}
    <View
      style={{
        position: "absolute",
        bottom: 0,
        padding: 20,
        width: "100%",
        marginBottom: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderTopWidth: 1,
          borderTopColor: "#ddd",
          borderBottomWidth: 1,
          borderBottomColor: "#ddd",
          paddingVertical: 10,
          paddingHorizontal: 5,
        }}
      >
        <Text style={{ fontWeight: "600" }}>Total</Text>
        <Text style={{ fontWeight: "600" }}>{cart.total || 0}</Text>
      </View>
      <TouchableOpacity
        onPress={() => route.push("/cartscreen")}
        style={{
          backgroundColor: "#7E0201",
          padding: 10,
          borderRadius: 35,
          marginTop: 10,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>VIEW CART</Text>
      </TouchableOpacity>
      <TouchableOpacity
      onPress={() => route.push("/checkout")}
        style={{
          backgroundColor: "#7E0201",
          padding: 10,
          borderRadius: 35,
          marginTop: 10,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>PROCEED TO CHECKOUT</Text>
      </TouchableOpacity>
    </View>
  </View>
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
    backgroundColor: "white",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    // zIndex: 10, // Ensures the badge is on top
  },

  badgeText: {
    color: "#7E0201",
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
