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
exports.default = PoliceScreen;
const expo_av_1 = require("expo-av");
const expo_router_1 = require("expo-router");
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
function PoliceScreen() {
    const router = (0, expo_router_1.useRouter)();
    const videoRef = (0, react_1.useRef)(null);
    const goBack = (0, react_1.useCallback)(() => {
        router.back();
    }, [router]);
    return (<react_native_1.View style={styles.container}>
      
      <expo_router_1.Stack.Screen options={{ headerShown: false }}/>

      
      <expo_av_1.Video ref={videoRef} source={require("../../assets/videos/police.mp4")} style={react_native_1.StyleSheet.absoluteFill} resizeMode={expo_av_1.ResizeMode.COVER} shouldPlay isLooping isMuted={false}/>

      
      <react_native_1.SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
        <react_native_1.Pressable onPress={goBack} style={styles.backBtn} hitSlop={10}>
          <react_native_1.Text style={styles.backText}>←</react_native_1.Text>
        </react_native_1.Pressable>
      </react_native_1.SafeAreaView>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },
    topOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 14,
        paddingTop: 6,
        alignItems: "flex-start",
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(0,0,0,0.35)",
        alignItems: "center",
        justifyContent: "center",
    },
    backText: { color: "white", fontSize: 22, fontWeight: "700" },
});
//# sourceMappingURL=police.js.map