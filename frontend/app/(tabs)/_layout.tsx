import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { TabIcons } from '@/src/constants/Icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2B5CFF', // Fixed Main Blue
        tabBarInactiveTintColor: '#A6A6A6',
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#F2F2F2',
            borderTopWidth: 1,
            height: 90, // Adjusted height
            paddingTop: 10,
            paddingBottom: 30, // Increased padding
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.05,
            shadowRadius: 4,
          },
          default: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#F2F2F2',
            borderTopWidth: 1,
            height: 70,
            paddingTop: 10,
            paddingBottom: 10,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => {
             const Icon = focused ? TabIcons.Home.Active : TabIcons.Home.Inactive;
             return <Icon width={24} height={24} />;
          },
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: '커뮤니티',
          tabBarIcon: ({ focused }) => {
            const Icon = focused ? TabIcons.Community.Active : TabIcons.Community.Inactive;
            return <Icon width={24} height={24} />;
          },
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: '피싱 뉴스',
          tabBarIcon: ({ focused }) => {
             const Icon = focused ? TabIcons.News.Active : TabIcons.News.Inactive;
             return <Icon width={24} height={24} />;
          },
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: '피싱 갤러리',
          tabBarIcon: ({ focused }) => {
             const Icon = focused ? TabIcons.Gallery.Active : TabIcons.Gallery.Inactive;
             return <Icon width={24} height={24} />;
          },
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이 페이지',
          tabBarIcon: ({ focused }) => {
             const Icon = focused ? TabIcons.MyPage.Active : TabIcons.MyPage.Inactive;
             return <Icon width={24} height={24} />;
          },
        }}
      />
    </Tabs>
  );
}
