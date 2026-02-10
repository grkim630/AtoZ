import { Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  addSessionEvent,
  addSessionMessage,
  createChatSession,
  fetchChatScenario,
  runEvaluation,
  submitSurvey,
} from "../../services/sessions-api";

type Msg = {
  id: string;
  from: "scammer" | "me";
  text: string;
  createdAt: number;
};

const uid = () => Math.random().toString(36).slice(2);

function getScammerReply(step: number, userText: string) {
  if (step === 0) {
    if (/전화|통화|콜|call/i.test(userText)) {
      return "지금 통화가 안돼… 급해. 기사님이 기다리고 있어. 계좌로 보내줘.";
    }
    return "응… 나 지금 급해. 폰 고장나서 새 폰이야. 100만 원만 먼저 보내줄 수 있어?";
  }
  if (step === 1) {
    if (/아들|맞아|누구|이름|생일|확인/i.test(userText)) {
      return "그건 나중에… 지금 기사님이 돈 먼저 달래. 빨리 보내줘 ㅠ";
    }
    return "계좌 보낼게. 일단 보내고 나중에 설명할게.";
  }
  if (step === 2) return "입금하면 캡처해서 보내줘. 엄마한테는 말하지 말고…";
  return "지금 정말 급해. 부탁할게…";
}

export default function ChildImpersonationChat() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [result, setResult] = useState<{
    overallScore: number;
    label: string;
    educationTips: string[];
  } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: uid(),
      from: "scammer",
      text: "할아버지 나 폰 고장나서 AS 맡겼어.\n보는대로 100만 원만 보내줘.",
      createdAt: Date.now(),
    },
    {
      id: uid(),
      from: "scammer",
      text: "새 폰이라 전화가 잘 안돼… 문자로만 할게.",
      createdAt: Date.now() + 1,
    },
  ]);

  const [input, setInput] = useState("");
  const mySendCount = useMemo(
    () => messages.filter((m) => m.from === "me").length,
    [messages],
  );

  const listRef = useRef<FlatList<Msg>>(null);

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      setLoadingSession(true);
      setApiError(null);
      try {
        const scenario = await fetchChatScenario("택배");
        const session = await createChatSession(scenario.id);
        if (!mounted) return;
        setSessionId(session.id);
      } catch (error) {
        if (!mounted) return;
        setApiError(String(error));
      } finally {
        if (mounted) {
          setLoadingSession(false);
        }
      }
    };
    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 30);
  }, [messages.length]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const myMsg: Msg = { id: uid(), from: "me", text, createdAt: Date.now() };
    setMessages((prev) => [...prev, myMsg]);
    setInput("");
    const nextTurn = messages.length;

    if (sessionId) {
      void addSessionMessage(sessionId, {
        turnIndex: nextTurn,
        speaker: "USER",
        text,
      }).catch((error) => setApiError(String(error)));
    }

    const replyText = getScammerReply(mySendCount, text);
    const delay = 650 + Math.floor(Math.random() * 600);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: uid(), from: "scammer", text: replyText, createdAt: Date.now() },
      ]);

      if (sessionId) {
        void addSessionMessage(sessionId, {
          turnIndex: nextTurn + 1,
          speaker: "AGENT",
          text: replyText,
        }).catch((error) => setApiError(String(error)));
      }
    }, delay);
  };

  const onBehaviorClick = (actionCode: string, riskWeight: number) => {
    if (!sessionId) {
      return;
    }
    void addSessionEvent(sessionId, {
      eventType: "CHOICE",
      actionCode,
      riskWeight,
      stepNo: mySendCount + 1,
    }).catch((error) => setApiError(String(error)));
  };

  const onFinish = async () => {
    if (!sessionId) {
      Alert.alert("알림", "세션이 준비되지 않았습니다.");
      return;
    }
    try {
      await submitSurvey(sessionId, {
        realism: 4,
        helpfulness: 4,
        confidence: 3,
        riskyFactor: "금전 요구",
      });
      const evaluated = await runEvaluation(sessionId);
      setResult({
        overallScore: evaluated.overallScore,
        label: evaluated.label,
        educationTips: evaluated.educationTips,
      });
    } catch (error) {
      setApiError(String(error));
    }
  };

  const renderItem = ({ item }: { item: Msg }) => {
    const mine = item.from === "me";
    return (
      <View style={[styles.bubbleRow, mine ? styles.rowRight : styles.rowLeft]}>
        <View
          style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleOther]}
        >
          <Text
            style={[styles.bubbleText, mine ? styles.textMe : styles.textOther]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ✅ 상단 검은 네비게이션 바 제거 */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* 우리가 만든 흰색 헤더 */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.back}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>메세지 사기</Text>
        <Pressable onPress={onFinish} style={styles.finishBtn}>
          <Text style={styles.finishBtnText}>종료</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chat}
          showsVerticalScrollIndicator={false}
          // ✅ 입력바 높이만큼 공간 확보 (키보드 올라와도 입력칸 가림 방지)
          style={{ flex: 1 }}
        />

        <View style={styles.statusBar}>
          <Text style={styles.statusText}>
            {loadingSession
              ? "세션 연결 중..."
              : sessionId
                ? `세션 연결됨: ${sessionId.slice(0, 8)}`
                : "세션 생성 실패"}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={() => onBehaviorClick("safe_stop", -1)}
            style={[styles.actionBtn, styles.safeBtn]}
          >
            <Text style={styles.actionText}>대화 중지</Text>
          </Pressable>
          <Pressable
            onPress={() => onBehaviorClick("continue_chat", 0.2)}
            style={[styles.actionBtn, styles.neutralBtn]}
          >
            <Text style={styles.actionText}>계속 대화</Text>
          </Pressable>
          <Pressable
            onPress={() => onBehaviorClick("risky_pay", 1)}
            style={[styles.actionBtn, styles.riskyBtn]}
          >
            <Text style={styles.actionText}>송금 선택</Text>
          </Pressable>
        </View>

        {/* ✅ 하단 입력바: 항상 보이게 고정 */}
        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <Pressable onPress={send} style={styles.sendBtn}>
            <Text style={styles.sendText}>전송</Text>
          </Pressable>
        </View>

        {(result || apiError) && (
          <View style={styles.resultPanel}>
            {result && (
              <>
                <Text style={styles.resultTitle}>
                  평가 결과: {result.overallScore}점 ({result.label})
                </Text>
                {result.educationTips.slice(0, 2).map((tip) => (
                  <Text key={tip} style={styles.resultTip}>
                    - {tip}
                  </Text>
                ))}
              </>
            )}
            {apiError && <Text style={styles.errorText}>API 오류: {apiError}</Text>}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  header: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  back: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 28, color: "#111", marginTop: -2 },
  title: { fontSize: 18, fontWeight: "900", color: "#111" },
  finishBtn: {
    minWidth: 48,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  finishBtnText: { color: "#fff", fontSize: 13, fontWeight: "800" },

  chat: {
    paddingHorizontal: 16,
    paddingTop: 14,
    // ✅ 입력바 높이만큼 항상 공간 확보
    paddingBottom: 70,
  },

  bubbleRow: { marginBottom: 10, flexDirection: "row" },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },

  bubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  bubbleOther: { backgroundColor: "#F3F4F6" },
  bubbleMe: { backgroundColor: "#2563EB" },

  bubbleText: { fontSize: 16, lineHeight: 22, fontWeight: "600" },
  textOther: { color: "#111" },
  textMe: { color: "#fff" },
  statusBar: {
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#6B7280",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  actionBtn: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  safeBtn: { backgroundColor: "#10B981" },
  neutralBtn: { backgroundColor: "#9CA3AF" },
  riskyBtn: { backgroundColor: "#EF4444" },
  actionText: { color: "#fff", fontSize: 12, fontWeight: "800" },

  inputBar: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#111",
  },
  sendBtn: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 21,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { fontSize: 14, fontWeight: "900", color: "#111" },
  resultPanel: {
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    padding: 12,
  },
  resultTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
  },
  resultTip: {
    marginTop: 4,
    color: "#374151",
    fontSize: 13,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 6,
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "700",
  },
});
