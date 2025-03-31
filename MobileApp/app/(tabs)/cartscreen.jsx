import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCart } from "@/context/CartProvider";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const CartScreen = () => {
  const { cart, loadCartData, updateItemQuantity, removeItemFromCart } =
    useCart();
  const [localLoading, setLocalLoading] = useState(null);
  const router = useRouter();

  const handleQuantityUpdate = async (itemId, newQuantity) => {
    if (newQuantity <= 0) return;

    try {
      setLocalLoading(itemId);
      await updateItemQuantity(itemId, newQuantity);
      await loadCartData();
      Toast.show({
        type: "success",
        text1: "Cart updated",
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: "Please try again",
      });
    } finally {
      setLocalLoading(null);
    }
  };

  if (!cart || !cart.items) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="remove-shopping-cart" size={60} color="#ccc" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header />
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="gray" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </View>

        <View style={styles.scrollContainers}>
          {cart.items.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <Image
                source={{ uri: item.product?.image }}
                style={styles.productImage}
                resizeMode="contain"
              />

              <View style={styles.detailsContainer}>
                <Text style={styles.productName}>
                  {item.product?.item_name}
                </Text>
                <Text style={styles.price}>
                  Br{parseFloat(item.product?.price || "0").toFixed(2)}
                </Text>

                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      handleQuantityUpdate(item.id, item.quantity - 1)
                    }
                    disabled={localLoading === item.id || item.quantity === 1}
                  >
                    {localLoading === item.id ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <MaterialIcons
                        name="remove-circle-outline"
                        size={28}
                        color={item.quantity === 1 ? "#ccc" : "#000"}
                      />
                    )}
                  </TouchableOpacity>

                  <Text style={styles.quantity}>{item.quantity}</Text>

                  <TouchableOpacity
                    onPress={() =>
                      handleQuantityUpdate(item.id, item.quantity + 1)
                    }
                    disabled={localLoading === item.id}
                  >
                    {localLoading === item.id ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <MaterialIcons
                        name="add-circle-outline"
                        size={28}
                        color="#000"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.actionContainer}>
                <Text style={styles.itemTotal}>
                  Br{(item.total_price || 0).toFixed(2)}
                </Text>
                <TouchableOpacity
                  onPress={() => removeItemFromCart(item.id)}
                  disabled={localLoading === item.id}
                >
                  <MaterialCommunityIcons
                    name="delete-outline"
                    size={24}
                    color="#ff4444"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.totalContainers}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalAmount}>
            Br{(cart.total || 0).toFixed(2)}
          </Text>
        </View>
        <View style={styles.proceedCheckout}>
          <TouchableOpacity
            onPress={() => router.push("/checkout")}
            style={{
              backgroundColor: "#7E0201",
              padding: 10,
              borderRadius: 35,
              marginTop: 10,
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              PROCEED TO CHECKOUT
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

// Add these new styles to your StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
  },
  headerContainer: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // emptyContainer: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  // emptyText: {
  //   fontSize: 18,
  //   color: "#666",
  //   marginTop: 10,
  // },
  // headerContainer: {
  //   height: 60,
  //   backgroundColor: "#fff",
  //   flexDirection: "row",
  //   alignItems: "center",
  //   paddingHorizontal: 10,
  // },
  backButton: {
    marginRight: 10,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  // ... keep the rest of your existing styles
  scrollContainers: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "500",
    minWidth: 24,
    textAlign: "center",
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  actionContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginLeft: 12,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    padding: 4,
  },
  totalContainers: {
    flexDirection: "column",
    justifyContent: "center",
    // alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    width: '100%'
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    paddingHorizontal: 16,
    // backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2ecc71",
  },
  proceedCheckout: {
    paddingHorizontal: 12,
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
  },
});

export default CartScreen;
