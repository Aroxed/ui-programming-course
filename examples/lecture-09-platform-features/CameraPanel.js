import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraPanel() {
  const [permission, requestPermission] = useCameraPermissions();
  const [open, setOpen] = useState(false);

  if (!permission) {
    return <Text style={s.note}>Перевірка дозволу камери…</Text>;
  }

  if (!permission.granted) {
    return (
      <View>
        <Text style={s.note}>Камера ще не дозволена.</Text>
        <Pressable accessibilityRole="button" style={s.button} onPress={requestPermission}>
          <Text style={s.buttonText}>Дозволити камеру</Text>
        </Pressable>
      </View>
    );
  }

  if (!open) {
    return (
      <Pressable accessibilityRole="button" style={s.button} onPress={() => setOpen(true)}>
        <Text style={s.buttonText}>Відкрити preview камери</Text>
      </Pressable>
    );
  }

  return (
    <View>
      <CameraView style={s.camera} facing="back" />
      <Pressable accessibilityRole="button" style={s.secondary} onPress={() => setOpen(false)}>
        <Text>Закрити камеру</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  note: { color: '#555', marginBottom: 10 },
  button: { alignSelf: 'flex-start', backgroundColor: '#111', paddingHorizontal: 14, paddingVertical: 10 },
  buttonText: { color: '#fff', fontWeight: '600' },
  secondary: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#bbb', paddingHorizontal: 14, paddingVertical: 10, marginTop: 10 },
  camera: { width: '100%', height: 240, backgroundColor: '#eee' },
});
