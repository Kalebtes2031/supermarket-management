import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Alert,
  Image,
  TextInput,
} from "react-native";
// import { images } from "../../constants";
import FormField from "@/components/FormField";
import CustomBotton from "@/components/CustomButton";
import { useColorScheme } from "@/hooks/useColorScheme.web";
// import { createUser } from "@/lib/appwrite";

const SignUp = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const colorScheme = useColorScheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const submit = async () => {
  //   if (form.username === "" || form.email === "" || form.password === "") {
  //     Alert.alert("Error", "Please fill in all fields");
  //   }

  //   setIsSubmitting(true);
  //   try {
  //     const result = await createUser(form.email, form.password, form.username);
  //     // setUser(result);
  //     // setIsLogged(true);

  //     router.replace("/home");
  //   } catch (error) {
  //     Alert.alert("Error:(", error.message);
  //     console.error("this is the error")
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
      }}
    >
      <ScrollView
        style={{
          flex: 1,
          // backgroundColor: "red"
        }}
      >
        <View
          style={{
            // minHeight: Dimensions.get("window").height - 100,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            // backgroundColor: "red"
            // justifyContent: "center",
            // alignItems: "center",
          }}
        >
          <Image
            source={require("@/assets/images/signup.png")}
            resizeMode="cover"
            // className="w-[115px] h-[34px]"
            style={{
              width: "100%",
              height: 440,
            }}
          />
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              paddingTop: 20,
              paddingBottom: 20,
              paddingHorizontal: 40,
              display: "flex",
              flexDirection: "column",
              gap: 20,
              position: "absolute",
              top: 300,
              left: 0,
              right: 0,
              // alignItems: "center",
              // justifyContent: "start",
            }}
          >
            <Text
              style={{
                textAlign: "start",
                fontSize: 20,
                fontWeight: 700,
                color: colorScheme === "dark" ? "#fff" : "black",
                fontWeight: "700",
                fontFamily: "Poppins-SemiBold",
              }}
            >
              Create your account
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* First Name Field */}
              <View
                style={{
                  backgroundColor: "white",
                  borderWidth: 1,
                  borderColor: "gray",
                  borderRadius: 35,
                  width: "48%",
                  height: 50,
                  justifyContent: "center",
                  paddingHorizontal: 12,
                }}
              >
                <TextInput
                  style={{
                    fontSize: 20,
                    color: colorScheme === "dark" ? "#000" : "black",
                  }}
                  value={form.firstName}
                  placeholder="First Name"
                  placeholderClassName="text-sm"
                  placeholderTextColor="#7B7B8B"
                  onChangeText={(e) => setForm({ ...form, firstName: e })}
                />
              </View>

              {/* Last Name Field */}
              <View
                style={{
                  backgroundColor: "white",
                  borderWidth: 1,
                  borderColor: "gray",
                  borderRadius: 35,
                  width: "48%",
                  height: 50,
                  justifyContent: "center",
                  paddingHorizontal: 12,
                }}
              >
                <TextInput
                  style={{
                    fontSize: 20,
                    color: colorScheme === "dark" ? "#000" : "black",
                  }}
                  value={form.lastName}
                  placeholder="Last Name"
                  placeholderTextColor="#7B7B8B"
                  onChangeText={(e) => setForm({ ...form, lastName: e })}
                />
              </View>
            </View>

            <FormField
              title=""
              value={form.username}
              handleChangeText={(e) => setForm({ ...form, username: e })}
              otherStyles="mt-10"
            />

            <FormField
              title=""
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              otherStyles=""
              keyboardType="email-address"
            />

            <FormField
              title=""
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              otherStyles=""
            />
            <CustomBotton
              title="Sign Up"
              // handlePress={submit}
              containerStyles="mt- w-full"
              isLoading={isSubmitting}
            />

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                // paddingTop: 20,
                gap: 10,
              }}
              // className="flex justify-center pt-5 flex-row gap-2"
            >
              <Text
                style={{
                  fontSize: 20,
                  color: colorScheme === "dark" ? "#fff" : "black",
                  fontFamily: "Poppins-Regular",
                }}
                // className="text-lg text-gray-100 font-pregular"
              >
                Have an account already?
              </Text>
              <Link
                href="/sign-in"
                style={{
                  fontSize: 20,
                  color: "#7E0201",
                  fontFamily: "Poppins-SemiBold",
                }}
                // className="text-lg font-psemibold text-secondary"
              >
                Login
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
