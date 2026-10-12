import NetInfo from '@react-native-community/netinfo';

export function subscribeToNetwork(listener) {
  return NetInfo.addEventListener((state) => {
    listener({
      isConnected: Boolean(state.isConnected),
      type: state.type,
    });
  });
}
