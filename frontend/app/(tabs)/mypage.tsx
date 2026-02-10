import { StyleSheet, Text, View } from 'react-native';

export default function MyPageScreen() {
  return (
    <View style={styles.container}>
      <Text>마이 페이지</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
