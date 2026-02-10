import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // For card overlay
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/src/constants/Colors';
import { MOCK_FEED } from '@/src/services/mockData';

const { width } = Dimensions.get('window');

// 1. Types for Mock Data
// Reusing MOCK_FEED from service, identifying Best Picks from it or creating static ones
const BEST_PICKS = [
    { id: 'b1', title: '다급한 목소리에 속지 마세요', desc: '지인 사칭 보이스피싱 예방 가이드', image: require('../../assets/images/Rectangle 12.png') }, // Assuming this asset exists from previous steps
    { id: 'b2', title: '모르는 링크는 절대 클릭 금지', desc: '스미싱 문자 구별법', image: require('../../assets/images/Rectangle 12.png') },
    { id: 'b3', title: '경찰청 사칭 전화 주의보', desc: '최근 유행하는 수법 총정리', image: require('../../assets/images/Rectangle 12.png') },
];

const CATEGORIES = ['전체', '피싱 예방', '피싱 대응'];

// 2. Component: Horizontal Best Pick Card
const BestPickCard = ({ item }: { item: any }) => (
    <View style={styles.bestPickCard}>
        <Image source={item.image} style={styles.bestPickImage} resizeMode="cover" />
        <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.cardOverlay}
        >
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardDesc} numberOfLines={1}>{item.desc}</Text>
        </LinearGradient>
    </View>
);

// 3. Component: Vertical List Item
const ReviewListItem = ({ item }: { item: any }) => (
    <View style={styles.listItem}>
        {/* Left: Thumbnail */}
        <Image 
            source={item.image ? item.image : require('../../assets/images/Rectangle 12.png')} // Fallback or item.image
            style={styles.listThumbnail}
            resizeMode="cover"
        />
        
        {/* Right: Text Info */}
        <View style={styles.listContentContainer}>
            <View style={styles.listHeaderRow}>
                <View style={[styles.tagBadge, item.type === 'Voice' ? styles.tagBlue : styles.tagRed]}>
                    <Text style={[styles.tagText, item.type === 'Voice' ? styles.tagTextBlue : styles.tagTextRed]}>
                        {item.type === 'Voice' ? '피싱 예방' : '피싱 대응'}
                    </Text>
                </View>
                <Text style={styles.dateText}>{item.time}</Text>
            </View>
            
            <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.listDesc} numberOfLines={2}>{item.content}</Text>
            
            <View style={styles.listFooter}>
                <View style={styles.iconRow}>
                    <Ionicons name="heart" size={14} color="#FF4B4B" />
                    <Text style={styles.iconText}>{item.likes}</Text>
                </View>
                <View style={styles.iconRow}>
                    <Ionicons name="chatbubble-outline" size={14} color="#666" />
                    <Text style={styles.iconText}>{item.comments}</Text>
                </View>
            </View>
        </View>
    </View>
);

export default function ReviewScreen() { // Renamed component to ReviewScreen logically, usually stays CommunityScreen in export if file name is community.tsx but Content matches "Review"
  const [activeCategory, setActiveCategory] = useState('전체');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>콘텐츠 리뷰</Text>
        <TouchableOpacity>
            <Ionicons name="search-outline" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Section 1: Best Picks */}
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>가장 많은 추천을 받았어요! 🔥</Text>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
            >
                {BEST_PICKS.map((pick) => (
                    <BestPickCard key={pick.id} item={pick} />
                ))}
            </ScrollView>
        </View>

        {/* Section 2: Category Filter */}
        <View style={styles.filterContainer}>
            {CATEGORIES.map((cat) => (
                <TouchableOpacity 
                    key={cat} 
                    style={[styles.filterChip, activeCategory === cat && styles.activeChip]}
                    onPress={() => setActiveCategory(cat)}
                >
                    <Text style={[styles.filterText, activeCategory === cat && styles.activeFilterText]}>
                        {cat}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        {/* Section 3: Vertical List */}
        <View style={styles.listContainer}>
            {MOCK_FEED.map((item) => (
                <ReviewListItem key={item.id} item={item} />
            ))}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 80 }} /> 

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // [Fixed] Background Color
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Best Picks Styles
  sectionContainer: {
    marginTop: 10,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginLeft: 20,
    marginBottom: 16,
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    paddingRight: 10, // Extra padding for last item
  },
  bestPickCard: {
    width: 280,
    height: 160,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  bestPickImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDesc: {
    color: '#DDD',
    fontSize: 13,
  },

  // Filter Styles
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: Colors.primary, // Blue background
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFF',
  },

  // Vertical List Styles
  listContainer: {
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  listThumbnail: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#EEE',
  },
  listContentContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#E5ECFF',
  },
  tagBlue: { backgroundColor: '#E5ECFF' },
  tagRed: { backgroundColor: '#FFE5E5' },
  tagText: { fontSize: 11, fontWeight: '700' },
  tagTextBlue: { color: Colors.primary },
  tagTextRed: { color: Colors.error },
  
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  listTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  listDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  listFooter: {
    flexDirection: 'row',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});
