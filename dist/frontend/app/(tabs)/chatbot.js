"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ChatbotScreen;
const expo_router_1 = require("expo-router");
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
function ChatbotScreen() {
    const router = (0, expo_router_1.useRouter)();
    return (<react_native_1.SafeAreaView style={styles.safe}>
      
      <react_native_1.View style={styles.header}>
        <react_native_1.Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <react_native_1.Text style={styles.backText}>‹</react_native_1.Text>
        </react_native_1.Pressable>
        <react_native_1.Text style={styles.headerTitle}>AI 챗봇 상담</react_native_1.Text>
        <react_native_1.View style={styles.headerRightDummy}/>
      </react_native_1.View>

      <react_native_1.ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <react_native_1.Text style={styles.title}>
          안녕하세요.{"\n"}
          <react_native_1.Text style={styles.blue}>AI 챗봇 시시</react_native_1.Text>
          <react_native_1.Text style={styles.black}>에요.</react_native_1.Text>
        </react_native_1.Text>

        
        <react_native_1.View style={styles.circle}>
          <react_native_1.Image source={require("../../assets/images/chatbot-eyes.png")} style={styles.eyeImage} resizeMode="contain"/>
        </react_native_1.View>

        <react_native_1.Text style={styles.subTitle}>
          추천 메뉴를 고르거나,{"\n"}편하게 말씀하세요!
        </react_native_1.Text>

        <react_native_1.View style={{ height: 18 }}/>

        <react_native_1.Pressable style={styles.btn} onPress={() => router.push("/upload")}>
          <react_native_1.Text style={styles.btnText}>파일 업로드하기</react_native_1.Text>
        </react_native_1.Pressable>

        <react_native_1.Pressable style={styles.btn}>
          <react_native_1.Text style={styles.btnText}>내가 당한 사기 찾기</react_native_1.Text>
        </react_native_1.Pressable>

        <react_native_1.Pressable style={styles.btn}>
          <react_native_1.Text style={styles.btnText}>사기 통계 검색</react_native_1.Text>
        </react_native_1.Pressable>
      </react_native_1.ScrollView>

      
      <react_native_1.Pressable style={styles.fab}>
        <react_native_1.Text style={styles.fabIcon}>🎙️</react_native_1.Text>
      </react_native_1.Pressable>
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
    headerTitle: { fontSize: 18, fontWeight: "800", color: "#111" },
    headerRightDummy: { width: 36, height: 36 },
    container: {
        paddingHorizontal: 18,
        paddingTop: 26,
        paddingBottom: 40,
        alignItems: "center",
    },
    title: {
        textAlign: "center",
        fontSize: 28,
        fontWeight: "900",
        color: "#111",
        lineHeight: 36,
        marginBottom: 18,
    },
    blue: { color: "#2563EB", fontWeight: "900" },
    black: { color: "#111", fontWeight: "900" },
    circle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: "#8FB3FF",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 18,
    },
    eyeImage: {
        width: 320,
        height: 240,
    },
    subTitle: {
        textAlign: "center",
        fontSize: 18,
        fontWeight: "800",
        color: "#6B7280",
        lineHeight: 26,
    },
    btn: {
        width: "100%",
        height: 64,
        borderRadius: 18,
        backgroundColor: "#EDEDED",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 14,
    },
    btnText: {
        fontSize: 18,
        fontWeight: "800",
        color: "#6B7280",
    },
    fab: {
        position: "absolute",
        right: 18,
        bottom: 22,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: "#2563EB",
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
    },
    fabIcon: { fontSize: 22, color: "#fff" },
});
//# sourceMappingURL=chatbot.js.map