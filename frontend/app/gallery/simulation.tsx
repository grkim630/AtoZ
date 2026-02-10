import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createPhoneSession,
  sendPhoneReply,
  transcribePhoneAudio,
  type CreatePhoneSessionResponse,
  type ReplyResponse,
} from '@/src/services/phishingSimulationService';
import { mapPhoneCategory, DEFAULT_PHONE_CATEGORY } from '@/src/services/categoryMapper';
import { playTts, stopTts } from '@/src/services/ttsPlayback';
import { playBeep } from '@/src/services/beep';
import { setSimulationOutcome } from '@/src/services/simulationOutcomeStore';

type Message = {
  id: string;
  text: string;
  sender: 'ai' | 'user';
};

export default function SimulationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; difficulty?: string }>();
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [micActive, setMicActive] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningText, setWarningText] = useState('');
  const [scale] = useState(new Animated.Value(1));
  const [shouldEnd, setShouldEnd] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const stoppingRef = useRef(false);
  const heardSpeechRef = useRef(false);
  const silenceFramesRef = useRef(0);
  const suspicionCountRef = useRef(0);

  const endWithOutcome = (outcome: 'success' | 'failure') => {
    // 결과 화면에서 확실히 읽을 수 있도록 전역에도 저장
    setSimulationOutcome(outcome);
    setShouldEnd(true);
    setMicActive(false);

    if (outcome === 'success') {
      setWarningText('피싱 예방에 성공하여 통화를 종료합니다.');
    } else {
      setWarningText('피싱 예방에 주의를 기울여주세요!');
    }

    setShowWarning(true);
    setTimeout(() => {
      // 페이지 이동 전에 재생 중인 TTS는 즉시 중단
      stopTts().catch(() => {});
      setShowWarning(false);
      router.replace({
        pathname: '/gallery/review',
        params: { outcome },
      });
    }, 2000);
  };

  const classifyUserUtterance = (text: string): { suspicious: boolean; compromise: boolean } => {
    const t = (text ?? '').toLowerCase();

    // "안 눌렀어 / 안 했어" 같은 부정 표현이 있으면 넘어감 판정에서 제외
    const neg = /(안|못|절대)\s*(눌|클릭|접속|설치|다운|송금|이체|입금|보냈|제공|알려)/;

    const suspicious = /(피싱|보이스\s*피싱|사기|의심|수상|이상|확인할게|확인하겠습니다|신고|112|1332|끊을게|끊겠습니다|통화\s*종료)/.test(t);
    const compromise =
      !neg.test(t) &&
      /(링크|url|클릭|눌렀|접속|앱|설치|다운|송금|이체|입금|계좌번호|카드번호|비밀번호|인증번호|otp|주민등록|신분증|원격|anydesk|teamviewer|팀뷰어)/.test(t);

    return { suspicious, compromise };
  };

  // 통화 중 스피커 재생 + 무음 모드에서도 TTS 재생되도록 설정
  useEffect(() => {
    Audio.setAudioModeAsync({
      // NOTE: iOS에서 allowsRecordingIOS=true면 재생이 수화기(earpiece)로 라우팅될 수 있어
      // TTS가 "안 들리는" 문제처럼 보일 수 있습니다. 기본은 false, 녹음할 때만 true로 전환합니다.
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(() => {});
  }, []);

  // 페이지 전환/화면 이탈 시: TTS가 남아있으면 즉시 중단
  useEffect(() => {
    return () => {
      stopTts().catch(() => {});
    };
  }, []);

  const setAudioModeForRecording = async (isRecording: boolean) => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: isRecording,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch {
      // ignore
    }
  };

  const forceEndCall = async () => {
    try {
      // 1) TTS 즉시 중단
      await stopTts();
    } catch {
      // ignore
    }

    try {
      // 2) 녹음 중이면 즉시 중단/정리
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch {
          // ignore
        }
        recordingRef.current = null;
      }
      setMicActive(false);
      await setAudioModeForRecording(false);
    } catch {
      // ignore
    }

    // 3) 설문(리뷰) 페이지로 즉시 이동
    setSimulationOutcome('unknown');
    router.replace({
      pathname: '/gallery/review',
      params: { outcome: 'unknown' },
    });
  };

  // 세션 초기화
  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const category = mapPhoneCategory(params.category ?? '') ?? DEFAULT_PHONE_CATEGORY;
        const difficulty = parseInt(params.difficulty ?? '2', 10) as 1 | 2 | 3;
        
        const session: CreatePhoneSessionResponse = await createPhoneSession({
          category,
          difficulty,
          recommended_delay_seconds_min: 3,
          recommended_delay_seconds_max: 5,
        });
        
        setSessionId(session.sessionId);
        
        // 첫 AI 메시지를 권장 지연 후 표시 + TTS 재생
        const delayMs = session.recommendedDelaySeconds * 1000;
        setTimeout(() => {
          setMessages([
            {
              id: '0',
              text: session.firstAssistantMessage,
              sender: 'ai',
            },
          ]);
          setLoading(false);
          // 첫 멘트 음성 재생 (TTS API 사용, 실패 시 무시)
          playTts({
            sessionId: session.sessionId,
            text: session.firstAssistantMessage,
          }).catch(() => {});
        }, delayMs);
      } catch (err) {
        setError(err instanceof Error ? err.message : '세션 생성 실패');
        setLoading(false);
      }
    };
    
    initSession();
  }, [params.category, params.difficulty]);

  // 음성 인식 애니메이션
  useEffect(() => {
    if (micActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true })
        ])
      ).start();
    } else {
      scale.setValue(1);
    }
  }, [micActive]);

  const stopRecordingAndSend = async (reason: 'manual' | 'silence' | 'timeout') => {
    if (!sessionId) return;
    if (stoppingRef.current) return;
    if (!recordingRef.current) return;

    stoppingRef.current = true;
    try {
      // 종료 신호음(가능하면): 사용자가 "종료"를 인지하도록 먼저 재생
      playBeep('end').catch(() => {});

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setMicActive(false);

      // 녹음 모드 해제 → 스피커 재생으로 복귀 (TTS용)
      await setAudioModeForRecording(false);

      if (!uri) {
        setError('녹음 파일을 가져올 수 없습니다.');
        return;
      }
      const filename = uri.split('/').pop() ?? 'audio.m4a';
      const type = filename.endsWith('.m4a')
        ? 'audio/m4a'
        : filename.endsWith('.caf')
          ? 'audio/x-caf'
          : filename.endsWith('.3gp')
            ? 'audio/3gpp'
            : 'audio/webm';

      const sttRes = await transcribePhoneAudio(sessionId, {
        uri,
        name: filename,
        type,
      });
      const text = (sttRes.text ?? '').trim();
      if (text) {
        await handleUserResponse(text);
      } else {
        setError(
          reason === 'silence'
            ? '말씀이 감지되지 않았습니다. 다시 말해 주세요.'
            : '음성을 인식하지 못했습니다. 다시 말해 주세요.',
        );
      }
    } catch (err) {
      setMicActive(false);
      recordingRef.current = null;
      setError(err instanceof Error ? err.message : '음성 인식 실패');
      // 녹음 모드가 꼬이지 않도록 복귀 시도
      await setAudioModeForRecording(false);
    } finally {
      stoppingRef.current = false;
      heardSpeechRef.current = false;
      silenceFramesRef.current = 0;
    }
  };

  const handleMicPress = async () => {
    if (!sessionId || shouldEnd) return;

    // 이미 녹음 중이면: 다시 누르면 수동 종료(=전송)
    if (micActive && recordingRef.current) {
      await stopRecordingAndSend('manual');
      return;
    }

    // 녹음 시작
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('마이크 권한이 필요합니다.');
        return;
      }

      setError(null);
      heardSpeechRef.current = false;
      silenceFramesRef.current = 0;
      await setAudioModeForRecording(true);

      // 시작 신호음 (가능하면)
      playBeep('start').catch(() => {});

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (st) => {
          // 자동 종료: 말한 뒤 무음이 일정 시간 지속되면 종료
          if (!st.isRecording || stoppingRef.current) return;
          const metering = typeof st.metering === 'number' ? st.metering : null;

          // 1) 타임아웃: 너무 오래 녹음되면 자동 종료
          if (st.durationMillis >= 10000) {
            stopRecordingAndSend('timeout').catch(() => {});
            return;
          }

          if (metering == null) return;

          // 2) 간단한 VAD(무음 감지): 한번이라도 "말소리"가 잡힌 후, 무음이 2초 정도 지속되면 종료
          const speechThreshold = -35; // 말소리로 간주할 dBFS
          const silenceThreshold = -55; // 무음으로 간주할 dBFS
          if (metering > speechThreshold) {
            heardSpeechRef.current = true;
            silenceFramesRef.current = 0;
            return;
          }
          if (heardSpeechRef.current && metering < silenceThreshold) {
            silenceFramesRef.current += 1;
            if (silenceFramesRef.current >= 8) {
              // 8 frames * 250ms ≈ 2s
              stopRecordingAndSend('silence').catch(() => {});
            }
          } else {
            // 말소리도 무음도 애매한 구간이면 카운트 리셋
            silenceFramesRef.current = 0;
          }
        },
        250,
      );

      recordingRef.current = recording;
      setMicActive(true);
    } catch (err) {
      await setAudioModeForRecording(false);
      setError(err instanceof Error ? err.message : '녹음을 시작할 수 없습니다.');
    }
  };

  const handleUserResponse = async (userText: string) => {
    if (!sessionId || shouldEnd) return;
    
    setMicActive(false);
    
    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMessage]);

    // 종료 포인트(프론트 규칙):
    // - 피싱에 넘어가는 행동/발화: 즉시 실패 종료
    // - 2번 이상 의심/경고: 자동 종료가 아니라 "종료 선택지"를 노출
    const { suspicious, compromise } = classifyUserUtterance(userText);
    if (compromise) {
      endWithOutcome('failure');
      return;
    }
    if (suspicious) {
      suspicionCountRef.current += 1;
      if (suspicionCountRef.current >= 2) {
        // 사용자가 버튼을 눌렀을 때 종료되도록 선택지만 띄움
        setShouldEnd(true);
        setWarningText('피싱이 의심됩니다. 통화를 종료할까요?');
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 1500);
        return;
      }
    }
    
    try {
      // AI 응답 받기
      const reply: ReplyResponse = await sendPhoneReply(sessionId, userText);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: reply.assistantText,
        sender: 'ai',
      };
      
      setMessages(prev => [...prev, aiMessage]);

      // 마지막 멘트(선택지 직전)는 끝까지 읽고 나서 버튼 표시
      if (reply.shouldEnd) {
        // 일부 기기에서 TTS 종료 이벤트가 늦거나 누락될 수 있어,
        // 버튼은 즉시 노출하고 TTS는 백그라운드로 재생합니다.
        playTts({ sessionId, text: reply.assistantText }).catch(() => {});
        setShouldEnd(true);
      } else {
        // 일반 케이스는 비동기로 재생
        playTts({ sessionId, text: reply.assistantText }).catch(() => {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '응답 생성 실패');
    }
  };

  const handleEndChoice = (choice: 'hangup' | 'comply') => {
    endWithOutcome(choice === 'hangup' ? 'success' : 'failure');
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
                <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                  {/* 강제 종료: 즉시 설문 페이지로 이동 */}
                  <TouchableOpacity onPress={forceEndCall}>
                    <Ionicons name="call" size={28} color="#FF3B30" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                      <Ionicons name="ellipsis-vertical" size={30} color="white" />
                  </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Loading State */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.loadingText}>세션 준비 중...</Text>
              </View>
            )}

            {/* Error State */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => router.back()}
                >
                  <Text style={styles.retryButtonText}>돌아가기</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Chat/Dialogue Area */}
            {!loading && !error && (
              <View style={styles.dialogueContainer}>
                {messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.bubbleLeft,
                      msg.sender === 'user' && styles.bubbleRight,
                      { marginTop: 10 },
                    ]}
                  >
                    <Text style={styles.bubbleText}>{msg.text}</Text>
                  </View>
                ))}

                {/* End Call Button (shouldEnd일 때 표시) */}
                {shouldEnd && (
                  <View style={styles.userResponseContainer}>
                    <TouchableOpacity
                      style={[styles.choiceBtn, styles.safeBtn]}
                      onPress={() => handleEndChoice('hangup')}
                    >
                      <Text style={styles.choiceText}>전화 끊기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.choiceBtn, styles.dangerBtn]}
                      onPress={() => handleEndChoice('comply')}
                    >
                      <Text style={styles.choiceText}>요구에 응하기</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Bottom Controls */}
            {!loading && !error && (
              <View style={styles.bottomControls}>
                {micActive ? (
                  <Text style={styles.micStatus}>말하는 중...</Text>
                ) : (
                  !shouldEnd && <Text style={styles.micHint}>버튼을 눌러 대답하세요</Text>
                )}
                
                {!shouldEnd && (
                  <Animated.View style={{ transform: [{ scale }] }}>
                    <TouchableOpacity
                      style={[styles.micButton, micActive && styles.micActive]}
                      onPress={handleMicPress}
                      // 녹음 중에도 다시 눌러 종료/전송할 수 있어야 함
                      disabled={loading}
                    >
                      <Ionicons name="mic" size={40} color="white" />
                    </TouchableOpacity>
                  </Animated.View>
                )}
                
              </View>
            )}
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
        flex: 1, // acts as flexGrow in this context
        flexGrow: 1, // User requested flexGrow: 1 explicitly
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 200, // increased further to avoid overlap with hint text
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
    },
    loadingText: {
        color: 'white',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 20,
    },
    errorText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bubbleRight: {
        alignSelf: 'flex-end',
        backgroundColor: 'rgba(102, 146, 255, 0.9)',
        borderTopRightRadius: 4,
        borderTopLeftRadius: 20,
    },
});
