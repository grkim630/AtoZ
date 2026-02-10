import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
// Image component removed in favor of SVG components
// import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DestinationIcon from '../../assets/icons/destination 1.svg';
import SirenIcon from '../../assets/icons/siren.svg';
import TaskIcon from '../../assets/icons/task 1.svg';

/* 
  Guide Category Screen:
  Selection between "By Crime Type" and "By Crime Step".
  Matches Image 14.22.06 ref.
*/

const SelectionCard = ({ title, activeTitle, subtitle, IconComponent, onPress }: { title: string, activeTitle: string, subtitle: string, IconComponent: any, onPress: () => void }) => (
    <Pressable style={styles.card} onPress={onPress}>
        <View style={styles.cardHeader}>
             <Text style={styles.cardTitle}>
                {title} <Text style={{ color: Colors.primary }}>{activeTitle}</Text>{'\n'}대응안
             </Text>
        </View>
        <View style={styles.cardBody}>
             <View style={styles.iconContainer}>
                <IconComponent width={80} height={80} />
             </View>
             <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
    </Pressable>
);

export default function GuideCategoryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>행동 요령</Text>
        <Ionicons name="search-outline" size={24} color="#111" />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleContainer}>
            <SirenIcon width={40} height={40} style={{ marginBottom: 8 }} />
            <Text style={styles.mainTitle}>
                피싱 범죄 <Text style={{ color: Colors.primary }}>행동 요령</Text>을{'\n'}알려드릴게요.
            </Text>
        </View>

        <View style={styles.cardContainer}>
            <SelectionCard 
                title="범행" 
                activeTitle="종류별" 
                subtitle={`자세한 유형을\n파악하고 싶어요.`}
                IconComponent={TaskIcon}
                onPress={() => router.push('/guide/steps_list')} 
            />
            <SelectionCard 
                title="범행" 
                activeTitle="단계별" 
                subtitle={`절차별 방법을\n파악하고 싶어요.`}
                IconComponent={DestinationIcon}
                onPress={() => router.push('/guide/steps')} 
            />
        </View>

        <View style={{ flex: 1 }} />
        
        <TouchableOpacity style={styles.chatButton}>
            <Text style={styles.chatButtonText}>채팅 상담</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
  },
  backButton: {
      padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  content: {
    padding: 20,
    flex: 1,
    paddingBottom: 40,
  },
  titleContainer: {
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 30,
  },
  mainTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: 30,
      color: '#111',
  },
  cardContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
  },
  card: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 20,
      height: 240,
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
  },
  cardHeader: {
      alignItems: 'center',
      marginTop: 10,
  },
  cardBody: {
      alignItems: 'center',
      marginBottom: 20,
  },
  cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: 26,
      color: '#111',
  },
  cardSubtitle: {
      fontSize: 13,
      color: '#888',
      textAlign: 'center',
      lineHeight: 18,
  },
  iconContainer: {
      marginBottom: 16,
      alignItems: 'center',
      justifyContent: 'center',
  },
  chatButton: {
      backgroundColor: '#2B5CFF', // Main Blue
      borderRadius: 16,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 40,
      width: '100%',
  },
  chatButtonText: {
      color: Colors.white,
      fontSize: 18,
      fontWeight: 'bold',
  },
});
