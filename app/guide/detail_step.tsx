import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* 
  Guide Detail Step Screen:
  Vertical timeline view of steps.
  Matches Image 14.22.16 ref.
*/

const STEPS = [
    {
        step: 1,
        text: '인터넷으로 대출 신청시에는 해당 업체 사이트에 등록번호·전화 번호·주소 등이 명확히 기재되어 있는지 확인하세요.',
    },
    {
        step: 2,
        text: '금감원 홈페이지를 통해 제도권 금융회사 여부를 반드시 조회하세요.',
    },
    {
        step: 3,
        text: '피해가 발생했다면, 경찰(112), 금감원(1332), 금융회사에 전화해 신속히 피해신고 및 지급정지를 요청해주세요.',
    },
];

const StepItem = ({ item, isLast }: { item: typeof STEPS[0], isLast: boolean }) => (
    <View style={styles.stepContainer}>
        {/* Timeline Side */}
        <View style={styles.timelineContainer}>
            <View style={styles.circle}>
                <Text style={styles.stepNum}>{item.step}</Text>
            </View>
            {!isLast && <View style={styles.line} />}
        </View>
        
        {/* Content Side */}
        <View style={[styles.cardContainer, isLast && { paddingBottom: 0 }]}>
             <View style={styles.card}>
                 <Text style={styles.cardDesc}>
                     {item.text}
                 </Text>
             </View>
        </View>
    </View>
);

export default function GuideDetailStepScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams();

  const getTitle = () => {
      // Dynamic Title based on param, mimicking screenshot logic
      if (type === 'impersonation') return '기관 사칭형';
      if (type === 'loan') return '대출 빙자형';
      if (type === 'romance') return '로맨스 스캠';
      return '대출을 빙자한 소액'; // Default as per screenshot 14.15.22
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
           
           <Text style={styles.pageTitle}>
               <Text style={{ color: Colors.primary }}>{getTitle()}</Text> 보이스피싱
           </Text>

           <View style={styles.list}>
               {STEPS.map((step, index) => (
                   <StepItem key={step.step} item={step} isLast={index === STEPS.length - 1} />
               ))}
           </View>
            
           {/* Fixed Bottom Button */}
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
      paddingBottom: 40,
  },
  iconContainer: {
      marginBottom: 10,
      marginTop: 20,
      alignItems: 'center',
  },
  pageTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 40,
      color: '#111',
  },
  list: {
      marginTop: 10,
  },
  stepContainer: {
      flexDirection: 'row',
  },
  timelineContainer: {
      alignItems: 'center',
      width: 50,
  },
  circle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#2B5CFF', // Blue Circle
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
  },
  stepNum: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 18,
  },
  line: {
      width: 2,
      flex: 1,
      backgroundColor: '#2B5CFF', // Blue Line
      marginVertical: 0,
  },
  cardContainer: {
      flex: 1,
      paddingBottom: 30, 
      paddingLeft: 10,
  },
  card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
      justifyContent: 'center',
      minHeight: 80,
  },
  cardDesc: {
      fontSize: 15,
      color: '#111',
      lineHeight: 22,
      fontWeight: '500',
  },
  chatButton: {
      backgroundColor: '#2B5CFF', 
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
