import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ImageBackground,
  Pressable,
  ScrollView,
  RefreshControl,
  TextInput,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Header from "@/components/Header";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Picker } from "@react-native-picker/picker";
import Card from "@/components/Card";
import SearchComp from "@/components/SearchComp";
import { fetchProducts } from "@/hooks/useFetch";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import SearchProducts from "@/components/SearchComponent";

const Shop = () => {
  const { t, i18n } = useTranslation('shop');
  const { width, height } = Dimensions.get("window");
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedValue, setSelectedValue] = useState("option1");
  const colorScheme = useColorScheme();
  const router = useRouter();

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
      
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);
  const ListHeader = () => (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.categoryTitle}> {t("products")}</Text>
        <Text style={styles.categoryTitle2}> {products.length} {t('items')}</Text>
      </View>
      {/* Content Area */}
      <View style={styles.contentContainer}>
        {/* Image Background Section */}
        
        {/* <SearchProducts /> */}
        
      </View>
    </View>
  );
  return (
    <View style={styles.mainContainer}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
  
        <Text style={styles.categoryTitle}>{t("products")}</Text>
        <Text style={styles.categoryTitle2}>{products.length} {t('items')}</Text>
      </View>
  
      {/* Fixed Search Container */}
      <View style={styles.searchContainer}>
        <SearchProducts />
      </View>
  
      {/* Products List */}
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <Card product={item} />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.flatListContent}
        ListHeaderComponent={<View style={styles.listHeaderSpacer} />}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
    </View>
  );
  
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 200,
    backgroundColor: '#445399',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  searchContainer: {
    position: 'absolute',
    top: 210, // Adjusted to appear below header titles
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
  },
  flatListContent: {
    paddingTop: 80, // Space for search bar
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
  },
  cardContainer: {
    width: '48%',
    marginBottom: 12,
  },
  listHeaderSpacer: {
    height: 60, // Space between search and first row
  },

  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#445399",
    padding: 0,
  },
  // header: {
  //   height: 200,
  //   backgroundColor: "#445399",
  //   paddingHorizontal: 20,
  //   paddingTop: 50,
    
  // },
  backButton: {
    position: "absolute",
    left: 20,
    top: 40,
    backgroundColor: "#445399",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    borderWidth:1,
    borderColor:"white",
  },
  categoryTitle: {
    position: "absolute",
    top: 100,
    left: 20,
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  categoryTitle2: {
    position: "absolute",
    top: 150,
    left: 20,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerContainer: {
    zIndex: 1000,
    height: 70,
  },
  contentContainer: {
    flex: 1,
    marginTop:0,
    padding:10,
    backgroundColor: "white",
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
  },
  imageContainer: {
    height: 180,
    marginBottom: 10,
  },
  imageBackground: {
    height: 180,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(101,100,114,0.5)",
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  text: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 2,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  text1: {
    fontSize: 32,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 2,
    lineHeight: 18,
    fontWeight: "600",
    paddingTop: 28,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#7E0201",
    padding: 5,
    borderRadius: 5,
    width: 100,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
  },
  picker: {
    height: 54,
    width: "50%",
    margin: 10,
    fontSize: 8,
  },
  flatListContainer: {
    // padding: 10,
    gap: 2,
    backgroundColor: "white",
  },
});

export default Shop;
