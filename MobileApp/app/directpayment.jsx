import React, { useState } from "react";
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
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { payUsingBankTransfer } from "@/hooks/useFetch"; // Import your API function
import { useRouter } from "expo-router";

const DirectBankTransfer = () => {
    const router = useRouter()
  const navigation = useNavigation();
  const route = useRoute();
  const rawPaymentData = route.params?.paymentData;
  let parsedPaymentData = {};

  if (typeof rawPaymentData === "string") {
    try {
      parsedPaymentData = JSON.parse(rawPaymentData);
    } catch (e) {
      console.error("Error parsing paymentData:", e);
    }
  } else {
    parsedPaymentData = rawPaymentData;
  }

  const { orderId, amountToPay, paymentStatus } = parsedPaymentData;

  const [copiedIndex, setCopiedIndex] = useState(null);
  const [bankPaymentForm, setBankPaymentForm] = useState({
    bank: "",
    receipt: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const banks = [
    {
      bank: require("@/assets/images/abyssinia.png"), // Update with actual image paths
      bankName: "Bank of Abyssinia",
      name: "Abebe Demssie W/Mariam",
      number: "23680661",
    },
    {
      bank: require("@/assets/images/cbenew.png"),
      bankName: "Commercial Bank of Ethiopia",
      name: "Abebe Demssie W/Mariam",
      number: "1000152439427",
    },
    {
      bank: require("@/assets/images/coop.png"),
      bankName: "COOP Bank of Oromia",
      name: "Abebe Demssie W/Mariam",
      number: "1000043541939",
    },
    {
      bank: require("@/assets/images/telebirrnew.png"),
      bankName: "Telebirr",
      name: "Abebe Demssie W/Mariam",
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
      Alert.alert("Error", paymentData);
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
      if (response.status === 200) {
        Alert.alert("Success", "Payment successful!");
        router.push("/(tabs)/home");
      } else {
        Alert.alert("Error", "Payment failed, please try again.");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Direct Bank Transfer</Text>

        <Text style={styles.instructions}>Please follow these steps:</Text>
        <View style={styles.stepsContainer}>
          {[1, 2, 3, 4, 5].map((step) => (
            <Text key={step} style={styles.stepText}>
              {step}. Step {step}
            </Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Bank Accounts</Text>
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
          <Text style={styles.label}>Select Bank</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={bankPaymentForm.bank}
              onValueChange={(value) =>
                setBankPaymentForm({ ...bankPaymentForm, bank: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Select a bank" value="" />
              {banks.map((bank, index) => (
                <Picker.Item
                  key={index}
                  label={bank.bankName}
                  value={bank.bankName}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Upload Receipt</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleFilePick}
          >
            <MaterialIcons name="upload-file" size={24} color="gray" />
            <Text style={styles.uploadText}>
              {bankPaymentForm.receipt
                ? bankPaymentForm.receipt.name
                : "Tap to upload"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Processing..." : "Submit Payment"}
            </Text>
          </TouchableOpacity>
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
  sectionTitle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#7E0201",
    marginBottom: 12,
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
  },
  picker: {
    height: 50,
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
    backgroundColor: "#7E0201",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
