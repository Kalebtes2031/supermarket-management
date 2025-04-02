import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SectionList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OrderTrackingScreen = () => {
  // Mock data for multiple orders
  const orders = [
    {
      id: '123',
      date: '2025-03-04',
      status: 'in_transit',
      items: [
        { name: 'Tena Oil', price: 1300.00, quantity: 1 },
        { name: 'Omar Oil', price: 1500.00, quantity: 2 }
      ],
      delivery: {
        driver: 'Delivery Person1',
        eta: '30-45 mins',
        progress: 65,
        coordinates: {
          start: { lat: 40.7128, lng: -74.0060 }, // Warehouse
          current: { lat: 40.7282, lng: -74.0776 }, // Driver location
          end: { lat: 40.7580, lng: -73.9855 }      // Customer
        }
      }
    },
    {
      id: '124',
      date: '2025-03-04',
      status: 'delivered',
      items: [
        { name: 'Omar Oil', price: 1500.00, quantity: 1 }
      ],
      delivery: {
        driver: 'Delivery Person2',
        eta: 'Delivered',
        progress: 100,
        coordinates: {
          start: { lat: 40.7128, lng: -74.0060 },
          end: { lat: 40.7580, lng: -73.9855 }
        }
      }
    }
  ];

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <View style={[styles.statusBadge, 
          item.status === 'delivered' ? styles.deliveredBadge :
          item.status === 'in_transit' ? styles.transitBadge : styles.processingBadge
        ]}>
          <Text style={styles.statusText}>
            {item.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Mock Map Visualization */}
      <View style={styles.mapContainer}>
        <Image 
          source={require('@/assets/images/map.png')} // Use your mock map image
          style={styles.mapImage}
        />
        <View style={styles.mapMarkers}>
          <Icon name="warehouse" size={24} color="#4CAF50" style={styles.mapMarker} />
          <Icon name="radio-button-checked" size={16} color="#2196F3" style={styles.mapMarker} />
          <Icon name="place" size={24} color="#FF5722" style={styles.mapMarker} />
        </View>
      </View>

      {/* Delivery Timeline */}
      <View style={styles.timeline}>
        <View style={styles.timelineStep}>
          <Icon name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.timelineText}>Order Confirmed</Text>
          <Text style={styles.timelineTime}>Aug 15, 10:30 AM</Text>
        </View>
        
        <View style={styles.timelineStep}>
          <Icon name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.timelineText}>Preparing Order</Text>
          <Text style={styles.timelineTime}>Aug 15, 11:45 AM</Text>
        </View>

        <View style={styles.timelineStep}>
          <Icon name={item.status === 'delivered' ? "check-circle" : "radio-button-unchecked"} 
                size={20} color={item.status === 'delivered' ? "#4CAF50" : "#9E9E9E"} />
          <Text style={styles.timelineText}>Out for Delivery</Text>
          {item.status === 'in_transit' && (
            <Text style={styles.timelineTime}>Estimated {item.delivery.eta}</Text>
          )}
        </View>
      </View>

      {/* Order Details */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Order Details</Text>
        {item.items.map((product, index) => (
          <View key={index} style={styles.productItem}>
            <Text style={styles.productName}>{product.quantity}x {product.name}</Text>
            <Text style={styles.productPrice}>Br{(product.price * product.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>
            Br{item.items.reduce((sum, product) => sum + (product.price * product.quantity), 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Delivery Info */}
      <View style={styles.deliveryInfo}>
        <Icon name="local-shipping" size={20} color="#445399" />
        <View style={styles.deliveryTextContainer}>
          <Text style={styles.deliveryDriver}>Driver: {item.delivery.driver}</Text>
          <Text style={styles.deliveryStatus}>
            {item.status === 'in_transit' ? ` ${item.delivery.eta}` : 'Delivered'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={[
          { title: 'Active Deliveries', data: orders.filter(o => o.status !== 'delivered') },
          { title: 'Delivery History', data: orders.filter(o => o.status === 'delivered') }
        ]}
        renderItem={renderOrderItem}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D4150',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  transitBadge: {
    backgroundColor: '#2196F320',
    borderColor: '#2196F3',
  },
  deliveredBadge: {
    backgroundColor: '#4CAF5020',
    borderColor: '#4CAF50',
  },
  processingBadge: {
    backgroundColor: '#FF980020',
    borderColor: '#FF9800',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#E0E0E0',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapMarkers: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  mapMarker: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  timeline: {
    marginVertical: 16,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  timelineText: {
    flex: 1,
    marginLeft: 12,
    color: '#2D4150',
    fontSize: 14,
  },
  timelineTime: {
    color: '#86939E',
    fontSize: 12,
  },
  detailsSection: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D4150',
    marginBottom: 12,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  productName: {
    color: '#2D4150',
    fontSize: 14,
  },
  productPrice: {
    color: '#445399',
    fontSize: 14,
    fontWeight: '500',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D4150',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#445399',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  deliveryTextContainer: {
    marginLeft: 12,
  },
  deliveryDriver: {
    fontSize: 14,
    color: '#2D4150',
  },
  deliveryStatus: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#445399',
    marginVertical: 16,
    marginLeft: 8,
  },
});

export default OrderTrackingScreen;