import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export function subscribeToNetwork(listener) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const emit = () => {
      listener({
        isConnected: navigator.onLine,
        type: 'web',
      });
    };

    window.addEventListener('online', emit);
    window.addEventListener('offline', emit);
    emit();

    return () => {
      window.removeEventListener('online', emit);
      window.removeEventListener('offline', emit);
    };
  }

  return NetInfo.addEventListener((state) => {
    listener({
      isConnected: Boolean(state.isConnected),
      type: state.type,
    });
  });
}
