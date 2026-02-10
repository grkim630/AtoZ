import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/src/constants/Colors';
import { Icons } from '@/src/constants/Icons';
import { MOCK_PHISHING_CASES, MOCK_STATS } from '@/src/services/mockData';

const { width } = Dimensions.get('window');

// Header Component
const Header = () => (
  <View style={styles.header}>
    <View style={styles.logoContainer}>
      <Text style={styles.logoText}>시시콜콜</Text>
      <View style={styles.chatIcon}>
        <Icons.Chat.Type
          name={Icons.Chat.Name}
          size={24}
          color={Colors.primary}
        />
      </View>
    </View>
    <View style={styles.headerRight}>
       <Icons.Alert.Type name={Icons.Alert.Name} size={24} color={Colors.gray} />
    </View>
  </View>
);

// Main Action Button Component
const UploadButton = () => {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.uploadButton,
        pressed && styles.uploadButtonPressed,
      ]}
      onPress={() => {
        router.push('/upload');
      }}>
      <LinearGradient
        colors={[Colors.primary, '#4D7DFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.uploadGradient}>
        <Text style={styles.uploadButtonText}>피해 사례 업로드</Text>
      </LinearGradient>
    </Pressable>
  );
};

// Stats Card Component
const StatsCard = ({ label, value, color }: { label: string; value: string; color: string }) => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
      delay: 300,
    }).start();
  }, [scale]);

  return (
    <Animated.View style={[styles.statsCard, { transform: [{ scale }] }]}>
      <Text style={styles.statsLabel}>{label}</Text>
      <Text style={[styles.statsValue, { color }]}>{value}</Text>
    </Animated.View>
  );
};

// Main Screen
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Main CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>내가 받은 연락, <Text style={styles.highlight}>사기</Text> 같다면?</Text>
          <Text style={styles.ctaSubtitle}>AI와 상담을 통해 위험도를 분석해보세요.</Text>
          <UploadButton />
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <StatsCard
             label="오늘 신고"
             value={MOCK_STATS.todayReports.toLocaleString()}
             color={Colors.primary}
          />
          <View style={styles.divider} />
           <StatsCard
             label="오늘 예방"
             value={MOCK_STATS.todayPrevention.toLocaleString()}
             color={Colors.success}
          />
          <View style={styles.divider} />
           <StatsCard
             label="누적 신고"
             value={MOCK_STATS.totalReports.toLocaleString()}
             color={Colors.primary}
          />
        </View>

        {/* New Crimes Section */}
        <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
                <Text style={styles.fireIcon}>🔥</Text>
                <Text style={styles.sectionTitle}>신종 범죄 알아보기</Text>
            </View>
            <Icons.Chevron.Type name={Icons.Chevron.Name} size={20} color={Colors.primary} />
        </View>
        
        <View style={styles.crimeCard}>
          <View style={styles.crimeImagePlaceholder} >
             {/* Placeholder for the phone image in the design */}
             <Icons.Image.Type name={Icons.Image.Name} size={40} color={Colors.white} />
          </View>
          <Text style={styles.crimeCardText}>실제 지인의 번호로 사칭 전화가 왔어요.</Text>
        </View>

        {/* Hot Posts Section */}
         <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
                <Text style={styles.bulbIcon}>💡</Text>
                <Text style={styles.sectionTitle}>오늘 핫한 게시글</Text>
            </View>
            <Icons.Chevron.Type name={Icons.Chevron.Name} size={20} color={Colors.primary} />
        </View>

        <View style={styles.hotPostsContainer}>
          {MOCK_PHISHING_CASES.map((item, index) => (
            <View key={item.id} style={styles.postItem}>
              <Text style={styles.postIndex}>{`0${index + 1}`}</Text>
              <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} /> 
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5F9', // Light grayish background similar to the image
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F3F5F9',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginRight: 4,
  },
  chatIcon: {
      paddingTop: 4,
  },
  headerRight: {
      //
  },
  ctaSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 25,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  highlight: {
    color: Colors.error,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  uploadButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
     shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  uploadButtonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
  },
  uploadGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsCard: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E5E5EA',
    alignSelf: 'center',
  },
  statsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 6,
  },
  fireIcon: {
    fontSize: 18,
  },
  bulbIcon: {
      fontSize: 18,
  },
  crimeCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
     shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  crimeImagePlaceholder: {
    height: 150,
    backgroundColor: '#8E8E93', // Placeholder color
    justifyContent: 'center',
    alignItems: 'center',
  },
  crimeCardText: {
    padding: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  hotPostsContainer: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
  },
  postIndex: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    width: 40,
    textAlign: 'center',
  },
  postTitle: {
    fontSize: 15,
    color: '#111',
    flex: 1,
    fontWeight: '500',
  },
});
