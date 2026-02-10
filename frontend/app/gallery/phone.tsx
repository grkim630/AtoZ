import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40 - 15) / 2; // (Screen Width - Padding - Gap) / 2

const DATA = [
    { title: '경찰 사칭 전화', subtitle: '경찰청, 검사 등을 사칭한\n전화가 왔어요', rating: 4.5, views: '95만', bg: '#2C3E50' },
    { title: '법원 사칭 전화', subtitle: '법원에서 제 앞으로 등기가\n배송되었어요', rating: 4.3, views: '73만', bg: '#34495E' },
    { title: '택배 배송 전화', subtitle: '택배를 주문한 적 없는데\n도착한다는 전화가 왔어요', rating: 4.8, views: '63만', bg: '#7F8C8D' },
    { title: '자녀 사칭 전화', subtitle: '제 자녀의 목소리로 전화가\n왔어요', rating: 4.9, views: '58만', bg: '#95A5A6' },
    { title: '금융 사칭 전화', subtitle: '저금리 대출을 해준다는\n전화가 왔어요', rating: 4.2, views: '45만', bg: '#BDC3C7' },
    { title: '지인 사칭 전화', subtitle: '급하게 돈이 필요하다는\n전화가 왔어요', rating: 4.0, views: '32만', bg: '#ECF0F1' },
];

export default function PhoneGalleryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>전화 피싱</Text>
        <View style={styles.headerIcons}>
            <Ionicons name="bookmark-outline" size={24} color="#111" style={{ marginRight: 15 }} />
            <Ionicons name="search-outline" size={24} color="#111" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <View style={[styles.chip, styles.activeChip]}>
                <Text style={styles.activeChipText}>신고순</Text>
                <Ionicons name="chevron-down" size={12} color="white"/>
            </View>
            <View style={styles.chip}><Text style={styles.chipText}>보이스피싱</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>로맨스스캠</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>영상피싱</Text></View>
          </ScrollView>

        <View style={styles.grid}>
            {DATA.map((item, index) => (
                <View key={index} style={styles.cardContainer}>
                    <Pressable 
                        style={styles.card}
                        onPress={() => router.push('/gallery/simulation')}
                    >
                        {/* Background Image Placeholder */}
                        <View style={[styles.cardBg, { backgroundColor: item.bg }]} />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.gradient}
                        />
                        
                        <View style={styles.cardContent}>
                           <Ionicons name="bookmark-outline" size={24} color="white" style={styles.bookmarkIcon} />
                           <View>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardSubtitle} numberOfLines={2}>{item.subtitle}</Text>
                           </View>
                        </View>
                    </Pressable>
                    <View style={styles.cardFooter}>
                        <Text style={styles.footerText}>신고 {item.views} 회 · 1분 전</Text>
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text style={styles.ratingText}>{item.rating}</Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
  },
  backBtn: {
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
  content: {
    padding: 20,
  },
  chipScroll: {
      flexDirection: 'row',
      marginBottom: 20,
      maxHeight: 40,
  },
  chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: '#F2F2F2',
      marginRight: 10,
  },
  activeChip: {
      backgroundColor: Colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
  },
  chipText: {
      color: '#111',
      fontWeight: '500',
  },
  activeChipText: {
      color: Colors.white,
      fontWeight: '600',
  },
  grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 15, // Gap between rows? No, gap property works nicely now
  },
  cardContainer: {
      width: CARD_WIDTH,
      marginBottom: 20,
  },
  card: {
      height: 220,
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 8,
  },
  cardBg: {
      ...StyleSheet.absoluteFillObject,
  },
  gradient: {
      ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
      flex: 1,
      justifyContent: 'space-between',
      padding: 16,
  },
  bookmarkIcon: {
      alignSelf: 'flex-end',
  },
  cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 4,
  },
  cardSubtitle: {
      fontSize: 12,
      color: '#E0E0E0',
      lineHeight: 16,
  },
  cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  footerText: {
      fontSize: 11,
      color: '#888',
  },
  ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
  },
  ratingText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#111',
  },
});
