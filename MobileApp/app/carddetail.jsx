import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import { useCart } from "@/context/CartProvider";
import Toast from "react-native-toast-message";
import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";


const { width } = Dimensions.get("window");

const ProductDetail = ({ route }) => {
  // const { product } = route.params;
  const { product: productString } = useLocalSearchParams();
  const product = productString ? JSON.parse(productString) : null;
  const [selectedImage, setSelectedImage] = useState(product?.image);
  const [quantity, setQuantity] = useState(1);
  const colorScheme = useColorScheme();
  const { cart, addItemToCart } = useCart();
  const router = useRouter();

  // Create array of all available images
  const images = [
    product.image,
    product.image_back,
    product.image_full,
    product.image_left,
    product.image_right,
  ];

  const handleAddToCart = () => {
    console.log("quantity", quantity);
    console.log("id", product.id);
    addItemToCart(product.id, quantity);
    Toast.show({
      type: "success",
      text1: "Product added to cart",
    });
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No product details available.</Text>
      </SafeAreaView>
    );
  }

  // console.log('ok now i wanna know if product is here: ', product)
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#000" : "#fff" },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header />
        <View
          style={{
            height: 60,
            backgroundColor: "#fff",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 10, paddingHorizontal: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="gray" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Product Detail
          </Text>
        </View>
        {/* Main Product Image */}
        <View style={styles.mainImageContainer}>
          <Image
            source={{
              uri:
                selectedImage ||
                product.image ||
                "https://via.placeholder.com/300",
            }}
            style={styles.mainImage}
            resizeMode="contain"
          />
        </View>

        {/* Image Gallery */}
        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryContainer}
          >
            {images.map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImage(img)}
                style={[
                  styles.galleryImageContainer,
                  selectedImage === img && styles.selectedImageContainer,
                ]}
              >
                <Image
                  source={{ uri: img }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Details Container */}
        <View style={styles.detailsContainer}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category?.name}</Text>
          </View>

          {/* Product Title */}
          <Text
            style={[
              styles.title,
              { color: colorScheme === "dark" ? "#fff" : "#000" },
            ]}
          >
            {product.item_name}
          </Text>

          {/* Amharic Name */}
          {/* {product.item_name_amh && (
            <Text style={[styles.amharicText, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              {product.item_name_amh}
            </Text>
          )} */}

          {/* Price and Stock Status */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>ETB {product.price}</Text>
            <View
              style={[
                styles.stockStatus,
                { backgroundColor: product.in_stock ? "#4CAF50" : "#F44336" },
              ]}
            >
              <Text style={styles.stockText}>
                {product.in_stock ? "In Stock" : "Out of Stock"}
              </Text>
            </View>
          </View>

          {/* Product Description Section */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colorScheme === "dark" ? "#fff" : "#000" },
              ]}
            >
              Product Details
            </Text>
            <Text
              style={[
                styles.description,
                { color: colorScheme === "dark" ? "#ccc" : "#666" },
              ]}
            >
              Premium quality men's full suit crafted from fine materials.
              Perfect for formal occasions and business meetings. Available in
              multiple sizes with custom tailoring options.
            </Text>
          </View>

          {/* Size Chart (Add your actual size data) */}
          {/* <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Available Sizes
            </Text>
            <View style={styles.sizeContainer}>
              {['S', 'M', 'L', 'XL'].map((size) => (
                <TouchableOpacity key={size} style={styles.sizeButton}>
                  <Text style={styles.sizeText}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View> */}
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View
        style={[
          styles.actionBar,
          { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
        ]}
      >
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={styles.quantityButton}
          >
            <MaterialIcons name="remove" size={24} color="#7E0201" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            onPress={() => setQuantity(quantity + 1)}
            style={styles.quantityButton}
          >
            <MaterialIcons name="add" size={24} color="#7E0201" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleAddToCart}
          style={styles.addToCartButton}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Space for fixed action bar
  },
  mainImageContainer: {
    height: width * 0.9,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  mainImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  galleryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  galleryImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  selectedImageContainer: {
    borderColor: "#7E0201",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    paddingHorizontal: 16,
  },
  categoryBadge: {
    backgroundColor: "#7E0201",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  amharicText: {
    fontSize: 16,
    marginBottom: 16,
    fontFamily: "NotoSansEthiopic-Regular",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  priceText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#7E0201",
  },
  stockStatus: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  stockText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  sizeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  sizeButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sizeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  // actionBar: {
  //   position: 'absolute',
  //   bottom: 0,
  //   left: 0,
  //   right: 0,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   padding: 16,
  //   borderTopWidth: 1,
  //   borderTopColor: '#eee',
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: -2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 4,
  //   elevation: 5,
  // },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 8,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: "#7E0201",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginLeft: 12,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProductDetail;
