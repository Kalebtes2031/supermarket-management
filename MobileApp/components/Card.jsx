import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useCart } from "@/context/CartProvider";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native"; // <-- Import useNavigation


const Card = ({ product }) => {
  const { addItemToCart } = useCart();
  const [isFavorited, setIsFavorited] = useState(false);
  const colorScheme = useColorScheme();
  const route = useRouter();
  const navigation = useNavigation(); // <-- Get navigation instance


  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };
  // const handlePress = () => {
  //   route.push("/(tabs)/carddetail", {product})
  //   // navigation.navigate("/(tab)/carddetail", { product });
  //   console.log("Card pressed!", product);
  // };
  const handlePress = () => {
    // Convert the product object to a JSON string and encode it for the URL
    route.push(`/carddetail?product=${encodeURIComponent(JSON.stringify(product))}`);
    console.log("Card pressed!", product);
  };

  
  const handleAddCartClick = () => {
    // navigate(`/shop/${id}`); // Redirect to /shop/:id
    console.log("Cart clicked!", product.id);
    addItemToCart(product.id, 1);
    // Toast.show({
    //   type: "success",
    //   text1: "item added to cart",
    // });
  };
  return (
    <TouchableOpacity onPress={handlePress} style={styles.cardcontainer}>
      <View style={styles.card}>
        {/* Image Container with Icons */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} />
          <View style={styles.cartIcon}>
            <TouchableOpacity onPress={handleAddCartClick}>
              <AntDesign name="shoppingcart" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.favoriteIcon} onPress={toggleFavorite}>
            <MaterialIcons
              name={isFavorited ? "favorite" : "favorite-border"}
              size={24}
              color="#7E0201"
            />
          </TouchableOpacity>
        </View>
        <Text
          style={[
            styles.category,
            { color: colorScheme === "dark" ? "#fff" : "#B9B4C7" },
          ]}
        >
          {product.category?.name || "N/A"}
        </Text>
        <Text
          style={[
            styles.name,
            { color: colorScheme === "dark" ? "#7E0201" : "#7E0201" },
          ]}
        >
          {product.item_name}
        </Text>
        <Text
          style={[
            styles.price,
            { color: colorScheme === "dark" ? "#fff" : "#5F374B" },
          ]}
        >
          {product.price}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardcontainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    // padding: 10,
    marginBottom: 10,
    width: "100%",
    height: 260,
  },
  card: {
    // borderWidth: 1,
    // borderColor: "#ddd",
    // borderRadius: 10,
    // padding: 10,
    // marginBottom: 10,
    width: "100%",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cartIcon: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 20,
  },
  favoriteIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 20,
  },
  category: {
    fontSize: 14,
    marginTop: 5,
    paddingLeft: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
    paddingLeft: 10,
    numberOfLines: 2,
    ellipsizeMode: "tail",
  },
  price: {
    fontSize: 14,
    color: "#7E0201",
    marginTop: 5,
    paddingLeft: 10,
    paddingBottom: 10,
  },
});

export default Card;
