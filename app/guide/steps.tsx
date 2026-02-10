import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/*
  Crime Response Steps Flowchart Screen
  Visualizes the response process in 7 levels.
  Refined with curved bracket-style connectors and softer UI (Pure White boxes).
*/

const StepBox = ({ text, style, onPress }: { text: string, style?: any, onPress?: () => void }) => (
    <TouchableOpacity 
        style={[styles.stepBox, style]} 
        activeOpacity={0.7}
        onPress={onPress}
    >
        <Text style={styles.stepText}>{text}</Text>
    </TouchableOpacity>
);

export default function GuideStepsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>범행 단계별 대응안</Text>
                <Ionicons name="search-outline" size={24} color="#111" />
            </View>

            <View style={styles.subHeader}>
                <Ionicons name="chatbubble" size={20} color="#2B5CFF" />
                <Text style={styles.subHeaderText}>궁금한 절차를 선택해주세요.</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.flowchartContainer}>
                    
                    {/* Level 1: Transaction / Damage */}
                    <View style={styles.levelRow}>
                        <StepBox text={`거래를 하려는\n경우`} style={styles.halfBox} />
                        <StepBox text={`피해를 당한\n경우`} style={styles.halfBox} />
                    </View>

                    {/* Connector 1 -> 2 (Merge with Bracket Style) */}
                    <View style={styles.connectorContainer}>
                         {/* Left Curve (L shape rotated) */}
                         <View style={styles.bracketLeftMerge} />
                         {/* Right Curve */}
                         <View style={styles.bracketRightMerge} />
                         {/* Center Stem Down */}
                         <View style={styles.bracketStemDown} />
                    </View>

                    {/* Level 2: Reported */}
                    <View style={styles.levelRow}>
                        <StepBox text={`신고를 완료한\n경우`} style={styles.centerBox} />
                    </View>

                    {/* Connector 2 -> 3 (Split with Bracket Style) */}
                    <View style={styles.connectorContainer}>
                         {/* Center Stem Up */}
                         <View style={styles.bracketStemUp} />
                         {/* Left Curve */}
                         <View style={styles.bracketLeftSplit} />
                         {/* Right Curve */}
                         <View style={styles.bracketRightSplit} />
                    </View>

                    {/* Level 3: Suspect Caught / Suspended */}
                    <View style={styles.levelRow}>
                        <StepBox text={`용의자가 검거된\n경우`} style={styles.halfBox} />
                        <StepBox text={`기소가 중지된\n경우`} style={styles.halfBox} />
                    </View>

                    {/* Level 3 -> 4: Left Split (From 'Caught') */}
                    <View style={styles.connectorContainer}>
                        {/* Stem extending from under 'Caught' (Left box) */}
                        <View style={[styles.bracketStemUp, { left: '23%' }]} />
                        
                        {/* Left Sub Split: Just a vertical continuation for the left child? 
                            No, 'Caught' is at Left(23%). 
                            'Wants Agreement' is at Left(23%).
                            'Doesn't Want' is at Right(77%). 
                        */}
                         <View style={styles.bracketLeftSubSplit} />
                         <View style={styles.bracketRightSubSplit} />
                    </View>

                    {/* Level 4: Agreement Details */}
                    <View style={styles.levelRow}>
                        <StepBox text={`(용의자가) 합의를\n원하는 경우`} style={styles.halfBox} />
                        <StepBox text={`(용의자가) 합의를\n원하지 않는 경우`} style={styles.halfBox} />
                    </View>

                    {/* Connector 4 -> 5 (Merge) */}
                    <View style={styles.connectorContainer}>
                         {/* Left Curve */}
                         <View style={styles.bracketLeftMerge} />
                         {/* Right Curve */}
                         <View style={styles.bracketRightMerge} />
                         {/* Center Stem Down */}
                         <View style={styles.bracketStemDown} />
                    </View>

                    {/* Level 5: Trial */}
                    <View style={styles.levelRow}>
                        <StepBox text="재판" style={styles.fullBox} />
                    </View>

                     {/* Connector 5 -> 6 (Split) */}
                    <View style={styles.connectorContainer}>
                         <View style={styles.bracketStemUp} />
                         <View style={styles.bracketLeftSplit} />
                         <View style={styles.bracketRightSplit} />
                    </View>

                    {/* Level 6: Restitution Application */}
                    <View style={styles.levelRow}>
                        <StepBox text={`배상명령 신청을 한\n경우`} style={styles.halfBox} />
                        <StepBox text={`배상명령 신청을 못한\n경우`} style={styles.halfBox} />
                    </View>

                    {/* Connector 6 -> 7 (Straight Down) */}
                    <View style={styles.connectorContainer}>
                        <View style={[styles.vLineFull, { left: '23%' }]} />
                        <View style={[styles.vLineFull, { right: '23%' }]} />
                    </View>

                    {/* Level 7: Enforcement / Civil Litigation */}
                    <View style={styles.levelRow}>
                         <StepBox text="강제집행" style={styles.halfBox} />
                         {/* Arrow centered */}
                         <View style={styles.arrowContainer}>
                            <Ionicons name="arrow-forward" size={18} color="#0055FF" />
                         </View>
                         <StepBox text="민사소송" style={styles.halfBox} />
                    </View>

                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.chatButton}>
                    <Text style={styles.chatButtonText}>채팅 상담</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const LINE_Color = '#0055FF';
const LINE_WIDTH = 1.5;
const RADIUS = 16; // Increased radius for softer curves

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        backgroundColor: '#F8F9FA',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
    },
    subHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 10,
    },
    subHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
        marginLeft: 8,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Extra padding as requested
    },
    flowchartContainer: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    levelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
        minHeight: 60,
    },
    stepBox: {
        backgroundColor: 'white',
        borderRadius: 16, // Softer corners
        paddingVertical: 20,
        paddingHorizontal: 16, // More internal spacing
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03, // Very subtle shadow as requested
        shadowRadius: 10,
        elevation: 1, 
        minHeight: 80,
    },
    halfBox: {
        width: '46%',
    },
    centerBox: {
        width: '50%', 
        alignSelf: 'center',
    },
    fullBox: {
        width: '100%',
    },
    stepText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111',
        textAlign: 'center',
        lineHeight: 22,
    },

    // Connector Architecture
    connectorContainer: {
        height: 48, // Increased spacing for curves
        width: '100%',
        position: 'relative',
    },
    
    // MERGE SHAPES (Top-Left & Top-Right -> Center Bottom)
    bracketLeftMerge: {
        position: 'absolute',
        top: 0,
        left: '23%', 
        right: '50%', 
        height: '50%',
        borderLeftWidth: LINE_WIDTH,
        borderBottomWidth: LINE_WIDTH,
        borderBottomLeftRadius: RADIUS,
        borderColor: LINE_Color,
    },
    bracketRightMerge: {
        position: 'absolute',
        top: 0,
        left: '50%', 
        right: '23%', 
        height: '50%',
        borderRightWidth: LINE_WIDTH,
        borderBottomWidth: LINE_WIDTH,
        borderBottomRightRadius: RADIUS,
        borderColor: LINE_Color,
    },
    bracketStemDown: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        height: '50%',
        width: LINE_WIDTH,
        backgroundColor: LINE_Color,
        marginLeft: -LINE_WIDTH / 2,
    },
    
    // SPLIT SHAPES (Center Top -> Bottom Left & Bottom Right)
    bracketStemUp: {
        position: 'absolute',
        top: 0,
        left: '50%',
        height: '50%',
        width: LINE_WIDTH,
        backgroundColor: LINE_Color,
        marginLeft: -LINE_WIDTH / 2,
    },
    bracketLeftSplit: {
        position: 'absolute',
        top: '50%',
        left: '23%', 
        right: '50%', 
        height: '50%',
        borderTopWidth: LINE_WIDTH,
        borderLeftWidth: LINE_WIDTH,
        borderTopLeftRadius: RADIUS,
        borderColor: LINE_Color,
    },
    bracketRightSplit: {
        position: 'absolute',
        top: '50%',
        left: '50%', 
        right: '23%', 
        height: '50%',
        borderTopWidth: LINE_WIDTH,
        borderRightWidth: LINE_WIDTH,
        borderTopRightRadius: RADIUS,
        borderColor: LINE_Color,
    },
    
    // SUB-SPLIT (Level 3 -> 4)
    bracketLeftSubSplit: {
        position: 'absolute',
        top: '50%',
        left: '23%', 
        width: LINE_WIDTH,
        height: '50%',
        backgroundColor: LINE_Color,
        marginLeft: -LINE_WIDTH / 2,
     },
     bracketRightSubSplit: {
         position: 'absolute',
         top: '50%',
         left: '23%', // Start at Left Box center
         right: '23%', // End at Right Box center
         height: '50%',
         borderTopWidth: LINE_WIDTH,
         borderRightWidth: LINE_WIDTH,
         borderTopRightRadius: RADIUS,
         borderColor: LINE_Color,
     },

    // Straight Lines
    vLineFull: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: LINE_WIDTH,
        backgroundColor: LINE_Color,
        marginLeft: -LINE_WIDTH / 2, 
    },
    
    // Arrow
    arrowContainer: {
        position: 'absolute',
        left: '50%',
        marginLeft: -9,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },

    // Bottom Buttons
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#F8F9FA', // Background to cover scroll content
        // Transparent gradient might be nicer but solid is safer
    },
    chatButton: {
        backgroundColor: '#2B5CFF',
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        shadowColor: '#2B5CFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    chatButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
