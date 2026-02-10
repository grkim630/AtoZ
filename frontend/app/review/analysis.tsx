import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';

const { width } = Dimensions.get('window');

// [STRICT DESIGN CONSTANTS]
const COLORS = {
    ROOT_BG: '#E5ECFF',
    CARD_BG: '#FFFFFF',
    PRIMARY_BLUE: '#0055FF',
    TEXT_DANGER: '#FF3B30',
    TEXT_MAIN: '#111111',
    TEXT_SUB: '#767676',
};

// 1. 게이지 차트 (Gauge Chart)
const GaugeChart = ({ score, total = 20 }: { score: number; total?: number }) => {
    const size = 180;
    const strokeWidth = 18;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = score / total;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View style={styles.gaugeContainer}>
            <Svg height={size} width={size}>
                <Circle cx={center} cy={center} r={radius} stroke="#EAEAEA" strokeWidth={strokeWidth} fill="none" />
                <Circle
                    cx={center} cy={center} r={radius}
                    stroke={COLORS.PRIMARY_BLUE} strokeWidth={strokeWidth} fill="none"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90" origin={`${center}, ${center}`}
                />
            </Svg>
            <View style={styles.gaugeTextWrapper}>
                <Text style={styles.gaugeLabel}>내 점수</Text>
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreValue}>{score}</Text>
                    <Text style={styles.scoreTotal}> / {total}</Text>
                </View>
            </View>
        </View>
    );
};

// 2. 레이더 차트 (Radar Chart)
const RadarChart = () => {
    const size = 240;
    const center = size / 2;
    const radius = 85;
    const axes = [
        { label: '긴급성/압박', value: 0.85, color: COLORS.PRIMARY_BLUE },
        { label: '금전 요구', value: 0.75, color: COLORS.PRIMARY_BLUE },
        { label: '상황 통제', value: 0.5, color: COLORS.TEXT_DANGER },
        { label: '링크 설치 유도', value: 0.9, color: COLORS.PRIMARY_BLUE },
        { label: '기관 사칭', value: 0.7, color: COLORS.TEXT_DANGER },
    ];

    const getPoint = (i: number, val: number) => {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        return {
            x: center + radius * val * Math.cos(angle),
            y: center + radius * val * Math.sin(angle),
        };
    };

    const dataPoints = axes.map((a, i) => `${getPoint(i, a.value).x},${getPoint(i, a.value).y}`).join(' ');
    const backgroundPoints = axes.map((_, i) => `${getPoint(i, 1).x},${getPoint(i, 1).y}`).join(' ');

    // 하단 바 계산 (상황 통제 표시)
    const situationControlIndex = 2;
    const barStart = getPoint(situationControlIndex, axes[situationControlIndex].value);
    const barEnd = getPoint((situationControlIndex + 1) % 5, axes[(situationControlIndex + 1) % 5].value);

    return (
        <View style={styles.radarWrapper}>
            <Svg height={size} width={size}>
                {/* 배경 오각형 */}
                <Polygon points={backgroundPoints} stroke="#EAEAEA" strokeWidth="1.5" fill="none" />
                
                {/* 데이터 오각형 */}
                <Polygon points={dataPoints} fill="rgba(0, 85, 255, 0.12)" stroke={COLORS.PRIMARY_BLUE} strokeWidth="2.5" />
                
                {/* 하단 바 (상황 통제) */}
                <Line 
                    x1={barStart.x} 
                    y1={barStart.y} 
                    x2={barEnd.x} 
                    y2={barEnd.y} 
                    stroke="#111111" 
                    strokeWidth="5" 
                    strokeLinecap="round"
                />
            </Svg>
            
            {/* 라벨들 */}
            <Text style={[styles.rLabel, { top: 5, alignSelf: 'center', color: COLORS.PRIMARY_BLUE }]}>긴급성/압박</Text>
            <Text style={[styles.rLabel, { top: '30%', right: -50, color: COLORS.PRIMARY_BLUE }]}>금전 요구</Text>
            <Text style={[styles.rLabel, { bottom: -5, right: -10, color: COLORS.TEXT_DANGER }]}>상황 통제</Text>
            <Text style={[styles.rLabel, { bottom: -5, left: -30, color: COLORS.PRIMARY_BLUE }]}>링크 설치 유도</Text>
            <Text style={[styles.rLabel, { top: '30%', left: -40, color: COLORS.TEXT_DANGER }]}>기관 사칭</Text>
        </View>
    );
};

export default function ReviewScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>점수 분석</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color="#111" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* 카드 1: 분석 결과 */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>시시콜콜님의 <Text style={styles.blueBold}>분석 결과</Text>입니다.</Text>
                    <GaugeChart score={17} />
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryMain}>시시콜콜님은 <Text style={styles.blueBold}>'대응 고수'</Text>시네요!</Text>
                        <Text style={styles.summarySub}>평균 대비 <Text style={styles.blueText}>24%</Text> 잘 대처했어요.</Text>
                    </View>
                    <TouchableOpacity style={styles.blueButton} onPress={() => router.push('/guide/category')}>
                        <Text style={styles.btnText}>대응안 확인하기</Text>
                    </TouchableOpacity>
                </View>

                {/* 카드 2: 세부 분석 내용 */}
                <View style={styles.card}>
                    <Text style={styles.detailTitle}>세부 분석 내용</Text>
                    <Text style={styles.detailSubText}>세부 항목에 대한 대처 점수예요.</Text>
                    <RadarChart />
                </View>
            </ScrollView>
            
            {/* 하단 탭바 */}
            <View style={styles.bottomTab}>
                {['메인 홈', '커뮤니티', '피싱 뉴스', '피싱 갤러리', '마이 페이지'].map((label, i) => (
                    <View key={i} style={styles.tabItem}>
                        <Ionicons 
                            name={['home-outline', 'chatbubble-outline', 'megaphone-outline', 'folder-open', 'person-outline'][i] as any} 
                            size={24} 
                            color={i === 3 ? COLORS.PRIMARY_BLUE : '#CCC'} 
                        />
                        <Text style={[styles.tabLabel, i === 3 && { color: COLORS.PRIMARY_BLUE }]}>{label}</Text>
                    </View>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.ROOT_BG },
    header: { 
        height: 60, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20 
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.TEXT_MAIN },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 110 },
    card: {
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 32,
        paddingVertical: 35,
        paddingHorizontal: 24,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000', 
        shadowOpacity: 0.05, 
        shadowRadius: 20, 
        shadowOffset: { width: 0, height: 10 },
    },
    cardTitle: { fontSize: 20, fontWeight: '700', marginBottom: 30, textAlign: 'center' },
    blueBold: { color: COLORS.PRIMARY_BLUE, fontWeight: '700' },
    blueText: { color: COLORS.PRIMARY_BLUE, fontWeight: '600' },
    gaugeContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
    gaugeTextWrapper: { position: 'absolute', alignItems: 'center' },
    gaugeLabel: { fontSize: 13, color: COLORS.TEXT_SUB, marginBottom: 4 },
    scoreRow: { flexDirection: 'row', alignItems: 'baseline' },
    scoreValue: { fontSize: 40, fontWeight: 'bold', color: COLORS.PRIMARY_BLUE },
    scoreTotal: { fontSize: 20, color: '#999' },
    summaryBox: { alignItems: 'center', marginBottom: 30 },
    summaryMain: { fontSize: 18, marginBottom: 6, fontWeight: '600' },
    summarySub: { fontSize: 15, color: COLORS.TEXT_SUB },
    blueButton: { 
        backgroundColor: COLORS.PRIMARY_BLUE, 
        width: '100%', 
        paddingVertical: 18, 
        borderRadius: 16, 
        alignItems: 'center' 
    },
    btnText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
    detailTitle: { 
        fontSize: 20, 
        fontWeight: '700', 
        marginBottom: 8, 
        alignSelf: 'flex-start' 
    },
    detailSubText: { 
        fontSize: 14, 
        color: COLORS.TEXT_SUB, 
        marginBottom: 40, 
        alignSelf: 'flex-start' 
    },
    radarWrapper: { 
        width: 240, 
        height: 240, 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'relative',
        marginVertical: 10
    },
    rLabel: { 
        position: 'absolute', 
        fontSize: 12, 
        fontWeight: '600',
        textAlign: 'center'
    },
    bottomTab: { 
        flexDirection: 'row',
        height: 90,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 25, 
    },
    tabItem: { alignItems: 'center', justifyContent: 'center' },
    tabLabel: { fontSize: 10, marginTop: 4, color: '#CCC' },
});