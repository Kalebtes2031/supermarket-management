import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { useGlobalContext } from "@/context/GlobalProvider";
import axios from "axios";
import { getAccessToken, updateUserProfile } from "@/hooks/useFetch";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";


const ProfileScreen = () => {
  const { t, i18n } = useTranslation('profile');
  const router = useRouter();
  const { user, setUser, logout } = useGlobalContext();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
  });

  // Sync global user data with local form state
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
      });
    }
  }, [user]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
        if (!/\S+@\S+\.\S+/.test(value)) error = "Invalid email address";
        break;
      case "phone":
        if (!/^\+?[1-9]\d{1,14}$/.test(value)) error = "Invalid phone number";
        break;
      case "password":
        if (value.length < 8) error = "Password must be at least 8 characters";
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (name, value) => {
    validateField(name, value);
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImage = result.assets[0].uri;
      setUser((prev) => ({ ...prev, image: newImage }));
    }
  };

  const updateProfile = async (data) => {
    try {
      const token = await getAccessToken();
      const response = await axios.put(
        "http://192.168.1.4:8000/account/user/profile/update/",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Update failed";
    }
  };

  // const handleSave = async () => {
  //   const validations = Object.entries(formData).map(([key, value]) =>
  //     validateField(key, value)
  //   );

  //   if (validations.every((v) => v)) {
  //     setLoading(true);
  //     try {
  //       const updatedUser = await updateProfile(formData);
  //       setUser(updatedUser);
  //       setEditMode(false);
  //     } catch (error) {
  //       setErrors({
  //         general: typeof error === "string" ? error : "Update failed",
  //       });
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };
  const handleSave = async () => {
    const validations = Object.entries(formData).map(([key, value]) =>
      validateField(key, value)
    );

    if (validations.every((v) => v)) {
      setLoading(true);
      try {
        const token = await getAccessToken();

        // Create FormData for image upload
        const formDataToSend = new FormData();
        formDataToSend.append("first_name", formData.first_name);
        formDataToSend.append("last_name", formData.last_name);
        formDataToSend.append("username", formData.username);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("phone_number", formData.phone_number);

        if (user.image && user.image.startsWith("file://")) {
          const uriParts = user.image.split(".");
          const fileType = uriParts[uriParts.length - 1];

          formDataToSend.append("image", {
            uri: user.image,
            name: `profile.${fileType}`,
            type: `image/${fileType}`,
          });
        }

        const response = await updateUserProfile(formDataToSend)

        if (response.status === 200) {
          setUser(response.data);
          setEditMode(false);
        }
      } catch (error) {
        setErrors({
          general: typeof error === "string" ? error : "Update failed",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );

    const handleLogout = () => {
        console.log("logout");
        console.log("user is : ", user);
        // console.log("isLogged is : ", isLogged);
        logout();
        router.replace("/(auth)/sign-in");
      };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Profile Image Section */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginHorizontal: 10, paddingHorizontal: 2 }}
              className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
            >
              <Ionicons name="arrow-back" size={24} color="#445399" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileHeader}>
            <TouchableOpacity
              onPress={handleImagePick}
              disabled={!editMode}
              style={styles.imageContainer}
            >
              {user.image ? (
                <Image
                  source={{ uri: user.image }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Icon name="person" size={40} color="#666" />
                </View>
              )}
              {editMode && (
                <View style={styles.editImageBadge}>
                  <Icon name="edit" size={18} color="white" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.editButton, editMode && styles.cancelButton]}
                onPress={() => setEditMode(!editMode)}
              >
                <Text
                  className="font-poppins-medium"
                  style={styles.editButtonText}
                >
                  {editMode ? t("cancel") : t('edit')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={()=>handleLogout()}>
                <Text
                  style={styles.logoutButtonText}
                  className="font-poppins-medium"
                >
                  {t('signout')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formContainers}>
            <View style={styles.nameContainer}>
              <View
                style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}
              >
                <Text className="font-poppins-medium" style={styles.inputLabel}>
                  {t('first_name')}
                </Text>
                <TextInput
                  value={formData.first_name}
                  onChangeText={(v) => handleChange("first_name", v)}
                  style={styles.input}
                  editable={editMode}
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text className="font-poppins-medium" style={styles.inputLabel}>
                {t('last_name')}
                </Text>
                <TextInput
                  value={formData.last_name}
                  onChangeText={(v) => handleChange("last_name", v)}
                  style={styles.input}
                  editable={editMode}
                />
              </View>
            </View>

            {[t("username"), t("email"), t("phone_number")].map((field) => (
              <View key={field} style={styles.inputContainer}>
                <Text className="font-poppins-medium" style={styles.inputLabel}>
                  {field.replace("_", " ").toUpperCase()}
                </Text>
                <TextInput
                  value={formData[field]}
                  onChangeText={(v) => handleChange(field, v)}
                  style={styles.input}
                  editable={editMode}
                  keyboardType={
                    field === "email"
                      ? "email-address"
                      : field === "phone_number"
                      ? "phone-pad"
                      : "default"
                  }
                />
                {errors[field] && (
                  <Text
                    className="font-poppins-medium"
                    style={styles.errorText}
                  >
                    {errors[field]}
                  </Text>
                )}
              </View>
            ))}

            {errors.general && (
              <Text className="font-poppins-medium" style={styles.errorText}>
                {errors.general}
              </Text>
            )}

            {editMode && (
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text
                    className="font-poppins-medium"
                    style={styles.buttonText}
                  >
                    {t('save')}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    // height: 60,
    backgroundColor: "#fff",
    // flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    // paddingHorizontal: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: "#eee",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#55B051",
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  profileHeader: {
    alignItems: "center",
    marginVertical: 32,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e1e4e8",
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e1e4e8",
    justifyContent: "center",
    alignItems: "center",
  },
  editImageBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007bff",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#e9ecef",
  },
  editButtonText: {
    color: "#007bff",
    fontWeight: "500",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  nameContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#6c757d",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#212529",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  button: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 4,
  },
});

export default ProfileScreen;
