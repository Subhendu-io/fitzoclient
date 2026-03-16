import { useRef, useCallback } from 'react';

// Placeholder hook — implement when adding camera functionality
// You'll want to use expo-camera or expo-image-picker here

export function useCamera() {
  const cameraRef = useRef(null);

  const takePicture = useCallback(async () => {
    // TODO: Implement with expo-camera
    console.warn('[useCamera] Not yet implemented');
    return null;
  }, []);

  const pickImage = useCallback(async () => {
    // TODO: Implement with expo-image-picker
    console.warn('[useCamera] Not yet implemented');
    return null;
  }, []);

  return {
    cameraRef,
    takePicture,
    pickImage,
  };
}
