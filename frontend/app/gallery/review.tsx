import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReviewScreen() {
    const router = useRouter();
    
    // 별점 및 선택 상태 관리
    const [realismRating, setRealismRating] = useState(0);
    const [confidenceRating, setConfidenceRating] = useState(0);
    const [selectedRisks, setSelectedRisks] = useState<string[]>([]);

    const riskOptions = ['긴급성/압박', '금전 요구', '기관/가족 사칭', '링크/앱 설치 유도', '기타'];

    const toggleRisk = (risk: string) => {
        if (selectedRisks.includes(risk)) {
            setSelectedRisks(selectedRisks.filter(r => r !== risk));
        } else {
            setSelectedRisks([...selectedRisks, risk]);
        }
    };

    // [핵심] 리뷰 남기기 버튼 클릭 시 '결과 화면'으로 이동
    const handleSubmit = () => {
        // 방금 새로 만든 result.tsx 화면으로 보냅니다.
        router.push('/gallery/result');
    };

    const isFormValid = realismRating > 0 && confidenceRating > 0;

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>콘텐츠 리뷰</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* 인트로 안내 */}
                <View style={styles.introContainer}>
                     <Ionicons name="chatbubble-ellipses" size={40} color="#0055FF" style={{ marginBottom: 15 }} />
                     <Text style={styles.title}>
                         방금 체험한 <Text style={{ color: '#0055FF' }}>콘텐츠</Text>를{'\n'}평가해주세요.
                     </Text>
                </View>

                {/* 질문 1: 현실감 별점 */}
                <View style={styles.section}>
                    <Text style={styles.question}>현실감 있는 시나리오였나요?</Text>
                    <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRealismRating(star)}>
                                <Ionicons 
                                    name={star <= realismRating ? "star" : "star-outline"} 
                                    size={40} 
                                    color={star <= realismRating ? "#FFD700" : "#E5E5EA"} 
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                 {/* 질문 2: 자신감 별점 */}
                 <View style={styles.section}>
                    <Text style={styles.question}>실제 상황에서 안전하게 대응할{'\n'}자신이 생겼나요?</Text>
                    <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setConfidenceRating(star)}>
                                <Ionicons 
                                    name={star <= confidenceRating ? "star" : "star-outline"} 
                                    size={40} 
                                    color={star <= confidenceRating ? "#FFD700" : "#E5E5EA"} 
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 위험 요소 선택 (칩 스타일) */}
                <View style={styles.section}>
                     <Text style={styles.question}>(선택 사항){'\n'}가장 위험하게 느껴졌던 요소는 무엇인가요?</Text>
                     <View style={styles.chipContainer}>
                         {riskOptions.map((risk, index) => {
                             const isSelected = selectedRisks.includes(risk);
                             return (
                                 <TouchableOpacity 
                                    key={index} 
                                    style={[styles.chip, isSelected && styles.chipActive]}
                                    onPress={() => toggleRisk(risk)}
                                 >
                                     <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                                         {risk}
                                     </Text>
                                 </TouchableOpacity>
                             );
                         })}
                     </View>
                </View>

                <View style={{ height: 20 }} />

                 {/* 리뷰 남기기 버튼 */}
                 <TouchableOpacity 
                    style={[styles.submitButton, !isFormValid && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={!isFormValid}
                 >
                     <Text style={styles.submitText}>리뷰 남기기</Text>
                 </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { paddingHorizontal: 24, paddingBottom: 40 },
    introContainer: { alignItems: 'center', marginVertical: 40 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', lineHeight: 34 },
    section: { marginBottom: 45, alignItems: 'center' },
    question: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, lineHeight: 26 },
    stars: { flexDirection: 'row', gap: 12 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
    chip: { paddingVertical: 14, paddingHorizontal: 22, backgroundColor: '#F5F6F8', borderRadius: 30 },
    chipActive: { backgroundColor: '#E8F0FF', borderWidth: 1, borderColor: '#0055FF' },
    chipText: { color: '#666', fontSize: 15, fontWeight: '500' },
    chipTextActive: { color: '#0055FF', fontWeight: 'bold' },
    submitButton: { backgroundColor: '#0055FF', height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    disabledButton: { backgroundColor: '#E5E5EA' },
    submitText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});