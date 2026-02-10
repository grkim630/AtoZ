import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Circle, Line, Path, Polygon, Svg, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

// --- Gauge Chart Component ---
const GaugeChart = ({ score }: { score: number }) => {
    const radius = 80;
    const strokeWidth = 25; // Thicker stroke
    const center = radius + strokeWidth;
    const circumference = Math.PI * radius; // Half circle
    const progress = (score / 20) * circumference;

    return (
        <View style={{ alignItems: 'center', marginVertical: 30 }}>
            <Svg width={center * 2} height={center + 10}>
                {/* Background Arc */}
                <Path
                    d={`M${strokeWidth},${center} A${radius},${radius} 0 0,1 ${center * 2 - strokeWidth},${center}`}
                    fill="none"
                    stroke="#E5E8EB" // Lighter gray
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                {/* Progress Arc */}
                <Path
                    d={`M${strokeWidth},${center} A${radius},${radius} 0 0,1 ${center * 2 - strokeWidth},${center}`}
                    fill="none"
                    stroke="#2B5CFF"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${progress}, ${circumference}`}
                />
                {/* Score Text */}
                <SvgText
                    x={center}
                    y={center - 15}
                    textAnchor="middle"
                    fill="#111"
                    fontSize="40"
                    fontWeight="bold"
                >
                    {score}점
                </SvgText>
                <SvgText
                     x={center}
                     y={center + 15}
                     textAnchor="middle"
                     fill="#666"
                     fontSize="15"
                     fontWeight="500"
                >
                    / 20점
                </SvgText>
            </Svg>
        </View>
    );
};

// --- Radar Chart Component ---
const RadarChart = () => {
    const size = 280;
    const center = size / 2;
    const radius = 90;
    const axes = 5;
    const angleSlice = (Math.PI * 2) / axes;

    // Helper to get coordinates
    const getCoordinates = (index: number, r: number) => {
        const angle = index * angleSlice - Math.PI / 2; // Start from top
        return [
            center + Math.cos(angle) * r,
            center + Math.sin(angle) * r
        ];
    };

    // Calculate Pentagon Points (Background)
    const levels = 4;
    const gridPoints = [];
    for (let i = 1; i <= levels; i++) {
        const r = (radius / levels) * i;
        const points = [];
        for (let j = 0; j < axes; j++) {
            points.push(getCoordinates(j, r).join(','));
        }
        gridPoints.push(points.join(' '));
    }

    // Mock Data (Score out of 100%)
    const scores = [0.8, 0.7, 0.9, 0.6, 0.8]; // Example scores
    const dataCoordinates = scores.map((s, i) => getCoordinates(i, radius * s));
    const dataPointsStr = dataCoordinates.map(p => p.join(',')).join(' ');

    const labels = ["긴급성/압박", "금전 요구", "기관 사칭", "개인정보", "기타 요소"];
    const labelRadius = radius + 25;

    return (
        <View style={{ alignItems: 'center', marginTop: 10, height: 300 }}>
             <Svg width={size} height={size}>
                 {/* Background Grids */}
                 {gridPoints.map((points, i) => (
                      <Polygon 
                        key={i} 
                        points={points} 
                        fill={i === levels - 1 ? "#FAFAFA" : "none"} 
                        stroke="#E0E0E0" 
                        strokeWidth="1" 
                      />
                 ))}
                 
                 {/* Axis Lines */}
                 {Array.from({ length: axes }).map((_, i) => {
                     const [x, y] = getCoordinates(i, radius);
                     return <Line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#E0E0E0" strokeWidth="1" />;
                 })}
                 
                 {/* Data Polygon */}
                 <Polygon 
                    points={dataPointsStr} 
                    fill="rgba(43, 92, 255, 0.2)" 
                    stroke="#2B5CFF" 
                    strokeWidth="2" 
                 />
                 {/* Data Points (Dots) */}
                 {dataCoordinates.map(([x, y], i) => (
                     <Circle key={i} cx={x} cy={y} r="4" fill="#2B5CFF" />
                 ))}

                 {/* Labels */}
                 {labels.map((label, i) => {
                    const [x, y] = getCoordinates(i, labelRadius);
                    return (
                        <SvgText
                            key={i}
                            x={x}
                            y={y + 4} // Optical adjustment
                            textAnchor="middle"
                            fill="#666"
                            fontSize="12"
                            fontWeight="600"
                        >
                            {label}
                        </SvgText>
                    );
                 })}
             </Svg>
        </View>
    );
};

export default function ResultScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>콘텐츠 리뷰</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                 {/* Analysis Section (Charts) */}
                 <View style={styles.analysisContainer}>
                    <Text style={styles.analysisTitle}>점수 분석</Text>
                    <GaugeChart score={16} />
                    <View style={styles.divider} />
                    <Text style={styles.analysisSubtitle}>세부 분석 내용</Text>
                    <RadarChart />
                 </View>

                 {/* CTA */}
                 <TouchableOpacity 
                    style={styles.ctaButton}
                    onPress={() => router.push('/guide/category')}
                 >
                     <Text style={styles.ctaText}>대응안 확인하기</Text>
                 </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
     header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        backgroundColor: Colors.white,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 30,
    },
    section: {
        marginBottom: 30,
        alignItems: 'center',
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 15,
        lineHeight: 24,
    },
    stars: {
        flexDirection: 'row',
        gap: 8,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    chip: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#F2F2F2',
        borderRadius: 20,
    },
    chipActive: {
         paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#003DFF',
        borderRadius: 20,
    },
    chipText: {
        color: '#555',
        fontWeight: '500',
    },
    chipTextActive: {
        color: 'white',
        fontWeight: '600',
    },
    analysisContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    analysisTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#111',
    },
    analysisSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
        marginTop: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#DDD',
        width: '100%',
    },
    ctaButton: {
        backgroundColor: '#003DFF',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctaText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
