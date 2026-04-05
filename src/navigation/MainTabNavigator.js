import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import HomeScreen from '../screens/home/HomeScreen';
import WorkoutsScreen from '../screens/workouts/WorkoutsScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NutritionScreen from '../screens/nutrition/NutritionScreen';
import { t } from '../i18n';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        sceneStyle: {
          backgroundColor: '#0A0A0A',
        },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: insets.bottom > 0 ? 10 : 14,
          height: 68,
          borderRadius: 22,
          backgroundColor: 'rgba(18,18,18,0.98)',
          borderTopWidth: 1,
          borderColor: '#1E1E1E',
          paddingHorizontal: 10,
          paddingTop: 8,
          paddingBottom: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 20,
        },
        tabBarActiveTintColor: '#8EA2D0',
        tabBarInactiveTintColor: '#6F6F6F',
        tabBarIcon: ({ color, focused }) => {
          let iconName = 'ellipse-outline';

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Workouts') {
              iconName = focused ? 'barbell' : 'barbell-outline';
            } else if (route.name === 'Progress') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else if (route.name === 'Nutrition') {
              iconName = focused ? 'restaurant' : 'restaurant-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: 22,

                  // 👇 destaque só quando ativo
                  backgroundColor: focused
                    ? 'rgba(142,162,208,0.12)'
                    : 'transparent',
                  borderWidth: focused ? 1 : 0,
                  borderColor: 'rgba(142,162,208,0.25)',

                  transform: [{ scale: focused ? 1.08 : 1 }],
                }}
              >
                <Ionicons name={iconName} size={22} color={color} />
              </View>
            );
          },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t('nav.home', 'Home') }}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutsScreen}
        options={{ title: t('nav.workouts', 'Workouts') }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ title: t('nav.progress', 'Progress') }}
      />
      <Tab.Screen
        name="Nutrition"
        component={NutritionScreen}
        options={{ title: t('nav.nutrition', 'Nutrition') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('nav.profile', 'Profile') }}
      />
    </Tab.Navigator>
  );
}