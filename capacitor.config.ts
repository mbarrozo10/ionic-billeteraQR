import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app3.ionic.starter',
  appName: 'app3',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
    },
  },
};

export default config;
