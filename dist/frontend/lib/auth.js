"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = exports.setAccessToken = void 0;
let accessToken = null;
const setAccessToken = (token) => {
    accessToken = token;
};
exports.setAccessToken = setAccessToken;
const getAccessToken = () => accessToken;
exports.getAccessToken = getAccessToken;
//# sourceMappingURL=auth.js.map