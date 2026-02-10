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

type Step = { step: 1 | 2 | 3; text: string };

function getSteps(type: unknown): Step[] {
    const t = Array.isArray(type) ? type[0] : type;

    if (t === 'impersonation') {
        return [
            {
                step: 1,
                text: '검찰·경찰·금융기관을 사칭하며 “수사/보안”을 말해도, 전화를 끊고 먼저 침착하게 상황을 정리하세요.',
            },
            {
                step: 2,
                text: '기관 확인은 상대가 준 번호가 아니라 공식 대표번호(홈페이지/포털/안내문)로 다시 걸어 사실 여부를 확인하세요.',
            },
            {
                step: 3,
                text: '계좌 이체·현금 전달·앱 설치를 요구받았거나 이미 응했다면 즉시 112/금융사에 신고하고 지급정지를 요청하세요.',
            },
        ];
    }

    if (t === 'loan') {
        return [
            {
                step: 1,
                text: '대출을 빙자해 “수수료/보증금/선입금”을 요구하면 즉시 의심하고, 돈을 보내기 전 거래를 중단하세요.',
            },
            {
                step: 2,
                text: '대출 상담은 문자 링크가 아닌 공식 앱/공식 홈페이지에서 진행하고, 서류·계좌 안내는 대표번호로 재확인하세요.',
            },
            {
                step: 3,
                text: '이미 송금했다면 금융사에 지급정지를 요청하고, 대화/입금 내역을 보관해 112에 피해 신고하세요.',
            },
        ];
    }

    if (t === 'romance') {
        return [
            {
                step: 1,
                text: '로맨스 스캠은 빠르게 친밀감을 쌓고 “급한 사정”으로 돈·선물·송금을 요구합니다. 감정적 압박이 오면 멈추세요.',
            },
            {
                step: 2,
                text: '프로필·사진·영상통화는 조작될 수 있습니다. 신분·직업·사고 상황은 독립적으로 검증하고 개인정보 공유를 피하세요.',
            },
            {
                step: 3,
                text: '금전 요구/투자 권유/링크 유도 징후가 있으면 즉시 차단하고, 송금했다면 금융사·112에 신고해 추가 피해를 막으세요.',
            },
        ];
    }

    return [
        { step: 1, text: '의심스러운 연락은 즉시 대화를 멈추고, 링크 클릭/개인정보 제공을 피하세요.' },
        { step: 2, text: '사실 확인은 상대가 준 번호가 아닌 공식 채널을 통해 직접 확인하세요.' },
        { step: 3, text: '피해가 의심되면 112 및 해당 금융사에 신고하고 지급정지 등 조치를 요청하세요.' },
    ];
}

const StepItem = ({ item, isLast }: { item: Step, isLast: boolean }) => (
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
               {getSteps(type).map((step, index, arr) => (
                   <StepItem key={step.step} item={step} isLast={index === arr.length - 1} />
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
