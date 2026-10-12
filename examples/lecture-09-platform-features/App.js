import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CameraPanel from './CameraPanel';
import { clearDraft, loadDraft, saveDraft } from './platform/storage';
import { readCurrentLocation } from './platform/location';
import { subscribeToNetwork } from './platform/network';

const initialDraft = { title: '', note: '' };

export default function App() {
  const [draft, setDraft] = useState(initialDraft);
  const [draftState, setDraftState] = useState('loading');
  const [network, setNetwork] = useState({ isConnected: true, type: 'unknown' });
  const [location, setLocation] = useState({ status: 'idle' });
  const [reminder, setReminder] = useState('idle');

  useEffect(() => {
    let active = true;
    loadDraft()
      .then((saved) => {
        if (!active) return;
        if (saved) setDraft(saved);
        setDraftState(saved ? 'restored' : 'empty');
      })
      .catch(() => setDraftState('error'));
    return () => { active = false; };
  }, []);

  useEffect(() => subscribeToNetwork(setNetwork), []);

  useEffect(() => {
    if (draftState === 'loading') return;
    const timer = setTimeout(() => {
      saveDraft(draft)
        .then(() => setDraftState('saved'))
        .catch(() => setDraftState('error'));
    }, 350);
    return () => clearTimeout(timer);
  }, [draft, draftState]);

  const connectionLabel = useMemo(
    () => network.isConnected ? `Online · ${network.type}` : 'Offline · дані форми залишаються доступними',
    [network],
  );

  async function handleLocation() {
    setLocation({ status: 'loading' });
    const result = await readCurrentLocation();
    setLocation(result);
  }

  async function handleClearDraft() {
    await clearDraft();
    setDraft(initialDraft);
    setDraftState('empty');
  }

  async function handleReminder() {
    if (Platform.OS === 'web') {
      setReminder('native-only');
      return;
    }
    setReminder('loading');
    try {
      const { scheduleTaskReminder } = await import('./platform/notifications');
      const result = await scheduleTaskReminder();
      setReminder(result.status);
    } catch {
      setReminder('error');
    }
  }

  return (
    <ScrollView contentContainerStyle={s.page}>
      <StatusBar style="dark" />
      <Text style={s.meta}>Лекція 9 · React Native + Expo</Text>
      <Text style={s.h1}>Платформні можливості</Text>
      <Text style={s.lead}>Один runnable example: мережа, локальна чернетка, геолокація, камера та локальне нагадування.</Text>

      <View style={s.section} testID="network-section">
        <Text style={s.h2}>Мережа</Text>
        <Text accessibilityLabel="Стан мережі" style={network.isConnected ? s.status : s.offline}>{connectionLabel}</Text>
        <Text style={s.copy}>NetInfo підписується на зміни з'єднання. Втрата мережі не очищає вже введені дані.</Text>
      </View>

      <View style={s.section} testID="draft-section">
        <Text style={s.h2}>Локальна чернетка</Text>
        <TextInput
          accessibilityLabel="Назва завдання"
          placeholder="Назва завдання"
          value={draft.title}
          onChangeText={(title) => setDraft((value) => ({ ...value, title }))}
          style={s.input}
        />
        <TextInput
          accessibilityLabel="Нотатка"
          placeholder="Нотатка"
          value={draft.note}
          onChangeText={(note) => setDraft((value) => ({ ...value, note }))}
          multiline
          style={[s.input, s.textarea]}
        />
        <Text style={s.note}>AsyncStorage: {draftState}</Text>
        <Pressable accessibilityRole="button" onPress={handleClearDraft} style={s.secondaryButton}>
          <Text>Очистити чернетку</Text>
        </Pressable>
      </View>

      <View style={s.section} testID="location-section">
        <Text style={s.h2}>Поточне місце</Text>
        <Pressable accessibilityRole="button" onPress={handleLocation} style={s.primaryButton}>
          <Text style={s.primaryText}>Додати поточне місце</Text>
        </Pressable>
        {location.status === 'idle' && <Text style={s.note}>Permission буде запитано лише після натискання.</Text>}
        {location.status === 'loading' && <Text style={s.note}>Отримання координат…</Text>}
        {location.status === 'denied' && <Text style={s.error}>Доступ до геолокації відхилено.</Text>}
        {location.status === 'error' && <Text style={s.error}>Не вдалося визначити місце.</Text>}
        {location.status === 'ready' && (
          <Text accessibilityLabel="Координати" style={s.result}>
            {location.coords.latitude.toFixed(5)}, {location.coords.longitude.toFixed(5)}
          </Text>
        )}
      </View>

      <View style={s.section} testID="camera-section">
        <Text style={s.h2}>Камера</Text>
        <Text style={s.copy}>CameraView і permission hook працюють з реальним camera permission flow.</Text>
        <CameraPanel />
      </View>

      <View style={s.section} testID="notification-section">
        <Text style={s.h2}>Локальне нагадування</Text>
        <Pressable accessibilityRole="button" onPress={handleReminder} style={s.primaryButton}>
          <Text style={s.primaryText}>Нагадати через 60 секунд</Text>
        </Pressable>
        {reminder === 'idle' && <Text style={s.note}>На Android/iOS використовується expo-notifications.</Text>}
        {reminder === 'loading' && <Text style={s.note}>Запит дозволу…</Text>}
        {reminder === 'scheduled' && <Text style={s.result}>Нагадування заплановано.</Text>}
        {reminder === 'denied' && <Text style={s.error}>Дозвіл на сповіщення відхилено.</Text>}
        {reminder === 'native-only' && <Text style={s.note}>У web target цей крок не імітується: перевірте локальне notification на Android/iOS.</Text>}
        {reminder === 'error' && <Text style={s.error}>Не вдалося запланувати нагадування.</Text>}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 24, paddingBottom: 60, backgroundColor: '#fff' },
  meta: { color: '#666', marginBottom: 6 },
  h1: { fontSize: 30, fontWeight: '700', marginBottom: 8 },
  lead: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 26 },
  section: { borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 18, marginTop: 8, marginBottom: 22 },
  h2: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  copy: { fontSize: 15, lineHeight: 22, color: '#333', marginBottom: 12 },
  status: { fontWeight: '600', marginBottom: 8 },
  offline: { fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#aaa', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontSize: 16, backgroundColor: '#fff' },
  textarea: { minHeight: 82, textAlignVertical: 'top' },
  note: { color: '#666', lineHeight: 20, marginTop: 8 },
  result: { marginTop: 12, fontWeight: '600' },
  error: { marginTop: 12, color: '#a00' },
  primaryButton: { alignSelf: 'flex-start', backgroundColor: '#111', paddingHorizontal: 14, paddingVertical: 10 },
  primaryText: { color: '#fff', fontWeight: '600' },
  secondaryButton: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#aaa', paddingHorizontal: 14, paddingVertical: 10, marginTop: 10 },
});
