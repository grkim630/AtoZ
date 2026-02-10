import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Colors } from '@/src/constants/Colors';
import { AnalysisResult, analyzeFile } from '@/src/services/analysisService';

const { width } = Dimensions.get('window');

// --- Types ---

type MessageType = 'user' | 'bot' | 'analysis' | 'loading';

interface Message {
  id: string;
  type: MessageType;
  text?: string;
  file?: any;
  analysis?: AnalysisResult;
}

// --- SVG Components (Refined) ---

const SemiCircleGauge = ({
  score,
  label,
}: {
  score: number;
  label: AnalysisResult['label'];
}) => {
  const radius = 60;
  const strokeWidth = 14; // Increased thickness
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  const toneColor = label === 'phishing' ? Colors.error : Colors.success;
  const badgeText = label === 'phishing' ? '위험' : '안전';

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={140} height={80} viewBox="0 0 140 80">
        <Path
          d={`M 10,70 A 60,60 0 0,1 130,70`}
          fill="none"
          stroke={Colors.white} // Using white for subtle background on colored card
          strokeOpacity={0.5}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d={`M 10,70 A 60,60 0 0,1 130,70`}
          fill="none"
          stroke={toneColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - progress}
        />
      </Svg>
      <View style={styles.gaugeTextContainer}>
        <Text style={styles.gaugeScoreText}>{score}%</Text>
        <View style={styles.gaugeLabelBadge}>
          <Text style={[styles.gaugeLabelText, { color: toneColor }]}>{badgeText}</Text>
        </View>
      </View>
    </View>
  );
};

const ComparisonChart = ({
  data,
  label,
}: {
  data: AnalysisResult['comparisonData'];
  label: AnalysisResult['label'];
}) => {
  const toneColor = label === 'phishing' ? Colors.error : Colors.success;
  return (
    <View style={styles.chartContainer}>
        <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#CCDBFF' }]} /> 
                <Text style={styles.legendText}>평균 피싱 위험도</Text>
            </View>
             <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: toneColor }]} />
                <Text style={styles.legendText}>위험도 분석 결과</Text>
            </View>
        </View>
      
      <View style={styles.barsRow}>
        {data.map((item, index) => (
          <View key={index} style={styles.barGroup}>
            <View style={styles.barPair}>
                {/* Average Bar */}
                <View style={styles.barWrapper}>
                    <View style={[styles.bar, { height: item.average, backgroundColor: '#CCDBFF' }]} />
                </View>
                {/* User Bar */}
                <View style={styles.barWrapper}>
                     <View style={[styles.bar, { height: item.user, backgroundColor: toneColor }]} />
                </View>
            </View>
            <Text style={styles.barLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// --- Message Components ---

const AnalysisMessage = ({ result }: { result: AnalysisResult }) => (
  <View style={styles.analysisCard}>
    <View style={styles.analysisHeader}>
      <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
      <Text style={styles.analysisTitle}>위험도 분석 결과</Text>
    </View>

    <View style={styles.divider} />

    {/* Section 1: Gauge */}
    <View style={styles.analysisSection}>
      <View style={styles.gaugeRow}>
        <SemiCircleGauge score={result.riskScore} label={result.label} />
        <View style={styles.riskInfo}>
          <Text style={styles.riskDescription}>
            <Text
              style={{
                fontWeight: 'bold',
                color: result.label === 'phishing' ? Colors.error : Colors.success,
              }}
            >
              {result.riskLevel}
            </Text>
            {'\n'}
            위험도 {result.riskScore}%
          </Text>
        </View>
      </View>
    </View>

    <View style={styles.divider} />

    {/* Section 2: Chart */}
    <View style={styles.analysisSection}>
      <ComparisonChart data={result.comparisonData} label={result.label} />
    </View>

    <View style={styles.divider} />

    {/* Section 3: Verdict */}
    <Text style={styles.verdictGuideText}>
      해당 파일은 <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>'{result.verdictTitle}'</Text>으로 분석돼요.{'\n'}
      아래 대응안을 추천해요.
    </Text>

    <View style={styles.actionCard}>
      <View style={styles.actionImagePlaceholder}>
        <Ionicons name="images-outline" size={32} color={Colors.white} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTag}>분석 기반 대응안</Text>
        <Text style={styles.actionDescription}>{result.verdictDescription}</Text>
      </View>
    </View>
  </View>
);

const UserMessage = ({ text, file }: { text?: string; file?: any }) => (
  <View style={styles.userMessageContainer}>
    {file && (
        <View style={styles.fileBubble}>
             <Ionicons name="document-text" size={20} color={Colors.white} style={{ marginRight: 8 }}/>
             <Text style={styles.fileText} numberOfLines={1}>{file.name}</Text>
        </View>
    )}
    {text && (
        <View style={styles.textBubble}>
            <Text style={styles.userText}>{text}</Text>
        </View>
    )}
  </View>
);

const BotMessage = ({ text }: { text: string }) => (
  <View style={styles.botMessageContainer}>
      <View style={styles.botAvatar}>
        <Ionicons name="chatbubble-ellipses" size={16} color={Colors.white} />
      </View>
      <View style={styles.botBubble}>
        <Text style={styles.botText}>{text}</Text>
      </View>
  </View>
);

// --- Main Screen ---

export default function UploadScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
        id: '1',
        type: 'bot',
        text: '안녕하세요! 궁금한 내용을 작성하거나 파일(녹음, 메시지 등)을 업로드해주시면 위험도를 분석해드릴게요.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showPickerSheet, setShowPickerSheet] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const addMessage = (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleDocumentPick = async () => {
    setShowPickerSheet(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      if (result.assets && result.assets.length > 0) {
        processFile(result.assets[0]);
      }
    } catch (err) {
      console.log('Error', err);
    }
  };

  const handleImagePick = async () => {
     setShowPickerSheet(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
         processFile(result.assets[0]);
      }
    } catch (err) {
        console.log('Error', err);
    }
  };

  const processFile = async (file: any) => {
      // 1. Add User Message with File
      addMessage({
          id: Date.now().toString(),
          type: 'user',
          file: file,
      });

      // 2. Add Loading Message
      const loadingId = 'loading-' + Date.now();
      addMessage({
          id: loadingId,
          type: 'loading',
      });

      // 3. Simulate Analysis
      try {
          const result = await analyzeFile({
            uri: file.uri,
            name: file.name,
            mimeType: file.mimeType,
          });
          
          // Remove loading, add result
          setMessages(prev => prev.filter(m => m.id !== loadingId));
          addMessage({
              id: Date.now().toString() + '-result',
              type: 'analysis',
              analysis: result,
          });
      } catch (error) {
           setMessages(prev => prev.filter(m => m.id !== loadingId));
           const message = error instanceof Error ? error.message : String(error);
           console.error('분석 요청 실패:', message);
           Alert.alert('분석 오류', message);
      }
  };

  const handleSendText = () => {
      if (!inputText.trim()) return;
      
      addMessage({
          id: Date.now().toString(),
          type: 'user',
          text: inputText
      });
      setInputText('');

      // Simulate bot reply for regular chat
      setTimeout(() => {
          addMessage({
              id: Date.now().toString() + '-reply',
              type: 'bot',
              text: '추가적인 정보가 있다면 알려주세요. 정밀하게 다시 분석해드릴게요.'
          });
      }, 1000);
  };

  const renderItem = ({ item }: { item: Message }) => {
      if (item.type === 'user') return <UserMessage text={item.text} file={item.file} />;
      if (item.type === 'bot') return <BotMessage text={item.text || ''} />;
      if (item.type === 'analysis' && item.analysis) return <AnalysisMessage result={item.analysis} />;
      if (item.type === 'loading') return (
          <View style={styles.loadingContainer}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.loadingText}>분석 중이에요...</Text>
          </View>
      );
      return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>피해 사례 업로드</Text>
        <View style={styles.headerRight}>
             <Ionicons name="search-outline" size={24} color="#111" />
             <Ionicons name="menu-outline" size={24} color="#111" />
        </View>
      </View>

      {/* Chat List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatContent}
        style={styles.chatList}
      />

      {/* Input Area */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
        <View style={styles.inputContainer}>
            <Pressable style={styles.addButton} onPress={() => setShowPickerSheet(true)}>
                <Ionicons name="add" size={24} color={Colors.white} />
            </Pressable>
            <View style={styles.textInputWrapper}>
                <TextInput 
                    style={styles.textInput}
                    placeholder="궁금한 내용을 작성해주세요."
                    placeholderTextColor="#A6A6A6"
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={handleSendText}
                />
                <Pressable onPress={handleSendText} disabled={!inputText.trim()}>
                    <Ionicons name={inputText.trim() ? "arrow-up-circle" : "mic-outline"} size={24} color={inputText.trim() ? Colors.primary : Colors.gray} />
                </Pressable>
            </View>
        </View>
      </KeyboardAvoidingView>

      {/* Picker Sheet */}
      {showPickerSheet && (
            <Pressable style={styles.modalOverlay} onPress={() => setShowPickerSheet(false)}>
                <View style={styles.bottomSheet}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.sheetTitle}>파일 업로드</Text>
                    
                    <Pressable style={styles.sheetOption} onPress={handleDocumentPick}>
                        <View style={styles.sheetIconBox}>
                            <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.sheetOptionText}>파일 선택</Text>
                    </Pressable>
                    
                    <Pressable style={styles.sheetOption} onPress={handleImagePick}>
                         <View style={styles.sheetIconBox}>
                            <Ionicons name="images-outline" size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.sheetOptionText}>앨범에서 선택</Text>
                    </Pressable>
                </View>
            </Pressable>
        )}
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
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  headerBtn: {
      padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  headerRight: {
      flexDirection: 'row',
      gap: 16,
  },
  chatList: {
      flex: 1,
      backgroundColor: Colors.white,
  },
  chatContent: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 20,
      gap: 20,
  },
  loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      alignSelf: 'flex-start',
      backgroundColor: '#F8F9FA',
      borderRadius: 20,
      borderBottomLeftRadius: 4,
  },
  loadingText: {
      marginLeft: 10,
      color: Colors.textSecondary,
      fontSize: 14,
  },
  // User Message
  userMessageContainer: {
      alignItems: 'flex-end',
      gap: 8,
  },
  fileBubble: {
      backgroundColor: Colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 18,
      borderBottomRightRadius: 4,
      maxWidth: '80%',
  },
  fileText: {
      color: Colors.white,
      fontSize: 14,
  },
  textBubble: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    maxWidth: '80%',
  },
  userText: {
      color: Colors.white,
      fontSize: 15,
      lineHeight: 22,
  },
  // Bot Message
  botMessageContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      maxWidth: '85%',
  },
  botAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: Colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
  },
  botBubble: {
      backgroundColor: '#F3F5F9',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 18,
      borderBottomLeftRadius: 4,
  },
  botText: {
      color: '#111',
      fontSize: 15,
      lineHeight: 22,
  },
  // Analysis Card
  analysisCard: {
      backgroundColor: Colors.whitish, // #E5ECFF
      borderRadius: 20,
      padding: 24,
      width: '100%',
      // Pixel-perfect spacing
      gap: 20, 
  },
  analysisHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  analysisTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#0029A3', // Darker blue for title
  },
  analysisSection: {
      paddingVertical: 5,
  },
  gaugeRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 20,
  },
  riskInfo: {
      flex: 1,
  },
  riskDescription: {
      fontSize: 15,
      lineHeight: 24,
      color: '#333',
  },
  divider: {
      height: 1,
      backgroundColor: 'rgba(0,0,0,0.05)',
      width: '100%',
  },
  verdictText: {
      fontSize: 15,
      lineHeight: 24,
      color: '#333',
  },
  verdictGuideText: {
      fontSize: 15,
      lineHeight: 24,
      color: '#333',
      marginTop: -4,
  },
  actionCard: {
      backgroundColor: Colors.white,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 16,
      gap: 12,
  },
  actionImagePlaceholder: {
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: Colors.light,
      justifyContent: 'center',
      alignItems: 'center',
  },
  actionContent: {
      flex: 1,
  },
  actionTag: {
      fontSize: 12,
      color: Colors.primary,
      marginBottom: 4,
      fontWeight: '600',
  },
  actionDescription: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#111',
  },
 
  // Refined Components Styles
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 80,
  },
  gaugeTextContainer: {
    position: 'absolute',
    bottom: 5,
    alignItems: 'center',
  },
  gaugeScoreText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0029A3',
  },
  gaugeLabelBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  gaugeLabelText: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  chartContainer: {
      minHeight: 160,
      width: '100%',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
      fontSize: 12,
      color: '#555',
  },
  barsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      height: 120,
      paddingBottom: 10,
  },
  barGroup: {
      alignItems: 'center',
      gap: 8,
  },
  barPair: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 6,
      height: 100,
  },
  barWrapper: {
      width: 14,
      height: 100, // max height container
      justifyContent: 'flex-end',
      borderRadius: 7,
      backgroundColor: 'rgba(255,255,255,0.5)', // Subtle track
  },
  bar: {
      width: '100%',
      borderRadius: 7,
  },
  barLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: '#555',
  },

  // Input Area
  inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: Colors.white,
      gap: 10,
      marginBottom: 30, // Floating effect margin
      marginHorizontal: 16, // Side margins
      borderRadius: 30, // Rounded container
      shadowColor: "#000",
      shadowOffset: {
	      width: 0,
	      height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
  },
  addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#E5E5EA',
      justifyContent: 'center',
      alignItems: 'center',
  },
  textInputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F3F5F9', // Light gray input bg
      borderRadius: 24,
      paddingHorizontal: 16,
      height: 48,
  },
  textInput: {
      flex: 1,
      fontSize: 15,
      color: '#111',
      marginRight: 8,
  },

     // Model
  modalOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
},
bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
},
sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
},
sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 20,
    textAlign: 'center',
},
sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
},
sheetIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.whitish,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
},
sheetOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
},
});
