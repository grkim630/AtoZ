import { useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Card = {
  id: string;
  title: string;
  reports: string;
  time: string;
  image?: any;
};

const DATA: Card[] = [
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

export default function PhoneScreen() {
  const router = useRouter();

  // ✅ 카드 id별로 이동할 라우트 매핑
  const goTo = (id: string) => {
    // ✅ 경찰청 사칭만 상세(영상) 화면으로 이동
    if (id === "police") {
      router.push("/phone/police");
      return;
    }

    // 나머지는 이동 안 함 (추후 구현 전까지)
    // 필요하면 안내 메시지 띄우기
    // Alert.alert("준비 중", "이 시나리오는 준비 중이에요!");
    return;
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)");
          }}
          hitSlop={10}
          style={styles.back}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>전화 사기</Text>
        </View>

        <View style={styles.headerRightDummy} />
      </View>

      {/* 검색바 */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <TextInput
            placeholder="검찰청에서 전화가 걸려 왔어요."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>
      </View>

      {/* 카드 그리드 */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {DATA.map((item) => (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() => goTo(item.id)} // ✅ 여기 추가!
          >
            {/* 썸네일 */}
            {item.image ? (
              <ImageBackground
                source={item.image}
                style={styles.thumb}
                imageStyle={styles.thumbImg}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.thumbPlaceholder} />
            )}

            {/* 북마크 (카드 눌림과 분리되게 stopPropagation 같은건 RN에 없어서,
               북마크 버튼을 눌러도 카드 이동되면 원치 않으니, 아래처럼 onPress를 빈 함수로 막아둠) */}
            <Pressable
              style={styles.bookmarkBtn}
              hitSlop={8}
              onPress={() => {
                // TODO: 북마크 로직 넣기
              }}
            >
              <Text style={styles.bookmarkIcon}>🔖</Text>
            </Pressable>

            {/* 텍스트 */}
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>
              {item.reports} · {item.time}
            </Text>
          </Pressable>
        ))}
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
    rowGap: 14,
  },

  card: {
    width: "47%",
    height: 230,
    backgroundColor: "#EFEFEF",
    borderRadius: 18,
    overflow: "hidden",
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
