import Header from "@/components/Header";
import { useCart } from "@/context/CartProvider";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { createOrder } from "@/hooks/useFetch";

const CheckoutPage = () => {
  const { cart, loadCartData } = useCart();
  const route = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [advanceAmount, setAdvanceAmount] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [amountToPay, setAmountToPay] = useState(null);
  const [selectedRadio, setSelectedRadio] = useState(false);
  const [selectedOption, setSelectedOption] = useState("total"); // Tracks the selected option

  const choiceofpayment = () => {
    handleBankPayment();
  };
  const handleBankPayment = () => {
    const paymentData = {
      orderId,
      amountToPay,
      paymentStatus,
      // ...other data,
    };
    // Pass the paymentData as a query parameter
    route.push(
      `/directpayment?paymentData=${encodeURIComponent(
        JSON.stringify(paymentData)
      )}`
    );
  };

  const handlePlaceOrder = async () => {
    // setShowModal(true);
    if (cart.total < 1 || cart.items.length < 1) {
      Toast.show({
        type: "error",
        text1:
          "Your cart is empty. Please add items to your cart before placing an order.",
        visibilityTime: 2000,
      });
      return;
    }

    setIsLoading(true); // Show loading spinner

    try {
      const response = await createOrder();
      console.log("test one two three: ", response);

      await loadCartData();
      Toast.show({
        type: "success",
        text1: "Order successful!",
        // visibilityTime: 2000,
      });

      const { id, total, advance_payment, payment_status } = response;

      setOrderId(id);
      setTotalAmount(total);
      console.log("this is the first advance payemnt", advance_payment);

      setAdvanceAmount(advance_payment);
      let advancePayment = parseFloat(advance_payment); // Ensure it's a number
      console.log("This is the advance payment:", advancePayment);

      if (advancePayment === 0) {
        // Check as a number
        const newAdvance = (total * 0.3).toFixed(2); // Calculate 30% of total
        setAdvanceAmount(newAdvance); // Update advance payment
        console.log("Advance payment updated to:", newAdvance);
      } else {
        setAdvanceAmount(advancePayment); // Use the existing value if not 0
        console.log("Advance payment remains the same:", advancePayment);
      }

      console.log("this is the updated advance payemnt", advance_payment);

      setPaymentStatus(payment_status);
      setAmountToPay(total);
      console.log("this is before modal opened:", total);
      // Show modal
      setShowModal(true);
    } catch (error) {
      console.error("Error creating order", error);
      if (error.response?.status === 401) {
        Toast.show({
          type: "error",
          text1: "Please you have to login first",
          // visibilityTime: 2000,
        });
        route.push("/(auth)/sign-in");
      }
      Toast.show({
        type: "error",
        text1: "An error occurred while creating the order. Please try again.",
        // visibilityTime: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => route.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="gray" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          {cart.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.productName}>{item.product.item_name}</Text>
                <Text style={styles.quantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                Br{item.total_price.toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Items:</Text>
              <Text style={styles.totalValue}>{cart.total_items}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Price:</Text>
              <Text style={styles.grandTotal}>Br{cart.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethod}>
            <View style={styles.radioButton}>
              <View style={styles.radioSelected} />
            </View>
            <Text style={styles.paymentMethodText}>Direct Bank Transfer</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
          //   disabled={isLoading}
        >
          <Text style={styles.placeOrderText}>
            {isLoading ? "Placing Order" : "Place Order"}
          </Text>
        </TouchableOpacity>
      </View>
      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            {/* Modal Title */}
            <Text style={styles.modalTitle}>Payment Option</Text>

            {/* Radio Options */}
            <View style={styles.radioContainer}>
              {/* Pay Advance Amount */}
              <TouchableOpacity
                style={styles.radioLabel}
                onPress={() => {
                  setAmountToPay(advanceAmount);
                  setSelectedOption("advance");
                }}
              >
              <View style={selectedOption === "advance" && styles.radioButtons}>
                <View
                  style={[
                    styles.radioButton,
                    selectedOption === "advance" && styles.radioSelected,
                  ]}
                /></View>
                <Text style={styles.radioText}>
                  Pay Advance Br {advanceAmount}
                </Text>
              </TouchableOpacity>

              {/* Pay Total Amount */}
              <TouchableOpacity
                style={styles.radioLabel}
                onPress={() => {
                  setAmountToPay(totalAmount);
                  setSelectedOption("total");
                }}
              >
               <View style={selectedOption === "total" && styles.radioButtons}>
                <View
                  style={[
                    styles.radioButton,
                    selectedOption === "total" && styles.radioSelected,
                  ]}
                /></View>
                <Text style={styles.radioText}>Pay Total Br {totalAmount}</Text>
              </TouchableOpacity>
            </View>

            {/* Selected Amount */}
            <Text style={styles.selectedText}>
              selected :
              <Text style={styles.selectedAmount}>
                br
                {amountToPay || totalAmount}
              </Text>
            </Text>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={choiceofpayment}
                style={styles.proceedButton}
              >
                <Text style={styles.proceedButtonText}>Proceed To pay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  backButton: {
    marginRight: 10,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    color: "#444",
    marginBottom: 4,
  },
  quantity: {
    fontSize: 14,
    color: "#666",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  totalContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
  },
  totalValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  grandTotal: {
    fontSize: 18,
    color: "#7E0201",
    fontWeight: "700",
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  radioButtons: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "gray",
    display:"flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft:8, 
    marginRight:12
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "gray",
    justifyContent: "center",
    alignItems: "center",
  },
  // radioSelected: {
  //   backgroundColor: "green", // Conditional green color
  //   borderColor: "green",
  // },
  radioLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  radioText: {
    marginLeft: 10,
    fontSize: 16,
  },
  radioSelected: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#7E0201",
  },
  paymentMethodText: {
    fontSize: 16,
    color: "#333",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  placeOrderButton: {
    backgroundColor: "#7E0201",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  placeOrderText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  //starts here
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)", // bg-black bg-opacity-50
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff", // bg-white
    paddingHorizontal: 24, // px-6 ~ 24px
    paddingVertical: 16, // py-4 ~ 16px (use 24px for larger screens if needed)
    borderRadius: 8, // rounded-lg
    width: 330, // md:w-[500px] - adjust or use maxWidth
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 8, // roughly top-2 (8px)
    right: 8, // roughly right-2 (8px)
  },
  closeButtonText: {
    fontSize: 20, // text-xl
    fontWeight: "600", // font-semibold
    color: "#4B5563", // text-gray-600
  },
  modalTitle: {
    textAlign: "center", // text-center
    fontSize: 14, // text-[14px] (adjust for larger screens if needed)
    fontWeight: "600", // font-semibold
    marginBottom: 16, // mb-4 ~ 16px
  },
  radioContainer: {
    flexDirection: "column", // flex flex-col
    marginBottom: 16, // mb-4
  },
  radioLabel: {
    flexDirection: "row", // flex row
    alignItems: "center", // items-center
    marginBottom: 8, // mb-2
  },
  radioButton: {
    width: 20, // can adjust size as needed
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8, // mr-2
    justifyContent: "center",
    alignItems: "center",
  },
  radioText: {
    fontSize: 12, // text-[12px]
    color: "#4B5563", // text-gray-700
  },
  selectedText: {
    color: "#6B7280", // text-gray-500
    marginBottom: 16, // mb-4
    fontSize: 12, // text-[12px]
  },
  selectedAmount: {
    fontWeight: "bold", // font-bold
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end", // flex justify-end
  },
  proceedButton: {
    backgroundColor: "#A0522D", // bg-primary-lightbrown (replace with your specific color)
    paddingHorizontal: 16, // px-4 ~ 16px
    paddingVertical: 8, // py-2 ~ 8px
    borderRadius: 35, // rounded
    marginTop: 10,
  },
  proceedButtonText: {
    color: "#fff", // text-white
    textAlign: "center",
    fontSize: 12, // text-[12px]
  },
});

export default CheckoutPage;
