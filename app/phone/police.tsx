import { ResizeMode, Video } from "expo-av";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useRef } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function PoliceScreen() {
  const router = useRouter();
  const videoRef = useRef<Video | null>(null);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <View style={styles.container}>
      {/* ✅ 이 화면은 헤더 완전히 숨김 */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* 배경 영상 */}
      <Video
        ref={videoRef}
        source={require("../../assets/videos/police.mp4")}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted={false}
      />

      {/* ✅ 뒤로가기 버튼만 오버레이 */}
      <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
        <Pressable onPress={goBack} style={styles.backBtn} hitSlop={10}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
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
