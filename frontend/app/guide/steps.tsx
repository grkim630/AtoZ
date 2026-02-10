import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// [STRICT DESIGN CONSTANTS]
const COLORS = {
  ROOT_BG: '#E5ECFF',      //
  CARD_BG: '#FFFFFF',
  BOX_BG: '#F4F8FF',       //
  PRIMARY_BLUE: '#0055FF', //
  TEXT_MAIN: '#111111',
  TEXT_SUB: '#444444',
};

const LINE_WIDTH = 1.5; // 선 두께 통일

const StepBox = ({ text, style, isBlueText = false }: { text: string; style?: any; isBlueText?: boolean }) => (
  <TouchableOpacity style={[styles.stepBox, style]} activeOpacity={0.8}>
    <Text style={[styles.stepText, isBlueText && styles.blueText]}>{text}</Text>
  </TouchableOpacity>
);

// 선 겹침 방지를 위해 단일 View 구조로 재설계된 커넥터
const Connector = ({ type }: { type: 'merge' | 'split' | 'subSplit' | 'subMerge' | 'straight' }) => {
  if (type === 'merge') {
    return (
      <View style={styles.connectorHeight}>
        <View style={styles.lineLeftMerge} />
        <View style={styles.lineRightMerge} />
        <View style={styles.lineStemDown} />
      </View>
    );
  }
  if (type === 'split') {
    return (
      <View style={styles.connectorHeight}>
        <View style={styles.lineStemUp} />
        <View style={styles.lineLeftSplit} />
        <View style={styles.lineRightSplit} />
      </View>
    );
  }
  return <View style={styles.connectorHeight}><View style={styles.vLine} /></View>;
};

export default function GuideStepsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_MAIN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>범행 단계별 대응안</Text>
        <Ionicons name="search-outline" size={24} color={COLORS.TEXT_MAIN} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.subHeader}>
          <Ionicons name="chatbubble" size={20} color={COLORS.PRIMARY_BLUE} />
          <Text style={styles.subHeaderText}>궁금한 절차를 선택해주세요.</Text>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.flowchart}>
            <View style={styles.row}><StepBox text={`거래를 하려는\n경우`} style={styles.halfBox} /><StepBox text={`피해를 당한\n경우`} style={styles.halfBox} /></View>
            <Connector type="merge" />
            <View style={styles.row}><StepBox text={`신고를 완료한\n경우`} style={styles.centerBox} isBlueText={true} /></View>
            <Connector type="split" />
            <View style={styles.row}><StepBox text={`용의자가 검거된\n경우`} style={styles.halfBox} /><StepBox text={`기소가 중지된\n경우`} style={styles.halfBox} /></View>
            
            {/* 용의자 검거 -> 합의 분기선 보정 */}
            <View style={styles.connectorHeight}>
                <View style={[styles.lineStemUp, { left: '24%' }]} />
                <View style={[styles.lineLeftSplit, { left: '24%', width: '26%', borderTopLeftRadius: 0 }]} />
                <View style={[styles.lineRightSplit, { left: '50%', right: '24%' }]} />
            </View>

            <View style={styles.row}><StepBox text={`(용의자가) 합의를\n원하는 경우`} style={styles.halfBox} /><StepBox text={`(용의자가) 합의를\n원하지 않는 경우`} style={styles.halfBox} /></View>
            
            {/* 합의 -> 재판 병합선 보정 */}
            <View style={styles.connectorHeight}>
                 <View style={[styles.lineLeftMerge, { left: '24%', width: '26%', borderBottomLeftRadius: 0 }]} />
                 <View style={[styles.lineRightMerge, { left: '50%', right: '24%' }]} />
                 <View style={[styles.lineStemDown, { left: '24%' }]} />
            </View>

            <View style={styles.row}><StepBox text="재판" style={styles.fullBox} isBlueText={true} /></View>
            <Connector type="split" />
            <View style={styles.row}><StepBox text={`배상명령 신청을 한\n경우`} style={styles.halfBox} /><StepBox text={`배상명령 신청을 못한\n경우`} style={styles.halfBox} /></View>
            <View style={styles.connectorHeight}><View style={[styles.vLine, { left: '24%' }]} /><View style={[styles.vLine, { right: '24%' }]} /></View>
            <View style={styles.row}>
              <StepBox text="강제집행" style={styles.halfBox} />
              <View style={styles.arrowIcon}><Ionicons name="arrow-forward" size={20} color={COLORS.PRIMARY_BLUE} /></View>
              <StepBox text="민사소송" style={styles.halfBox} />
            </View>
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkButtonText}>채팅 상담</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.PRIMARY_BLUE} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ROOT_BG },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.TEXT_MAIN },
  backButton: { padding: 4 },
  subHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 4, marginTop: 10 },
  subHeaderText: { fontSize: 16, fontWeight: 'bold', color: COLORS.TEXT_MAIN, marginLeft: 8 },
  scrollContent: { paddingHorizontal: 16 },
  mainCard: { backgroundColor: COLORS.CARD_BG, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 32, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  flowchart: { alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' },
  stepBox: { backgroundColor: COLORS.BOX_BG, borderRadius: 16, paddingVertical: 18, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center', minHeight: 74 },
  halfBox: { width: '48%' },
  centerBox: { width: '64%', alignSelf: 'center' },
  fullBox: { width: '100%' },
  stepText: { fontSize: 15, fontWeight: '600', color: COLORS.TEXT_SUB, textAlign: 'center', lineHeight: 22 },
  blueText: { color: COLORS.PRIMARY_BLUE, fontWeight: 'bold' },

  // [겹침 해결 핵심 스타일]
  connectorHeight: { height: 40, width: '100%', position: 'relative', marginVertical: -2 },
  
  // 가로선과 세로선이 만나는 지점을 zIndex와 정밀 좌표로 조정
  lineLeftMerge: { position: 'absolute', top: 0, left: '24%', right: '50%', height: 20, borderLeftWidth: LINE_WIDTH, borderBottomWidth: LINE_WIDTH, borderBottomLeftRadius: 12, borderColor: COLORS.PRIMARY_BLUE },
  lineRightMerge: { position: 'absolute', top: 0, right: '24%', left: '50%', height: 20, borderRightWidth: LINE_WIDTH, borderBottomWidth: LINE_WIDTH, borderBottomRightRadius: 12, borderColor: COLORS.PRIMARY_BLUE },
  lineStemDown: { position: 'absolute', top: 20, left: '50%', width: LINE_WIDTH, height: 20, backgroundColor: COLORS.PRIMARY_BLUE, marginLeft: -LINE_WIDTH / 2 },
  lineStemUp: { position: 'absolute', top: 0, left: '50%', width: LINE_WIDTH, height: 20, backgroundColor: COLORS.PRIMARY_BLUE, marginLeft: -LINE_WIDTH / 2 },
  lineLeftSplit: { position: 'absolute', top: 20, left: '24%', right: '50%', height: 20, borderLeftWidth: LINE_WIDTH, borderTopWidth: LINE_WIDTH, borderTopLeftRadius: 12, borderColor: COLORS.PRIMARY_BLUE },
  lineRightSplit: { position: 'absolute', top: 20, right: '24%', left: '50%', height: 20, borderRightWidth: LINE_WIDTH, borderTopWidth: LINE_WIDTH, borderTopRightRadius: 12, borderColor: COLORS.PRIMARY_BLUE },
  
  vLine: { position: 'absolute', top: 0, bottom: 0, width: LINE_WIDTH, backgroundColor: COLORS.PRIMARY_BLUE, marginLeft: -LINE_WIDTH / 2 },
  arrowIcon: { position: 'absolute', left: '50%', marginLeft: -10 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 34, paddingTop: 20, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center' },
  linkButton: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  linkButtonText: { color: COLORS.PRIMARY_BLUE, fontSize: 18, fontWeight: 'bold' },
});