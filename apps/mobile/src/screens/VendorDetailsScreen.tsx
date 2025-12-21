import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function VendorDetailsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vendor Details</Text>
      <Text style={styles.subtitle}>Vendor information and booking</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf9f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e2e2e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7a7a7a',
  },
});
