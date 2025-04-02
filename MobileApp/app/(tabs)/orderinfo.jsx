import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

export default function OrderInfo() {
  const route = useRouter();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.pentagonContainer}>
            {/* Top Triangle */}
            {/* <View style={styles.triangle} /> */}

            {/* Bottom Rectangle */}
            <View style={styles.rectangle}>
              <Text style={styles.text}>Your Order is in process</Text>
              <Text style={styles.text2}>Thank you!</Text>
            </View>
          </View>
        </View>
        <View style={styles.sectiona}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "start",
              alignItems: "center",
              marginHorizontal: 23,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text>ORDER NUMBER : </Text>
              <Text>#Yas-002/16</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "start",
              alignItems: "center",
              marginHorizontal: 23,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text>DATE : </Text>
              <Text>15/07/2024</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "start",
              alignItems: "center",
              marginHorizontal: 23,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text>TOTAL : </Text>
              <Text>Br 814.20</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "start",
              alignItems: "center",
              marginHorizontal: 23,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text>PAYMENT METHOD : </Text>
              <Text>On Delivery</Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "column",
              justifyContent: "start",
              alignItems: "start",
              margin: 23,
            }}
          >
            <Text
              className="text-primary"
              style={{ fontSize: 15, fontWeight: 600 }}
            >
              Order Address
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "start",
                marginTop: 3,
              }}
            >
              <Text>NAME : </Text>
              <Text style={{ textTransform: "uppercase" }}>
                Andualem legesse taye
              </Text>
            </View>
            <Text>DJIBOUTI ST.</Text>
            <Text>ADDIS ABABA, ETHIOPIA</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "start",
                marginTop: 3,
              }}
            >
              <Text>Email : </Text>
              <Text>kalebtesfaye2031@gmail.com</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "start",
                marginTop: 3,
              }}
            >
              <Text>PHONE NO : </Text>
              <Text>+251911383095</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.placeOrderButton}
          // onPress={handlePlaceOrder}
          onPress={() => route.push("/trackorder")}
          //   disabled={isLoading}
        >
          <Text style={styles.placeOrderText}>
            {/* {isLoading ? "Pay Now" : "Pay Now"} */}
            Track Order
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "start",
    backgroundColor: "#fff",
  },
  pentagonContainer: {
    alignItems: "center",
    marginTop: 32,
    justifyContent: "center",
    width: 350, // Increased size
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 5, // For Android
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 170, // Half of container width
    borderRightWidth: 170,
    borderBottomWidth: 70, // Increased triangle height
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#4A55A2", // Updated color
    position: "relative",
    zIndex: 1,
  },
  rectangle: {
    width: 345,
    height: 200, // Increased height
    backgroundColor: "#55B051",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopRightRadius: 200,
    borderTopLeftRadius: 200,
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: -15,
    paddingBottom: 40,
  },
  text: {
    color: "white",
    fontSize: 20,
    letterSpacing: 1.2,
    fontWeight: "600",
    fontFamily: "System", // Use system font for clean look
    // textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 8,
  },
  text2: {
    color: "white",
    fontSize: 15,
    letterSpacing: 1.2,
    fontWeight: "600",
    fontFamily: "System", // Use system font for clean look
    // textTransform: "uppercase",
  },
  scrollContent: {
    paddingHorizontal: 26,
    paddingVertical: 6,
    paddingBottom: 100,
    backgroundColor: "#fff",
    gap: 12,
  },
  sectiona: {
    backgroundColor: "rgba(150, 166, 234, 0.4)",
    borderRadius: 32,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#445399",
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
    textTransform: "uppercase",
  },
});
