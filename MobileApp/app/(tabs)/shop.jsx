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
} from "react-native";
import Header from "@/components/Header";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Picker } from "@react-native-picker/picker";
import Card from "@/components/Card";
import SearchComp from "@/components/SearchComp";
import { fetchProducts } from "@/hooks/useFetch";

const Shop = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedValue, setSelectedValue] = useState("option1");
  const colorScheme = useColorScheme();

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
      <View style={styles.headerContainer}>
        <Header />
      </View>
      {/* Content Area */}
      <View style={styles.contentContainer}>
        {/* Image Background Section */}
        <View style={styles.imageContainer}>
          <ImageBackground
            source={require("@/assets/images/headerhabeshakemis.png")}
            style={styles.imageBackground}
          >
            <View style={styles.overlay} />
            <View style={styles.textContainer}>
              <Text style={[styles.text, styles.text1]}>Shop</Text>
              <Text style={styles.text}>Home {">>"} Shop </Text>
            </View>
          </ImageBackground>
        </View>
        <SearchComp />
        {/* Filter Container */}
        <View style={styles.filterContainer}>
          <Pressable
            style={styles.button}
            onPress={() => console.log("Filter pressed")}
          >
            <AntDesign name="filter" size={24} color="white" />
            <Text style={{ color: "white" }}>Filter</Text>
          </Pressable>
          <Picker
            selectedValue={selectedValue}
            onValueChange={(itemValue) => setSelectedValue(itemValue)}
            style={[
              styles.picker,
              {
                backgroundColor: colorScheme === "dark" ? "#fff" : "#fff",
                color: colorScheme === "dark" ? "#000" : "#333",
              },
            ]}
          >
            <Picker.Item label="Default sorting" value="option1" />
            <Picker.Item label="Sort by popularity" value="option2" />
            <Picker.Item label="Sort by latest" value="option3" />
          </Picker>
        </View>
      </View>
    </View>
  );
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <View style={{ width: '48%'}}>
          <Card product={item} /> 
        </View>
      )}
      
      keyExtractor={(item) => item.id.toString()}
      numColumns={2} // This displays 2 cards per row
      columnWrapperStyle={{
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 10,
        paddingHorizontal: 16,
      }}
      ListHeaderComponent={ListHeader}
      onRefresh={onRefresh}
      refreshing={refreshing}
      contentContainerStyle={styles.flatListContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    padding: 0,
  },
  headerContainer: {
    zIndex: 1000,
    height: 70,
  },
  contentContainer: {
    flex: 1,
    marginTop: 0,
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
    gap:2,
  },
});

export default Shop;
