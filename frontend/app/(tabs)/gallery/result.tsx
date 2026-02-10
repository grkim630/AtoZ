// app/gallery/result.tsx

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { getSimulationOutcome } from '@/src/services/simulationOutcomeStore';

const COLORS = {
    ROOT_BG: '#E5ECFF',      // 피그마 배경색
    CARD_BG: '#FFFFFF',
    PRIMARY_BLUE: '#0055FF', //
    TEXT_DANGER: '#FF3B30',  //
    TEXT_SUB: '#767676',
};

// 1. 게이지 차트 컴포넌트
const GaugeChart = ({
    scorePercent,
    label,
}: {
    scorePercent: number;
    label: 'phishing' | 'normal';
}) => (
    <View style={styles.gaugeContainer}>
        <Svg height="180" width="180">
            <Circle cx="90" cy="90" r="70" stroke="#EAEAEA" strokeWidth="18" fill="none" />
            <Circle 
                cx="90" cy="90" r="70" stroke={label === 'phishing' ? COLORS.TEXT_DANGER : '#34C759'} strokeWidth="18" fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`} strokeDashoffset={`${2 * Math.PI * 70 * (1 - scorePercent / 100)}`}
                strokeLinecap="round" rotation="-90" origin="90, 90"
            />
        </Svg>
        <View style={styles.gaugeTextWrapper}>
            <Text style={{ fontSize: 14, color: COLORS.TEXT_SUB }}>위험도</Text>
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: label === 'phishing' ? COLORS.TEXT_DANGER : '#34C759' }}>{scorePercent}<Text style={{ fontSize: 18, color: '#999' }}>%</Text></Text>
        </View>
    </View>
);

// 2. 레이더 차트 컴포넌트
const RadarChart = () => (
    <View style={styles.radarWrapper}>
        <Svg height="220" width="220">
            <Polygon points="110,35 180,85 155,165 65,165 40,85" stroke="#EAEAEA" fill="none" />
            <Polygon points="110,45 170,95 145,145 75,155 55,95" fill="rgba(0, 85, 255, 0.15)" stroke={COLORS.PRIMARY_BLUE} strokeWidth="2" />
        </Svg>
        <Text style={[styles.rLabel, { top: -10, color: COLORS.PRIMARY_BLUE }]}>긴급성/압박</Text>
        <Text style={[styles.rLabel, { top: '35%', right: -45, color: COLORS.PRIMARY_BLUE }]}>금전 요구</Text>
        <Text style={[styles.rLabel, { bottom: 0, right: -15, color: COLORS.TEXT_DANGER }]}>상황 통제</Text>
        <Text style={[styles.rLabel, { bottom: 0, left: -15, color: COLORS.PRIMARY_BLUE }]}>링크 설치 유도</Text>
        <Text style={[styles.rLabel, { top: '35%', left: -45, color: COLORS.TEXT_DANGER }]}>기관 사칭</Text>
    </View>
);

export default function ResultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ outcome?: string }>();
    const outcomeParam = (params.outcome ?? 'unknown').toString();
    const outcome = outcomeParam !== 'unknown' ? outcomeParam : getSimulationOutcome();

    const { label, riskScore } = useMemo(() => {
        const randomInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        // 통화 체험 결과 기반 위험도:
        // - 성공(안 걸림): 0~30
        // - 실패(걸림): 70~90
        if (outcome === 'success') return { label: 'normal' as const, riskScore: randomInt(0, 30) };
        if (outcome === 'failure') return { label: 'phishing' as const, riskScore: randomInt(70, 90) };

        // 강제 종료 등으로 불명확할 때도 "업로드 분석 점수"를 재사용하지 않음
        const mid = randomInt(30, 60);
        return { label: mid >= 60 ? ('phishing' as const) : ('normal' as const), riskScore: mid };
    }, [outcome]);

    const scoreTone = label === 'phishing' ? COLORS.TEXT_DANGER : '#34C759';

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* 상단 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="chevron-back" size={28} color="#111" /></TouchableOpacity>
                <Text style={styles.headerTitle}>점수 분석</Text>
                <TouchableOpacity onPress={() => router.replace('/gallery')}><Ionicons name="close" size={28} color="#111" /></TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* 결과 카드 */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>시시콜콜님의 <Text style={styles.blueBold}>분석 결과</Text>입니다.</Text>
                    <GaugeChart scorePercent={riskScore} label={label} />
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryMain}>
                            현재 상태: <Text style={{ color: scoreTone, fontWeight: 'bold' }}>{label === 'phishing' ? '위험' : '안전'}</Text>
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.blueButton} onPress={() => router.push('/guide/category')}>
                        <Text style={styles.btnText}>대응안 확인하기</Text>
                    </TouchableOpacity>
                </View>

                {/* 세부 분석 카드 */}
                <View style={styles.card}>
                    <Text style={styles.detailTitle}>세부 분석 내용</Text>
                    <Text style={styles.detailSub}>위험도 분석 결과를 기반으로 표시됩니다.</Text>
                    <RadarChart />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.ROOT_BG },
    header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 110 }, // 탭 바 높이만큼 하단 여백 추가
    card: { backgroundColor: COLORS.CARD_BG, borderRadius: 32, paddingVertical: 35, paddingHorizontal: 24, alignItems: 'center', marginBottom: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
    cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 30 },
    blueBold: { color: COLORS.PRIMARY_BLUE, fontWeight: 'bold' },
    gaugeContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
    gaugeTextWrapper: { position: 'absolute', alignItems: 'center' },
    scoreValue: { fontSize: 40, fontWeight: 'bold', color: COLORS.PRIMARY_BLUE },
    summaryBox: { alignItems: 'center', marginBottom: 30 },
    summaryMain: { fontSize: 18, marginBottom: 6 },
    summarySub: { fontSize: 15, color: COLORS.TEXT_SUB },
    blueButton: { backgroundColor: COLORS.PRIMARY_BLUE, width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
    btnText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
    detailTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, alignSelf: 'flex-start' },
    detailSub: { fontSize: 14, color: COLORS.TEXT_SUB, marginBottom: 40, alignSelf: 'flex-start' },
    radarWrapper: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    rLabel: { position: 'absolute', fontSize: 12, fontWeight: 'bold' },
});