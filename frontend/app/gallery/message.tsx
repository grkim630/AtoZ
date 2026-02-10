import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DATA = [
    { 
        id: 1, 
        title: '로맨스스캠 메세지', 
        desc: '저에게 호감을 표시하는 메세지를 받았어요.', 
        views: '95만', 
        time: '1분 전',
        rating: 4.5,
        type: 'romance',
        preview: [
            { sender: 'other', text: '어째서? 🥲', time: '19:32' },
            { sender: 'other', text: '게시물을 봤는데 넌 아름다워 불안해 🙂', time: '19:34' }
        ]
    },
    { 
        id: 2, 
        title: '부업 피싱 메세지', 
        desc: '급여가 높은 부업에 대한 메세지를 받았어요.', 
        views: '78만', 
        time: '1분 전',
        rating: 4.8,
        type: 'job',
        preview: [
             { sender: 'other', text: '저는 PSO의 총책임자입니다.\n현재 부업팀을 모집하고 있습니다.\n급여는 매일 지급됩니다.\n일급 : 30,000~50,000원.\n채용문의는 카카오톡으로 연락주세요.', time: '16:55' }
        ]
    },
    { 
        id: 3, 
        title: 'SNS 제안 메세지', 
        desc: '스폰, 바이럴 등 SNS에서 메세지를 받았어요.', 
        views: '66만', 
        time: '2분 전',
        rating: 4.3,
        type: 'sns',
         preview: [
             { sender: 'other', text: '신원확실하시고 보안확실하시니 부담없이 만남어떠신지요\n매월 고정페이 가능하시고 일시 선지급도 가능합니다.', time: '' }
        ]
    },
];

const ChatPreview = ({ messages }: { messages: any[] }) => (
    <View style={styles.previewContainer}>
        {messages.map((msg, i) => (
            <View key={i} style={styles.chatRow}>
                <View style={styles.avatar}>
                    <Ionicons name="globe-outline" size={16} color="white" />
                </View>
                <View style={styles.bubbleContainer}>
                     <View style={styles.bubbleContent}>
                         {/* Name (Fake) */}
                         <Text style={styles.senderName}>윤아._.dbsdk</Text>
                         {/* Bubble */}
                         <View style={styles.bubble}>
                            <Text style={styles.bubbleText}>{msg.text}</Text>
                         </View>
                     </View>
                     {msg.time ? <Text style={styles.msgTime}>{msg.time}</Text> : null}
                </View>
            </View>
        ))}
         <View style={styles.bookmarkBadge}>
            <Ionicons name="bookmark" size={16} color="white" />
        </View>
    </View>
);

export default function MessageGalleryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>메세지 피싱</Text>
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
            <View style={styles.chip}><Text style={styles.chipText}>로맨스스캠</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>악성 앱 설치</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>불법 대출</Text></View>
          </ScrollView>

        <View style={styles.list}>
            {DATA.map((item, index) => (
                <View key={index} style={styles.card}>
                     {/* Chat Preview Visual */}
                     <ChatPreview messages={item.preview} />

                    {/* Meta Info */}
                    <View style={styles.metaInfo}>
                        <View style={styles.metaHeader}>
                             <Text style={styles.cardTitle}>{item.title}</Text>
                             <Text style={styles.metaStats}>신고 {item.views} 회 · {item.time}</Text>
                        </View>
                        <View style={styles.metaFooter}>
                            <Text style={styles.cardDesc} numberOfLines={1}>{item.desc}</Text>
                            <View style={styles.ratingBox}>
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Text style={styles.ratingText}>{item.rating}</Text>
                            </View>
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
  list: {
      gap: 20,
  },
  card: {
      backgroundColor: Colors.white,
      marginBottom: 10,
  },
  previewContainer: {
      backgroundColor: '#A0B4CC', // Chat bg color similar to Kakao/Screenshot
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      minHeight: 100,
      position: 'relative',
  },
  bookmarkBadge: {
      position: 'absolute',
      top: 10,
      right: 15,
  },
  chatRow: {
      flexDirection: 'row',
      marginBottom: 10,
  },
  avatar: {
      width: 32,
      height: 32,
      borderRadius: 12,
      backgroundColor: '#E67E22', // Orange avatar
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
  },
  bubbleContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
  },
  bubbleContent: {
      maxWidth: '80%',
  },
  senderName: {
      fontSize: 11,
      color: '#555',
      marginBottom: 2,
  },
  bubble: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderTopLeftRadius: 2,
      padding: 10,
  },
  bubbleText: {
      fontSize: 13,
      color: '#111',
      lineHeight: 18,
  },
  msgTime: {
      fontSize: 10,
      color: '#555',
      marginLeft: 4,
      marginBottom: 2,
  },
  metaInfo: {
      paddingHorizontal: 4,
  },
  metaHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
  },
  cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#111',
  },
  metaStats: {
      fontSize: 12,
      color: '#999',
  },
  metaFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  cardDesc: {
      fontSize: 13,
      color: '#888',
      flex: 1,
  },
  ratingBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
  },
  ratingText: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#111',
  },
});
