import React, { useState, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { ref, onValue } from "firebase/database";
import { database } from "@/firebaseConfig";

const OrderMapView = ({ order }) => {
  const mapRef = useRef(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  // Get customer location from the order (assuming they are saved as strings/ numbers).
  const customerLocation = {
    latitude: Number(order.customer_latitude),
    longitude: Number(order.customer_longitude),
  };

  // Extract the delivery person's Firebase identifier.
  // Adjust this according to how your order payload sends this info.
  const deliveryPersonId = order.delivery_person?.user?.id;

  useEffect(() => {
    if (!deliveryPersonId) return;
    const deliveryRef = ref(
      database,
      `locations/delivery_persons/${deliveryPersonId}`
    );
    const unsubscribe = onValue(deliveryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const liveLocation = {
          latitude: data.latitude,
          longitude: data.longitude,
        };
        setDeliveryLocation(liveLocation);
        if (mapRef.current) {
          // Calculate a region centered between customer and delivery locations.
          const newRegion = {
            latitude: (customerLocation.latitude + liveLocation.latitude) / 2,
            longitude: (customerLocation.longitude + liveLocation.longitude) / 2,
            latitudeDelta: Math.max(
              Math.abs(customerLocation.latitude - liveLocation.latitude) * 2.5,
              0.05
            ),
            longitudeDelta: Math.max(
              Math.abs(customerLocation.longitude - liveLocation.longitude) * 2.5,
              0.05
            ),
          };
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      }
    });
    return () => unsubscribe();
  }, [deliveryPersonId, customerLocation]);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        latitude: customerLocation.latitude,
        longitude: customerLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {/* Customer's Static Location Marker */}
      <Marker coordinate={customerLocation} title="Your Location" pinColor="blue" />

      {/* Live Delivery Person Marker */}
      {deliveryLocation && (
        <>
          <Marker coordinate={deliveryLocation} title="Delivery Person" pinColor="red" />
          {/* Draw a polyline between the two locations */}
          <Polyline
            coordinates={[customerLocation, deliveryLocation]}
            strokeColor="#1E90FF"
            strokeWidth={3}
          />
        </>
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: 300,
    height: 150,
    borderRadius: 4,
  },
});

export default OrderMapView;
