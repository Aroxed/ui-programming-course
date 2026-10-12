import * as Location from 'expo-location';

export async function readCurrentLocation() {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== 'granted') {
    return { status: 'denied' };
  }

  try {
    const position = await Location.getCurrentPositionAsync({});
    return {
      status: 'ready',
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      },
    };
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Location error' };
  }
}
