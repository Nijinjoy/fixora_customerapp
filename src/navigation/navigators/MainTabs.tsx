import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ComponentType } from 'react';
import { useEffect } from 'react';
import { BottomNav } from '../../components/navigation/BottomNav';
import { askStartupPermissions } from '../../services/permissions';
import { useSessionStore } from '../../store/sessionStore';
import { tabRoutes } from '../routes/tabRoutes';
import type { TabParamList } from '../types';

const Tab = createBottomTabNavigator<TabParamList>();

const renderTabBar = (props: BottomTabBarProps) => <BottomNav {...props} />;

const tabNames = Object.keys(tabRoutes) as (keyof TabParamList)[];

function useStartupPermissions() {
  useEffect(() => {
    const { permissionsPrompted, markPermissionsPrompted } =
      useSessionStore.getState();
    if (permissionsPrompted) {
      return;
    }
    const timer = setTimeout(() => {
      markPermissionsPrompted();
      askStartupPermissions();
    }, 600);
    return () => clearTimeout(timer);
  }, []);
}

export function MainTabs() {
  useStartupPermissions();

  return (
    <Tab.Navigator tabBar={renderTabBar} screenOptions={{ headerShown: false }}>
      {tabNames.map(name => (
        <Tab.Screen
          key={name}
          name={name}
          component={tabRoutes[name].component as ComponentType<object>}
          options={tabRoutes[name].options}
        />
      ))}
    </Tab.Navigator>
  );
}
