import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS = [
    {
        step: 1,
        title: '신고 및 지급 정지 신청',
        description: '가장 먼저 경찰(112) 또는 금융감독원(1332)에 연락해 범죄 사실을 알리세요.',
        highlight: '112, 1332',
    },
    {
        step: 2,
        title: '피해 구제 신청',
        description: '관련 금융기관에 방문하여 피해 구제 신청서를 작성하고 제출하세요.',
        highlight: '금융기관 방문',
    },
    {
        step: 3,
        title: '개인정보 노출 등록',
        description: '금융감독원 파인(FINE) 사이트에서 개인정보 노출 사실을 등록해 추가 피해를 막으세요.',
        highlight: '파인(FINE)',
    },
];

const StepItem = ({ item, isLast }: { item: typeof STEPS[0], isLast: boolean }) => (
    <View style={styles.stepContainer}>
        {/* Timeline */}
        <View style={styles.timelineContainer}>
            <View style={styles.circle}>
                <Text style={styles.stepNum}>{item.step}</Text>
            </View>
            {!isLast && <View style={styles.line} />}
        </View>
        
        {/* Content Card */}
        <View style={styles.cardContainer}>
             <View style={styles.card}>
                 <Text style={styles.cardTitle}>{item.title}</Text>
                 <Text style={styles.cardDesc}>
                     {item.description}
                 </Text>
             </View>
        </View>
    </View>
);

export default function GuideStepScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams();

  const getTitle = () => {
      if (type === 'impersonation') return '기관 사칭형';
      if (type === 'loan') return '대출 빙자형';
      if (type === 'romance') return '로맨스 스캠';
      return '범행 단계별';
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()} 대응안</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
           <Text style={styles.introText}>
               이미 피해가 발생했다면,{'\n'}
               <Text style={{ fontWeight: 'bold', color: Colors.primary }}>아래 순서대로</Text> 행동해주세요.
           </Text>

           <View style={styles.list}>
               {STEPS.map((step, index) => (
                   <StepItem key={step.step} item={step} isLast={index === STEPS.length - 1} />
               ))}
           </View>
           
           <TouchableOpacity 
                style={styles.flowButton}
                onPress={() => router.push('/gallery/guide_flow')}
           >
                <Text style={styles.flowButtonText}>상황별 흐름도 보기 (Flowchart)</Text>
                <Ionicons name="git-network-outline" size={20} color={Colors.white} />
           </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
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
    borderBottomColor: '#F2F2F2',
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
      paddingBottom: 40,
  },
  introText: {
      fontSize: 20,
      lineHeight: 30,
      marginBottom: 30,
      color: '#111',
  },
  list: {
      marginTop: 10,
  },
  stepContainer: {
      flexDirection: 'row',
      marginBottom: 0, 
  },
  timelineContainer: {
      alignItems: 'center',
      width: 40,
      marginRight: 10,
  },
  circle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: Colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
  },
  stepNum: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
  },
  line: {
      width: 2,
      flex: 1,
      backgroundColor: '#E5E5EA',
      marginVertical: 4,
  },
  cardContainer: {
      flex: 1,
      paddingBottom: 30, // Space between items
  },
  card: {
      backgroundColor: '#F8F9FA',
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: '#F2F2F2',
  },
  cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#111',
  },
  cardDesc: {
      fontSize: 14,
      color: '#555',
      lineHeight: 22,
  },
  flowButton: {
      marginTop: 30,
      backgroundColor: '#111',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
  },
  flowButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  },
});
