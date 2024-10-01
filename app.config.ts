import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Oii Puwali",
  slug: "oiipuwali",
  version: "1.0.1",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    resizeMode: "contain",
    backgroundColor: "#f27e18"
  },
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSLocationAlwaysAndWhenInUseUsageDescription: "Allow $(PRODUCT_NAME) to use your location.",
      NSPhotoLibraryUsageDescription: "Allow $(PRODUCT_NAME to access your photos."
    },
    bundleIdentifier: "com.userapp.oiipuwali" 
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF"
    },
    permissions: [
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.FOREGROUND_SERVICE",
  //    "android.permission.CAMERA",
      "android.permission.READ_EXTERNAL_STORAGE",
    ],
    package: "com.userapp.oiipuwali",
    googleServicesFile: "./google-services.json",
    config: {
      googleMaps: {
        apiKey: "AIzaSyBZ_jnKn5U_saPuBcYqn8TLZo_VNcsLRn4"
      }
    }
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/favicon.png"
  },
  plugins: [
    [
      "expo-location",
      "expo-image-picker",
    ]
  ],
  extra: {
    eas: {
      projectId: "77cc8894-661d-4e9c-9725-296710c15853"
    }
  }
});