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
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TextInput } from "react-native";

const Schedule = () => {
  const [text, setText] = useState("");

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
          Schedule Delivery
        </Text>
        <Text
          style={{ fontSize: 18, paddingLeft: 8 }}
          className="text-start font-poppins-bold text-gray-800 text-[14px] mb-4"
        >
          Address
        </Text>
        <TextInput
          style={{
            height: 50,
            width: "100%",
            borderColor: "gray",
            borderWidth: 1,
            paddingHorizontal: 15,
            marginBottom: 10,
            borderRadius:39,
          }}
          placeholder="Type your home address"
          onChangeText={(value) => setText(value)}
          value={text}
        />
        <View
          style={{
            padding:10,
          }}
        >

        <Image 
          source={require('@/assets/images/map.png')}
          
          />
        </View>
        <Text
          style={{ fontSize: 18, paddingLeft: 8 }}
          className="text-start font-poppins-bold text-gray-800 text-[14px] mb-4"
        >
          Date and Time
        </Text>
        <View
          style={{
            flexDirection:"row",
            justifyContent: "space-between",
            alignItems:"center",
            marginHorizontal: 22
          }}
        >

            <Image 
          source={require('@/assets/images/calender.png')}
          
          />
            <Image 
          source={require('@/assets/images/time.png')}
          
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default Schedule;

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
});
