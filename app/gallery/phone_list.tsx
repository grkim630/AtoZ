import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, FlatList, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* 
  Phone List Screen (Refined):
  Displays a 2-column grid of phone scam scenarios.
  Matches Image 14.37.09.jpg ref.
  - FlatList numColumns={2}
  - ImageBackground cards with dark overlay
  - Custom Header with SafeAreaView padding
*/

const { width } = Dimensions.get('window');
// Calculate card width: (Screen Width - Horizontal Padding (20*2) - Gap (12)) / 2
const CARD_WIDTH = (width - 40 - 12) / 2;

const SCENARIOS = [
    {
        id: '1',
        title: '경찰 사칭 전화',
        desc: '경찰청, 검사 등을 사칭한\n전화가 왔어요',
        reportCount: '95만',
        time: '1분 전',
        rating: 4.5,
        type: 'police',
        image: require('../../assets/images/Rectangle 271.png'),
    },
    {
        id: '2',
        title: '법원 사칭 전화',
        desc: '법원에서 제 앞으로 등기가\n배송되었어요',
        reportCount: '73만',
        time: '3분 전',
        rating: 4.3,
        type: 'court',
        image: require('../../assets/images/Rectangle 272.png'), // Mapped to available image
    },
    {
        id: '3',
        title: '택배 배송 전화',
        desc: '택배를 주문한 적 없는데\n도착한다는 전화가 왔어요',
        reportCount: '63만',
        time: '7분 전',
        rating: 4.8,
        type: 'delivery',
        image: require('../../assets/images/Rectangle 273.png'), // Mapped to available image
    },
    {
        id: '4',
        title: '자녀 사칭 전화',
        desc: '제 자녀의 목소리로 전화가\n왔어요',
        reportCount: '58만',
        time: '12분 전',
        rating: 4.9,
        type: 'family',
        image: require('../../assets/images/Rectangle 274.png'), // Mapped to available image
    },
    {
        id: '5',
        title: '해외 송금 사기',
        desc: '해외로 수수료를 송금해야\n한다는 전화가 왔어요',
        reportCount: '41만',
        time: '30분 전',
        rating: 4.8,
        type: 'remittance',
        image: require('../../assets/images/Rectangle 275.png'), // Mapped to available image
    },
    {
        id: '6',
        title: '지인 사칭 전화',
        desc: '실제 지인의 이름으로\n전화가 왔어요',
        reportCount: '32만',
        time: '10분 전',
        rating: 4.9,
        type: 'acquaintance',
        image: require('../../assets/images/Rectangle 276.png'), // Mapped to available image
    },
];

const ScenarioCard = ({ item, onPress }: { item: typeof SCENARIOS[0], onPress: () => void }) => {
    return (
        <Pressable onPress={onPress} style={styles.cardWrapper}>
            <ImageBackground
                source={item.image}
                style={styles.card}
                imageStyle={{ borderRadius: 16 }}
                resizeMode="cover"
            >
                <View style={styles.cardOverlay} />
                
                <TouchableOpacity style={styles.bookmark}>
                    <Ionicons name="bookmark-outline" size={24} color="white" />
                </TouchableOpacity>

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDesc}>{item.desc}</Text>
                </View>
            </ImageBackground>
            
            <View style={styles.cardFooter}>
                 <Text style={styles.statsText}>신고 {item.reportCount} 회 · {item.time}</Text>
                 <View style={styles.ratingContainer}>
                     <Ionicons name="star" size={14} color="#FFD700" />
                     <Text style={styles.ratingText}>{item.rating}</Text>
                 </View>
            </View>
        </Pressable>
    );
};

export default function PhoneListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('신고순');

  const navigateToSimulation = (type: string) => {
      router.push({ pathname: '/gallery/simulation', params: { type } });
  };

  const renderItem = ({ item }: { item: typeof SCENARIOS[0] }) => (
      <ScenarioCard item={item} onPress={() => navigateToSimulation(item.type)} />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>전화 피싱</Text>
        <View style={styles.headerIcons}>
            <Ionicons name="bookmark-outline" size={24} color="#111" style={{ marginRight: 15 }} />
            <Ionicons name="search-outline" size={24} color="#111" />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
              <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                  <Text style={styles.activeTabText}>신고순</Text>
                  <Ionicons name="chevron-down" size={16} color="white" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                  <Text style={styles.tabText}>보이스피싱</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                  <Text style={styles.tabText}>로맨스스캠</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                  <Text style={styles.tabText}>영상피싱</Text>
              </TouchableOpacity>
          </ScrollView>
      </View>

      {/* Grid Content */}
      <FlatList
        data={SCENARIOS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
      padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  headerIcons: {
      flexDirection: 'row',
  },
  tabsContainer: {
      height: 50,
  },
  tabsContent: {
      paddingHorizontal: 20,
      alignItems: 'center',
      gap: 8,
  },
  tab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: '#F0F0F0',
      flexDirection: 'row',
      alignItems: 'center',
      height: 36,
  },
  activeTab: {
      backgroundColor: '#003DFF',
  },
  tabText: {
      color: '#666',
      fontSize: 14,
      fontWeight: '600',
  },
  activeTabText: {
      color: '#FFF',
      fontSize: 14,
      fontWeight: '600',
  },
  listContent: {
      padding: 20,
      paddingBottom: 40,
  },
  columnWrapper: {
      justifyContent: 'space-between',
      gap: 12, 
  },
  cardWrapper: {
      width: CARD_WIDTH,
      marginBottom: 24,
  },
  card: {
      height: undefined, // Let aspect ratio handle it
      aspectRatio: 3/4, // Vertical formatting (Portrait)
      borderRadius: 16,
      overflow: 'hidden',
      justifyContent: 'flex-end', // Text at bottom
      padding: 20, // Increased padding
  },
  cardOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.35)', // Slightly darker overlay
  },
  bookmark: {
      position: 'absolute',
      top: 12,
      right: 12,
      zIndex: 10,
  },
  cardContent: {
      zIndex: 5,
  },
  cardTitle: {
      color: 'white',
      fontSize: 16, 
      fontWeight: 'bold',
      marginBottom: 8,
      lineHeight: 22,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: {width: 0, height: 1},
      textShadowRadius: 3,
  },
  cardDesc: {
      color: '#F0F0F0',
      fontSize: 11,
      lineHeight: 16,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: {width: 0, height: 1},
      textShadowRadius: 3,
  },
  cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
      alignItems: 'center',
  },
  statsText: {
      color: '#888',
      fontSize: 11,
  },
  ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
  },
  ratingText: {
      color: '#333',
      fontSize: 12,
      fontWeight: 'bold',
  },
});
