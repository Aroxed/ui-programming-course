import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function App() {
  const [completed, setCompleted] = useState(false);

  return (
    <View style={styles.screen}>
      <Text style={styles.meta}>Лекція 10 · React Native</Text>
      <Text style={styles.h1}>Один сценарій у трьох стеках</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Завдання</Text>
        <Text style={styles.title}>Перевірити обладнання в аудиторії</Text>
        <Text accessibilityLabel="Стан завдання" style={styles.status}>
          {completed ? 'Виконано' : 'Активне'}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Перемкнути стан"
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
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  meta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
    marginBottom: 36,
  },
  section: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d7d7d7',
    paddingVertical: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  title: {
    fontSize: 19,
    lineHeight: 26,
    marginBottom: 12,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
