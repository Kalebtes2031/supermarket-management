import { useColorScheme } from "@/hooks/useColorScheme.web";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";

// import { icons } from "../constants";

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();
  return (
    <View style={{ gap: 2 }} className={` ${otherStyles}`}>
      <Text
        style={{
          color: colorScheme === "dark" ? "#fff" : "#7E0201",
          fontSize: 20,
          fontWeight: "semibold",
        }}
        // className="text-base text-gray-100 font-pmedium"
      >
        {title}
      </Text>

      <View 
      style={{
        backgroundColor: "white",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "gray",
        width: '100%',
        height: 50,
        paddingHorzontal: 4,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
      // className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center"
      >
        <TextInput
          style={{
            flex: 1,
            color: colorScheme === "dark" ? "#000z" : "black",
            fontSize: 20,
            fontWeight: "semibold",
            paddingHorizontal: 12,
          }}
          // className="flex-1 text-white font-psemibold text-base"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7B7B8B"
          onChangeText={handleChangeText}
          secureTextEntry={title === "Password" && !showPassword}
          {...props}
        />

        {title === "Password" && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={
                !showPassword
                  ? require("@/assets/icons/eye.png")
                  : require("@/assets/icons/eye-hide.png")
              }
              style={{
                width: 24,
                height: 24,
                marginRight: 12,
              }}
              // className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
