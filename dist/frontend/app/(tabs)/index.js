"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomeScreen;
const vector_icons_1 = require("@expo/vector-icons");
const expo_router_1 = require("expo-router");
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const mockCards = [
    { id: "1", image: require("../../assets/images/trend1.png") },
    { id: "2", image: require("../../assets/images/trend2.png") },
    { id: "3", image: require("../../assets/images/used-trade.png") },
    { id: "4", image: require("../../assets/images/court-paper.png") },
];
function HomeScreen() {
    const router = (0, expo_router_1.useRouter)();
    const [q, setQ] = react_1.default.useState("");
    const onPressCall = () => {
        router.push("/phone");
    };
    const onPressMessage = () => {
        router.push("/message");
    };
    return (<react_native_1.SafeAreaView style={styles.safe}>
      <react_native_1.ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <react_native_1.View style={styles.header}>
          <react_native_1.Image source={require("../../assets/images/logo.png")} style={styles.logo} resizeMode="contain"/>
        </react_native_1.View>

        
        <react_native_1.View style={styles.searchWrap}>
          <react_native_1.TextInput value={q} onChangeText={setQ} placeholder="보이스피싱 범죄 예방 방법이 궁금해요" placeholderTextColor="#B0B0B0" style={styles.searchInput} returnKeyType="search"/>
          <vector_icons_1.Ionicons name="search" size={25} color="#555"/>
        </react_native_1.View>

        
        <react_native_1.View style={styles.subTitleWrap}>
          <react_native_1.Text style={styles.subTitle}>예방하고 싶은</react_native_1.Text>
          <react_native_1.Text style={styles.subTitle}>
            <react_native_1.Text style={styles.subTitleBlue}>범죄 유형</react_native_1.Text>을 골라주세요!
          </react_native_1.Text>
        </react_native_1.View>

        
        <react_native_1.Pressable style={styles.bigCard} onPress={onPressCall}>
          <react_native_1.ImageBackground source={require("../../assets/images/card_call.png")} style={styles.bigCardBg} imageStyle={styles.bigCardImg} resizeMode="cover">
            <react_native_1.View style={styles.bigCardOverlay}/>
            <react_native_1.Text style={styles.bigCardCenterText}>전화</react_native_1.Text>
          </react_native_1.ImageBackground>
        </react_native_1.Pressable>

        <react_native_1.Pressable style={styles.bigCard} onPress={onPressMessage}>
          <react_native_1.ImageBackground source={require("../../assets/images/card_message.png")} style={styles.bigCardBg} imageStyle={styles.bigCardImg} resizeMode="cover">
            <react_native_1.View style={styles.bigCardOverlay}/>
            <react_native_1.Text style={styles.bigCardCenterText}>메시지</react_native_1.Text>
          </react_native_1.ImageBackground>
        </react_native_1.Pressable>

        <react_native_1.View style={styles.divider}/>

        
        <react_native_1.View style={styles.sectionRow}>
          <react_native_1.Text style={styles.sectionTitle}>신종 유행 범죄</react_native_1.Text>
          <vector_icons_1.Ionicons name="chevron-forward" size={26} color="#111"/>
        </react_native_1.View>

        
        <react_native_1.View style={styles.grid}>
          {mockCards.map((item) => (<react_native_1.Pressable key={item.id} style={styles.gridCard} onPress={() => console.log("card", item.id)}>
              {item.image ? (<react_native_1.ImageBackground source={item.image} style={styles.gridImgBg} imageStyle={styles.gridImg} resizeMode="cover"/>) : (<react_native_1.View style={styles.gridPlaceholder}/>)}

              <react_native_1.Pressable style={styles.bookmarkBtn} onPress={() => console.log("bookmark", item.id)} hitSlop={8}>
                <vector_icons_1.Ionicons name="bookmark-outline" size={18} color="#111"/>
              </react_native_1.Pressable>
            </react_native_1.Pressable>))}
        </react_native_1.View>

        <react_native_1.View style={{ height: 16 }}/>
      </react_native_1.ScrollView>
    </react_native_1.SafeAreaView>);
}
const styles = react_native_1.StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#fff" },
    container: { paddingHorizontal: 18, paddingTop: 10 },
    header: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
    },
    logo: {
        width: 120,
        height: 32,
    },
    searchWrap: {
        height: 46,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#9E9E9E",
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 18,
        paddingRight: 18,
        marginTop: 6,
        marginBottom: 16,
        backgroundColor: "#fff",
    },
    searchInput: { flex: 1, fontSize: 15, color: "#111", paddingVertical: 0 },
    subTitleWrap: {
        marginTop: 8,
        marginBottom: 18,
    },
    subTitle: { fontSize: 20, fontWeight: "800", color: "#111", lineHeight: 24 },
    subTitleBlue: {
        color: "#2563EB",
        fontWeight: "900",
    },
    bigCard: {
        height: 145,
        borderRadius: 26,
        overflow: "hidden",
        marginBottom: 16,
        backgroundColor: "#EDEDED",
    },
    bigCardBg: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    bigCardImg: {
        borderRadius: 22,
    },
    bigCardOverlay: {
        ...react_native_1.StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.25)",
    },
    bigCardCenterText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "500",
    },
    divider: {
        height: 2,
        backgroundColor: "#D0D0D0",
        marginVertical: 12,
    },
    sectionRow: {
        marginTop: 6,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sectionTitle: { fontSize: 20, fontWeight: "800", color: "#111" },
    grid: {
        marginTop: 12,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    gridCard: {
        width: "48%",
        height: 230,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: "#F3F4F6",
        marginBottom: 14,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    gridImgBg: {
        width: "100%",
        height: "100%",
    },
    gridImg: {
        borderRadius: 24,
    },
    gridPlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "#EFEFEF",
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
});
//# sourceMappingURL=index.js.map