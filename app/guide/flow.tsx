import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Line, Path, Svg } from 'react-native-svg';

const { width } = Dimensions.get('window');

const FlowNode = ({ text, x, y, width: w, height: h }: { text: string, x: number, y: number, width: number, height: number }) => {
    return (
        <View style={[styles.node, { left: x, top: y, width: w, height: h }]}>
            <Text style={styles.nodeText}>{text}</Text>
        </View>
    );
};

export default function GuideFlowScreen() {
  const router = useRouter();

  // Layout similar to previous but refined for "Bracket" look
  const cardW = 130; 
  const cardH = 60;
  const gapY = 60; 
  
  const cX = width / 2; 
  const leftX = width * 0.25 + 5;
  const rightX = width * 0.75 - 5;

  const y1 = 20; 
  const y2 = y1 + cardH + gapY; 
  const y3 = y2 + cardH + gapY; 
  const y4 = y3 + cardH + gapY; 
  const y5 = y4 + cardH + gapY; 
  const y6 = y5 + cardH + gapY; 
  const y7 = y6 + cardH + gapY; 

  const BLUE = '#2B5CFF';
  const CR = 10; // Corner Radius for brackets

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
           <Text style={styles.pageTitle}>궁금한 절차를 선택해주세요.</Text>

            <View style={{ height: 1000, marginTop: 20 }}>
                <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                     {/* 
                        Drawing "Bracket" style lines 
                     */}
                     
                     {/* 1. Merge: Trade (Left) & Victim (Right) -> Reported (Center) */}
                     {/* Line from Left Bottom to Center Top */}
                     <Path d={`M ${leftX} ${y1+cardH} v ${(gapY/2)-CR} a ${CR} ${CR} 0 0 0 ${CR} ${CR} h ${(cX-leftX)-(2*CR)} a ${CR} ${CR} 0 0 1 ${CR} ${CR} v ${(gapY/2)-CR}`} stroke={BLUE} strokeWidth="2" fill="none" />
                     {/* Line from Right Bottom to Center Top */}
                     <Path d={`M ${rightX} ${y1+cardH} v ${(gapY/2)-CR} a ${CR} ${CR} 0 0 1 -${CR} ${CR} h ${(cX-rightX)+(2*CR)} a ${CR} ${CR} 0 0 0 -${CR} ${CR} v ${(gapY/2)-CR}`} stroke={BLUE} strokeWidth="2" fill="none" />

                     {/* 2. Split: Reported (Center) -> Suspect Caught (Left) & Suspended (Right) */}
                     {/* Line from Center Bottom to Left Top */}
                     <Path d={`M ${cX} ${y2+cardH} v ${(gapY/2)-CR} a ${CR} ${CR} 0 0 1 -${CR} ${CR} h ${(leftX-cX)+(2*CR)} a ${CR} ${CR} 0 0 0 -${CR} ${CR} v ${(gapY/2)-CR}`} stroke={BLUE} strokeWidth="2" fill="none" />
                     {/* Line from Center Bottom to Right Top */}
                     <Path d={`M ${cX} ${y2+cardH} v ${(gapY/2)-CR} a ${CR} ${CR} 0 0 0 ${CR} ${CR} h ${(rightX-cX)-(2*CR)} a ${CR} ${CR} 0 0 1 ${CR} ${CR} v ${(gapY/2)-CR}`} stroke={BLUE} strokeWidth="2" fill="none" />

                     {/* 3. Branch: Suspect Caught (Left) -> Settlement (Left) & No Settlement (Right) */}
                     {/* Left -> Left (Straight down) */}
                     <Line x1={leftX} y1={y3+cardH} x2={leftX} y2={y4} stroke={BLUE} strokeWidth="2" />
                     {/* Left -> Right (Bracket across) */}
                     <Path d={`M ${leftX} ${y3+cardH} v 20 h ${rightX-leftX - CR} a ${CR} ${CR} 0 0 1 ${CR} ${CR} v ${gapY-20-CR}`} stroke={BLUE} strokeWidth="2" fill="none" />

                     {/* 4. Merge: Settlement (Left) & No Settlement (Right) -> Trial (Center) */}
                     <Path d={`M ${leftX} ${y4+cardH} v ${(gapY/2)-CR} a ${CR} ${CR} 0 0 0 ${CR} ${CR} h ${(cX-leftX)-(2*CR)} a ${CR} ${CR} 0 0 1 ${CR} ${CR} v ${(gapY/2)-CR}`} stroke={BLUE} strokeWidth="2" fill="none" />
                     <Path d={`M ${rightX} ${y4+cardH} v ${(gapY/2)-CR} a ${CR} ${CR} 0 0 1 -${CR} ${CR} h ${(cX-rightX)+(2*CR)} a ${CR} ${CR} 0 0 0 -${CR} ${CR} v ${(gapY/2)-CR}`} stroke={BLUE} strokeWidth="2" fill="none" />

                     {/* 5. Split: Trial (Center) -> Compensation (Left) & No Compensation (Right) */}
                     <Path d={`M ${cX} ${y5+cardH} v ${(gapY/2)-CR} a ${CR} ${CR} 0 0 1 -${CR} ${CR} h ${(leftX-cX)+(2*CR)} a ${CR} ${CR} 0 0 0 -${CR} ${CR} v ${(gapY/2)-CR}`} stroke={BLUE} strokeWidth="2" fill="none" />
                     <Path d={`M ${cX} ${y5+cardH} v ${(gapY/2)-CR} a ${CR} ${CR} 0 0 0 ${CR} ${CR} h ${(rightX-cX)-(2*CR)} a ${CR} ${CR} 0 0 1 ${CR} ${CR} v ${(gapY/2)-CR}`} stroke={BLUE} strokeWidth="2" fill="none" />

                     {/* 6. Straight: Compensation (Left) -> Enforcement (Left) */}
                     <Line x1={leftX} y1={y6+cardH} x2={leftX} y2={y7} stroke={BLUE} strokeWidth="2" />

                     {/* 7. Straight: No Compensation (Right) -> Litigation (Right) */}
                     <Line x1={rightX} y1={y6+cardH} x2={rightX} y2={y7} stroke={BLUE} strokeWidth="2" />

                     {/* 8. Arrow: Enforcement (Left) -> Litigation (Right) */}
                     <LinkArrow x1={leftX + cardW/2} y1={y7 + cardH/2} x2={rightX - cardW/2} y2={y7 + cardH/2} color={BLUE} />

                </Svg>

                {/* Level 1 */}
                <FlowNode text="거래를 하려는\n경우" x={leftX - cardW/2} y={y1} width={cardW} height={cardH} />
                <FlowNode text="피해를 당한\n경우" x={rightX - cardW/2} y={y1} width={cardW} height={cardH} />
                
                {/* Level 2 */}
                <FlowNode text="신고를 완료한\n경우" x={cX - cardW/2} y={y2} width={cardW} height={cardH} />

                {/* Level 3 */}
                <FlowNode text="용의자가 검거된\n경우" x={leftX - cardW/2} y={y3} width={cardW} height={cardH} />
                <FlowNode text="기소가 중지된\n경우" x={rightX - cardW/2} y={y3} width={cardW} height={cardH} />

                {/* Level 4 */}
                <FlowNode text="(용의자가) 합의를\n원하는 경우" x={leftX - cardW/2} y={y4} width={cardW} height={cardH} />
                <FlowNode text="(용의자가) 합의를\n원하지 않는 경우" x={rightX - cardW/2} y={y4} width={cardW} height={cardH} />

                {/* Level 5 */}
                <FlowNode text="재판" x={cX - cardW/2} y={y5} width={cardW} height={cardH} />

                {/* Level 6 */}
                <FlowNode text="배상명령 신청을 한\n경우" x={leftX - cardW/2} y={y6} width={cardW} height={cardH} />
                <FlowNode text="배상명령 신청을 못한\n경우" x={rightX - cardW/2} y={y6} width={cardW} height={cardH} />

                {/* Level 7 */}
                <FlowNode text="강제집행" x={leftX - cardW/2} y={y7} width={cardW} height={cardH} />
                <FlowNode text="민사소송" x={rightX - cardW/2} y={y7} width={cardW} height={cardH} />

            </View>
            
            <View style={{ marginTop: 20 }}>
                 <TouchableOpacity style={styles.chatButton}>
                   <Text style={styles.chatButtonText}>채팅 상담</Text>
                 </TouchableOpacity>
            </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Arrow Helper
const LinkArrow = ({ x1, y1, x2, y2, color }: { x1: number, y1: number, x2: number, y2: number, color: string }) => {
    return (
        <>
            <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" />
            <Path d={`M ${x2} ${y2} L ${x2-6} ${y2-4} L ${x2-6} ${y2+4} Z`} fill={color} />
        </>
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
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
      color: '#111',
  },
  node: {
      position: 'absolute',
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 2,
      padding: 5,
  },
  nodeText: {
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 12,
      lineHeight: 16,
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
