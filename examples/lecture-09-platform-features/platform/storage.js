import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = 'lecture-09-task-draft';

export async function loadDraft() {
  const value = await AsyncStorage.getItem(DRAFT_KEY);
  return value ? JSON.parse(value) : null;
}

export async function saveDraft(draft) {
  await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export async function clearDraft() {
  await AsyncStorage.removeItem(DRAFT_KEY);
}
