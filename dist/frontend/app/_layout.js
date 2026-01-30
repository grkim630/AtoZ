"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unstable_settings = void 0;
exports.default = RootLayout;
const native_1 = require("@react-navigation/native");
const expo_router_1 = require("expo-router");
const expo_status_bar_1 = require("expo-status-bar");
const react_1 = require("react");
require("react-native-reanimated");
const use_color_scheme_1 = require("@/hooks/use-color-scheme");
exports.unstable_settings = {
    anchor: "(tabs)",
};
function RootLayout() {
    const colorScheme = (0, use_color_scheme_1.useColorScheme)();
    const hasRequestedAuth = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(() => {
        if (hasRequestedAuth.current)
            return;
        hasRequestedAuth.current = true;
        const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
        const runAutoLogin = async () => {
            try {
                const response = await fetch(`${apiBase}/auth/auto`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) {
                    throw new Error(`auth auto failed: ${response.status}`);
                }
                const data = await response.json();
                console.log("auto login ok", data);
            }
            catch (error) {
                console.warn("auto login error", error);
            }
        };
        runAutoLogin();
    }, []);
    return (<native_1.ThemeProvider value={colorScheme === "dark" ? native_1.DarkTheme : native_1.DefaultTheme}>
      <expo_router_1.Stack>
        
        <expo_router_1.Stack.Screen name="(tabs)" options={{ headerShown: false }}/>

        
        <expo_router_1.Stack.Screen name="upload" options={{ headerShown: false }}/>
        <expo_router_1.Stack.Screen name="phone" options={{ headerShown: false }}/>
        <expo_router_1.Stack.Screen name="message" options={{ headerShown: false }}/>

        
        <expo_router_1.Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }}/>
      </expo_router_1.Stack>

      <expo_status_bar_1.StatusBar style="auto"/>
    </native_1.ThemeProvider>);
}
//# sourceMappingURL=_layout.js.map