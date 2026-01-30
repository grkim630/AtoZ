import { Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
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
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 30);
  }, [messages.length]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const myMsg: Msg = { id: uid(), from: "me", text, createdAt: Date.now() };
    setMessages((prev) => [...prev, myMsg]);
    setInput("");

    const replyText = getScammerReply(mySendCount, text);
    const delay = 650 + Math.floor(Math.random() * 600);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: uid(), from: "scammer", text: replyText, createdAt: Date.now() },
      ]);
    }, delay);
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
        <View style={{ width: 36 }} />
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
});
