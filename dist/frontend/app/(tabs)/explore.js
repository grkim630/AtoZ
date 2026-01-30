"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExploreScreen;
const expo_router_1 = require("expo-router");
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const SAVED = [
    require("../../assets/images/police-call.png"),
    require("../../assets/images/court-paper.png"),
    require("../../assets/images/used-trade.png"),
    require("../../assets/images/child-scam.png"),
];
const WATCHED = [
    require("../../assets/images/court-paper.png"),
    require("../../assets/images/used-trade.png"),
    require("../../assets/images/police-call.png"),
    require("../../assets/images/child-scam.png"),
];
function ExploreScreen() {
    const router = (0, expo_router_1.useRouter)();
    return (<react_native_1.SafeAreaView style={styles.safe}>
      
      <react_native_1.View style={styles.header}>
        <react_native_1.Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <react_native_1.Text style={styles.backText}>‹</react_native_1.Text>
        </react_native_1.Pressable>
        <react_native_1.Text style={styles.headerTitle}>내 기록</react_native_1.Text>
        <react_native_1.View style={styles.headerRightDummy}/>
      </react_native_1.View>

      <react_native_1.ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <react_native_1.View style={styles.profileRow}>
          <react_native_1.View style={styles.avatarCircle}>
            <react_native_1.Image source={require("../../assets/images/chatbot-eyes.png")} style={styles.eyeImage} resizeMode="contain"/>
          </react_native_1.View>

          <react_native_1.View style={styles.profileInfo}>
            <react_native_1.View style={styles.nameRow}>
              <react_native_1.Text style={styles.name}>배기현</react_native_1.Text>
              <react_native_1.View style={styles.badge}>
                <react_native_1.Text style={styles.badgeText}>사기 예측 전문가</react_native_1.Text>
              </react_native_1.View>
            </react_native_1.View>

            <react_native_1.Text style={styles.countText}>체험 수 126회</react_native_1.Text>
            <react_native_1.Text style={styles.countText}>업로드 수 53회</react_native_1.Text>
          </react_native_1.View>

          <react_native_1.Pressable style={styles.chevronWrap}>
            <react_native_1.Text style={styles.chevron}>›</react_native_1.Text>
          </react_native_1.Pressable>
        </react_native_1.View>

        
        <react_native_1.Text style={styles.sectionTitle}>저장한 영상</react_native_1.Text>

        
        <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
          {SAVED.map((src, idx) => (<react_native_1.Pressable key={`saved-${idx}`} style={styles.card}>
              <react_native_1.Image source={src} style={styles.cardImg} resizeMode="cover"/>
              <react_native_1.Pressable style={styles.bookmarkBtn} hitSlop={8}>
                <react_native_1.Text style={styles.bookmarkIcon}>🔖</react_native_1.Text>
              </react_native_1.Pressable>
            </react_native_1.Pressable>))}
          <react_native_1.View style={{ width: 6 }}/>
        </react_native_1.ScrollView>

        <react_native_1.View style={styles.divider}/>

        
        <react_native_1.Text style={styles.sectionTitle}>이미 시청했어요</react_native_1.Text>

        
        <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
          {WATCHED.map((src, idx) => (<react_native_1.Pressable key={`watched-${idx}`} style={styles.card}>
              <react_native_1.Image source={src} style={styles.cardImg} resizeMode="cover"/>
              <react_native_1.Pressable style={styles.bookmarkBtn} hitSlop={8}>
                <react_native_1.Text style={styles.bookmarkIcon}>🔖</react_native_1.Text>
              </react_native_1.Pressable>
            </react_native_1.Pressable>))}
          <react_native_1.View style={{ width: 6 }}/>
        </react_native_1.ScrollView>

        <react_native_1.View style={{ height: 40 }}/>
      </react_native_1.ScrollView>
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
    headerTitle: { fontSize: 20, fontWeight: "900", color: "#111" },
    headerRightDummy: { width: 36, height: 36 },
    container: {
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 40,
    },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
    },
    avatarCircle: {
        width: 86,
        height: 86,
        borderRadius: 43,
        backgroundColor: "#8FB3FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
        overflow: "hidden",
    },
    eyeImage: {
        width: 230,
        height: 130,
    },
    profileInfo: { flex: 1 },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 6,
    },
    name: { fontSize: 22, fontWeight: "900", color: "#111" },
    badge: {
        borderWidth: 1,
        borderColor: "#93C5FD",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    badgeText: { fontSize: 13, fontWeight: "800", color: "#3B82F6" },
    countText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#9CA3AF",
        lineHeight: 22,
    },
    chevronWrap: {
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
    },
    chevron: { fontSize: 28, color: "#9CA3AF" },
    sectionTitle: {
        fontSize: 26,
        fontWeight: "900",
        color: "#111",
        marginTop: 16,
        marginBottom: 12,
    },
    hList: {
        paddingRight: 8,
        gap: 14,
    },
    card: {
        width: 165,
        height: 210,
        borderRadius: 22,
        backgroundColor: "#EFEFEF",
        overflow: "hidden",
    },
    cardImg: {
        width: "100%",
        height: "100%",
    },
    bookmarkBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "rgba(255,255,255,0.95)",
        alignItems: "center",
        justifyContent: "center",
    },
    bookmarkIcon: { fontSize: 18 },
    divider: {
        height: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        marginVertical: 22,
    },
});
//# sourceMappingURL=explore.js.map