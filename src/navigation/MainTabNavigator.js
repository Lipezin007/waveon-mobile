import { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import HomeScreen from '../screens/home/HomeScreen';
import WorkoutsScreen from '../screens/workouts/WorkoutsScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NutritionScreen from '../screens/nutrition/NutritionScreen';
import { LanguageContext } from '../contexts/LanguageContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';


const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const { t } = useContext(LanguageContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarStyle: {
          position: 'absolute',
          left: spacing.md,
          right: spacing.md,
          bottom: insets.bottom > 0 ? 10 : 14,
          height: 68,
          borderRadius: 24,
          backgroundColor: 'rgba(17,21,28,0.98)',
          borderTopWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 10,
          paddingTop: 8,
          paddingBottom: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 20,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#6F7785',
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
              style={[
                styles.iconWrapper,
                focused && styles.iconWrapperActive,
              ]}
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

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(110,134,188,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(110,134,188,0.22)',
    transform: [{ scale: 1.05 }],
  },
});