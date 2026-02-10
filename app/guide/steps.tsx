import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/*
  Crime Response Steps Flowchart Screen
  Visual Fix: STRICT HARDCODED VALUES
  - Root BG: #E5ECFF
  - Card BG: #FFFFFF
  - Box BG: #F4F8FF
  - Button: Transparent, Text #0055FF
  - Padding: 24 (H) / 32 (V)
  - Margin: 20
  - Radius: 16
*/

const StepBox = ({ text, style, onPress, isBlue = false }: { text: string, style?: any, onPress?: () => void, isBlue?: boolean }) => (
    <TouchableOpacity 
        style={[styles.stepBox, style, isBlue && styles.blueBox]} 
        activeOpacity={0.7}
        onPress={onPress}
    >
        <Text style={[styles.stepText, isBlue && styles.blueBoxText]}>{text}</Text>
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
                <Ionicons name="chatbubble" size={20} color="#0055FF" />
                <Text style={styles.subHeaderText}>궁금한 절차를 선택해주세요.</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Main White Card Container */}
                <View style={styles.mainCard}>
                    
                    <View style={styles.flowchartContainer}>
                        
                        {/* Level 1: Transaction / Damage */}
                        <View style={styles.levelRow}>
                            <StepBox text={`거래를 하려는\n경우`} style={styles.halfBox} />
                            <StepBox text={`피해를 당한\n경우`} style={styles.halfBox} />
                        </View>

                        {/* Connector 1 -> 2 (Merge) */}
                        <View style={styles.connectorContainer}>
                             <View style={styles.bracketLeftMerge} />
                             <View style={styles.bracketRightMerge} />
                             <View style={styles.bracketStemDown} />
                        </View>

                        {/* Level 2: Reported */}
                        <View style={styles.levelRow}>
                            <StepBox text={`신고를 완료한\n경우`} style={styles.centerBox} isBlue={true} />
                        </View>

                        {/* Connector 2 -> 3 (Split) */}
                        <View style={styles.connectorContainer}>
                             <View style={styles.bracketStemUp} />
                             <View style={styles.bracketLeftSplit} />
                             <View style={styles.bracketRightSplit} />
                        </View>

                        {/* Level 3: Suspect Caught / Suspended */}
                        <View style={styles.levelRow}>
                            <StepBox text={`용의자가 검거된\n경우`} style={styles.halfBox} />
                            <StepBox text={`기소가 중지된\n경우`} style={styles.halfBox} />
                        </View>

                        {/* Level 3 -> 4: Left Split */}
                        <View style={styles.connectorContainer}>
                            <View style={[styles.bracketStemUp, { left: '23%' }]} />
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
                             <View style={styles.bracketLeftMerge} />
                             <View style={styles.bracketRightMerge} />
                             <View style={styles.bracketStemDown} />
                        </View>

                        {/* Level 5: Trial */}
                        <View style={styles.levelRow}>
                            <StepBox text="재판" style={styles.fullBox} isBlue={true} />
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

                        {/* Connector 6 -> 7 */}
                        <View style={styles.connectorContainer}>
                            <View style={[styles.vLineFull, { left: '23%' }]} />
                            <View style={[styles.vLineFull, { right: '23%' }]} />
                        </View>

                        {/* Level 7: Enforcement / Civil Litigation */}
                        <View style={styles.levelRow}>
                             <StepBox text="강제집행" style={styles.halfBox} />
                             <View style={styles.arrowContainer}>
                                <Ionicons name="arrow-forward" size={18} color="#0055FF" />
                             </View>
                             <StepBox text="민사소송" style={styles.halfBox} />
                        </View>

                    </View>
                </View>
                
                {/* Spacer for bottom area */}
                <View style={{ height: 60 }} />
            </ScrollView>

            {/* Bottom Button (Transparent Text Link) */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.chatButton}>
                    <Text style={styles.chatButtonText}>채팅 상담</Text>
                    <Ionicons name="chevron-forward" size={20} color="#0055FF" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// Global Constants for this file
const LINE_Color = '#0055FF'; 
const LINE_WIDTH = 1.5;
const RADIUS = 16; 

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E5ECFF', // [Fixed] Root Background
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        backgroundColor: '#E5ECFF', // Match Root BG
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
        marginTop: 10,
        marginBottom: 20, 
    },
    subHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
        marginLeft: 8,
    },
    scrollContent: {
        paddingHorizontal: 16, 
        paddingBottom: 40,
    },
    // The "White Card"
    mainCard: {
        backgroundColor: '#FFFFFF', // [Fixed] Pure White
        borderRadius: 24, 
        paddingVertical: 32,    // [Fixed] 32
        paddingHorizontal: 24,  // [Fixed] 24
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    flowchartContainer: {
        alignItems: 'center',
    },
    levelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
        minHeight: 50,
        marginBottom: 20, // [Fixed] Margin 20+
    },
    stepBox: {
        backgroundColor: '#F4F8FF', // [Fixed] Light Sky Blue Box
        borderRadius: 16,           // [Fixed] Radius 16
        paddingVertical: 18,
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 70,
    },
    blueBox: {
        backgroundColor: '#F4F8FF', // Keep same or slightly different if needed, but user said #F4F8FF
        borderWidth: 1,
        borderColor: '#0055FF', // Highlight border for "blue" items? Or just text color? 
        // User said "Box background... #F4F8FF". I will keep it consistent.
        // Let's add the border only if it was intended to be "Active".
        // For now, I'll keep the background consistent and use text color to differentiate.
    },
    blueBoxText: {
        color: '#0055FF',
        fontWeight: '700',
    },
    halfBox: {
        width: '47%', 
    },
    centerBox: {
        width: '60%', 
        alignSelf: 'center',
    },
    fullBox: {
        width: '100%',
    },
    stepText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        lineHeight: 20,
    },

    // Connector Architecture
    connectorContainer: {
        // The connectors need to span the gap between rows.
        // Previous logic relied on absolute positioning.
        // If we have marginBottom on levelRow, the connectors need to overlap or bridge that gap.
        // Actually, the connectors should probably NOT have height if they are just lines?
        // No, they need height to draw the curves.
        height: 48, 
        marginTop: -20, // Pull up to bridge the gap if levelRow has margin
        marginBottom: 0, 
        width: '100%',
        position: 'relative',
        zIndex: -1, // Send to back?
    },
    
    // MERGE SHAPES
    bracketLeftMerge: {
        position: 'absolute',
        top: 0,
        left: '23.5%', 
        right: '50%', 
        height: '100%',
        borderLeftWidth: LINE_WIDTH,
        borderBottomWidth: LINE_WIDTH,
        borderBottomLeftRadius: RADIUS,
        borderColor: LINE_Color,
    },
    bracketRightMerge: {
        position: 'absolute',
        top: 0,
        left: '50%', 
        right: '23.5%', 
        height: '100%',
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
    
    // SPLIT SHAPES
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
        left: '23.5%', 
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
        right: '23.5%', 
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
        left: '23.5%', 
        width: LINE_WIDTH,
        height: '50%',
        backgroundColor: LINE_Color,
        marginLeft: -LINE_WIDTH / 2,
     },
     bracketRightSubSplit: {
         position: 'absolute',
         top: '50%',
         left: '23.5%',
         right: '23.5%',
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
        paddingVertical: 20,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: 'transparent', // [Fixed] Transparent
    },
    chatButtonText: {
        color: '#0055FF', // [Fixed] Blue Text
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 4,
    },
});
