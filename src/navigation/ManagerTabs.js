import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ManagerDashboardScreen from '../screens/manager/ManagerDashboardScreen';
import TeamAttendanceScreen   from '../screens/manager/TeamAttendanceScreen';
import LeaveReviewScreen      from '../screens/manager/LeaveReviewScreen';
import ProfileScreen          from '../screens/employee/ProfileScreen';
import ScanQRScreen           from '../screens/shared/ScanQRScreen';

const Tab = createBottomTabNavigator();
const icon = (name) => ({ color, size }) => <Ionicons name={name} size={size} color={color} />;

export default function ManagerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard"     component={ManagerDashboardScreen} options={{ tabBarIcon: icon('home-outline'),        tabBarLabel: 'Home' }} />
      <Tab.Screen name="Team"          component={TeamAttendanceScreen}   options={{ tabBarIcon: icon('people-outline'),      tabBarLabel: 'Team' }} />
      <Tab.Screen name="ScanQR"        component={ScanQRScreen}           options={{ tabBarIcon: icon('scan-outline'),        tabBarLabel: 'Scan QR' }} />
      <Tab.Screen name="LeaveReview"   component={LeaveReviewScreen}      options={{ tabBarIcon: icon('checkmark-circle-outline'), tabBarLabel: 'Leave' }} />
      <Tab.Screen name="Profile"       component={ProfileScreen}          options={{ tabBarIcon: icon('person-outline'),      tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
