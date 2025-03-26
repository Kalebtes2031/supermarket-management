import { useState } from "react";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Alert,
  Image,
  StyleSheet,
} from "react-native";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import { useRouter } from "expo-router";
import { GET_AUTH } from "@/hooks/useFetch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const SignIn = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { setUser, setIsLogged } = useGlobalContext();
  const [form, setForm] = useState({
    // email: "",
    username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!form.username || !form.password) {
      Toast.show({
        type: 'info',
        text1: "Please fill in all fields"
    })
      // Alert.alert("Error", "Please fill in all fields");
      return;
    }
    console.log( 'username is : ', form)
    console.log( 'password is : ', form.password)
    setIsSubmitting(true);
    try {
      const result = await GET_AUTH(form);

      // Store the token in AsyncStorage
      await AsyncStorage.setItem("accessToken", result.access);

      // await AsyncStorage.setItem("user", form.username);
      // const users = await AsyncStorage.getItem("user")
      // Update global context
      setUser({ username: form.username });
      setIsLogged(true);
      
      Toast.show({
        type: 'success',
        text1: "Your signed in successfully",
    })
      // Alert.alert("Success", "User signed in successfully");
      router.replace("/(tabs)/home");
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: "Error",
        text2: "Invalid credentials or server error"
    })
      // Alert.alert("Error", "Invalid credentials or server error");
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
      ]}
    >
      <ScrollView>
        <View style={styles.content}>
          <Image
            source={
              colorScheme === "dark"
                ? require("@/assets/images/malhibfooterlogo.png")
                : require("@/assets/images/malhiblogo.png")
            }
            resizeMode="contain"
            style={styles.logo}
          />

          <Text
            style={[
              styles.title,
              { color: colorScheme === "dark" ? "#fff" : "#000" },
            ]}
          >
            Log in to Yason
          </Text>

          {/* <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          /> */}
          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-10"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
            // secureTextEntry={true}
          />

          <CustomButton
            title="Sign In"
            handlePress={submit}
            // handlePress={() => router.push("/(tabs)/home")}
            containerStyles="mt-7 w-full"
            isLoading={isSubmitting}
          />

          <View style={styles.footer}>
            <Text
              style={[
                styles.footerText,
                { color: colorScheme === "dark" ? "#fff" : "#000" },
              ]}
            >
              Don't have an account?
            </Text>
            <Link href="/sign-up" style={styles.link}>
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  content: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 20,
    minHeight: Dimensions.get("window").height - 100,
  },
  logo: {
    width: 150,
    height: 104,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 20,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    fontFamily: "Poppins-SemiBold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 20,
    gap: 10,
  },
  footerText: {
    fontSize: 18,
    fontFamily: "Poppins-Regular",
  },
  link: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7E0201",
    fontFamily: "Poppins-SemiBold",
    textDecorationLine: "underline",
  },
});

export default SignIn;
