import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../src/constants/Colors';

const { width } = Dimensions.get('window');

export default function GalleryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Title */}
        <Text style={styles.headerTitle}>피싱 갤러리</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
            <TextInput 
                style={styles.searchInput}
                placeholder="경찰을 사칭한 보이스피싱 범죄"
                placeholderTextColor="#999"
            />
            <Ionicons name="search" size={24} color="#999" style={styles.searchIcon} />
        </View>

        {/* Main Title */}
        <Text style={styles.sectionTitle}>
            체험하고 싶은{'\n'}
            <Text style={{ color: '#003DFF' }}>범죄 유형</Text>을 골라주세요.
        </Text>

        {/* Large Cards */}
        <Pressable onPress={() => router.push('/gallery/phone_list')} style={styles.cardContainer}>
             <ImageBackground
                source={require('../../../assets/images/Rectangle 12.png')}
                style={styles.cardInfo}
                imageStyle={{ borderRadius: 20 }}
                resizeMode="cover"
             >
                <View style={styles.overlay}>
                    <Text style={styles.cardText}>전화</Text>
                    {/* Decorative Icons to mimic the phone UI in the screenshot */}
                    <Ionicons name="call" size={40} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', top: 20, left: 30 }} />
                    <Ionicons name="mic" size={30} color="rgba(255,255,255,0.2)" style={{ position: 'absolute', bottom: 30, right: 40 }} />
                </View>
             </ImageBackground>
        </Pressable>

        <Pressable onPress={() => router.push('/gallery/message_list')} style={styles.cardContainer}>
            <ImageBackground
                source={require('../../../assets/images/Rectangle 14.png')}
                style={styles.cardInfo}
                imageStyle={{ borderRadius: 20 }}
                resizeMode="cover"
            >
                <View style={styles.overlay}>
                    <Text style={styles.cardText}>메세지</Text>
                     {/* Decorative Icons to mimic the message UI */}
                    <Ionicons name="chatbubble-ellipses" size={40} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', top: 30, right: 30 }} />
                </View>
            </ImageBackground>
        </Pressable>

        <View style={styles.divider} />

        {/* Bottom Banner */}
        <Text style={styles.bottomTitle}>
            <Text style={{ color: '#003DFF' }}>피해</Text>를 당했다면?
        </Text>
        
        <Pressable onPress={() => router.push('/guide/category')} style={styles.guideButton}>
            <LinearGradient
                colors={['#003DFF', '#0029AA']}
                style={styles.guideGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <View style={styles.sirenContainer}>
                    <Image 
                        source={require('../../../assets/images/siren.png')}
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.guideTextContainer}>
                    <Text style={styles.guideSubtitle}>범행 종류 · 단계별</Text>
                    <Text style={styles.guideMainText}>피해 사례 대응 방법</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="white" />
            </LinearGradient>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#111',
  },
  searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#EFEFEF', // Use 'EFEFEF' for subtleness or 'C7C7CC' if needed
      borderRadius: 30, // Fully rounded
      paddingHorizontal: 15,
      height: 50,
      marginBottom: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
  },
  searchInput: {
      flex: 1,
      fontSize: 15,
      color: '#111',
  },
  searchIcon: {
      marginLeft: 10,
  },
  sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      lineHeight: 28,
      marginBottom: 20,
      color: '#111',
  },
  cardContainer: {
      width: '100%',
      height: 160,
      borderRadius: 20,
      marginBottom: 15,
      overflow: 'hidden',
      // Shadow for depth
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 5,
  },
  cardInfo: {
      flex: 1,
  },
  overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.2)', // Slight darken overlay
  },
  cardText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
      zIndex: 1,
  },
  divider: {
      height: 1,
      backgroundColor: '#F2F2F2',
      marginVertical: 30,
  },
  bottomTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#111',
  },
  guideButton: {
      width: '100%',
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#003DFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 8,
      marginBottom: 40,
  },
  guideGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      height: 100,
  },
  sirenContainer: {
      width: 50,
      height: 50,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
  },
  guideTextContainer: {
      flex: 1,
  },
  guideSubtitle: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: 4,
  },
  guideMainText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
  },
});
