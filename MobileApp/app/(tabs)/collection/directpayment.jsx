import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as Clipboard from "expo-clipboard";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { payUsingBankTransfer } from "@/hooks/useFetch"; // Import your API function
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

const DirectBankTransfer = () => {
  const { t, i18n } = useTranslation("directpayment");
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const route = useRoute();
  const rawPaymentData = params.paymentData;
  let parsedPaymentData = {};

  if (typeof rawPaymentData === "string") {
    try {
      parsedPaymentData = JSON.parse(rawPaymentData);
    } catch (e) {
      console.error("Error parsing paymentData:", e);
    }
  } else {
    parsedPaymentData = rawPaymentData || {};
  }

  const {
    orderId,
    amountToPay,
    paymentStatus,
    // phone,
    // firstName,
    // lastName,
    // email,
  } = parsedPaymentData;

  useEffect(() => {
    console.log("we are on investigation", parsedPaymentData);
  }, [parsedPaymentData]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [bankPaymentForm, setBankPaymentForm] = useState({
    bank: "",
    receipt: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const banks = [
    {
      bank: require("@/assets/images/abyssinia.png"), // Update with actual image paths
      bankName: t("abyssinia"),
      name: t("name"),
      number: "23680661",
    },
    {
      bank: require("@/assets/images/cbenew.png"),
      bankName: t("cbe"),
      name: t("name"),
      number: "1000152439427",
    },
    {
      bank: require("@/assets/images/coop.png"),
      bankName: t("coop"),
      name: t("name"),
      number: "1000043541939",
    },
    {
      bank: require("@/assets/images/telebirrnew.png"),
      bankName: t("tele"),
      name: t("name"),
      number: "+251912860746",
    },
  ];

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
      });

      // Handle new DocumentPicker response structure
      if (!result.canceled && result.assets.length > 0) {
        const file = result.assets[0];

        // Validate file size
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert("Error", "File size exceeds 5MB limit");
          return;
        }

        // Handle Android content URIs
        let processedUri = file.uri;
        if (Platform.OS === "android" && file.uri.startsWith("content://")) {
          const fileInfo = await FileSystem.getInfoAsync(file.uri);
          processedUri = fileInfo.uri;
        }

        setBankPaymentForm({
          ...bankPaymentForm,
          receipt: {
            uri: processedUri,
            name: file.name || "receipt.jpg",
            type: file.mimeType || "application/octet-stream",
            size: file.size,
          },
        });
      }
    } catch (err) {
      console.error("Error picking file:", err);
      Alert.alert("Error", "Failed to select file");
    }
  };

  const copyToClipboard = async (text, index, bankName) => {
    await Clipboard.setStringAsync(text);
    setCopiedIndex(index);
    setBankPaymentForm({ ...bankPaymentForm, bank: bankName });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSubmit = async () => {
    // if (isSubmitting) return;
    // setIsSubmitting(true);
    if (!bankPaymentForm.receipt) {
      Alert.alert("Error", "Please upload a receipt");
      return;
    }
    console.log("FormData contents:", {
      orderId: orderId,
      amountToPay: amountToPay,
      paymentStatus: paymentStatus,
      bankName: bankPaymentForm.bank,
      receipt: bankPaymentForm.receipt,
    });

    // Validate required payment data
    if (!orderId || !amountToPay || !paymentStatus) {
      Alert.alert("Error", formData);
      return;
    }

    // Create FormData according to backend expectations
    const formData = new FormData();
    formData.append("orderId", orderId.toString());
    formData.append("amountToPay", amountToPay.toString());
    formData.append("paymentStatus", paymentStatus);
    formData.append("bankName", bankPaymentForm.bank);
    formData.append("receipt", {
      uri: bankPaymentForm.receipt.uri,
      name: bankPaymentForm.receipt.name,
      type: bankPaymentForm.receipt.type,
    });

    try {
      const response = await payUsingBankTransfer(formData);
      // if (response.status === 200) {
      //   Alert.alert("Success", "Payment successful!");
      //   router.push("/(tabs)/home");
      // } else {
      //   Alert.alert("Error", "Payment failed, please try again.");
      // }
    } catch (error) {
      console.error("Error updating payment status:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSchedule = () => {
    if (!bankPaymentForm.bank) {
      Alert.alert("Error", "Please Select a Bank");
      return;
    }
    if (!bankPaymentForm.receipt) {
      Alert.alert("Error", "Please upload a receipt");
      return;
    }
    handleSubmit();
    // router.push("./schedule");
    router.push(
      `./schedule?orderId=${encodeURIComponent(JSON.stringify(orderId))}`
    );
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginHorizontal: 10, paddingHorizontal: 2 }}
            className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
          >
            <Ionicons name="arrow-back" size={24} color="#445399" />
          </TouchableOpacity>
        </View>
        <Text
          className="font-poppins-bold text-center text-primary mb-4"
          style={styles.headerTitle}
        >
          {t("bank")}
        </Text>
        <View style={styles.sectiona}>
          <Text style={styles.sectionTitle}>{t("yason")}</Text>
          {banks.map((account, index) => (
            <View key={index} style={styles.bankCard}>
              <Image source={account.bank} style={styles.bankLogo} />
              <View style={styles.bankDetails}>
                <Text style={styles.accountName}>{account.name}</Text>
                <View style={styles.accountNumberContainer}>
                  <Text style={styles.accountNumber}>{account.number}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      copyToClipboard(account.number, index, account.bankName)
                    }
                    style={styles.copyButton}
                  >
                    {copiedIndex === index ? (
                      <Feather name="check-circle" size={20} color="green" />
                    ) : (
                      <Feather name="copy" size={20} color="gray" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.formContainer}>
            <Text style={styles.label}>{t("select")}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={bankPaymentForm.bank}
                onValueChange={(value) =>
                  setBankPaymentForm({ ...bankPaymentForm, bank: value })
                }
                style={styles.picker}
              >
                <Picker.Item label={t("selecta")} value="" />
                {banks.map((bank, index) => (
                  <Picker.Item
                    key={index}
                    label={bank.bankName}
                    value={bank.bankName}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>{t("upload")}</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleFilePick}
            >
              <MaterialIcons name="upload-file" size={24} color="gray" />
              <Text style={styles.uploadText}>
                {bankPaymentForm.receipt
                  ? bankPaymentForm.receipt.name
                  : t("tap")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* <Text style={styles.sectionTitle}>{t("shipment")}</Text> */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            marginVertical: 20,
          }}
        >
          <TouchableOpacity
            style={[
              i18n.language === "en"
                ? styles.submitButton
                : styles.submitButton1,
              // isSubmitting && styles.disabledButton
            ]}
            onPress={() => {
              handleSchedule();
            }}
            // onPress={handleSubmit}
            // disabled={isSubmitting}
          >
            <Text
              style={
                i18n.language === "en"
                  ? styles.submitButtonText
                  : styles.submitButtonText1
              }
            >
              {/* {isSubmitting ? "Processing..." : "Submit Payment"} */}
              {t("schedule")}
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={() =>
              navigation.push(
                `/(tabs)/orderinfo?orderId=${encodeURIComponent(
                  JSON.stringify(orderId)
                )}`
              )
            }
            style={[
              i18n.language === "en"
                ? styles.submitButton2
                : styles.submitButton3,
              //  isSubmitting && styles.disabledButton
            ]}
            // onPress={() => {()=>router.push("/(tabs)/home")}}
            // onPress={handleSubmit}
            // disabled={isSubmitting}
          >
            <Text
              style={
                i18n.language === "en"
                  ? styles.submitButtonText
                  : styles.submitButtonText1
              }
            >
              {/* {isSubmitting ? "Processing..." : "Submit Payment"} */}
              {/* {t("pick")} */}
            {/* </Text> */}
          {/* </TouchableOpacity> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DirectBankTransfer;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#7E0201",
  },
  instructions: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 8,
  },
  stepsContainer: {
    marginLeft: 16,
    marginBottom: 16,
  },
  stepText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sectiona: {
    backgroundColor: "rgba(150, 166, 234, 0.4)",
    borderRadius: 32,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#445399",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    color: "#445399",
    marginVertical: 15,
  },
  bankCard: {
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 12,
  },
  bankLogo: {
    width: 180,
    height: 40,
    objectFit: "contain",
  },
  bankDetails: {
    marginLeft: 12,
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  accountNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accountNumber: {
    fontSize: 16,
    fontFamily: Platform.OS === "android" ? "monospace" : "Courier",
    color: "#4B5563",
  },
  copyButton: {
    marginLeft: 12,
    padding: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
  },
  formContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  picker: {
    height: 53,
    width: "100%",
    color: "#000",
  },
  uploadButton: {
    backgroundColor: "#E5E7EB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: "#445399",
    padding: 16,
    borderRadius: 38,
    alignItems: "center",
    width:"100%"
  },
  submitButton1: {
    backgroundColor: "#445399",
    padding: 16,
    borderRadius: 38,
    alignItems: "center",
    width:"100%"
  },
  submitButton2: {
    backgroundColor: "#55B051",
    padding: 16,
    borderRadius: 38,
    alignItems: "center",
  },
  submitButton3: {
    backgroundColor: "#55B051",
    padding: 10,
    borderRadius: 38,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  submitButtonText1: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
});
