import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* 
  Message List Screen:
  Displays a list of message scam scenarios.
  Matches Image 14.48.29.png ref.
  - Chat Bubble Thumbnails (Code-based)
  - Categories
  - Stats & Bookmark
*/

const SCENARIOS = [
    {
        id: '1',
        title: '로맨스스캠 메세지',
        desc: '저에게 호감을 표시하는 메세지를 받았어요.',
        reportCount: '95만',
        time: '1분 전',
        rating: 4.5,
        type: 'romance',
        preview: [
            { sender: 'them', text: '어째서? 😔', time: '19:32' },
            { sender: 'them', text: '게시물을 봤는데 넌 아름다워 불안해 🙂', time: '19:34' },
        ]
    },
    {
        id: '2',
        title: '부업 피싱 메세지',
        desc: '급여가 높은 부업에 대한 메세지를 받았어요.',
        reportCount: '78만',
        time: '1분 전',
        rating: 4.8,
        type: 'job',
        preview: [
            { sender: 'them', text: '저는 PSO의 총책임자입니다.\n현재 부업팀을 모집하고 있습니다.\n급여는 매일 지급됩니다.', time: '16:55' },
        ]
    },
    {
        id: '3',
        title: 'SNS 제안 메세지',
        desc: '스폰, 바이럴 등 SNS에서 메세지를 받았어요.',
        reportCount: '66만',
        time: '2분 전',
        rating: 4.3,
        type: 'sns',
        preview: [
            { sender: 'them', text: '신원확실하시고 보안확실하시니 부담없이 만남어떠신지요\n매월 고정페이 가능하시고 일시 선지급도 가능합니다', time: '14:20' },
        ]
    },
];

const ChatThumbnail = ({ messages }: { messages: any[] }) => {
    return (
        <View style={styles.thumbnailContainer}>
            {messages.map((msg, index) => (
                <View key={index} style={styles.bubbleRow}>
                    {/* Placeholder Avatar */}
                    <View style={styles.avatar}>
                         <Ionicons name="globe-outline" size={16} color="white" />
                         <View style={styles.avatarBadge}>
                             <Ionicons name="alert-circle" size={10} color="white" />
                         </View>
                    </View>
                    
                    <View style={{ flex: 1 }}>
                        <Text style={styles.senderName}>윤아.._.dbsdk</Text>
                        <View style={styles.bubbleContainer}>
                            <View style={styles.bubble}>
                                <Text style={styles.bubbleText} numberOfLines={2}>{msg.text}</Text>
                            </View>
                            <Text style={styles.timeText}>{msg.time}</Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
};

const ScenarioItem = ({ item, onPress }: { item: typeof SCENARIOS[0], onPress: () => void }) => {
    return (
        <Pressable style={styles.card} onPress={onPress}>
            {/* Header / Thumbnail Area */}
            <View style={styles.cardHeader}>
                <ChatThumbnail messages={item.preview} />
                <TouchableOpacity style={styles.bookmark}>
                    <Ionicons name="bookmark-outline" size={24} color="#C4C4C4" />
                </TouchableOpacity>
            </View>
            
            {/* Content Body */}
            <View style={styles.cardBody}>
                <View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDesc}>{item.desc}</Text>
                </View>
            </View>

            {/* Footer Stats */}
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

export default function MessageListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('신고순');

  const navigateToChat = (type: string) => {
      // Navigate to chat simulation
      router.push({ pathname: '/gallery/message_chat', params: { type } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>메세지 피싱</Text>
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
                  <Text style={styles.tabText}>로맨스스캠</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                  <Text style={styles.tabText}>악성 앱 설치</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                  <Text style={styles.tabText}>불법 대출</Text>
              </TouchableOpacity>
          </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
           {SCENARIOS.map((item) => (
                <ScenarioItem 
                    key={item.id} 
                    item={item} 
                    onPress={() => navigateToChat(item.type)} 
                />
           ))}
      </ScrollView>

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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
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
  card: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 16, // Padding around entire card
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
      // No shadow for list items usually in this style, just border separator or spacing
      // But prompt says "White card form", so maybe shadow?
      // Image 14.48.29 looks like cards with shadow or just clean separation.
      // I'll add slight shadow if it's a "card".
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      backgroundColor: '#F5F7FA', // Light bg for bubble area
      borderRadius: 12,
      padding: 12,
      position: 'relative',
  },
  thumbnailContainer: {
      flex: 1,
      paddingRight: 20,
  },
  bubbleRow: {
      flexDirection: 'row',
      marginBottom: 8,
      alignItems: 'flex-start',
  },
  avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#FF6B6B', // Salmon color for avatar
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
      position: 'relative',
  },
  avatarBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      backgroundColor: '#FF3B30',
      borderRadius: 6,
      width: 12,
      height: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'white',
  },
  senderName: {
      fontSize: 12,
      color: '#555',
      marginBottom: 2,
  },
  bubbleContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
  },
  bubble: {
      backgroundColor: 'white',
      borderRadius: 12,
      borderTopLeftRadius: 2,
      paddingHorizontal: 10,
      paddingVertical: 6,
      maxWidth: '85%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
  },
  bubbleText: {
      fontSize: 13,
      color: '#111',
      lineHeight: 18,
  },
  timeText: {
      fontSize: 10,
      color: '#999',
      marginLeft: 4,
  },
  bookmark: {
      position: 'absolute',
      top: 10,
      right: 10,
  },
  cardBody: {
      marginBottom: 10,
  },
  cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#111',
      marginBottom: 4,
  },
  cardDesc: {
      fontSize: 13,
      color: '#888',
  },
  cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
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
