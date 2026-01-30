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

// ✅ 카드 이미지들 (원하는 이미지로 바꿔도 됨)
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

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.back}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>내 기록</Text>
        <View style={styles.headerRightDummy} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 영역 */}
        <View style={styles.profileRow}>
          <View style={styles.avatarCircle}>
            <Image
              source={require("../../assets/images/chatbot-eyes.png")}
              style={styles.eyeImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>배기현</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>사기 예측 전문가</Text>
              </View>
            </View>

            <Text style={styles.countText}>체험 수 126회</Text>
            <Text style={styles.countText}>업로드 수 53회</Text>
          </View>

          <Pressable style={styles.chevronWrap}>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        {/* 저장한 영상 */}
        <Text style={styles.sectionTitle}>저장한 영상</Text>

        {/* ✅ 가로 스크롤로 변경 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}
        >
          {SAVED.map((src, idx) => (
            <Pressable key={`saved-${idx}`} style={styles.card}>
              <Image source={src} style={styles.cardImg} resizeMode="cover" />
              <Pressable style={styles.bookmarkBtn} hitSlop={8}>
                <Text style={styles.bookmarkIcon}>🔖</Text>
              </Pressable>
            </Pressable>
          ))}
          <View style={{ width: 6 }} />
        </ScrollView>

        <View style={styles.divider} />

        {/* 이미 시청했어요 */}
        <Text style={styles.sectionTitle}>이미 시청했어요</Text>

        {/* ✅ 가로 스크롤로 변경 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}
        >
          {WATCHED.map((src, idx) => (
            <Pressable key={`watched-${idx}`} style={styles.card}>
              <Image source={src} style={styles.cardImg} resizeMode="cover" />
              <Pressable style={styles.bookmarkBtn} hitSlop={8}>
                <Text style={styles.bookmarkIcon}>🔖</Text>
              </Pressable>
            </Pressable>
          ))}
          <View style={{ width: 6 }} />
        </ScrollView>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    width: 230, // ✅ 원래 230이라 너무 큼 → 프로필용으로 적당히
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

  // ✅ 가로 리스트 컨테이너
  hList: {
    paddingRight: 8,
    gap: 14, // 카드 사이 간격
  },

  card: {
    width: 165,
    height: 210,
    borderRadius: 22,
    backgroundColor: "#EFEFEF",
    overflow: "hidden",
  },

  // ✅ 카드 이미지 꽉 채우기
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
