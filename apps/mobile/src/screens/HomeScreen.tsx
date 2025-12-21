import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, getDaysUntilEvent } from '@/utils';

const { width } = Dimensions.get('window');

// Mock data - in production this would come from your API
const upcomingEvents = [
  {
    id: '1',
    name: 'Sarah & Michael Wedding',
    date: new Date('2024-03-15'),
    type: 'Wedding',
    status: 'confirmed',
    vendorCount: 8,
    guestCount: 150,
  },
  {
    id: '2',
    name: 'Grace Kitchen Party',
    date: new Date('2024-03-22'),
    type: 'Kitchen Party',
    status: 'planning',
    vendorCount: 5,
    guestCount: 80,
  },
];

const quickActions = [
  {
    id: 'create-event',
    title: 'Create Event',
    subtitle: 'Start planning your celebration',
    icon: 'add-circle',
    color: '#6a1b9a',
  },
  {
    id: 'find-vendors',
    title: 'Find Vendors',
    subtitle: 'Discover trusted professionals',
    icon: 'search',
    color: '#bfa2db',
  },
  {
    id: 'view-bookings',
    title: 'View Bookings',
    subtitle: 'Manage your reservations',
    icon: 'calendar',
    color: '#d9b53f',
  },
  {
    id: 'guest-list',
    title: 'Guest List',
    subtitle: 'Manage your guest list',
    icon: 'people',
    color: '#e6b7a9',
  },
];

export function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'create-event':
        navigation.navigate('CreateEvent' as never);
        break;
      case 'find-vendors':
        navigation.navigate('VendorSearch' as never);
        break;
      case 'view-bookings':
        navigation.navigate('Plan' as never);
        break;
      case 'guest-list':
        navigation.navigate('Guests' as never);
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#22c55e';
      case 'planning':
        return '#f59e0b';
      case 'pending':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {new Date().getHours() < 12 ? 'Good Morning' : 'Good Afternoon'}
          </Text>
          <Text style={styles.userName}>{user?.phone || 'User'}</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Messages' as never)}
        >
          <Ionicons name="notifications-outline" size={24} color="#2e2e2e" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionCard, { backgroundColor: action.color }]}
              onPress={() => handleQuickAction(action.id)}
            >
              <Ionicons name={action.icon as any} size={32} color="#ffffff" />
              <Text style={styles.quickActionTitle}>{action.title}</Text>
              <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Upcoming Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Plan' as never)}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {upcomingEvents.length > 0 ? (
          <View style={styles.eventsList}>
            {upcomingEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => (navigation.navigate as any)('EventDetails', { eventId: event.id })}
              >
                <View style={styles.eventHeader}>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventName}>{event.name}</Text>
                    <Text style={styles.eventType}>{event.type}</Text>
                  </View>
                  <View style={styles.eventStatus}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(event.status) },
                      ]}
                    />
                    <Text style={styles.statusText}>{event.status}</Text>
                  </View>
                </View>

                <View style={styles.eventDetails}>
                  <View style={styles.eventDetail}>
                    <Ionicons name="calendar-outline" size={16} color="#7a7a7a" />
                    <Text style={styles.eventDetailText}>
                      {formatDate(event.date)}
                    </Text>
                    <Text style={styles.eventDetailText}>
                      ({getDaysUntilEvent(event.date)} days left)
                    </Text>
                  </View>
                  
                  <View style={styles.eventStats}>
                    <View style={styles.eventStat}>
                      <Ionicons name="business-outline" size={16} color="#7a7a7a" />
                      <Text style={styles.eventStatText}>{event.vendorCount} vendors</Text>
                    </View>
                    <View style={styles.eventStat}>
                      <Ionicons name="people-outline" size={16} color="#7a7a7a" />
                      <Text style={styles.eventStatText}>{event.guestCount} guests</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#d6d6d6" />
            <Text style={styles.emptyStateTitle}>No events yet</Text>
            <Text style={styles.emptyStateDescription}>
              Start planning your first celebration
            </Text>
            <TouchableOpacity
              style={styles.createEventButton}
              onPress={() => navigation.navigate('CreateEvent' as never)}
            >
              <Text style={styles.createEventButtonText}>Create Your First Event</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#7a7a7a',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e2e2e',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c62828',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e2e2e',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6a1b9a',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 12,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
    textAlign: 'center',
  },
  eventsList: {
    gap: 16,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#6a1b9a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e2e2e',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 14,
    color: '#7a7a7a',
  },
  eventStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#7a7a7a',
    textTransform: 'capitalize',
  },
  eventDetails: {
    gap: 12,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#7a7a7a',
  },
  eventStats: {
    flexDirection: 'row',
    gap: 16,
  },
  eventStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventStatText: {
    fontSize: 14,
    color: '#7a7a7a',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e2e2e',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#7a7a7a',
    textAlign: 'center',
    marginBottom: 24,
  },
  createEventButton: {
    backgroundColor: '#6a1b9a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createEventButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
});
