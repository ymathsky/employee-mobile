import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import AdminDashboardScreen      from '../screens/admin/AdminDashboardScreen';
import EmployeeManagementScreen  from '../screens/admin/EmployeeManagementScreen';
import PayrollScreen             from '../screens/admin/PayrollScreen';
import DepartmentScreen          from '../screens/admin/DepartmentScreen';
import AdminSettingsScreen       from '../screens/admin/AdminSettingsScreen';
import ProfileScreen             from '../screens/employee/ProfileScreen';

const Tab = createBottomTabNavigator();
const icon = (name) => ({ color, size }) => <Ionicons name={name} size={size} color={color} />;

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard"  component={AdminDashboardScreen}     options={{ tabBarIcon: icon('home-outline'),          tabBarLabel: 'Home' }} />
      <Tab.Screen name="Employees"  component={EmployeeManagementScreen}  options={{ tabBarIcon: icon('people-outline'),        tabBarLabel: 'Employees' }} />
      <Tab.Screen name="Payroll"    component={PayrollScreen}             options={{ tabBarIcon: icon('cash-outline'),          tabBarLabel: 'Payroll' }} />
      <Tab.Screen name="Departments" component={DepartmentScreen}         options={{ tabBarIcon: icon('business-outline'),      tabBarLabel: 'Depts' }} />
      <Tab.Screen name="Settings"   component={AdminSettingsScreen}       options={{ tabBarIcon: icon('settings-outline'),      tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}
