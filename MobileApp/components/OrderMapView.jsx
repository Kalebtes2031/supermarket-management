import React, { useState, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
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
            longitude:
              (customerLocation.longitude + liveLocation.longitude) / 2,
            latitudeDelta: Math.max(
              Math.abs(customerLocation.latitude - liveLocation.latitude) * 2.5,
              0.05
            ),
            longitudeDelta: Math.max(
              Math.abs(customerLocation.longitude - liveLocation.longitude) *
                2.5,
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
      // provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: customerLocation.latitude,
        longitude: customerLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
    >
      {/* Customer's Static Location Marker */}
      <Marker
        coordinate={customerLocation}
        title={"Your Location"}
        // description="Your Location"
        pinColor="blue"
        // image={{uri:order?.items[0]?.product?.image}}
        // style={{width:100,height:100}}
      />

      {/* Live Delivery Person Marker */}
      {deliveryLocation && (
        <>
          <Marker
            coordinate={deliveryLocation}
            title={"Delivery Person"}
            pinColor="red"
          />
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

// import React, { useState, useEffect, useRef } from "react";
// import { StyleSheet } from "react-native";
// import MapView, { Marker, Polyline } from "react-native-maps";
// import { ref, onValue } from "firebase/database";
// import { database } from "@/firebaseConfig";

// // Function to decode an encoded polyline string into coordinates.
// function decodePolyline(encoded, precision = 5) {
//   let coordinates = [];
//   let index = 0,
//     len = encoded.length;
//   let lat = 0,
//     lng = 0;
//   const factor = Math.pow(10, precision);
//   while (index < len) {
//     let b, shift = 0, result = 0;
//     do {
//       b = encoded.charCodeAt(index++) - 63;
//       result |= (b & 0x1f) << shift;
//       shift += 5;
//     } while (b >= 0x20);
//     const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
//     lat += deltaLat;
//     shift = 0;
//     result = 0;
//     do {
//       b = encoded.charCodeAt(index++) - 63;
//       result |= (b & 0x1f) << shift;
//       shift += 5;
//     } while (b >= 0x20);
//     const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
//     lng += deltaLng;
//     coordinates.push({ latitude: lat / factor, longitude: lng / factor });
//   }
//   return coordinates;
// }

// const OrderMapView = ({ order }) => {
//   const mapRef = useRef(null);
//   const [deliveryLocation, setDeliveryLocation] = useState(null);
//   const [routeCoordinates, setRouteCoordinates] = useState([]);  // New state for route polyline

//   // Get customer location from the order.
//   const customerLocation = {
//     latitude: Number(order.customer_latitude),
//     longitude: Number(order.customer_longitude),
//   };

//   // Extract delivery person ID from the order.
//   const deliveryPersonId = order.delivery_person?.user?.id;

//   // Subscribe to delivery person's live location updates from Firebase.
//   useEffect(() => {
//     if (!deliveryPersonId) return;
//     const deliveryRef = ref(database, `locations/delivery_persons/${deliveryPersonId}`);
//     const unsubscribe = onValue(deliveryRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const liveLocation = {
//           latitude: data.latitude,
//           longitude: data.longitude,
//         };
//         setDeliveryLocation(liveLocation);

//         // Animate the map to a region between the two markers.
//         if (mapRef.current) {
//           const newRegion = {
//             latitude: (customerLocation.latitude + liveLocation.latitude) / 2,
//             longitude: (customerLocation.longitude + liveLocation.longitude) / 2,
//             latitudeDelta: Math.max(
//               Math.abs(customerLocation.latitude - liveLocation.latitude) * 1.5,
//               0.02
//             ),
//             longitudeDelta: Math.max(
//               Math.abs(customerLocation.longitude - liveLocation.longitude) * 1.5,
//               0.02
//             ),
//           };
//           mapRef.current.animateToRegion(newRegion, 1000);
//         }
//       }
//     });
//     return () => unsubscribe();
//   }, [deliveryPersonId, customerLocation]);

//   // Once both customer and delivery locations are available, fetch the route.
//   useEffect(() => {
//     if (customerLocation && deliveryLocation) {
//       const origin = `${customerLocation.latitude},${customerLocation.longitude}`;
//       const destination = `${deliveryLocation.latitude},${deliveryLocation.longitude}`;
//       const apiKey = "YOUR_GOOGLE_DIRECTIONS_API_KEY";  // Replace with your key
//       const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

//       fetch(url)
//         .then((response) => response.json())
//         .then((data) => {
//           if (data.routes && data.routes.length) {
//             const points = data.routes[0].overview_polyline.points;
//             const coords = decodePolyline(points);
//             setRouteCoordinates(coords);
//           }
//         })
//         .catch((error) => console.error("Directions API error:", error));
//     }
//   }, [customerLocation, deliveryLocation]);

//   return (
//     <MapView
//       ref={mapRef}
//       style={styles.map}
//       initialRegion={{
//         latitude: customerLocation.latitude,
//         longitude: customerLocation.longitude,
//         latitudeDelta: 0.02,
//         longitudeDelta: 0.02,
//       }}
//     >
//       {/* Customer's Static Location Marker */}
//       <Marker
//         coordinate={customerLocation}
//         title="Your Location"
//         description="Your Location"
//         pinColor="blue"
//       />

//       {/* Live Delivery Person Marker */}
//       {deliveryLocation && (
//         <>
//           <Marker
//             coordinate={deliveryLocation}
//             title="Delivery Person"
//             pinColor="red"
//           />
//         </>
//       )}

//       {/* Display route polyline if available */}
//       {routeCoordinates.length > 0 && (
//         <Polyline
//           coordinates={routeCoordinates}
//           strokeColor="#1E90FF"
//           strokeWidth={3}
//         />
//       )}
//     </MapView>
//   );
// };

// const styles = StyleSheet.create({
//   map: {
//     width: 300,
//     height: 150,
//     borderRadius: 4,
//   },
// });

// export default OrderMapView;
