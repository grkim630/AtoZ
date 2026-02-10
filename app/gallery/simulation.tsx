import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock Data for the scenario
const SCENARIO = {
    title: "서울남부지방검찰청 형사과 팀장 오은재",
    intro: "안녕하세요. 서울남부지방검찰청 형사과 팀장 오은재입니다.",
    question: "시시콜콜씨 맞으십니까?",
    choices: [
        { text: "네, 맞습니다.", type: 'voice', next: 'threat' },
        { text: "누구시죠?", type: 'voice', next: 'threat' }
    ],
    threat: {
        text: "처벌을 피하고 싶으면 당장 담당 검사에게 전화하세요.",
        options: [
            { text: "담당 검사에게 전화하기", risk: 'high', feedback: "의심되는 번호로 전화하면 위험해요!" },
            { text: "일단 전화 끊기", risk: 'safe', feedback: "잘하셨어요! 의심스러울 땐 일단 끊으세요." }
        ]
    }
};

export default function SimulationScreen() {
    const router = useRouter();
    const [step, setStep] = useState('intro'); // intro, question, threat, result
    const [micActive, setMicActive] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [warningText, setWarningText] = useState('');
    const [scale] = useState(new Animated.Value(1));

    // Simulate "Voice Recognition" animation
    useEffect(() => {
        if (micActive) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scale, { toValue: 1.2, duration: 500, useNativeDriver: true }),
                    Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true })
                ])
            ).start();
            
            // Auto-advance for "Voice" simulation after 2 seconds
            const timer = setTimeout(() => {
                setMicActive(false);
                setStep('threat');
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            scale.setValue(1);
        }
    }, [micActive]);

    const handleMicPress = () => {
        setMicActive(true);
    };

    const handleOptionSelect = (option: any) => {
        if (option.risk === 'high') {
            setWarningText(option.feedback);
            setShowWarning(true);
            setTimeout(() => {
                setShowWarning(false);
                router.replace('/gallery/review');
            }, 2000);
        } else {
            router.replace('/gallery/review');
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Background - Simulating Police Office Video Call */}
            <ImageBackground
                source={require('../../assets/images/pol.png')}
                style={styles.backgroundPlaceholder}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={StyleSheet.absoluteFill}
                />
                <Text style={styles.callerName}>전화 피싱</Text>
            </ImageBackground>

            {/* Warning Banner */}
            {showWarning && (
                <SafeAreaView edges={['top']} style={styles.warningBanner}>
                    <Ionicons name="warning" size={24} color="white" />
                    <Text style={styles.warningText}>{warningText}</Text>
                </SafeAreaView>
            )}

            {/* Header Controls */}
            <SafeAreaView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={30} color="white" />
                </TouchableOpacity>
            </SafeAreaView>

            {/* Chat/Dialogue Area */}
            <View style={styles.dialogueContainer}>
                <View style={styles.bubbleLeft}>
                    <Text style={styles.bubbleText}>{SCENARIO.intro}</Text>
                </View>
                {step !== 'intro' && (
                    <View style={[styles.bubbleLeft, { marginTop: 10 }]}>
                        <Text style={styles.bubbleText}>{SCENARIO.question}</Text>
                    </View>
                )}
                {step === 'threat' && (
                     <View style={[styles.bubbleLeft, { marginTop: 10 }]}>
                         <Text style={styles.bubbleText}>{SCENARIO.threat.text}</Text>
                     </View>
                )}

                {/* User Response Simulation */}
                {step === 'threat' && (
                     <View style={styles.userResponseContainer}>
                        {SCENARIO.threat.options.map((opt, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={[styles.choiceBtn, opt.risk === 'high' ? styles.dangerBtn : styles.safeBtn]}
                                onPress={() => handleOptionSelect(opt)}
                            >
                                <Text style={styles.choiceText}>{opt.text}</Text>
                            </TouchableOpacity>
                        ))}
                     </View>
                )}
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
                {micActive ? (
                    <Text style={styles.micStatus}>사용자 음성을 인식 중입니다...</Text>
                ) : (
                    step !== 'threat' && <Text style={styles.micHint}>버튼을 눌러 대답하세요</Text>
                )}
                
                <Animated.View style={{ transform: [{ scale }] }}>
                    <TouchableOpacity 
                        style={[styles.micButton, micActive && styles.micActive]} 
                        onPress={handleMicPress}
                        disabled={step === 'threat' || micActive}
                    >
                        <Ionicons name="mic" size={40} color="white" />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    backgroundPlaceholder: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#333',
    },
    callerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginTop: 20,
        position: 'absolute',
        top: 60,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    warningBanner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FF3B30',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        gap: 10,
    },
    warningText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    dialogueContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    bubbleLeft: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 20,
        borderTopLeftRadius: 4,
        alignSelf: 'flex-start',
        maxWidth: '80%',
    },
    bubbleText: {
        fontSize: 16,
        color: '#111',
        lineHeight: 22,
    },
    userResponseContainer: {
        marginTop: 30,
        alignItems: 'center',
        gap: 15,
    },
    choiceBtn: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
    },
    dangerBtn: {
        backgroundColor: 'rgba(255, 59, 48, 0.9)', // Red
    },
    safeBtn: {
        backgroundColor: 'rgba(43, 92, 255, 0.9)', // Blue
    },
    choiceText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomControls: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    micButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    micActive: {
        backgroundColor: '#2B5CFF',
        borderColor: '#2B5CFF',
    },
    micStatus: {
        color: 'white',
        marginBottom: 20,
        fontSize: 16,
        fontWeight: 'bold',
    },
    micHint: {
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 20,
        fontSize: 14,
    },
});
