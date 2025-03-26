import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";
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
      // className="bg-primary h-full"
      style={{
        height: "100%",
        backgroundColor:  colorScheme === "dark" ? "#000" : "#fff",
      }}
    >
      <ScrollView>
        <View
          className="w-full flex justify-center min-h-[85vh] px-4 my-6"
          // style={{
          //   minHeight: Dimensions.get("window").height - 100,
          // }}
          style={{
            // minHeight: Dimensions.get("window").height - 100,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
            marginVertical: 20,
            minHeight: "85vh",
          }}
        >
          <Image
            source={colorScheme==="dark" ? require("@/assets/images/malhibfooterlogo.png") :require("@/assets/images/malhiblogo.png")}
            resizeMode="contain"
            className="w-[115px] h-[34px]"
            style={{
              width: 150,
              height: 104,
            }}
          />

          <Text 
          style={{
            textAlign: "center",
            fontSize: 30,
            fontWeight: "semibold",
            color: colorScheme === "dark" ? "#fff" : "black",
            marginTop: 20,
            fontWeight: '700',
            fontFamily: "Poppins-SemiBold",
            textShadowColor: "rgba(0, 0, 0, 0.3)",
            textShadowOffset: { width: 0, height: 3 },
            textShadowRadius: 6,
          }}
          // className="text-2xl font-semibold text-white mt-10 font-psemibold"
          >
            Sign Up to Yason
          </Text>
          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-10"
          />

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />
          <CustomBotton
            title="Sign Up"
            // handlePress={submit}
            containerStyles="mt-7 w-full"
            isLoading={isSubmitting}
          />

          <View 
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            paddingTop: 20,
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
