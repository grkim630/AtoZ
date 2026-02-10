import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

export default function MessageChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);
  
  // Initial scenario setup based on params or default
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '안녕하세요.\n저는 시시라고 합니다.\n당신과 대화하고 싶어요.',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  
  // Warning Animation
  const warningOpacity = useRef(new Animated.Value(0)).current;

  // PII Keywords (Korean & English)
  const PII_KEYWORDS = ['이름', '전화번호', '계좌', '비밀번호', '주소', 'name', 'phone', 'account', 'password', 'address', 'card', '카드'];

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

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    // Auto-scroll
    setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Mock AI Response
    setTimeout(() => {
        const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: getAIResponse(messages.length),
            sender: 'ai',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, 1500);
  };

  const getAIResponse = (count: number) => {
      // Simple scripted flow for demo
      if (count === 1) return "아 네 안녕하세요."; // User said something
      if (count === 2) return "저는 이라크에 주둔하고 있는 주한 미군입니다. 당신의 사진을 보고 너무 아름다워서 친구가 되고 싶습니다. 당신의 이름은 무엇입니까?";
      if (count === 3) return "반가워요. 저는 한국에 살고 있는 25살 콜콜입니다. 당신과 친구가 되고 싶습니다.";
      return "그렇군요. 혹시 지금 통화 가능하신가요?";
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
          <Text style={styles.subHeaderText}>‘로맨스스캠 메세지’를 선택했어요.</Text>
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

      {/* Chat List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
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
                />
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                     {inputText.trim() ? (
                         <Ionicons name="arrow-up-circle" size={32} color={Colors.primary} />
                     ) : (
                         <Ionicons name="mic-outline" size={24} color="#555" />
                     )}
                </TouchableOpacity>
            </View>
        </View>
      </KeyboardAvoidingView>
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#F8F9FA' }} />
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
});
