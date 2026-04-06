import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen   from '../screens/employee/DashboardScreen';
import AttendanceScreen  from '../screens/employee/AttendanceScreen';
import LeaveScreen       from '../screens/employee/LeaveScreen';
import PayslipsScreen    from '../screens/employee/PayslipsScreen';
import ProfileScreen     from '../screens/employee/ProfileScreen';
import MyQRCodeScreen    from '../screens/employee/MyQRCodeScreen';

const Tab = createBottomTabNavigator();

const icon = (name) => ({ color, size }) =>
  <Ionicons name={name} size={size} color={color} />;

export default function EmployeeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard"  component={DashboardScreen}  options={{ tabBarIcon: icon('home-outline'),         tabBarLabel: 'Home' }} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} options={{ tabBarIcon: icon('time-outline'),         tabBarLabel: 'Attendance' }} />
      <Tab.Screen name="MyQR"       component={MyQRCodeScreen}   options={{ tabBarIcon: icon('qr-code-outline'),      tabBarLabel: 'My QR' }} />
      <Tab.Screen name="Leave"      component={LeaveScreen}      options={{ tabBarIcon: icon('calendar-outline'),     tabBarLabel: 'Leave' }} />
      <Tab.Screen name="Payslips"   component={PayslipsScreen}   options={{ tabBarIcon: icon('document-text-outline'), tabBarLabel: 'Payslips' }} />
      <Tab.Screen name="Profile"    component={ProfileScreen}    options={{ tabBarIcon: icon('person-outline'),       tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
