import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Msg =
  | { id: string; role: "bot"; text: string }
  | { id: string; role: "user"; text: string }
  | { id: string; role: "file"; filename: string }
  | {
      id: string;
      role: "result";
      riskPct: number;
      keywords: string;
      reports: string;
      title: string;
    }
  | { id: string; role: "recommend"; title: string };

export default function UploadScreen() {
  const router = useRouter();

  const [input, setInput] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  // ✅ 업로드 완료/분석중 모달
  const [analyzing, setAnalyzing] = useState(false);

  const [messages, setMessages] = useState<Msg[]>(() => [
    {
      id: "m1",
      role: "bot",
      text: "파일을 업로드해주세요.\n지원 가능 형식: 녹음 파일(wav, mp3)\n사진 파일(png, jpeg) 등",
    },
  ]);

  const scrollRef = useRef<ScrollView>(null);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  const append = (msg: Msg) => {
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const onSend = () => {
    const text = input.trim();
    if (!text) return;
    append({ id: String(Date.now()), role: "user", text });
    setInput("");
  };

  // ✅ 파일 업로드(지금은 데모)
  const runDemoUploadFlow = () => {
    // 1) 모달 띄우기
    setAnalyzing(true);

    // 2) 1.5초 후 분석 결과 추가
    setTimeout(() => {
      setAnalyzing(false);

      // 파일명 말풍선
      append({
        id: String(Date.now()),
        role: "file",
        filename: "20260218-message.jpeg",
      });

      // 분석 결과 카드
      append({
        id: String(Date.now() + 1),
        role: "result",
        riskPct: 55,
        keywords: "경찰청, URL 등",
        reports: "11만 회",
        title: "파일 분석 결과",
      });

      // 추천 영상 카드
      append({
        id: String(Date.now() + 2),
        role: "recommend",
        title: "경찰청 사칭 사기",
      });
    }, 1500);
  };

  const onPick = (type: "텍스트 파일" | "녹음 파일" | "사진") => {
    setPickerOpen(false);
    // 데모: 선택만 메시지로 찍고, 업로드 버튼으로 결과 흐름 보여줌
    append({
      id: String(Date.now()),
      role: "user",
      text: `[업로드 선택] ${type}`,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)/chatbot");
          }}
          hitSlop={10}
          style={styles.back}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>파일업로드</Text>
        </View>

        {/* 오른쪽: 파일 업로드 버튼 (스샷처럼) */}
        <Pressable style={styles.uploadBtn} onPress={runDemoUploadFlow}>
          <Text style={styles.uploadBtnText}>업로드</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        {/* 채팅 */}
        <ScrollView
          ref={scrollRef}
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((m) => {
            if (m.role === "bot") {
              return (
                <View key={m.id} style={[styles.bubble, styles.bubbleBot]}>
                  <Text style={styles.bubbleText}>{m.text}</Text>
                </View>
              );
            }

            if (m.role === "user") {
              return (
                <View key={m.id} style={[styles.bubble, styles.bubbleUser]}>
                  <Text style={[styles.bubbleText, styles.bubbleTextUser]}>
                    {m.text}
                  </Text>
                </View>
              );
            }

            if (m.role === "file") {
              return (
                <View
                  key={m.id}
                  style={[styles.filePill, { alignSelf: "flex-end" }]}
                >
                  <Text style={styles.filePillText}>{m.filename}</Text>
                </View>
              );
            }

            if (m.role === "result") {
              return (
                <View key={m.id} style={styles.resultCard}>
                  <Text style={styles.resultTitle}>{m.title}</Text>

                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>사기 위험도</Text>
                    <Text style={styles.resultValueRed}>{m.riskPct}%</Text>
                  </View>

                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>분석 키워드</Text>
                    <Text style={styles.resultValue}>{m.keywords}</Text>
                  </View>

                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>신고 건 수</Text>
                    <Text style={styles.resultValue}>{m.reports}</Text>
                  </View>

                  <Text style={styles.resultHint}>아래 영상을 추천합니다.</Text>
                </View>
              );
            }

            // recommend
            return (
              <View key={m.id} style={styles.recoCard}>
                <Image
                  source={require("../assets/images/police-call.png")}
                  style={styles.recoThumb}
                  resizeMode="cover"
                />
                <Text style={styles.recoTitle}>{m.title}</Text>
              </View>
            );
          })}

          <View style={{ height: 10 }} />
        </ScrollView>

        {/* 하단 입력바 */}
        <View style={styles.bottomBar}>
          <Pressable
            style={styles.plusBtn}
            onPress={() => setPickerOpen(true)}
            hitSlop={10}
          >
            <Text style={styles.plusText}>＋</Text>
          </Pressable>

          <View style={styles.inputWrap}>
            <TextInput
              placeholder="메세지를 입력하세요."
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={input}
              onChangeText={setInput}
              returnKeyType="send"
              onSubmitEditing={onSend}
            />
          </View>

          <Pressable style={styles.micBtn} hitSlop={10}>
            <Text style={styles.micText}>🎙️</Text>
          </Pressable>
        </View>

        {/* 업로드 선택 시트 */}
        {pickerOpen && (
          <Pressable
            style={styles.sheetOverlay}
            onPress={() => setPickerOpen(false)}
          >
            <Pressable style={styles.sheet} onPress={() => {}}>
              <Text style={styles.sheetTitle}>업로드할 파일 종류 선택</Text>

              <Pressable
                style={styles.sheetBtn}
                onPress={() => onPick("텍스트 파일")}
              >
                <Text style={styles.sheetBtnText}>텍스트 파일</Text>
              </Pressable>

              <Pressable
                style={styles.sheetBtn}
                onPress={() => onPick("녹음 파일")}
              >
                <Text style={styles.sheetBtnText}>녹음 파일</Text>
              </Pressable>

              <Pressable style={styles.sheetBtn} onPress={() => onPick("사진")}>
                <Text style={styles.sheetBtnText}>사진</Text>
              </Pressable>

              <Pressable
                style={[styles.sheetBtn, styles.sheetCancel]}
                onPress={() => setPickerOpen(false)}
              >
                <Text style={[styles.sheetBtnText, { color: "#111" }]}>
                  취소
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        )}

        {/* ✅ 분석중 모달 (스샷 왼쪽 느낌) */}
        {analyzing && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>파일 업로드 완료!</Text>

              <View style={styles.modalIconCircle}>
                <Text style={styles.modalEyes}>👀</Text>
              </View>

              <View style={styles.dotsRow}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>

              <Text style={styles.modalDesc}>
                파일을 분석 중이에요!{"\n"}잠시만 기다려주세요.
              </Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  /* 헤더 */
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

  headerCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#111" },

  uploadBtn: {
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  uploadBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },

  /* 채팅 */
  body: { flex: 1 },
  bodyContent: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  bubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  bubbleBot: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E7EB",
  },
  bubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: "#2563EB",
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    lineHeight: 18,
  },
  bubbleTextUser: { color: "#fff" },

  filePill: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 10,
  },
  filePillText: { color: "#fff", fontWeight: "900", fontSize: 13 },

  /* 결과 카드 */
  resultCard: {
    alignSelf: "flex-start",
    width: "82%",
    backgroundColor: "#E5E7EB",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111",
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  resultLabel: { fontSize: 13, fontWeight: "800", color: "#374151" },
  resultValue: { fontSize: 13, fontWeight: "900", color: "#111" },
  resultValueRed: { fontSize: 13, fontWeight: "900", color: "#EF4444" },
  resultHint: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "900",
    color: "#374151",
  },

  /* 추천 영상 카드(썸네일은 더미) */
  recoCard: {
    alignSelf: "flex-start",
    width: "82%",
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    marginBottom: 12,
  },
  recoThumb: { width: "100%", height: 110, backgroundColor: "#D1D5DB" },
  recoTitle: { padding: 12, fontSize: 14, fontWeight: "900", color: "#111" },

  /* 하단 입력바 */
  bottomBar: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
  },
  plusBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: { fontSize: 22, color: "#111", marginTop: -2 },
  inputWrap: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  input: { fontSize: 15, color: "#111" },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  micText: { fontSize: 18 },

  /* 업로드 시트 */
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111",
    marginBottom: 12,
  },
  sheetBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  sheetBtnText: { fontSize: 15, fontWeight: "900", color: "#2563EB" },
  sheetCancel: { backgroundColor: "#E5E7EB" },

  /* 분석중 모달 */
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  modalCard: {
    width: "86%",
    borderRadius: 26,
    backgroundColor: "#9BB7FF",
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0B2A6F",
    marginBottom: 14,
  },
  modalIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  modalEyes: { fontSize: 34 },
  dotsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  dotActive: { backgroundColor: "#1D4ED8" },
  modalDesc: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "900",
    color: "#0B2A6F",
  },
});
