import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* 
  Guide Steps List Screen (Refined):
  Matches Image 14.22.11 exactly.
  - Title: '범행 단계별 대응안'
  - Back Button: Left, Search Icon: Right
  - List: 3 White Cards
  - Highlight Keywords: '사칭', '대출', '로맨스' in #003DFF
*/

const ScenarioCard = ({ textParts, onPress }: { textParts: { text: string, highlight?: boolean }[], onPress: () => void }) => (
    <Pressable style={styles.card} onPress={onPress}>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
                {textParts.map((part, index) => (
                    <Text key={index} style={part.highlight ? { color: '#003DFF' } : { color: '#111' }}>
                        {part.text}
                    </Text>
                ))}
            </Text>
            <Ionicons name="chevron-forward" size={24} color="#C4C4C4" />
        </View>
    </Pressable>
);

export default function GuideStepsListScreen() {
  const router = useRouter();

  const navigateToDetail = (type: string) => {
      router.push({ pathname: '/guide/detail_step', params: { type } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>범행 단계별 대응안</Text>
        <Ionicons name="search-outline" size={24} color="#111" />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
            <Ionicons name="chatbubble" size={24} color={Colors.primary} />
        </View>
        <Text style={styles.mainTitle}>
            궁금한 범행 종류를 선택해주세요.{'\n'}
            <Text style={styles.subTitle}>메뉴에 없는 내용은 채팅을 통해 작성해주세요.</Text>
        </Text>

        <View style={styles.cardList}>
            <ScenarioCard 
                textParts={[
                    { text: '기관, 지인을 ' },
                    { text: '사칭', highlight: true },
                    { text: '한 보이스피싱' }
                ]}
                onPress={() => navigateToDetail('impersonation')}
            />
            <ScenarioCard 
                textParts={[
                    { text: '대출', highlight: true },
                    { text: '을 빙자한 보이스피싱' }
                ]}
                onPress={() => navigateToDetail('loan')} 
            />
            <ScenarioCard 
                textParts={[
                    { text: '메신저를 통한 ' },
                    { text: '로맨스', highlight: true },
                    { text: '스캠' }
                ]}
                onPress={() => navigateToDetail('romance')}
            />
        </View>

        <View style={{ flex: 1 }} />
        
        <View style={{ marginTop: 40 }}>
            <TouchableOpacity style={styles.chatButton}>
                <Text style={styles.chatButtonText}>채팅 상담</Text>
            </TouchableOpacity>
        </View>

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
    padding: 24,
    flex: 1,
    paddingBottom: 40,
  },
  iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      marginTop: 20,
      gap: 8,
  },
  mainTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      lineHeight: 28,
      color: '#111',
  },
  subTitle: {
      fontSize: 14,
      fontWeight: 'normal',
      color: '#888',
  },
  cardList: {
      gap: 15,
      marginTop: 30,
  },
  card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
  },
  cardContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#111',
  },
  chatButton: {
      backgroundColor: '#2B5CFF', // Main Blue
      borderRadius: 16,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
  },
  chatButtonText: {
      color: Colors.white,
      fontSize: 18,
      fontWeight: 'bold',
  },
});
