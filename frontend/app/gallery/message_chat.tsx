import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createMessageSession,
  sendMessageReply,
  type CreateMessageSessionResponse,
  type ReplyResponse,
} from '@/src/services/phishingSimulationService';
import { mapMessageCategory, DEFAULT_MESSAGE_CATEGORY } from '@/src/services/categoryMapper';
import { setSimulationOutcome } from '@/src/services/simulationOutcomeStore';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

export default function MessageChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; difficulty?: string }>();
  const flatListRef = useRef<FlatList>(null);
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [endNoticeVisible, setEndNoticeVisible] = useState(false);
  const [endNoticeText, setEndNoticeText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [shouldEnd, setShouldEnd] = useState(false);
  const suspicionCountRef = useRef(0);
  const [kavKey, setKavKey] = useState(0);
  
  // Warning Animation
  const warningOpacity = useRef(new Animated.Value(0)).current;

  // PII Keywords (Korean & English)
  const PII_KEYWORDS = ['이름', '전화번호', '계좌', '비밀번호', '주소', 'name', 'phone', 'account', 'password', 'address', 'card', '카드'];

  const endWithOutcome = (outcome: 'success' | 'failure') => {
    setSimulationOutcome(outcome);
    setShouldEnd(true);

    if (outcome === 'success') {
      setEndNoticeText('피싱 예방에 성공하여 대화를 종료합니다.');
    } else {
      setEndNoticeText('피싱 예방에 주의를 기울여주세요!');
    }

    setEndNoticeVisible(true);
    setTimeout(() => {
      setEndNoticeVisible(false);
      router.replace({
        pathname: '/gallery/review',
        params: { outcome },
      });
    }, 2000);
  };

  const classifyUserUtterance = (text: string): { suspicious: boolean; compromise: boolean } => {
    const t = (text ?? '').toLowerCase();
    const neg = /(안|못|절대)\s*(눌|클릭|접속|설치|다운|송금|이체|입금|보냈|제공|알려)/;
    const suspicious = /(피싱|보이스\s*피싱|사기|의심|수상|이상|신고|112|1332|무시|차단|삭제|대화\s*종료)/.test(t);
    const compromise =
      !neg.test(t) &&
      /(링크|url|클릭|눌렀|접속|앱|설치|다운|송금|이체|입금|계좌번호|카드번호|비밀번호|인증번호|otp|주민등록|신분증|원격|anydesk|teamviewer|팀뷰어)/.test(t);
    return { suspicious, compromise };
  };

  // 세션 초기화
  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const category = mapMessageCategory(params.category ?? '') ?? DEFAULT_MESSAGE_CATEGORY;
        const difficulty = parseInt(params.difficulty ?? '2', 10) as 1 | 2 | 3;
        
        const session: CreateMessageSessionResponse = await createMessageSession({
          category,
          difficulty,
          recommended_delay_seconds_min: 2,
          recommended_delay_seconds_max: 4,
        });
        
        setSessionId(session.sessionId);
        
        // 첫 AI 메시지를 권장 지연 후 표시
        setTimeout(() => {
          setMessages([
            {
              id: '0',
              text: session.firstAssistantMessage,
              sender: 'ai',
              timestamp: new Date(),
            },
          ]);
          setLoading(false);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }, session.recommendedDelaySeconds * 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : '세션 생성 실패');
        setLoading(false);
      }
    };
    
    initSession();
  }, [params.category, params.difficulty]);

  useEffect(() => {
    // Check for PII in real-time
    const hasPII = PII_KEYWORDS.some(keyword => inputText.includes(keyword));
    setShowWarning(hasPII);

    Animated.timing(warningOpacity, {
      toValue: hasPII ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [inputText]);

  // Android에서 키보드가 내려간 뒤 입력창이 약간 위로 남는 현상 방지:
  // KeyboardAvoidingView를 한 번 리마운트해서 레이아웃을 원복시킵니다.
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidHide', () => {
      setKavKey((v) => v + 1);
    });
    return () => sub.remove();
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || !sessionId || sending || shouldEnd) return;

    const userText = inputText.trim();
    setInputText('');
    setSending(true);

    const newMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // 종료 포인트(전화와 동일한 규칙):
    // - 피싱에 넘어감: 즉시 실패 종료
    // - 2번 이상 의심/차단/무시: 자동 종료가 아니라 "종료 선택지"를 노출
    const { suspicious, compromise } = classifyUserUtterance(userText);
    if (compromise) {
      endWithOutcome('failure');
      setSending(false);
      return;
    }
    if (suspicious) {
      suspicionCountRef.current += 1;
      if (suspicionCountRef.current >= 2) {
        setShouldEnd(true);
        setEndNoticeText('피싱이 의심됩니다. 대화를 종료할까요?');
        setEndNoticeVisible(true);
        setTimeout(() => setEndNoticeVisible(false), 1500);
        setSending(false);
        return;
      }
    }

    try {
      const reply: ReplyResponse = await sendMessageReply(sessionId, userText);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: reply.assistantText,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      if (reply.shouldEnd) {
        setShouldEnd(true);
        // shouldEnd일 때는 선택지를 보여주고, 사용자가 선택하면 종료합니다.
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '응답 생성 실패');
    } finally {
      setSending(false);
    }
  };

  const handleEndChoice = (choice: 'safe' | 'comply') => {
    endWithOutcome(choice === 'safe' ? 'success' : 'failure');
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAi]}>
        {!isUser && (
            <View style={styles.avatar}>
                <Ionicons name="chatbubble-ellipses" size={16} color="white" />
            </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
          <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAi]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>메시지 피싱</Text>
        <View style={styles.headerIcons}>
            <Ionicons name="search-outline" size={24} color="#111" style={{ marginRight: 15 }} />
            <Ionicons name="menu-outline" size={24} color="#111" />
        </View>
      </View>

      {/* Sub Header */}
      <View style={styles.subHeader}>
          <Text style={styles.subHeaderText}>
            ‘{params.category ?? '메시지 피싱'}’를 선택했어요.
          </Text>
      </View>

      {/* Warning Banner */}
      <Animated.View style={[styles.warningBanner, { opacity: warningOpacity }]}>
            <View style={styles.warningContent}>
                <View style={styles.warningIcon}>
                    <Ionicons name="alert" size={16} color="white" />
                </View>
                <Text style={styles.warningText}>
                    <Text style={{ fontWeight: 'bold', color: Colors.error }}>경고</Text> 개인 정보를 보내는 것은 위험해요.
                </Text>
            </View>
      </Animated.View>

      {/* End Notice Banner */}
      {endNoticeVisible && (
        <SafeAreaView edges={['top']} style={styles.endNoticeBanner}>
          <Ionicons name="warning" size={20} color="white" />
          <Text style={styles.endNoticeText}>{endNoticeText}</Text>
        </SafeAreaView>
      )}

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>세션 준비 중...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
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

      {/* Chat + Input (keyboard-aware) */}
      {!loading && !error && (
        <KeyboardAvoidingView
          key={kavKey}
          style={styles.chatArea}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          // 헤더 높이만큼 오프셋 (키보드가 입력창을 가리는 현상 방지)
          keyboardVerticalOffset={Platform.OS === 'ios' ? 56 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          />

          {shouldEnd ? (
            <View style={styles.choiceContainer}>
              <TouchableOpacity
                style={[styles.choiceBtn, styles.safeBtn]}
                onPress={() => handleEndChoice('safe')}
              >
                <Text style={styles.choiceText}>차단/무시하고 종료</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.choiceBtn, styles.dangerBtn]}
                onPress={() => handleEndChoice('comply')}
              >
                <Text style={styles.choiceText}>요구에 응하기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.plusButton}>
                <Ionicons name="add" size={24} color="#555" />
              </TouchableOpacity>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="메시지를 입력하세요"
                  placeholderTextColor="#999"
                  multiline
                  editable={!sending}
                />
                <TouchableOpacity
                  onPress={sendMessage}
                  style={styles.sendButton}
                  disabled={!inputText.trim() || sending}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : inputText.trim() ? (
                    <Ionicons name="arrow-up-circle" size={32} color={Colors.primary} />
                  ) : (
                    <Ionicons name="mic-outline" size={24} color="#555" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      )}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#F8F9FA' }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chatArea: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
      padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  headerIcons: {
      flexDirection: 'row',
  },
  subHeader: {
      alignItems: 'center',
      paddingVertical: 10,
  },
  subHeaderText: {
      fontSize: 14,
      color: '#666',
  },
  warningBanner: {
      position: 'absolute',
      top: 100, // Adjust based on header height
      left: 20,
      right: 20,
      zIndex: 100,
      backgroundColor: '#FFF0F0',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#FFD7D7',
      padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
  },
  warningContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
  },
  warningIcon: {
      backgroundColor: Colors.error,
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
  },
  warningText: {
      color: '#111',
      fontSize: 14,
  },
  endNoticeBanner: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#FF3B30',
      paddingVertical: 12,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      gap: 8,
  },
  endNoticeText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 15,
  },
  list: {
      flex: 1,
      backgroundColor: '#FFFFFF',
  },
  listContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 60, // Space for warning banner
  },
  messageRow: {
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'flex-end',
  },
  messageRowUser: {
      justifyContent: 'flex-end',
  },
  messageRowAi: {
      justifyContent: 'flex-start',
  },
  avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: Colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
      marginBottom: 4,
  },
  bubble: {
      maxWidth: '75%',
      padding: 12,
      borderRadius: 18,
  },
  bubbleUser: {
      backgroundColor: '#6692FF',
      borderBottomRightRadius: 4,
  },
  bubbleAi: {
      backgroundColor: '#F2F3F5',
      borderTopLeftRadius: 4,
  },
  messageText: {
      fontSize: 15,
      lineHeight: 22,
  },
  messageTextUser: {
      color: '#FFFFFF',
  },
  messageTextAi: {
      color: '#111111',
  },
  inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: '#F8F9FA',
      borderTopWidth: 1,
      borderTopColor: '#E5E5EA',
  },
  plusButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#E5E5EA',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
  },
  inputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF', // White background for input field
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: '#EFEFEF',
  },
  input: {
      flex: 1,
      minHeight: 36,
      maxHeight: 100,
      fontSize: 15,
      color: '#111',
      paddingRight: 8,
  },
  sendButton: {
      padding: 4,
  },
  choiceContainer: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: '#F8F9FA',
      borderTopWidth: 1,
      borderTopColor: '#E5E5EA',
  },
  choiceBtn: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
  },
  safeBtn: {
      backgroundColor: Colors.primary,
  },
  dangerBtn: {
      backgroundColor: Colors.error,
  },
  choiceText: {
      color: 'white',
      fontSize: 15,
      fontWeight: 'bold',
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 20,
  },
  loadingText: {
      color: '#111',
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
      color: Colors.error,
      fontSize: 16,
      textAlign: 'center',
  },
  retryButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: Colors.primary,
      borderRadius: 20,
  },
  retryButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
  },
});
