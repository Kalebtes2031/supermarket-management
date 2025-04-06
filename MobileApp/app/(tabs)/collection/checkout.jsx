import Header from "@/components/Header";
import { useCart } from "@/context/CartProvider";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { createOrder, USER_PROFILE } from "@/hooks/useFetch";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useTranslation } from "react-i18next";

const CheckoutPage = () => {
  const { t, i18n } = useTranslation("checkout");
  const { cart, loadCartData } = useCart();
  const { user } = useGlobalContext();
  const route = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [advanceAmount, setAdvanceAmount] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [amountToPay, setAmountToPay] = useState(null);
  const [selectedRadio, setSelectedRadio] = useState(false);
  const [selectedOption, setSelectedOption] = useState("directbanktransfer"); // Tracks the selected option
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const choiceofpayment = () => {
    handleBankPayment();
  };
  const handleBankPayment = (paymentData) => {
    // const paymentData = {
    //   orderId,
    //   amountToPay,
    //   paymentStatus,
    //   // phone,
    //   // firstName,
    //   // lastName,
    //   // email,
    //   // ...other data,
    // };
    console.log("is the problem here, need for investigation:", paymentData);
    // Pass the paymentData as a query parameter
    route.push(
      `./directpayment?paymentData=${encodeURIComponent(
        JSON.stringify(paymentData)
      )}`
    );
  };

  const fetchCustomerProfile = async () => {
    try {
      // const profile = await USER_PROFILE();
      // console.log("Customer Profile:", profile);

      setPhone(user.phone_number || "");
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
    } catch (error) {
      console.error("Error fetching customer profile:", error);
    }
  };
  useEffect(() => {
    fetchCustomerProfile();
  }, []);

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
    const orderinfo = {
      phone_number: phone,
      first_name: firstName,
      last_name: lastName,
      email: email,
    };

    try {
      const response = await createOrder(orderinfo);
      console.log("test one two three: ", response);

      await loadCartData();
      // Toast.show({
      //   type: "success",
      //   text1: "Order successful!",
      //   // visibilityTime: 2000,
      // });

      const { id, total, payment_status } = response;

      setOrderId(id);
      setTotalAmount(total);
      setPaymentStatus(payment_status);
      setAmountToPay(total);
      // console.log("this is before modal opened:", total);
      // Show modal
      // setShowModal(true);
      if (selectedOption === "directbanktransfer") {
        handleBankPayment({
          orderId: id,
          amountToPay: total,
          paymentStatus: payment_status,
        });
      } else {
        let orderId=id
        route.push(
          `/(tabs)/collection/schedule?orderId=${encodeURIComponent(
            JSON.stringify(orderId)
          )}`
        );
        // handleBankPayment({
        //   orderId: id,
        //   amountToPay: total,
        //   paymentStatus: payment_status,
        // });
      }
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
      {/* <Header /> */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => route.back()}
          style={{ marginHorizontal: 10, paddingHorizontal: 2 }}
          className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
        >
          <Ionicons name="arrow-back" size={24} color="#445399" />
        </TouchableOpacity>
        <View style={styles.iconWrapper}>
          <TouchableOpacity>
            <MaterialIcons name="favorite-border" size={28} color="#445399" />
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>0</Text>
          </View>
        </View>
      </View>
      <Text
        className="font-poppins-bold text-center text-primary mb-4"
        style={styles.headerTitle}
      >
        {t("check")}
      </Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order Summary Section */}
        <View style={styles.sectiona}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t("phone")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t("first")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t("last")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t("email")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>
        <Text
          className="font-poppins-bold text-center text-primary mb-4"
          style={styles.headerTitle}
        >
          {t("your")}
        </Text>
        <View style={styles.section}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginHorizontal: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#445399",
            }}
          >
            <Text style={styles.sectionTitle}>{t("product")}</Text>
            <Text style={styles.sectionTitle}>{t("price")}</Text>
          </View>

          {cart.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "start",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Text style={styles.productName}>
                    {i18n.language === "en"
                      ? item.item_name
                      : item.item_name_amh}
                  </Text>
                  <Text style={styles.quantity1}>
                    {parseInt(item.variations.quantity)}
                    {item.variations.unit}
                  </Text>
                </View>
                <Text style={styles.quantity}>{t('qty')}: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                {t('br')}{item.total_price.toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.totalContainer}>
            {/* <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Items:</Text>
              <Text style={styles.totalValue}>{cart.total_items}</Text>
            </View> */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('total')}:</Text>
              <Text style={styles.grandTotal}>{t('br')}{cart.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method Section */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 14,
          }}
        >
          {/* <View style={styles.paymentMethod}>
            <View style={styles.radioButton}>
              <View style={styles.radioSelected} />
            </View>
            <Text style={styles.paymentMethodText}>Direct Bank Transfer</Text>
          </View> */}
          {/* <View style={styles.paymentMethod}>
            <View style={styles.radioButton}>
              <View style={styles.radionotSelected} />
            </View>
            <Text style={styles.paymentMethodText}>Cash on Delivery</Text>
          </View> */}
          <TouchableOpacity
            style={styles.radioLabel}
            onPress={() => {
              // setAmountToPay(advanceAmount);
              setSelectedOption("directbanktransfer");
            }}
          >
            <View
              style={
                selectedOption === "directbanktransfer" && styles.radioButtons
              }
            >
              <View
                style={[
                  styles.radioButton,
                  selectedOption === "directbanktransfer" &&
                    styles.radioSelected,
                ]}
              />
            </View>
            <Text style={styles.radioText}>{t('direct')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioLabel}
            onPress={() => {
              // setAmountToPay(advanceAmount);
              setSelectedOption("cashondelivery");
            }}
          >
            <View
              style={selectedOption === "cashondelivery" && styles.radioButtons}
            >
              <View
                style={[
                  styles.radioButton,
                  selectedOption === "cashondelivery" && styles.radioSelected,
                ]}
              />
            </View>
            <Text style={styles.radioText}>{t('cash')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
          // onPress={()=>route.push("./directpayment")}
          //   disabled={isLoading}
        >
          <Text style={i18n.language === "en"?styles.placeOrderText:styles.placeOrderText1}>
            {/* {isLoading ? "Pay Now" : "Pay Now"} */}
            {selectedOption === "cashondelivery"? t('schedule'): t('pay')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            
            <Text style={styles.modalTitle}>Payment Option</Text>

           
            <View style={styles.radioContainer}>
             
              <TouchableOpacity
                style={styles.radioLabel}
                onPress={() => {
                  setAmountToPay(advanceAmount);
                  setSelectedOption("advance");
                }}
              >
                <View
                  style={selectedOption === "advance" && styles.radioButtons}
                >
                  <View
                    style={[
                      styles.radioButton,
                      selectedOption === "advance" && styles.radioSelected,
                    ]}
                  />
                </View>
                <Text style={styles.radioText}>
                  Pay Advance Br {advanceAmount}
                </Text>
              </TouchableOpacity>

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
                  />
                </View>
                <Text style={styles.radioText}>Pay Total Br {totalAmount}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.selectedText}>
              selected :
              <Text style={styles.selectedAmount}>
                br
                {amountToPay || totalAmount}
              </Text>
            </Text>

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
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: "#eee",
  },
  iconWrapper: {
    position: "relative",
    marginRight: 16,
  },

  badge: {
    position: "absolute",
    top: -8,
    right: -8,
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
  backButton: {
    marginRight: 10,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: 26,
    paddingVertical: 6,
    paddingBottom: 100,
  },
  sectiona: {
    backgroundColor: "rgba(150, 166, 234, 0.4)",
    borderRadius: 32,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#445399",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 3,
    // elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    marginBottom: 4,
    color: "#445399",
  },
  input: {
    height: 40,
    // borderWidth: 1,
    // borderColor: "#445399",
    borderRadius: 38,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    paddingLeft: 15,
    // placeholderTextColor: "#445399",
  },
  section: {
    backgroundColor: "rgba(150, 166, 234, 0.4)",
    borderRadius: 32,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
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
  quantity1: {
    fontSize: 14,
    color: "#666",
    paddingBottom: 2,
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
    color: "#445399",
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 8,
    marginRight: 12,
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
    backgroundColor: "#445399",
  },
  paymentMethodText: {
    fontSize: 11,
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
    backgroundColor: "#445399",
    borderRadius: 38,
    padding: 16,
    alignItems: "center",
  },
  placeOrderText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  placeOrderText1: {
    color: "white",
    fontSize: 12,
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
