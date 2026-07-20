import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import HomeScreen from './src/screens/Home';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './src/store';
import OnboardScreen from './src/screens/Onboard';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuthScreen from './src/screens/GetStarted';
import LikedScreen from './src/screens/LikedScreen';
import PaymentScreen from './src/screens/Payment';
import HomeT from './src/tutorials/HomewithTutorial';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './src/screens/SplashScreen';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, Linking, StatusBar, View } from 'react-native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import messaging from '@react-native-firebase/messaging';
import requestUserPermission from './src/NotificationService/notificationsetup';
import { incrementCart } from './src/store/cartSlice';
import { SystemBars } from "react-native-edge-to-edge";
import { Settings } from 'react-native-fbsdk-next';
import { AppEventsLogger } from 'react-native-fbsdk-next';

// import { useSafeAreaInsets } from 'react-native-safe-area-context';
const Stack = createNativeStackNavigator();

const RootNavigator = ({ onLoadingChange, onNetworkChange }) => {
  const user = useSelector((state) => state.auth.user);
  const [initialRoute, setInitialRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const insets = useSafeAreaInsets();
    useEffect(()=>{
  requestUserPermission(user)
},[user])


useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected =
        state.isConnected && state.isInternetReachable;

      setIsConnected(connected);
      onNetworkChange?.(connected);
    });

    return () => unsubscribe();
  }, [onNetworkChange]);

useEffect(() => {
  Settings.initializeSDK();
  // No App Tracking Transparency / IDFA tracking in v1 (matches "Data Not
  // Collected" in App Store Connect). Enable ATT + advertiser tracking in a
  // later version if Facebook ad attribution is needed.
  Settings.setAdvertiserTrackingEnabled(false);
  Settings.setAutoLogAppEventsEnabled(true);

  setTimeout(() => {
    console.log("EVENT SENT");
    AppEventsLogger.logEvent('test_event');
  }, 5000);
}, []);

console.log("hello1")

// useEffect(async()=>{
// await AsyncStorage.setItem('tutorialCompleted','false')
// },[])

// useEffect(() => {
//   onLoadingChange?.(isLoading);
// }, [isLoading]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await AsyncStorage.removeItem('hasShownDynamicIsland');
          // await AsyncStorage.setItem('tutorialCompleted', 'false')
        // Keep splash for at least 2s
        const splashTimer = new Promise(resolve => setTimeout(resolve, 2000));

        const checkTutorialStatus = async () => {
          try {
            const completed = await AsyncStorage.getItem('tutorialCompleted');
            if (completed === 'true') {
              setInitialRoute(user ? 'Home' : 'Login');
            } else {
              setInitialRoute(user ? 'Tutorial' : 'Login');
            }
          } catch (error) {
            setInitialRoute('Tutorial');
          }
        };

        await Promise.all([splashTimer, checkTutorialStatus()]);
        setIsLoading(false);
      } catch (error) {
        console.error('Initialization error:', error);
        setInitialRoute('Tutorial');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [user]);

  Settings.initializeSDK();
  // If still loading OR no internet, keep splash up
  if (isLoading || !isConnected) {
    return <SplashScreen />;
  }

  // useEffect(async()=>{
  //   await AsyncStorage.setItem('tutorialCompleted', false)
  // },[])
  // const dispatch=useDispatch();
  // useEffect(()=>{
  //   dispatch(incrementCart())
  // },[])

  if (!initialRoute) return null;



  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="Tutorial" component={HomeT} />
      <Stack.Screen name="Login" component={OnboardScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Liked" component={LikedScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Closet" component={HomeScreen} />

    </Stack.Navigator>
  );
};
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
const App = () => {
  
  const [currentRoute, setCurrentRoute] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
const [appConnected, setAppConnected] = useState(true);

const shouldHavePadding =
  !appLoading && appConnected &&
  currentRoute !== 'Home' &&
  currentRoute !== 'Login' &&
  currentRoute !== 'Liked' &&
  currentRoute !== 'Closet'&&
  currentRoute !== 'Tutorial';
  
const linking = {
  prefixes: ['https://www.shazlo.store', 'shazlo://open'],
  config: {
    screens: {
      Tutorial: 'tutorial',
      Login: 'login',
      Home: '',
      Auth: 'auth',
      Liked: 'liked',
      Payment: 'payment',
       Closet: 'closet/:id',
       Liked:'product/:id',
      
    },
  },
  async getInitialURL() {
    // Handle case when app was closed and opened by a link
    const url = await Linking.getInitialURL();
    return url;
  },
  subscribe(listener) {
    // Listen to incoming deep links while app is running
    const onReceiveURL = ({ url }) => listener(url);
    const subscription = Linking.addEventListener('url', onReceiveURL);

    return () => subscription.remove();
  },
};

const [initialState, setInitialState] = useState();

useEffect(() => {
  const prepare = async () => {
    const url = await Linking.getInitialURL();
    if (url) {
      const state = await linking.getStateFromPath?.(url, linking.config);
      if (state?.routes?.length === 1) {
        // If app started directly from deep link → add Home as base
        setInitialState({
          routes: [
            { name: 'Home' },       // base screen
            ...state.routes,        // deep link target
          ],
        });
      } else {
        setInitialState(state);
      }
    }
  };
  prepare();
}, []);

  const [isGestureNav, setIsGestureNav] = useState(false);

  // Detect gesture navigation dynamically
  useEffect(() => {
    const detectGestureMode = () => {
      const { height: screenHeight } = Dimensions.get('screen');
      const { height: windowHeight } = Dimensions.get('window');
      const diff = screenHeight - windowHeight;
      const gesture = diff < 60; // threshold (px)
      setIsGestureNav(gesture);
      // console.log(gesture)
      // adjust nav bar color accordingly
      if (gesture) {
        changeNavigationBarColor('transparent', false);
      } else {
        changeNavigationBarColor('transparent', false);
      }
    };

    detectGestureMode(); // run initially

    // Listen to orientation / mode changes
    const sub = Dimensions.addEventListener('change', detectGestureMode);
    return () => sub?.remove?.();
  }, []);

  
// async function requestUserPermission() {
//     // console.log('hello')
//   const authStatus = await messaging().requestPermission();
//   const enabled =
//     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//   if (enabled) {
//     console.log('Notification permission granted');
//     const token = await messaging().getToken();
//     console.log('FCM Token:', token);
//     await AsyncStorage.setItem('fcmToken', token);
//     // send this token to your backend
//   }
// }



const SafeRoot = ({ children }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        // paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: '#fff',
      }}
    >
      {children}
    </View>
  );
};

  return (
     <SafeAreaProvider  >
      {/* <SafeRoot> */}
      <SystemBars style="dark" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <NavigationContainer 
                linking={linking}
                  initialState={initialState}
                onStateChange={(state) => {
                  const route = state?.routes[state.index];
                  setCurrentRoute(route?.name);
                }}>
                <RootNavigator   onLoadingChange={setAppLoading}
  onNetworkChange={setAppConnected}/>
              </NavigationContainer>
            </PersistGate>
          </Provider>
        </QueryClientProvider>
      </GestureHandlerRootView>
      {/* </SafeRoot> */}
    </SafeAreaProvider>
  );
};

export default App;
