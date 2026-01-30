"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TabLayout;
const expo_router_1 = require("expo-router");
const react_1 = __importDefault(require("react"));
const haptic_tab_1 = require("@/components/haptic-tab");
const icon_symbol_1 = require("@/components/ui/icon-symbol");
const theme_1 = require("@/constants/theme");
const use_color_scheme_1 = require("@/hooks/use-color-scheme");
function TabLayout() {
    const colorScheme = (0, use_color_scheme_1.useColorScheme)();
    return (<expo_router_1.Tabs screenOptions={{
            tabBarActiveTintColor: theme_1.Colors[colorScheme ?? "light"].tint,
            headerShown: false,
            tabBarButton: haptic_tab_1.HapticTab,
        }}>
      <expo_router_1.Tabs.Screen name="chatbot" options={{
            title: "챗봇",
            tabBarIcon: ({ color }) => (<icon_symbol_1.IconSymbol size={28} name="message.fill" color={color}/>),
        }}/>

      <expo_router_1.Tabs.Screen name="index" options={{
            title: "홈",
            tabBarIcon: ({ color }) => (<icon_symbol_1.IconSymbol size={28} name="house.fill" color={color}/>),
        }}/>

      <expo_router_1.Tabs.Screen name="explore" options={{
            title: "내 기록",
            tabBarIcon: ({ color }) => (<icon_symbol_1.IconSymbol size={28} name="person.fill" color={color}/>),
        }}/>
    </expo_router_1.Tabs>);
}
//# sourceMappingURL=_layout.js.map