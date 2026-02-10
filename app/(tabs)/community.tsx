import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
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

const FILTERS = ['추천순', '보이스피싱', '로맨스스캠', '영상피싱'];

const FeedItem = ({ item }: { item: any }) => (
  <View style={styles.feedCard}>
    <View style={styles.feedHeader}>
      <View style={[styles.badge, styles.badgeBlue]}>
        <Text style={styles.badgeText}>{item.type === 'Voice' ? '보이스피싱' : '로맨스스캠'}</Text>
      </View>
      {item.status === 'Analyzed' && (
        <View style={[styles.badge, styles.badgeGray]}>
          <Text style={styles.badgeText}>분석 완료</Text>
        </View>
      )}
      <Text style={styles.timeText}>{item.time} · 조회 {item.views}</Text>
    </View>

    <Text style={styles.feedTitle}>{item.title}</Text>
    <Text style={styles.feedContent} numberOfLines={2}>{item.content}</Text>

    {/* Placeholder content area mimicking the screenshot */}
    {item.image ? (
        <Image 
            source={item.image}
            style={styles.feedImage}
            resizeMode="cover"
        />
    ) : (
        <View style={styles.contentPlaceholder}>
            <Text style={styles.placeholderText}>
                {item.type === 'Voice' ? '통화 내용 스크립트...' : '문자 메시지 내용...'}
            </Text>
        </View>
    )}

    <View style={styles.feedFooter}>
      <View style={styles.interaction}>
        <Ionicons name="thumbs-up-outline" size={16} color={Colors.gray} />
        <Text style={styles.interactionText}>{item.likes}</Text>
      </View>
      <View style={styles.interaction}>
        <Ionicons name="chatbubble-outline" size={16} color={Colors.gray} />
        <Text style={styles.interactionText}>{item.comments}</Text>
      </View>
    </View>
  </View>
);

export default function CommunityScreen() {
  const [activeFilter, setActiveFilter] = useState('추천순');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>피드</Text>
        <View style={styles.headerIcons}>
           <Ionicons name="search-outline" size={24} color={Colors.text} style={{marginRight: 15}}/>
           <Ionicons name="notifications-outline" size={24} color={Colors.text} />
        </View>
      </View>

      <View style={styles.tabContainer}>
        <Text style={[styles.tabTitle, styles.activeTab]}>최신 피드</Text>
        <Text style={styles.tabTitle}>핫한 게시글</Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {FILTERS.map((filter) => (
            <TouchableOpacity
                key={filter}
                style={[
                styles.filterChip,
                activeFilter === filter && styles.activeFilterChip,
                ]}
                onPress={() => setActiveFilter(filter)}>
                <Text
                style={[
                    styles.filterText,
                    activeFilter === filter && styles.activeFilterText,
                ]}>
                {filter}
                </Text>
            </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
       
       <View style={styles.feedCountContainer}>
           <Text style={styles.feedCountText}>전체 게시글 382,443</Text>
       </View>

      <FlatList
        data={MOCK_FEED}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedItem item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerIcons: {
      flexDirection: 'row',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.gray,
    marginRight: 20,
  },
  activeTab: {
    color: Colors.text,
  },
  filterContainer: {
    marginBottom: 15,
  },
  filterScroll: {
      paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F4F6', // Light gray
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4E5968',
  },
  activeFilterText: {
    color: Colors.white,
  },
  feedCountContainer: {
      paddingHorizontal: 20,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#F2F4F6',
      paddingBottom: 10,
  },
  feedCountText: {
      fontSize: 12,
      color: Colors.gray,
  },
  listContent: {
    paddingBottom: 20,
  },
  feedCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F6',
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeBlue: {
    backgroundColor: '#E8F0FF',
  },
  badgeGray: {
    backgroundColor: '#F2F4F6',
  },
  badgeText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 'auto',
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 6,
  },
  feedContent: {
    fontSize: 14,
    color: '#4E5968',
    marginBottom: 12,
    lineHeight: 20,
  },
  contentPlaceholder: {
      backgroundColor: '#F8F9FA',
      padding: 15,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#EFEFEF'
  },
  placeholderText: {
      color: Colors.gray,
      fontSize: 12,
  },
  feedImage: {
      width: '100%',
      height: 200, // Fixed height for consistency
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#EEEEEE',
      marginBottom: 12,
  },
  feedFooter: {
    flexDirection: 'row',
  },
  interaction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  interactionText: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 4,
  },
});
