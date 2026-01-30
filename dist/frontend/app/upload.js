"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UploadScreen;
const expo_router_1 = require("expo-router");
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
function UploadScreen() {
    const router = (0, expo_router_1.useRouter)();
    const [input, setInput] = (0, react_1.useState)("");
    const [pickerOpen, setPickerOpen] = (0, react_1.useState)(false);
    const [analyzing, setAnalyzing] = (0, react_1.useState)(false);
    const [messages, setMessages] = (0, react_1.useState)(() => [
        {
            id: "m1",
            role: "bot",
            text: "파일을 업로드해주세요.\n지원 가능 형식: 녹음 파일(wav, mp3)\n사진 파일(png, jpeg) 등",
        },
    ]);
    const scrollRef = (0, react_1.useRef)(null);
    const canSend = (0, react_1.useMemo)(() => input.trim().length > 0, [input]);
    const append = (msg) => {
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    };
    const onSend = () => {
        const text = input.trim();
        if (!text)
            return;
        append({ id: String(Date.now()), role: "user", text });
        setInput("");
    };
    const runDemoUploadFlow = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            append({
                id: String(Date.now()),
                role: "file",
                filename: "20260218-message.jpeg",
            });
            append({
                id: String(Date.now() + 1),
                role: "result",
                riskPct: 55,
                keywords: "경찰청, URL 등",
                reports: "11만 회",
                title: "파일 분석 결과",
            });
            append({
                id: String(Date.now() + 2),
                role: "recommend",
                title: "경찰청 사칭 사기",
            });
        }, 1500);
    };
    const onPick = (type) => {
        setPickerOpen(false);
        append({
            id: String(Date.now()),
            role: "user",
            text: `[업로드 선택] ${type}`,
        });
    };
    return (<react_native_1.SafeAreaView style={styles.safe}>
      
      <react_native_1.View style={styles.header}>
        <react_native_1.Pressable onPress={() => {
            if (router.canGoBack())
                router.back();
            else
                router.replace("/(tabs)/chatbot");
        }} hitSlop={10} style={styles.back}>
          <react_native_1.Text style={styles.backText}>‹</react_native_1.Text>
        </react_native_1.Pressable>

        <react_native_1.View style={styles.headerCenter}>
          <react_native_1.Text style={styles.headerTitle}>파일업로드</react_native_1.Text>
        </react_native_1.View>

        
        <react_native_1.Pressable style={styles.uploadBtn} onPress={runDemoUploadFlow}>
          <react_native_1.Text style={styles.uploadBtnText}>업로드</react_native_1.Text>
        </react_native_1.Pressable>
      </react_native_1.View>

      <react_native_1.KeyboardAvoidingView style={{ flex: 1 }} behavior={react_native_1.Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={react_native_1.Platform.OS === "ios" ? 8 : 0}>
        
        <react_native_1.ScrollView ref={scrollRef} style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
          {messages.map((m) => {
            if (m.role === "bot") {
                return (<react_native_1.View key={m.id} style={[styles.bubble, styles.bubbleBot]}>
                  <react_native_1.Text style={styles.bubbleText}>{m.text}</react_native_1.Text>
                </react_native_1.View>);
            }
            if (m.role === "user") {
                return (<react_native_1.View key={m.id} style={[styles.bubble, styles.bubbleUser]}>
                  <react_native_1.Text style={[styles.bubbleText, styles.bubbleTextUser]}>
                    {m.text}
                  </react_native_1.Text>
                </react_native_1.View>);
            }
            if (m.role === "file") {
                return (<react_native_1.View key={m.id} style={[styles.filePill, { alignSelf: "flex-end" }]}>
                  <react_native_1.Text style={styles.filePillText}>{m.filename}</react_native_1.Text>
                </react_native_1.View>);
            }
            if (m.role === "result") {
                return (<react_native_1.View key={m.id} style={styles.resultCard}>
                  <react_native_1.Text style={styles.resultTitle}>{m.title}</react_native_1.Text>

                  <react_native_1.View style={styles.resultRow}>
                    <react_native_1.Text style={styles.resultLabel}>사기 위험도</react_native_1.Text>
                    <react_native_1.Text style={styles.resultValueRed}>{m.riskPct}%</react_native_1.Text>
                  </react_native_1.View>

                  <react_native_1.View style={styles.resultRow}>
                    <react_native_1.Text style={styles.resultLabel}>분석 키워드</react_native_1.Text>
                    <react_native_1.Text style={styles.resultValue}>{m.keywords}</react_native_1.Text>
                  </react_native_1.View>

                  <react_native_1.View style={styles.resultRow}>
                    <react_native_1.Text style={styles.resultLabel}>신고 건 수</react_native_1.Text>
                    <react_native_1.Text style={styles.resultValue}>{m.reports}</react_native_1.Text>
                  </react_native_1.View>

                  <react_native_1.Text style={styles.resultHint}>아래 영상을 추천합니다.</react_native_1.Text>
                </react_native_1.View>);
            }
            return (<react_native_1.View key={m.id} style={styles.recoCard}>
                <react_native_1.Image source={require("../assets/images/police-call.png")} style={styles.recoThumb} resizeMode="cover"/>
                <react_native_1.Text style={styles.recoTitle}>{m.title}</react_native_1.Text>
              </react_native_1.View>);
        })}

          <react_native_1.View style={{ height: 10 }}/>
        </react_native_1.ScrollView>

        
        <react_native_1.View style={styles.bottomBar}>
          <react_native_1.Pressable style={styles.plusBtn} onPress={() => setPickerOpen(true)} hitSlop={10}>
            <react_native_1.Text style={styles.plusText}>＋</react_native_1.Text>
          </react_native_1.Pressable>

          <react_native_1.View style={styles.inputWrap}>
            <react_native_1.TextInput placeholder="메세지를 입력하세요." placeholderTextColor="#9CA3AF" style={styles.input} value={input} onChangeText={setInput} returnKeyType="send" onSubmitEditing={onSend}/>
          </react_native_1.View>

          <react_native_1.Pressable style={styles.micBtn} hitSlop={10}>
            <react_native_1.Text style={styles.micText}>🎙️</react_native_1.Text>
          </react_native_1.Pressable>
        </react_native_1.View>

        
        {pickerOpen && (<react_native_1.Pressable style={styles.sheetOverlay} onPress={() => setPickerOpen(false)}>
            <react_native_1.Pressable style={styles.sheet} onPress={() => { }}>
              <react_native_1.Text style={styles.sheetTitle}>업로드할 파일 종류 선택</react_native_1.Text>

              <react_native_1.Pressable style={styles.sheetBtn} onPress={() => onPick("텍스트 파일")}>
                <react_native_1.Text style={styles.sheetBtnText}>텍스트 파일</react_native_1.Text>
              </react_native_1.Pressable>

              <react_native_1.Pressable style={styles.sheetBtn} onPress={() => onPick("녹음 파일")}>
                <react_native_1.Text style={styles.sheetBtnText}>녹음 파일</react_native_1.Text>
              </react_native_1.Pressable>

              <react_native_1.Pressable style={styles.sheetBtn} onPress={() => onPick("사진")}>
                <react_native_1.Text style={styles.sheetBtnText}>사진</react_native_1.Text>
              </react_native_1.Pressable>

              <react_native_1.Pressable style={[styles.sheetBtn, styles.sheetCancel]} onPress={() => setPickerOpen(false)}>
                <react_native_1.Text style={[styles.sheetBtnText, { color: "#111" }]}>
                  취소
                </react_native_1.Text>
              </react_native_1.Pressable>
            </react_native_1.Pressable>
          </react_native_1.Pressable>)}

        
        {analyzing && (<react_native_1.View style={styles.modalOverlay}>
            <react_native_1.View style={styles.modalCard}>
              <react_native_1.Text style={styles.modalTitle}>파일 업로드 완료!</react_native_1.Text>

              <react_native_1.View style={styles.modalIconCircle}>
                <react_native_1.Text style={styles.modalEyes}>👀</react_native_1.Text>
              </react_native_1.View>

              <react_native_1.View style={styles.dotsRow}>
                <react_native_1.View style={[styles.dot, styles.dotActive]}/>
                <react_native_1.View style={styles.dot}/>
                <react_native_1.View style={styles.dot}/>
              </react_native_1.View>

              <react_native_1.Text style={styles.modalDesc}>
                파일을 분석 중이에요!{"\n"}잠시만 기다려주세요.
              </react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>)}
      </react_native_1.KeyboardAvoidingView>
    </react_native_1.SafeAreaView>);
}
const styles = react_native_1.StyleSheet.create({
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
    sheetOverlay: {
        ...react_native_1.StyleSheet.absoluteFillObject,
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
    modalOverlay: {
        ...react_native_1.StyleSheet.absoluteFillObject,
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
//# sourceMappingURL=upload.js.map