import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useWatchlist } from "@/context/WatchlistProvider";
import Card from "@/components/Card";

const WatchlistScreen = () => {
  const { watchlist } = useWatchlist();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Watchlist</Text>
      {watchlist.length === 0 ? (
        <Text style={styles.emptyMessage}>Your watchlist is empty.</Text>
      ) : (
        <FlatList
          data={watchlist}
          renderItem={({ item }) => <Card product={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  emptyMessage: { fontSize: 16, color: "#888", textAlign: "center" },
});

export default WatchlistScreen;
