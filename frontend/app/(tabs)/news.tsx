import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

// --- Mock Data ---

const STATS = {
  rate: 7.2,
  amount: -132,
  count: 72,
};

const CHART_DATA = [40, 30, 60, 40, 90]; // 5 weeks data points (0-100 scale)

const NEWS_ITEMS = [
  {
    id: '1',
    date: '오늘 2.8(일)',
    titleParts: [
        { text: '자녀 납치', highlight: true },
        { text: '를 빙자한 보이스피싱 사기 성행, 소비자경보(주의) 발령', highlight: false },
    ],
    snippet: '최근 미성년 자녀와 학부모의 이름, 연락처 등...',
  },
  {
    id: '2',
    date: '오늘 2.8(일)',
    titleParts: [
        { text: '저금리 대출', highlight: true },
        { text: '의 유혹, 최근 보이스피싱 피해자\n10명중 4명은 대출빙자 사기에 당한다!', highlight: false },
    ],
    snippet: '서민층을 주요 범행대상으로 하는 대출빙자형...',
  },
  {
    id: '3',
    date: '어제 2.7(토)',
    titleParts: [
        { text: '카드배송 사칭', highlight: true },
        { text: ' 보이스피싱 증가,\n소비자경보 상향', highlight: false },
    ],
    snippet: '더욱 교묘해진 가짜 카드배송으로 시작된 기관...',
  },
   {
    id: '4',
    date: '어제 2.7(토)',
    titleParts: [
        { text: '2030 청년 구직자 대상', highlight: true },
        { text: ' 보이스피싱 수법\n소비자경보(주의) 발령', highlight: false },
    ],
    snippet: '최근 구인·구직 중계 사이트에 가짜 채용공고를...',
  },
];

// --- Components ---

const StatCard = ({ label, value, unit, color, suffix }: { label: string, value: string, unit: string, color: string, suffix?: React.ReactNode }) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <View style={styles.statValueRow}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
        {suffix}
    </View>
  </View>
);

const TrendChart = () => {
    // Simple smooth curve approximation for the data
    const d = `M 0,150 
               L 0,${150 - CHART_DATA[0]} 
               L ${width/5},${150 - CHART_DATA[1]} 
               L ${width/5 * 2},${150 - CHART_DATA[2]} 
               L ${width/5 * 3},${150 - CHART_DATA[3]} 
               L ${width/5 * 4},${150 - CHART_DATA[4]} 
               L ${width/5 * 4},150 Z`;

    const line = `M 0,${150 - CHART_DATA[0]} 
                  L ${width/5},${150 - CHART_DATA[1]} 
                  L ${width/5 * 2},${150 - CHART_DATA[2]} 
                  L ${width/5 * 3},${150 - CHART_DATA[3]} 
                  L ${width/5 * 4},${150 - CHART_DATA[4]}`;

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>
         최근 한 달동안,{'\n'}
         재난의 빈도수가 <Text style={{ color: Colors.error }}>증가</Text>했어요.
      </Text>
      
      <View style={styles.chartWrapper}>
        <Svg height={180} width={width - 80}>
             <Defs>
                <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#6692FF" stopOpacity="0.5" />
                    <Stop offset="1" stopColor="#6692FF" stopOpacity="0" />
                </LinearGradient>
            </Defs>
            {/* Grid Lines */}
            <Path d="M 0,40 L 400,40" stroke="#F2F2F2" strokeWidth="1" />
            <Path d="M 0,100 L 400,100" stroke="#F2F2F2" strokeWidth="1" />
            <Path d="M 0,160 L 400,160" stroke="#F2F2F2" strokeWidth="1" />
            
            {/* Area */}
            <Path d={d} fill="url(#grad)" />
            {/* Line */}
            <Path d={line} fill="none" stroke="#6692FF" strokeWidth="3" />
            
            {/* Dots */}
            {CHART_DATA.map((val, i) => (
                <Path 
                    key={i}
                    d={`M ${width/5 * i},${150 - val} m -3,0 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0`}
                    fill="#2B5CFF"
                />
            ))}
        </Svg>
        {/* Y-Axis Labels */}
        <View style={styles.yAxis}>
             <Text style={styles.axisText}>100건</Text>
             <Text style={[styles.axisText, { top: 60 }]}>50건</Text>
        </View>
        {/* X-Axis Labels */}
        <View style={styles.xAxis}>
            {['1주', '2주', '3주', '4주', '5주'].map((label, i) => (
                <Text key={i} style={styles.axisText}>{label}</Text>
            ))}
        </View>
      </View>
    </View>
  );
};

const NewsCard = ({ item }: { item: typeof NEWS_ITEMS[0] }) => (
    <View style={styles.newsCard}>
        <View style={styles.newsTextContainer}>
             <Text style={styles.newsDate}>{item.date}</Text>
             <Text style={styles.newsTitle}>
                {item.titleParts.map((part, index) => (
                    <Text key={index} style={{ color: part.highlight ? '#2B5CFF' : '#111111', fontWeight: 'bold' }}>
                        {part.text}
                    </Text>
                ))}
            </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#C4C4C4" />
    </View>
);

// --- Main Screen ---

export default function NewsScreen() {
  const [activeTab, setActiveTab] = useState<'stats' | 'news'>('stats');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>피싱 뉴스</Text>
        <Ionicons name="search-outline" size={24} color="#111" />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <Pressable onPress={() => setActiveTab('stats')} style={styles.tabBtn}>
             <Text style={[styles.tabText, activeTab === 'stats' ? styles.activeTabText : styles.inactiveTabText]}>피해 통계</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('news')} style={styles.tabBtn}>
             <Text style={[styles.tabText, activeTab === 'news' ? styles.activeTabText : styles.inactiveTabText]}>최근 소식</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'stats' ? (
            <>
                <View style={styles.statsIconContainer}>
                     <Ionicons name="chatbubble" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.statsMainTitle}>
                    시시콜콜이 분석한{'\n'}
                    <Text style={{ color: Colors.primary }}>최근 피싱 추이</Text>입니다.
                </Text>

                <View style={styles.statCardsRow}>
                    <StatCard 
                        label="피싱 발생률" 
                        value="7.2" 
                        unit="%" 
                        color="#111" 
                        suffix={<Ionicons name="chevron-up" size={16} color={Colors.error} />}
                    />
                    <View style={styles.verticalDivider} />
                    <StatCard 
                        label="피싱 금액(억)" 
                        value="-132" 
                        unit="" 
                        color="#111" 
                        suffix={<Ionicons name="chevron-down" size={16} color={Colors.primary} />}
                    />
                    <View style={styles.verticalDivider} />
                    <StatCard 
                        label="피싱 발생수" 
                        value="+72" 
                        unit="" 
                        color="#111" 
                        suffix={<Ionicons name="chevron-up" size={16} color={Colors.error} />}
                    />
                </View>

                <TrendChart />
            </>
        ) : (
            <>
                {/* News Filter Chips */}
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    <View style={[styles.chip, styles.activeChip]}><Text style={styles.activeChipText}>추천순</Text><Ionicons name="chevron-down" size={12} color="white"/></View>
                    <View style={styles.chip}><Text style={styles.chipText}>보이스피싱</Text></View>
                    <View style={styles.chip}><Text style={styles.chipText}>로맨스스캠</Text></View>
                     <View style={styles.chip}><Text style={styles.chipText}>영상피싱</Text></View>
                 </ScrollView>

                 <NewsCard item={NEWS_ITEMS[0]} />
                 <NewsCard item={NEWS_ITEMS[1]} />
                 <NewsCard item={NEWS_ITEMS[2]} />
                 <NewsCard item={NEWS_ITEMS[3]} />
            </>
        )}
        <View style={{ height: 100 }} />
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
  },
  tabRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 20,
      gap: 15,
  },
  tabBtn: {
      paddingVertical: 5,
  },
  tabText: {
      fontSize: 18,
      fontWeight: '600',
  },
  activeTabText: {
      color: '#111', // Black for active
  },
  inactiveTabText: {
      color: '#A6A6A6',
  },
  scrollContent: {
      paddingHorizontal: 20,
  },
  // Stats Tab
  statsIconContainer: {
      marginBottom: 10,
      alignItems: 'center',
  },
  statsMainTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 30,
      lineHeight: 28,
  },
  statCardsRow: {
      flexDirection: 'row',
      backgroundColor: Colors.white,
      borderRadius: 16,
      paddingVertical: 20,
      justifyContent: 'space-evenly',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      marginBottom: 30,
  },
  statCard: {
      alignItems: 'center',
  },
  statLabel: {
      fontSize: 12,
      color: Colors.primary, // Blue labels
      marginBottom: 6,
      fontWeight: '600',
  },
  statValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
  },
  statValue: {
      fontSize: 20,
      fontWeight: 'bold',
  },
  statUnit: {
      fontSize: 14,
      color: '#111',
  },
  verticalDivider: {
      width: 1,
      height: 30,
      backgroundColor: '#E5E5EA',
  },
  // Chart
  chartContainer: {
      backgroundColor: Colors.white,
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
  },
  chartTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      lineHeight: 26,
      marginBottom: 20,
  },
  chartWrapper: {
      height: 200,
      marginTop: 10,
  },
  yAxis: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 20,
      justifyContent: 'space-between',
  },
  xAxis: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      paddingHorizontal: 0,
  },
  axisText: {
      fontSize: 11,
      color: '#999',
  },
  // News Tab
  chipScroll: {
      flexDirection: 'row',
      marginBottom: 20,
  },
  chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: '#E5E5EA',
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
  dateSectionHeader: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      marginTop: 10,
  },
  newsCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      // iOS Shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      // Android Shadow
      elevation: 5,
  },
  newsTextContainer: {
      flex: 1,
      marginRight: 10,
  },
  newsDate: {
      fontSize: 13,
      color: '#888',
      marginBottom: 4,
  },
  newsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#111',
      lineHeight: 22,
  },
});
