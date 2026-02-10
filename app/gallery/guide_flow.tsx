import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Line, Svg } from 'react-native-svg';

const { width } = Dimensions.get('window');

const FlowNode = ({ text, type = 'question', x, y, width: w, height: h }: { text: string, type?: 'question' | 'action' | 'end', x: number, y: number, width: number, height: number }) => {
    const bgColor = type === 'question' ? '#FFFFFF' : type === 'action' ? '#E8F0FE' : '#FFE8E8';
    const borderColor = type === 'question' ? '#2B5CFF' : type === 'action' ? '#2B5CFF' : '#FF4D4D';
    const textColor = type === 'question' ? '#111' : type === 'action' ? '#2B5CFF' : '#D32F2F';

    return (
        <View style={[styles.node, { left: x, top: y, width: w, height: h, backgroundColor: bgColor, borderColor }]}>
            <Text style={[styles.nodeText, { color: textColor }]}>{text}</Text>
        </View>
    );
};

export default function GuideFlowScreen() {
  const router = useRouter();

  const nodeWidth = 140;
  const nodeHeight = 60;
  const cX = width / 2 - nodeWidth / 2; // Center X

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>상황별 흐름도</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
           <Text style={styles.introText}>
               <Text style={{ fontWeight: 'bold', color: Colors.primary }}>YES / NO</Text>로 따라가며{'\n'}
               내 상황에 맞는 대처법을 확인하세요.
           </Text>

            <View style={{ height: 600, marginTop: 20 }}>
                <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                     {/* Lines */}
                     {/* Start -> Q1 */}
                     <Line x1={width/2} y1={60} x2={width/2} y2={100} stroke="#C4C4C4" strokeWidth="2" />
                     
                     {/* Q1 -> Yes (Left) / No (Right) */}
                     <Line x1={width/2} y1={160} x2={width/2} y2={180} stroke="#C4C4C4" strokeWidth="2" />
                     <Line x1={width/2} y1={180} x2={width/4 + 35} y2={180} stroke="#C4C4C4" strokeWidth="2" />
                     <Line x1={width/2} y1={180} x2={width*3/4 - 35} y2={180} stroke="#C4C4C4" strokeWidth="2" />
                     <Line x1={width/4 + 35} y1={180} x2={width/4 + 35} y2={210} stroke="#C4C4C4" strokeWidth="2" />
                     <Line x1={width*3/4 - 35} y1={180} x2={width*3/4 - 35} y2={210} stroke="#C4C4C4" strokeWidth="2" />

                     {/* Q2 (Left) -> Action */}
                     <Line x1={width/4 + 35} y1={270} x2={width/4 + 35} y2={310} stroke="#C4C4C4" strokeWidth="2" />

                     {/* Q2 (Right) -> End */}
                     <Line x1={width*3/4 - 35} y1={270} x2={width*3/4 - 35} y2={310} stroke="#C4C4C4" strokeWidth="2" />
                </Svg>

                {/* Nodes */}
                <FlowNode text="출처가 불분명한\n연락인가요?" x={cX} y={0} width={nodeWidth} height={nodeHeight} />
                
                <View style={{ position: 'absolute', top: 75, left: width/2 + 5 }}><Text style={styles.arrowText}>시작</Text></View>

                <FlowNode text="돈이나 개인정보를\n요구하나요?" x={cX} y={100} width={nodeWidth} height={nodeHeight} />

                <View style={{ position: 'absolute', top: 170, left: width/4 + 20 }}><Text style={styles.arrowText}>YES</Text></View>
                <View style={{ position: 'absolute', top: 170, right: width/4 + 20 }}><Text style={styles.arrowText}>NO</Text></View>

                <FlowNode text="즉시 끊고\n번호 차단" type="action" x={width/4 - nodeWidth/2 + 35} y={210} width={nodeWidth} height={nodeHeight} />
                <FlowNode text="일단 의심하고\n확인 전화" type="action" x={width*3/4 - nodeWidth/2 - 35} y={210} width={nodeWidth} height={nodeHeight} />

                <FlowNode text="이미 송금했나요?" x={width/4 - nodeWidth/2 + 35} y={310} width={nodeWidth} height={nodeHeight} />
                
                <Line x1={width/4 + 35} y1={370} x2={width/4 + 35} y2={410} stroke="#C4C4C4" strokeWidth="2" />
                 <View style={{ position: 'absolute', top: 380, left: width/4 + 40 }}><Text style={styles.arrowText}>YES</Text></View>
                
                <FlowNode text="즉시 112 신고 및\n계좌 지급정지" type="end" x={width/4 - nodeWidth/2 + 35} y={410} width={nodeWidth} height={nodeHeight} />

            </View>

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
      textAlign: 'center',
  },
  node: {
      position: 'absolute',
      borderRadius: 12,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  nodeText: {
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 13,
      lineHeight: 18,
  },
  arrowText: {
      fontSize: 12,
      color: '#666',
      fontWeight: '600',
      backgroundColor: 'white',
      paddingHorizontal: 4,
  },
});
