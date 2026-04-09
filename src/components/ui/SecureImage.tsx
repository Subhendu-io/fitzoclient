import React, { useEffect, useState } from 'react';
import { Image, ImageProps, View } from 'react-native';
import { getStorage } from '@react-native-firebase/storage';

interface SecureImageProps extends Omit<ImageProps, 'source'> {
  uri?: string;
  fallbackUri?: string;
}

export function SecureImage({ uri, fallbackUri, className, ...props }: SecureImageProps) {
  const [safeUri, setSafeUri] = useState<string | null>(null);

  useEffect(() => {
    async function resolveUri() {
      if (!uri) return;
      
      // If it is a Firebase Storage URL missing a download token (auth protected)
      if (uri.includes('firebasestorage.googleapis.com') && !uri.includes('token=')) {
        try {
          // Extract the exact storage path from the REST URL (e.g. users%2Fuid%2Fimage.png -> users/uid/image.png)
          const pathRaw = uri.split('/o/')[1]?.split('?')[0];
          if (pathRaw) {
            const rawPath = decodeURIComponent(pathRaw);
            const resolvedTokenUrl = await getStorage().ref(rawPath).getDownloadURL();
            setSafeUri(resolvedTokenUrl);
            return;
          }
        } catch (error) {
          console.log('[SecureImage] Failed resolving token URL:', error);
          if (fallbackUri) setSafeUri(fallbackUri);
        }
      } else {
        // Safe standard URL or already has token
        setSafeUri(uri);
      }
    }

    resolveUri();
  }, [uri, fallbackUri]);

  if (!safeUri) {
    return <View className={`${className} bg-stone-200 dark:bg-stone-800 opacity-50`} />;
  }

  return <Image source={{ uri: safeUri }} className={className} {...props} />;
}
