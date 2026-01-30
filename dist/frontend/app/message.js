"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MessageScamScreen;
const expo_router_1 = require("expo-router");
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const DATA = [
    {
        id: "police",
        title: "경찰청 사칭\n사기",
        reports: "신고 건 수 142만 회",
        time: "1시간 전",
        image: require("../assets/images/police-call.png"),
    },
    {
        id: "court",
        title: "법원 등기\n사기",
        reports: "신고 건 수 115만 회",
        time: "7일 전",
        image: require("../assets/images/court-paper.png"),
    },
    {
        id: "used",
        title: "중고거래\n사기",
        reports: "신고 건 수 108만 회",
        time: "3일 전",
        image: require("../assets/images/used-trade.png"),
    },
    {
        id: "child",
        title: "자녀 사칭\n사기",
        reports: "신고 건 수 95만 회",
        time: "10일 전",
        image: require("../assets/images/child-scam.png"),
    },
];
function MessageScamScreen() {
    const router = (0, expo_router_1.useRouter)();
    const { width } = (0, react_native_1.useWindowDimensions)();
    const sidePadding = 16;
    const gap = 14;
    const cardWidth = (width - sidePadding * 2 - gap) / 2;
    return (<react_native_1.SafeAreaView style={styles.safe}>
      
      <react_native_1.View style={styles.header}>
        <react_native_1.Pressable onPress={() => {
            if (router.canGoBack())
                router.back();
            else
                router.replace("/(tabs)");
        }} hitSlop={10} style={styles.back}>
          <react_native_1.Text style={styles.backText}>‹</react_native_1.Text>
        </react_native_1.Pressable>

        <react_native_1.View style={styles.headerCenter}>
          <react_native_1.Text style={styles.headerTitle}>메세지 사기</react_native_1.Text>
        </react_native_1.View>

        <react_native_1.View style={styles.headerRightDummy}/>
      </react_native_1.View>

      
      <react_native_1.View style={styles.searchWrap}>
        <react_native_1.View style={styles.searchBar}>
          <react_native_1.TextInput placeholder="메세지에서 이상한 요구가 왔어요." placeholderTextColor="#9CA3AF" style={styles.searchInput}/>
          <react_native_1.Text style={styles.searchIcon}>🔍</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>

      
      <react_native_1.ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="never">
        {DATA.map((item) => {
            const CardInner = (<react_native_1.View style={[styles.card, { width: cardWidth }]}>
              
              {item.image ? (<react_native_1.ImageBackground source={item.image} style={styles.thumb} imageStyle={styles.thumbImg} resizeMode="cover"/>) : (<react_native_1.View style={styles.thumbPlaceholder}/>)}

              
              <react_native_1.Pressable style={styles.bookmarkBtn} hitSlop={8} onPress={() => {
                }}>
                <react_native_1.Text style={styles.bookmarkIcon}>🔖</react_native_1.Text>
              </react_native_1.Pressable>

              
              <react_native_1.Text style={styles.cardTitle}>{item.title}</react_native_1.Text>
              <react_native_1.Text style={styles.cardMeta}>
                {item.reports} · {item.time}
              </react_native_1.Text>
            </react_native_1.View>);
            if (item.id === "child") {
                return (<expo_router_1.Link key={item.id} href="/message/child" asChild>
                <react_native_1.Pressable>{CardInner}</react_native_1.Pressable>
              </expo_router_1.Link>);
            }
            return (<react_native_1.Pressable key={item.id} onPress={() => { }}>
              {CardInner}
            </react_native_1.Pressable>);
        })}

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
    headerCenter: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
    },
    headerTitle: { fontSize: 18, fontWeight: "900", color: "#111" },
    headerRightDummy: { width: 36, height: 36 },
    searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
    searchBar: {
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.18)",
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
    },
    searchInput: { flex: 1, fontSize: 14, color: "#111", paddingRight: 10 },
    searchIcon: { fontSize: 18 },
    grid: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 40,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    card: {
        height: 230,
        backgroundColor: "#EFEFEF",
        borderRadius: 18,
        overflow: "hidden",
        marginBottom: 14,
    },
    thumb: { width: "100%", height: 130 },
    thumbImg: { borderTopLeftRadius: 18, borderTopRightRadius: 18 },
    thumbPlaceholder: { width: "100%", height: 130, backgroundColor: "#E5E7EB" },
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
    cardTitle: {
        marginTop: 12,
        paddingHorizontal: 12,
        fontSize: 16,
        fontWeight: "900",
        color: "#111",
        lineHeight: 22,
        marginBottom: 6,
    },
    cardMeta: {
        paddingHorizontal: 12,
        fontSize: 12,
        fontWeight: "800",
        color: "#6B7280",
    },
});
//# sourceMappingURL=message.js.map