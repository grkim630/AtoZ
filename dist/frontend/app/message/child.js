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
exports.default = ChildImpersonationChat;
const expo_router_1 = require("expo-router");
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const uid = () => Math.random().toString(36).slice(2);
function getScammerReply(step, userText) {
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
    if (step === 2)
        return "입금하면 캡처해서 보내줘. 엄마한테는 말하지 말고…";
    return "지금 정말 급해. 부탁할게…";
}
function ChildImpersonationChat() {
    const router = (0, expo_router_1.useRouter)();
    const [messages, setMessages] = (0, react_1.useState)([
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
    const [input, setInput] = (0, react_1.useState)("");
    const mySendCount = (0, react_1.useMemo)(() => messages.filter((m) => m.from === "me").length, [messages]);
    const listRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 30);
    }, [messages.length]);
    const send = () => {
        const text = input.trim();
        if (!text)
            return;
        const myMsg = { id: uid(), from: "me", text, createdAt: Date.now() };
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
    const renderItem = ({ item }) => {
        const mine = item.from === "me";
        return (<react_native_1.View style={[styles.bubbleRow, mine ? styles.rowRight : styles.rowLeft]}>
        <react_native_1.View style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleOther]}>
          <react_native_1.Text style={[styles.bubbleText, mine ? styles.textMe : styles.textOther]}>
            {item.text}
          </react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>);
    };
    return (<react_native_1.SafeAreaView style={styles.safe}>
      
      <expo_router_1.Stack.Screen options={{ headerShown: false }}/>

      
      <react_native_1.View style={styles.header}>
        <react_native_1.Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <react_native_1.Text style={styles.backText}>‹</react_native_1.Text>
        </react_native_1.Pressable>
        <react_native_1.Text style={styles.title}>메세지 사기</react_native_1.Text>
        <react_native_1.View style={{ width: 36 }}/>
      </react_native_1.View>

      <react_native_1.KeyboardAvoidingView style={{ flex: 1 }} behavior={react_native_1.Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={react_native_1.Platform.OS === "ios" ? 0 : 0}>
        <react_native_1.FlatList ref={listRef} data={messages} keyExtractor={(m) => m.id} renderItem={renderItem} contentContainerStyle={styles.chat} showsVerticalScrollIndicator={false} style={{ flex: 1 }}/>

        
        <react_native_1.View style={styles.inputBar}>
          <react_native_1.TextInput value={input} onChangeText={setInput} placeholder="메시지를 입력하세요" placeholderTextColor="#9CA3AF" style={styles.input} returnKeyType="send" onSubmitEditing={send}/>
          <react_native_1.Pressable onPress={send} style={styles.sendBtn}>
            <react_native_1.Text style={styles.sendText}>전송</react_native_1.Text>
          </react_native_1.Pressable>
        </react_native_1.View>
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
    title: { fontSize: 18, fontWeight: "900", color: "#111" },
    chat: {
        paddingHorizontal: 16,
        paddingTop: 14,
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
//# sourceMappingURL=child.js.map