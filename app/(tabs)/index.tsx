import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  ImageSourcePropType,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";


type CrimeCard = { id: string; image?: ImageSourcePropType; };

const mockCards: CrimeCard[] = [
  { id: "1", image: require("../../assets/images/trend1.png") },
  { id: "2", image: require("../../assets/images/trend2.png") },
  { id: "3" },
  { id: "4" },
];

export default function HomeScreen() {
  const [q, setQ] = React.useState("");

  const onPressCall = () => {
    // TODO: 전화 기능/화면으로 이동
    console.log("전화");
  };

  const onPressMessage = () => {
    // TODO: 메시지 기능/화면으로 이동
    console.log("메시지");
  };
  

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="보이스피싱 범죄 예방 방법이 궁금해요"
            placeholderTextColor="#B0B0B0"
            style={styles.searchInput}
            returnKeyType="search"
          />
          <Ionicons name="search" size={25} color="#555" />
        </View>

        {/* Subtitle */}
        <View style={styles.subTitleWrap}>
          <Text style={styles.subTitle}>예방하고 싶은</Text>
          <Text style={styles.subTitle}>
            <Text style={styles.subTitleBlue}>범죄 유형</Text>을 골라주세요!
         </Text>
        </View>

        {/* Big cards */}
        <Pressable style={styles.bigCard} onPress={onPressCall}>
          <ImageBackground
            source={require("../../assets/images/card_call.png")}
            style={styles.bigCardBg}
            imageStyle={styles.bigCardImg}
            resizeMode="cover"
          >
            <View style={styles.bigCardOverlay} />
            <Text style={styles.bigCardCenterText}>전화</Text>
         </ImageBackground>
        </Pressable>

        <Pressable style={styles.bigCard} onPress={onPressMessage}>
          <ImageBackground
            source={require("../../assets/images/card_message.png")}
            style={styles.bigCardBg}
            imageStyle={styles.bigCardImg}
            resizeMode="cover"
          >
            <View style={styles.bigCardOverlay} />
            <Text style={styles.bigCardCenterText}>메시지</Text>
          </ImageBackground>
        </Pressable>

        <View style={styles.divider} />

        {/* Section title */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>신종 유행 범죄</Text>
          <Ionicons name="chevron-forward" size={26} color="#111" />
        </View>

        {/* Grid (scroll 내려야 보이도록 위 요소들이 충분히 위에 있음) */}
        
        <View style={styles.grid}>
          {mockCards.map((item) => (
            <Pressable
              key={item.id}
              style={styles.gridCard}
              onPress={() => console.log("card", item.id)}
            >
              {item.image ? (
                <ImageBackground
                  source={item.image}
                  style={styles.gridImgBg}
                  imageStyle={styles.gridImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.gridPlaceholder} />
              )}

              <Pressable
                style={styles.bookmarkBtn}
                onPress={() => console.log("bookmark", item.id)}
                hitSlop={8}
              >
                <Ionicons name="bookmark-outline" size={18} color="#111" />
              </Pressable>
            </Pressable>
          ))}
        </View>
        

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { paddingHorizontal: 18, paddingTop: 10 },

  headerRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "800", color: "#111" },
  titleIcon: { fontSize: 18, fontWeight: "800", color: "#111", opacity: 0.85 },
 
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
  searchInput: { flex: 1, fontSize: 15, color: "#111", paddingVertical:0,},

  subTitleWrap: {
    marginTop: 8,
    marginBottom: 18,
  },

  subTitle: { fontSize: 20, fontWeight: "800", color: "#111", lineHeight: 24 },
  subTitleBlue: {
    color: "#2563EB", 
    fontWeight: "900",
  },
  subTitleBold: { fontWeight: "800", color: "#111" },

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
    ...StyleSheet.absoluteFillObject,
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

  sectionRow: { marginTop: 6,  marginBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
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
  
    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  
    // Android shadow
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
