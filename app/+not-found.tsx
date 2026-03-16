import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '../src/components/layout/ScreenWrapper';
import { Button } from '../src/components/ui/Button';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ScreenWrapper style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/" asChild>
          <Button title="Go to home screen" onPress={() => {}} />
        </Link>
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
