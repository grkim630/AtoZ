"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconSymbol = IconSymbol;
const MaterialIcons_1 = __importDefault(require("@expo/vector-icons/MaterialIcons"));
const MAPPING = {
    'house.fill': 'home',
    'paperplane.fill': 'send',
    'chevron.left.forwardslash.chevron.right': 'code',
    'chevron.right': 'chevron-right',
};
function IconSymbol({ name, size = 24, color, style, }) {
    return <MaterialIcons_1.default color={color} size={size} name={MAPPING[name]} style={style}/>;
}
//# sourceMappingURL=icon-symbol.js.map