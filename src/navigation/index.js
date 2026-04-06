import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

import LoginScreen    from '../screens/auth/LoginScreen';
import EmployeeTabs   from './EmployeeTabs';
import ManagerTabs    from './ManagerTabs';
import AdminTabs      from './AdminTabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const isAdmin   = user?.role === 'HR Admin' || user?.role === 'Super Admin';
  const isManager = user?.role === 'Manager';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login"        component={LoginScreen}  />
        ) : isAdmin ? (
          <Stack.Screen name="AdminHome"    component={AdminTabs}    />
        ) : isManager ? (
          <Stack.Screen name="ManagerHome"  component={ManagerTabs}  />
        ) : (
          <Stack.Screen name="EmployeeHome" component={EmployeeTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
