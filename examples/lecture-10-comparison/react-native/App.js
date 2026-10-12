import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function App() {
  const [completed, setCompleted] = useState(false);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Перевірити обладнання в аудиторії</Text>
      <Text>{completed ? 'Виконано' : 'Активне'}</Text>

      <Pressable
        accessibilityRole="button"
        onPress={() => setCompleted((value) => !value)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {completed ? 'Повернути' : 'Позначити виконаним'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 10 },
  button: { marginTop: 20, paddingVertical: 12 },
  buttonText: { fontSize: 16, fontWeight: '600' },
});
