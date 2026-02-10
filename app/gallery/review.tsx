import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReviewScreen() {
    const router = useRouter();
    
    // State for interactive elements
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

    const handleSubmit = () => {
        // In a real app, send data to backend here
        router.push('/gallery/result');
    };

    const isFormValid = realismRating > 0 && confidenceRating > 0;

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
                {/* Intro */}
                <View style={styles.introContainer}>
                     <Ionicons name="chatbubble" size={30} color="#2B5CFF" style={{ marginBottom: 10 }} />
                     <Text style={styles.title}>
                         방금 체험한 <Text style={{ color: '#2B5CFF' }}>콘텐츠</Text>를{'\n'}평가해주세요.
                     </Text>
                </View>

                {/* Question 1 */}
                <View style={styles.section}>
                    <Text style={styles.question}>현실감 있는 시나리오였나요?</Text>
                    <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRealismRating(star)}>
                                <Ionicons 
                                    name={star <= realismRating ? "star" : "star-outline"} 
                                    size={36} 
                                    color="#FFD700" 
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                 {/* Question 2 */}
                 <View style={styles.section}>
                    <Text style={styles.question}>실제 상황에서 안전하게 대응할{'\n'}자신이 생겼나요?</Text>
                    <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setConfidenceRating(star)}>
                                <Ionicons 
                                    name={star <= confidenceRating ? "star" : "star-outline"} 
                                    size={36} 
                                    color="#FFD700" 
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Risk Factors */}
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

                <View style={{ height: 40 }} />

                 {/* Submit Button */}
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
    introContainer: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 32,
    },
    section: {
        marginBottom: 40,
        alignItems: 'center',
    },
    question: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 15,
        lineHeight: 26,
        color: '#111',
    },
    stars: {
        flexDirection: 'row',
        gap: 10,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    chip: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#F5F6F8',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#F5F6F8',
    },
    chipActive: {
        backgroundColor: '#E8F0FF',
        borderColor: '#2B5CFF',
    },
    chipText: {
        color: '#555',
        fontWeight: '500',
        fontSize: 15,
    },
    chipTextActive: {
        color: '#2B5CFF',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#2B5CFF',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#C7C7CC',
    },
    submitText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
