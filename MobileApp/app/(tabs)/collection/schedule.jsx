// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   Alert,
//   Platform,
//   SafeAreaView,
// } from "react-native";
// import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { TextInput } from "react-native";

// const Schedule = () => {
//   const [text, setText] = useState("");
//   const router = useRouter();

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView contentContainerStyle={styles.container}>
//         <View style={styles.headerContainer}>
//           <TouchableOpacity
//             onPress={() => router.back()}
//             style={{ marginHorizontal: 10, paddingHorizontal: 2 }}
//             className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
//           >
//             <Ionicons name="arrow-back" size={24} color="#445399" />
//           </TouchableOpacity>
//         </View>
//         <Text
//           className="font-poppins-bold text-center text-primary mb-4"
//           style={styles.headerTitle}
//         >
//           Schedule Delivery
//         </Text>
//         <Text
//           style={{ fontSize: 18, paddingLeft: 8 }}
//           className="text-start font-poppins-bold text-gray-800 text-[14px] mb-4"
//         >
//           Address
//         </Text>
//         <TextInput
//           style={{
//             height: 50,
//             width: "100%",
//             borderColor: "gray",
//             borderWidth: 1,
//             paddingHorizontal: 15,
//             marginBottom: 10,
//             borderRadius: 39,
//           }}
//           placeholder="Type your home address"
//           onChangeText={(value) => setText(value)}
//           value={text}
//         />
//         <View
//           style={{
//             padding: 10,
//           }}
//         >
//           <Image source={require("@/assets/images/map.png")} />
//         </View>
//         <Text
//           style={{ fontSize: 18, paddingLeft: 8, marginTop: 15 }}
//           className="text-start font-poppins-bold text-gray-800 text-[14px] mb-4"
//         >
//           Date and Time
//         </Text>
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginHorizontal: 32,
//           }}
//         >
//           <Image source={require("@/assets/images/calender.png")} />
//           <Image source={require("@/assets/images/time.png")} />
//         </View>

//         <TouchableOpacity
//           style={styles.placeOrderButton}
//           // onPress={handlePlaceOrder}
//           onPress={() => router.replace("/(tabs)/orderinfo")}
//           //   disabled={isLoading}
//         >
//           <Text style={styles.placeOrderText}>
//             {/* {isLoading ? "Pay Now" : "Pay Now"} */}
//               CONFIRM ORDER
//           </Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };
// export default Schedule;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   container: {
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//   },
//   title: {
//     textAlign: "center",
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 16,
//     color: "#7E0201",
//   },
//   instructions: {
//     fontSize: 14,
//     color: "#4B5563",
//     marginBottom: 8,
//   },
//   stepsContainer: {
//     marginLeft: 16,
//     marginBottom: 16,
//   },
//   stepText: {
//     fontSize: 14,
//     color: "#4B5563",
//     marginBottom: 4,
//   },
//   headerContainer: {
//     height: 60,
//     backgroundColor: "#fff",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 10,
//     // borderBottomWidth: 1,
//     // borderBottomColor: "#eee",
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   placeOrderButton: {
//     backgroundColor: "#445399",
//     borderRadius: 38,
//     padding: 16,
//     alignItems: "center",
//     marginTop: 38,
//   },
//   placeOrderText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { DateTimePicker } from "expo-date-time-picker"; // Check exact import from Expo docs
import Toast from "react-native-toast-message";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScheduleDelivery } from "@/hooks/useFetch"; // Your exported function

const ScheduleDeliveryPage = () => {
  // Extract orderId from query parameters (e.g. ?orderId=27)
  const { orderId } = useLocalSearchParams();
  const router = useRouter();

  const [date, setDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Imperative onChange handler used by DateTimePickerAndroid.open
  const onChange = (event, selectedDate) => {
    // The event.type will be "set" when a date is selected,
    // "dismissed" when the user cancels the dialog.
    if (event.type === "set" && selectedDate) {
      setDate(selectedDate);
    }
  };

  // Opens the Android date/time picker dialog imperatively
  const openDatePicker = () => {
    setShowPicker(true);
  };

  // Submit the selected date/time to schedule delivery
  const handleSchedule = async () => {
    setIsSubmitting(true);
    try {
      // Call your API function with orderId and ISO string date
      const response = await ScheduleDelivery(orderId, date.toISOString());
      Toast.show({
        type: "success",
        text1: "Delivery scheduled successfully",
        text2: `Scheduled for ${date.toLocaleString()}`,
        visibilityTime: 3000,
      });
      router.back(); // Optionally navigate back
    } catch (error) {
      console.error(
        "Error scheduling delivery:",
        error.response?.data || error.message
      );
      Toast.show({
        type: "error",
        text1: "Error scheduling delivery",
        text2: error.response?.data?.detail || error.message,
        visibilityTime: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Schedule Delivery</Text>
      <View style={styles.dateContainer}>
        <Text style={styles.label}>Selected Date & Time:</Text>
        <Text style={styles.dateText}>{date.toLocaleString()}</Text>
      </View>
      <Text style={styles.buttonText}>Pick a Date & Time</Text>
      {showPicker && (
        <DateTimePicker
          value={date}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
          mode="datetime"
          minimumDate={new Date()}
        />
      )}
      <TouchableOpacity
        style={[styles.button, styles.submitButton]}
        onPress={handleSchedule}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Scheduling..." : "Schedule Delivery"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ScheduleDeliveryPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
  },
  dateContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#445399",
  },
  button: {
    backgroundColor: "#445399",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#28a745",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});
