import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const GuideCard = ({ title, highlight, icon, onPress }: { title: string, highlight: string, icon: any, onPress: () => void }) => (
    <Pressable style={styles.card} onPress={onPress}>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
                {title} <Text style={{ color: Colors.primary }}>{highlight}</Text>
            </Text>
            <Ionicons name="chevron-forward" size={24} color="#C4C4C4" />
        </View>
    </Pressable>
);

export default function GuideScreen() {
  const router = useRouter();

  const navigateToStep = (type: string) => {
      router.push({ pathname: '/gallery/guide_step', params: { type } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>범행 단계별 대응안</Text>
        <View style={{ width: 24 }} />
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
            <GuideCard 
                title="기관, 지인을 " 
                highlight="사칭한 보이스피싱" 
                icon="people-circle" 
                onPress={() => navigateToStep('impersonation')}
            />
            <GuideCard 
                title="" 
                highlight="대출을 빙자한 보이스피싱" 
                icon="cash" 
                onPress={() => navigateToStep('loan')} 
            />
            <GuideCard 
                title="메신저를 통한 " 
                highlight="로맨스스캠" 
                icon="heart" 
                onPress={() => navigateToStep('romance')}
            />
        </View>

        <View style={{ flex: 1 }} />
        
        <Pressable style={styles.chatButton}>
            <Text style={styles.chatButtonText}>채팅 상담</Text>
        </Pressable>

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
  backBtn: {
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
      marginTop: 20,
  },
  card: {
      backgroundColor: Colors.white,
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: '#EFEFEF',
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
      marginTop: 40,
      width: '100%',
  },
  chatButtonText: {
      color: Colors.white,
      fontSize: 18,
      fontWeight: 'bold',
  },
});
