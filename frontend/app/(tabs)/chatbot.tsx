import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ChatbotScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.back}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>AI 챗봇 상담</Text>
        <View style={styles.headerRightDummy} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          안녕하세요.{"\n"}
          <Text style={styles.blue}>AI 챗봇 시시</Text>
          <Text style={styles.black}>에요.</Text>
        </Text>

        {/* 원형 캐릭터 자리 */}
        <View style={styles.circle}>
          <Image
            // ✅ 여기 경로만 네 프로젝트에 맞게 수정!
            source={require("../../assets/images/chatbot-eyes.png")}
            style={styles.eyeImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.subTitle}>
          추천 메뉴를 고르거나,{"\n"}편하게 말씀하세요!
        </Text>

        <View style={{ height: 18 }} />

        <Pressable style={styles.btn} onPress={() => router.push("/upload")}>
          <Text style={styles.btnText}>파일 업로드하기</Text>
        </Pressable>

        <Pressable style={styles.btn}>
          <Text style={styles.btnText}>내가 당한 사기 찾기</Text>
        </Pressable>

        <Pressable style={styles.btn}>
          <Text style={styles.btnText}>사기 통계 검색</Text>
        </Pressable>
      </ScrollView>

      {/* 우측 하단 음성 버튼 */}
      <Pressable style={styles.fab}>
        <Text style={styles.fabIcon}>🎙️</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

  // ✅ 눈 이미지 크기/위치 조절은 여기서!
  eyeImage: {
    width: 320,
    height: 240,
    // 필요하면 살짝 위로: marginTop: -6,
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
