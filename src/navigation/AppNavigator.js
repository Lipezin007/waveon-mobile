import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { LanguageContext } from '../contexts/LanguageContext';
import RegisterScreen from '../screens/auth/RegisterScreen';
import WorkoutDetailsScreen from '../screens/workouts/WorkoutDetailsScreen';
import MainTabNavigator from './MainTabNavigator';
import PaywallScreen from '../screens/paywall/PaywallScreen';
import CreateWorkoutScreen from '../screens/workouts/CreateWorkoutScreen';
import SessionDetailsScreen from '../screens/progress/SessionDetailsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0A0A0A',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#4D618F" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#0A0A0A' },
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WorkoutDetails"
              component={WorkoutDetailsScreen}
              options={{ title: t('nav.workoutDetails', 'Workout details') }}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ title: t('nav.paywall', 'Premium') }}
            />
            <Stack.Screen
              name="CreateWorkout"
              component={CreateWorkoutScreen}
              options={{ title: t('nav.createWorkout', 'Create workout') }}
            />
            <Stack.Screen
              name="SessionDetails"
              component={SessionDetailsScreen}
              options={{ title: 'Session details' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}