import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
  BackHandler,
  Image,
  TouchableOpacity,
  Linking,
  ImageBackground,
  Share,
  InteractionManager,
  Platform
} from 'react-native';
//import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import LinearGradient from 'react-native-linear-gradient';

import MoodboardSelector from '../components/MoodBoardSelector';
import { useDispatch, useSelector } from 'react-redux';
import { moodboards } from './Closets';
import SearchBar from '../components/SearchBar';
// import FiltersBar from '../components/FilterBar';
import { setlogin, setUpdatedPreferenceVector, setUpdatedRewards } from '../store/authSlice';
import SelectClosetSheet from '../components/SelectClosetSheet';
import SwipeSkeleton from '../components/SwipeSkeleton';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import TutorialOverlay from '../components/Tutorial';
import { registerTutorialTarget } from '../tutorials/tutorialTargets';
import CarouselCircleIndicator from '../components/Circles';
import { useAddToCart } from '../QueryHooks/Cart';
import ColorSelector from '../components/ColorSelectorUI';
import { useNavigation } from '@react-navigation/native';
import DynamicIsland from '../components/DynamicIsland';
import { finishCartUpdate, incrementCart, startCartUpdate } from '../store/cartSlice';
import RewardBadge from '../components/RewardBadge';
import IconPressButton from '../components/IconPressButton';
import FiltersBar from '../components/FilterBar';
import FiltersNew from '../components/FiltersWithPics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Queue from '../utils/Queue';
import TutorialCard from '../components/TutorialCard';
import { storage } from '../storage/mmkv';
import { API_BASE_URL } from '../config/api';
// import FiltersBar from '../components/Filters';
// import FiltersBar from '../components/FilterBar';
// import FiltersBar from '../components/Filters';
const { width, height } = Dimensions.get('window');
// const insets = useSafeAreaInsets();
// Color schemes for each gossip card
const colorSchemes = [
  '#ff4b5c', // Bold Red
  '#635acc', // Purple
  '#ff9f00', // Vibrant Yellow
  '#00bcd4', // Cyan
  '#8bc34a', // Green
];
const isTablet = Platform.OS === 'ios' && Math.min(width, height) >= 768;
const isLargeIPad =
  isTablet &&
  Math.max(width, height) >= 1180;
export default function SwipeUI({ brand, handleScreenChange, activeScreen, closets, setclosets, preferred_gender }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedCards, setSwipedCards] = useState(0);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [showslideup, setshowslideup] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(height)).current;
  const slideAnim = useRef(new Animated.Value(200)).current;
  console.log(brand)
  const leftImageScale = useRef(new Animated.Value(1)).current; // Scale for the left image
  const rightImageScale = useRef(new Animated.Value(1)).current; // Scale for the right image
  const nextCardScale = useRef(new Animated.Value(0.95)).current;
  const nextCardTranslateY = useRef(new Animated.Value(0)).current;
  const [currentCardImage, setCurrentCardImage] = useState(null);
  const [cardimageindex, setcardimageindex] = useState(0);
  const [nextCardImage, setNextCardImage] = useState(null);
  const [items, setitems] = useState([]);
  const [liking, setliking] = useState(null);
  let user = useSelector(state => state.auth.user);
  const [gender,setgender]=useState(user.preferred_gender||'women');
  const [disliking, setdisliking] = useState(null);
  const likingRef = useRef(false);
  const dislikingRef = useRef(false);
  const [saving, setsaving] = useState(false);
  const [playing, setplaying] = useState(null);
  const [loading, setloading] = useState(true);
  
  const [seen, setseen] = useState(0);
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const dislikeOpacity = useRef(new Animated.Value(0)).current;
  const saveOpacity = useRef(new Animated.Value(0)).current;
  const cartOpacity = useRef(new Animated.Value(0)).current;
  const darkenOpacity = useRef(new Animated.Value(0)).current;
  const closetRef = useRef();
  const dispatch = useDispatch();
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([brand]);
  const [isbrandspecific, setisbrandspecific] = useState(brand);
  const [products, setProducts] = useState([]);
  const [tutorialDone, setTutorialDone] = useState(false);
  const [showFallbackMessage, setShowFallbackMessage] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const seenBufferRef = useRef([]); //contains temporary list of seen items
  const flipAnim = useRef(new Animated.Value(0)).current;
  const { mutate: addToCart, isPending } = useAddToCart(user.user_id);
  const [cardTimer, setcardTimer] = useState(Date.now());
  const [cardClicks, setcardClicks] = useState(0);
  const [recentStats, setRecentStats] = useState([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;
const translateAnim = useRef(new Animated.Value(0)).current;

const [displayGender, setDisplayGender] = useState(gender);
const isTablet = width >= 768;

const CARD_WIDTH = isTablet
    ? Math.min(width * 0.72, 620)
    : width * 0.92;
useEffect(() => {
  const checkTutorial = async () => {
    try {
      const completed = await AsyncStorage.getItem('tutorialCompleted');
      if (completed === 'true') {
        setTutorialDone(true);
      } else {
        setTutorialDone(false);
      }
    } catch (e) {
      console.log("Error reading tutorial status", e);
    }
    console.log("tutorial="+tutorialDone)
  };

  checkTutorial();
}, []);
// console.log(user)
// const [tutorialDone, setTutorialDone] = useState(false);
//  const completed = await AsyncStorage.getItem('tutorialCompleted');
const servedQueueRef = useRef(new Queue());
  let currentController = useRef(null);
   useEffect(() => {
  // fade out + move up slightly
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }),
    Animated.timing(translateAnim, {
      toValue: -6,
      duration: 150,
      useNativeDriver: true,
    }),
  ]).start(() => {
    // change text AFTER fade out
    setDisplayGender(gender);

    // reset position
    translateAnim.setValue(6);

    // fade in + move to place
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  });
}, [gender]);

  useEffect(() => {
    // Ensure all animated values are at correct initial positions
    translateX.setValue(0);
    translateY.setValue(0);
    nextCardScale.setValue(0.95);
    nextCardTranslateY.setValue(0);
    imageScale.setValue(1);
  }, []);
  useEffect(() => {
    const handleBackPress = () => {
      if (isFlipped) {
        flipCard();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove();
  }, [isFlipped]);

  let lastStatus = null;

  let directionLocked = null; // add this above the panResponder
  // console.log(translateX.)
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onPanResponderGrant: () => {
      translateX.setValue(0);
      translateX.stopAnimation()
      // 
      translateY.setValue(0);
      setshowslideup(true);
      lastStatus = null;
      directionLocked = null; // reset direction lock on new touch
    },

    onPanResponderMove: (event, gestureState) => {
      const { dx, dy } = gestureState;
      // setcardClicks(prev=>prev+1)
      if (event.nativeEvent.touches.length > 1) {
        const touches = event.nativeEvent.touches;
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // console.log()
        if (initialDistance.current === null) {
          initialDistance.current = distance;
        } else {
          const scaleFactor = distance / initialDistance.current;

          imageScale.setValue(Math.max(1, scaleFactor));

        }
        return;
      }

      const DIRECTION_LOCK_THRESHOLD = 20;

      if (!directionLocked) {
        if (Math.abs(dx) > DIRECTION_LOCK_THRESHOLD || Math.abs(dy) > DIRECTION_LOCK_THRESHOLD) {
          directionLocked = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
        } else {
          return; // Don't react to small jitters
        }
      }

      if (directionLocked === 'horizontal') {
        translateX.setValue(dx);
        translateY.setValue(0);
      } else if (directionLocked === 'vertical' && dy>0) {
        translateY.setValue(dy);
        translateX.setValue(0);
      }

      const horizontalThreshold = 30;
      const verticalThreshold = 60;

      let currentStatus = null;

      if (dy < -verticalThreshold) {
        return;
        currentStatus = 'cart';
      } else if (dy > verticalThreshold) {
        currentStatus = 'save';
        // console.log(currentStatus)
      } else if (dx > horizontalThreshold) {
        currentStatus = 'like';
      } else if (dx < -horizontalThreshold) {
        currentStatus = 'dislike';
      }

      if (currentStatus !== lastStatus) {
        // setliking(currentStatus === 'like');
        // setdisliking(currentStatus === 'dislike');
        // setsaving(currentStatus === 'save');
        // setplaying(currentStatus === 'play');
        lastStatus = currentStatus;
      }
      if (currentStatus === 'like' || currentStatus === 'dislike' || currentStatus === 'save' || currentStatus === 'cart') {
        Animated.timing(darkenOpacity, {
          toValue: 1,
          duration: 1,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(darkenOpacity, {
          toValue: 0,
          duration: 1,
          useNativeDriver: true,
        }).start();
      }
      if (currentStatus === 'like') {
        Animated.timing(likeOpacity, {
          toValue: 1,
          duration: 1,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(likeOpacity, {
          toValue: 0,
          duration: 1,
          useNativeDriver: true,
        }).start();
      }

      if (currentStatus === 'dislike') {
        Animated.timing(dislikeOpacity, {
          toValue: 1,
          duration: 1,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(dislikeOpacity, {
          toValue: 0,
          duration: 1,
          useNativeDriver: true,
        }).start();
      }

      if (currentStatus === 'save') {
        // console.log(currentStatus)
        Animated.timing(saveOpacity, {
          toValue: 1,
          duration: 1,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(saveOpacity, {
          toValue: 0,
          duration: 1,
          useNativeDriver: true,
        }).start();
      }

      if (currentStatus === 'cart') {
        Animated.timing(cartOpacity, {
          toValue: 1,
          duration: 1,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(cartOpacity, {
          toValue: 0,
          duration: 1,
          useNativeDriver: true,
        }).start();
      }

    },

    onPanResponderRelease: (event, gestureState) => {
      const { dx, dy, x0 } = gestureState;


      directionLocked = null;
      lastStatus = null;

      const TAP_THRESHOLD = 5;
      const isTap = Math.abs(dx) < TAP_THRESHOLD && Math.abs(dy) < TAP_THRESHOLD;
      const isRightHalfTap = x0 > width / 2;
      const isLeftHalfTap = x0 < width / 2;
      if (isTap && isRightHalfTap) {
        cycleImage(); // ✅ your custom function to cycle image

        return;
      }
      if (isTap && isLeftHalfTap) {
        cycleImageLeft(); // ✅ your custom function to cycle image

        return;
      }

      Animated.timing(likeOpacity, {
        toValue: 0,
        duration: 1,
        useNativeDriver: true,
      }).start();

      Animated.timing(dislikeOpacity, {
        toValue: 0,
        duration: 1,
        useNativeDriver: true,
      }).start();
      Animated.timing(saveOpacity, {
        toValue: 0,
        duration: 1,
        useNativeDriver: true,
      }).start();
      Animated.timing(cartOpacity, {
        toValue: 0,
        duration: 1,
        useNativeDriver: true,
      }).start();
      Animated.timing(darkenOpacity, {
        toValue: 0,
        duration: 1,
        useNativeDriver: true,
      }).start();

      initialDistance.current = null;
      Animated.spring(imageScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      if (dx > 80 || dx < -80) {
        const isLike = dx > 0;
        react(currentIndex, isLike);
        seenBufferRef.current.push(items[currentIndex].item_id);
        console.log((Date.now() - cardTimer) / 1000);
        setRecentStats(prev => {
          const updated = [...prev, { timeTaken: (Date.now() - cardTimer) / 1000, clicks: cardClicks }];
          if (updated.length > 6) updated.shift(); // remove oldest
          return updated;
        });
        Animated.timing(translateX, {
          toValue: isLike ? width : -width,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {


          // translateX.setValue(0);
          // console.log("Current Index="+currentIndex+","+"translateX="+translateX.__getValue());

          setTimeout(() => {

            setShowFallbackMessage(false);
            setSwipedCards(prev => prev + 1);
            setCurrentIndex(prev => prev + 1);
            setcardimageindex(0);
            setcardTimer(Date.now())
            setcardClicks(0);
            // if(currentIndex===0)
            //    translateX.setValue(0);
            // else
            if (currentIndex === 0) {
              // setTimeout(()=>{
              translateX.setValue(0);
              // console.log(translateX)
              // },200)
            }
            else {
              setTimeout(() => {
                translateX.setValue(0);
              }, 1)
            }

            console.log("Current Index=" + currentIndex + "," + "translateX=" + translateX.__getValue())
            // translateY.setValue(0);
            // nextCardScale.setValue(0.95);
            // nextCardTranslateY.setValue(0);
            // Now animate the next card coming forward
            Animated.parallel([
              Animated.timing(nextCardScale, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(nextCardTranslateY, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start(() => {
              // Reset for next stack after animation completes
              nextCardScale.setValue(0.95);
              nextCardTranslateY.setValue(0);

              console.log(seenBufferRef.current.length);
              if (seenBufferRef.current.length >= 6) {
                flushSeenBuffer();
              }
            });
          }, 2); // One frame delay
        });
      } else if (dy < -100) {
        // if(!user?.name)
        // { closetRef.current.open();
        //   return;
        // }
        return;
        addtocart(currentIndex);
        setRecentStats(prev => {
          const updated = [...prev, { timeTaken: (Date.now() - cardTimer) / 1000, clicks: cardClicks }];
          if (updated.length > 6) updated.shift(); // remove oldest
          return updated;
        });
        // addToCart({ itemId: items[currentIndex].item_id, quantity: 1 });
        Animated.timing(translateY, {
          toValue: -height,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Update state
          // setShowFallbackMessage(false);
          // seenBufferRef.current.push(items[currentIndex].item_id);
          // setSwipedCards(prev => prev + 1);
          // setCurrentIndex(prev => prev + 1);
          // setcardimageindex(0);
          // setcardTimer(Date.now())
          //         setcardClicks(0);
          //  translateX.setValue(0);
          // translateY.setValue(0);
          // Use setTimeout to ensure state update completes
          setTimeout(() => {
            // NOW reset position (after React has re-rendered)
            setShowFallbackMessage(false);
            setSwipedCards(prev => prev + 1);
            setCurrentIndex(prev => prev + 1);
            setcardimageindex(0);
            setcardTimer(Date.now())
            setcardClicks(0);
            // if(currentIndex===0)
            //    translateX.setValue(0);
            // else
            if (currentIndex === 0) {
              // setTimeout(()=>{
              translateY.setValue(0);
              // console.log(translateX)
              // },200)
            }
            else {
              setTimeout(() => {
                translateY.setValue(0);
              }, 1)
            }



            Animated.parallel([
              Animated.timing(nextCardScale, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(nextCardTranslateY, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start(() => {
              nextCardScale.setValue(0.95);
              nextCardTranslateY.setValue(0);

              console.log(seenBufferRef.current.length);
              if (seenBufferRef.current.length >= 6) {
                flushSeenBuffer();
              }
            });
          }, 16);
        });
      }
      else if (dy > 100) {
        closetRef.current.open();

      }
      else {

        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },

  });

  //piunch responder for zoom effect
  const imageScale = useRef(new Animated.Value(1)).current;
  const initialDistance = useRef(null);

  const pinchResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
      onMoveShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
      onPanResponderTerminationRequest: () => false,

      onPanResponderMove: (evt, gestureState) => {
        console.log('hello')
        if (evt.nativeEvent.touches.length === 2) {
          const touches = evt.nativeEvent.touches;
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          console.log()
          if (initialDistance.current === null) {
            initialDistance.current = distance;
          } else {
            const scaleFactor = distance / initialDistance.current;
            imageScale.setValue(scaleFactor);
          }
        }
      },

      onPanResponderRelease: () => {
        initialDistance.current = null;
        Animated.spring(imageScale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const movetonext = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Update state
      seenBufferRef.current.push(items[currentIndex].item_id);

      // Use setTimeout to ensure state update completes
      setTimeout(() => {
        // NOW reset position (after React has re-rendered)
        // translateX.setValue(0);
        
        setSwipedCards(prev => prev + 1);
        setCurrentIndex(prev => prev + 1);
        setcardimageindex(0);
        setcardTimer(Date.now())
        setcardClicks(0);
        // Reset next card to proper starting position
translateY.setValue(0);

        Animated.parallel([
          Animated.timing(nextCardScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(nextCardTranslateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          nextCardScale.setValue(0.95);
          nextCardTranslateY.setValue(0);

          console.log(seenBufferRef.current.length);
          if (seenBufferRef.current.length >= 6) {
            // flushSeenBuffer();
          }
        });
      }, 16);
    });
  };

  const addtocart = async (index) => {
    try {
      dispatch(startCartUpdate());
      const data = {
        user_id: user.user_id,
        item_id: items[index].item_id,
        quantity: 1
      }
      const response = await fetch(`${API_BASE_URL}/v1/cart/add/`, {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(data)
      })
      const returneddata = await response.json();
      dispatch(finishCartUpdate())
      dispatch(incrementCart())
    } catch (error) {

    }
  }

  async function flushSeenBuffer() {
    try {
      console.log("data flsuhed")
      const buffer = seenBufferRef.current;
      if (buffer.length === 0) return;

      
      if (buffer.length === 6) {
        const avgTime = (recentStats.reduce((sum, s) => sum + s.timeTaken, 0)) / 6;
        const avgClicks = (recentStats.reduce((sum, s) => sum + s.clicks, 0)) / 6;
        const data = {
          user_id: user.user_id,
          dwell_time: avgTime,
          clicks: avgClicks,
          shadow: user?.name ? false : true
        };
        const response = await fetch(`${API_BASE_URL}/v1/user/update_rewards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const rewardsjson = await response.json();
        console.log(rewardsjson)
        if (user?.name && rewardsjson.new_reward!==0)
          dispatch(setUpdatedRewards(rewardsjson.new_reward));
        console.log(rewardsjson)
      }
      saveSeenToStorage()
      seenBufferRef.current = [];
    }
    catch (e) {
      console.log(e)
    }
  }

  const preloadImages = (items) => {
  items.forEach(item => {
    if (Array.isArray(item.images) && item.images.length > 0) {
      // Prefetch ALL images in item.images[]
      item.images.forEach(img => {
        const url = `${API_BASE_URL}/v1/items/getimage?url=${encodeURIComponent(img)}`;
        Image.prefetch(url);
      });
    } else if (item.image_url) {
      // Prefetch fallback main image
      const url = `${API_BASE_URL}/v1/items/getimage?url=${encodeURIComponent(item.image_url)}`;
      Image.prefetch(url);
    }
  });
};



  const getitems = async (gender,recommend, min_price, max_price, brands, products) => {
  const hasValidBrands = Array.isArray(brands) && brands.filter(b => b && b.trim() !== "").length > 0;
  const hasValidProducts = Array.isArray(products) && products.length > 0;
  const hasPriceFilter = (min_price && min_price !== '') || (max_price && max_price !== '');
    const excludeIds = servedQueueRef.current.getIds();
  if (!recommend || hasPriceFilter || hasValidBrands || hasValidProducts) { 
    setloading(true) 
  }

  try {
    const data = {
      userid: user.user_id,
      preference_vector: user.preference_vector,
      min_price: min_price,
      max_price: max_price,
      brands: brands,
      products: products,
      gender:gender,
      exclude_ids:excludeIds
    }

    console.log(data)
    
    const response = await fetch(
      `${API_BASE_URL}/v1/items/getinitial`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      },
    );
    
    const returneddata = await response.json();
    console.log('Fetched items:', returneddata.length);
    
    setMinPrice(min_price)
    setMaxPrice(max_price)
    setSelectedBrands(brands)
    setProducts(products)
    
    const itemsWithAnim = returneddata.map(item => ({
      ...item,
      translateX: new Animated.Value(0),
    }));

    itemsWithAnim.forEach(item => servedQueueRef.current.enqueue(item));
    // preloadImages(itemsWithAnim);
    
    if (!recommend || hasPriceFilter || hasValidBrands || hasValidProducts) { 
      console.log("Replacing all items"); 
      setitems(itemsWithAnim); 
    } else {
      // FIX 1: Trim old items before adding new ones
      setitems(prev => {
      
        return [...prev, ...itemsWithAnim];
      });
      
      // FIX 2: Adjust currentIndex to account for trimming
      // setCurrentIndex(0);
    }
    
    setloading(false);
  } catch (error) {
    console.log('Error fetching items:', error);
    setloading(false);
  }
};
  useEffect(() => {
   if(!tutorialDone)
    return;
    getitems(gender,false, minPrice, maxPrice, selectedBrands, []);
  }, [tutorialDone]);

  useEffect(() => {
  return () => {
    // Cleanup: stop all animations when component unmounts
    translateX.stopAnimation();
    translateY.stopAnimation();
    nextCardScale.stopAnimation();
    nextCardTranslateY.stopAnimation();
    imageScale.stopAnimation();
  };
}, []);

const removeSwipedItem = () => {
  setitems(prev => {
    if (prev.length <= 1) return prev;
    return prev.slice(1);
  });

  setCurrentIndex(0);
};
  const react = async (index, like) => {
    //console.log('hello')
    const data = {
      user_id: user.user_id,
      item_id: items[index].item_id,
      like_status: like,
      item_embedding: items[index].embedding,
      preference_vector: user.preference_vector
    };

    let seen1 = seen + 1;
    setseen(seen1);
    console.log(like ? "Liked:" : "Not Liked:" + items[index].item_id + "and seen" + seen1)
     if ((currentIndex+1) % 6 === 0 && currentIndex!==0) {
        // await flushSeenBuffer()
        console.log("Fetching new items")
        getitems(gender,true, minPrice, maxPrice, selectedBrands, products);
      }
    try {
      const response = await fetch(`${API_BASE_URL}/v1/user/swipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const returnedmsg = await response.json();
      //user.preference_vector=returnedmsg.new_vector;
      // dispatch(setUpdatedPreferenceVector(returnedmsg.new_vector));
      servedQueueRef.current.dequeue();
     
      console.log(returnedmsg);
    } catch (error) {
      console.log(error);
    }
  };

 const calcInProgress = useRef(false);

useEffect(() => {
  if (seen !== 0 && seen % 4 === 0 && !calcInProgress.current) {
    calcInProgress.current = true;

    InteractionManager.runAfterInteractions(async () => {
      try {
        const data = {
          user_id: user.user_id,
          preference_vector: user.preference_vector,
        };

        // Delay a bit so swiping animations finish first
        await new Promise(r => setTimeout(r, 500));

        const response = await fetch(`${API_BASE_URL}/v1/user/calculatevector`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const returnedmsg = await response.json();
          dispatch(setUpdatedPreferenceVector(returnedmsg.new_vector));
          console.log("✅ Updated vector in background");
        } else {
          console.log("⚠️ Vector update failed", response.status);
        }
      } catch (error) {
        console.log("❌ Vector update error", error);
      } finally {
        calcInProgress.current = false;
      }
    });
  }
}, [seen]);
  const imageSlideX = useRef(new Animated.Value(0)).current;
  const [isImageCycling, setIsImageCycling] = useState(false);
  const cycleImage = () => {
    if (isImageCycling) return; // Prevent multiple taps during animation
    // console.log(items[currentIndex].images?.length)
    if(!items[currentIndex].images) return;
    if(items[currentIndex].images?.length===0) return;
    if(cardimageindex===(items[currentIndex].images?.length-1)) return;
    if (isFlipped) return;
    setIsImageCycling(true);
    setcardimageindex(prev => prev + 1);
    // Animate current image sliding out to the left
    Animated.timing(imageSlideX, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Reset position to right side (off-screen)
      imageSlideX.setValue(width/4);

      // Animate new image sliding in from the right
      Animated.timing(imageSlideX, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start(() => {
        setIsImageCycling(false);
        // setShowFallbackMessage(true)
      });
    });
  };
  const cycleImageLeft = () => {
    if (isImageCycling) return; // Prevent multiple taps during animation
    if (isFlipped) return;
    if (cardimageindex === 0) { return; }
    setIsImageCycling(true);
      if(!items[currentIndex].images) return;
    if(items[currentIndex].images?.length===0) return;
    setcardimageindex(prev => prev - 1);
    // Animate current image sliding out to the left
    Animated.timing(imageSlideX, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Reset position to right side (off-screen)
      imageSlideX.setValue(-width);

      // Animate new image sliding in from the right
      Animated.timing(imageSlideX, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start(() => {
        setIsImageCycling(false);
        // setShowFallbackMessage(true)
      });
    });
  };

  const cycleImageHint = () => {
    if (isImageCycling) return; // Prevent multiple taps during animation
    if (isFlipped) return;
    setIsImageCycling(true);

    // Animate a small displacement to the left
    Animated.timing(imageSlideX, {
      toValue: -60, // slight nudge
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Spring back to original position
      Animated.spring(imageSlideX, {
        toValue: 0,
        friction: 4,   // controls "bounciness"
        tension: 40,   // controls speed
        useNativeDriver: true,
      }).start(() => {
        setIsImageCycling(false);
        // setShowFallbackMessage(true);
      });
    });
  };


  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // const backInterpolate = flipAnim.interpolate({
  //   inputRange: [0, 180],
  //   outputRange: ['180deg', '360deg'],
  // });

  const flipCard = () => {
    setcardClicks(prev => prev + 1);
    setIsFlipped(!isFlipped)
    Animated.timing(flipAnim, {
      toValue: 0.5,  // Halfway point of the animation
      duration: 150, // Half the total duration (half of 400ms)
      useNativeDriver: true,
    }).start(() => {
      // Call setflippedstuff when halfway through the animation
      // setflippedstuff(!flippedstuff);
      setIsFlipped(!isFlipped)
      // Continue the second half of the animation
      Animated.timing(flipAnim, {
        toValue: isFlipped ? 0 : 1,
        duration: 150, // Remaining half of the animation
        useNativeDriver: true,
      }).start();
    });
  };

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    backfaceVisibility: 'hidden',
    // position: 'absolute',
    // width: '100%',
    // height: '100%',
  };

  // const backAnimatedStyle = {
  //   transform: [{ rotateY: backInterpolate }],
  //   backfaceVisibility: 'hidden',
  //   // position: 'absolute',
  //   // width: '100%',
  //   // height: '100%',
  // };


  const secondsRef = useRef(0);

  useEffect(() => {
    secondsRef.current = 0;

    const interval = setInterval(() => {
      secondsRef.current += 1;
      if (secondsRef.current === 10) {
        cycleImageHint()
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex]);

 


  // console.log(user)
  // console.log(selectedVariant);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const navigation = useNavigation();
  console.log(items)

  useEffect(() => {
    if(!tutorialDone)
      return;
  servedQueueRef.current = new Queue();   // reset queue
  setitems([]);                           // clear current items
  setCurrentIndex(0);
  setSwipedCards(0);
  seenBufferRef.current = [];

  getitems(gender, false, minPrice, maxPrice, selectedBrands, []);
}, [gender,tutorialDone]);

useEffect(() => {
  if (currentIndex > 8) {
    setitems(prev => prev.slice(currentIndex - 2));
    setCurrentIndex(2);
  }
}, [currentIndex]);

useEffect(() => {
  const loadSeen = () => {
    const stored = storage?.getString('seen_ids')
    if (!stored) return

    const ids = JSON.parse(stored)

    ids.forEach(id => {
      servedQueueRef.current.enqueue(id)
    })
  }

  loadSeen()
}, [])

const saveSeenToStorage = () => {
  const existing = storage.getString('seen_ids')
  const seen = existing ? JSON.parse(existing) : []

  const newIds = servedQueueRef.current.getIds()

  const merged = [...new Set([...seen, ...newIds])]

  // limit size
  const trimmed = merged.slice(-200)

  storage.set('seen_ids', JSON.stringify(trimmed))
}

  return (
    <View
      //colors={['#6c63ff', '#f3c13f']}
      style={styles.container}

    >
      {gender==='men'?(<LinearGradient
        colors={['#2c3e50', '#bdc3c7', '#ffffff']}
        start={{ x: 0.5, y: 0 }}    // top center
        end={{ x: 0.5, y: 1 }}      // bottom center
        locations={[0, 0.4, 1]}  // controls blending smoothness
        style={{
          position: 'absolute',
          top: -100,
          left: 0,
          right: 0,
          height: 500,   // extend a bit below top bar so fade is smooth
          zIndex: 0,
        }}
      />):(
        <LinearGradient
        colors={['#3b2f4a', '#c9c3d1', '#ffffff']}

        start={{ x: 0.5, y: 0 }}    // top center
        end={{ x: 0.5, y: 1 }}      // bottom center
        locations={[0, 0.4, 1]}  // controls blending smoothness
        style={{
          position: 'absolute',
          top: -100,
          left: 0,
          right: 0,
          height: 500,   // extend a bit below top bar so fade is smooth
          zIndex: 0,
        }}
      />
      )}
    <View style={{zIndex:10, paddingHorizontal: 30,}}>
      <View
        style={{
          minWidth: '100%',
          paddingHorizontal: 16,
          flexDirection: 'row',
          // zIndex:10,
          //justifyContent: 'flex-end',
          marginBottom: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>

       
        
        <View
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  }}
>
  {/* LEFT: Brand / Logo */}
 
    <Image
      source={require('../assets/images/shazlo-logo-v4.png')}
      style={styles.logoInsideBar}
    />
  
   <Animated.Text
  style={{
    fontSize: 13,
    marginBottom:-8,
    letterSpacing: 1.6,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    opacity: fadeAnim,
    transform: [{ translateY: translateAnim }],
  }}
>
  {displayGender === 'women' ? 'Women' : 'Men'}
</Animated.Text>

  {/* RIGHT SIDE ACTIONS */}
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 'auto', // 🔑 pushes this group to right
      gap: 14,
    }}
  >
    <RewardBadge />
   

    {/* <IconPressButton
      size={25}
      iconSource={require('../assets/images/heart.png')}
      onPress={() => navigation.navigate('Liked')}
    /> */}

    {!user.name ? (
  <TouchableOpacity 
  onPress={() => handleScreenChange('Profile')}
  style={{
    marginRight: 10,
    borderRadius: 12,       
    overflow: 'hidden',
    width: 95,              // 1. Force an explicit width large enough for the text
  }}
>
  <LinearGradient
    colors={['#C6A664', '#E3C888', '#F5E3B3']}
    style={{
      height: 36,           // 2. Comfortable height balance
      width: '100%',        // 3. Fill the forced touchable width completely
      borderRadius: 12,     
      alignItems: 'center',
      justifyContent: 'center', 
    }}
  >
    <Text
      style={{
        fontSize: 12,       
        fontWeight: '800',
        color: '#000',
        letterSpacing: 0.3, // 4. Slightly reduced letter spacing to protect edge boundaries
        textAlign: 'center',
      }}
      numberOfLines={1}
      allowFontScaling={false}
    >
      JOIN NOW
    </Text>
  </LinearGradient>
</TouchableOpacity>
    ) : (
      <IconPressButton
      style={{
        paddingRight:10
      }}
        size={25}
        iconSource={require('../assets/images/user.png')}
        onPress={() => handleScreenChange('Profile')}
      />
    )}
  </View>
</View>

      </View>
      <FiltersBar gender={gender} setGender={setgender} getitems={getitems} brands={brand} isbrandspecific={isbrandspecific} />
</View>

    {!tutorialDone && <TutorialCard/>}
      {/* <FiltersNew getitems={getitems} brands={brand} isbrandspecific={isbrandspecific}/> */}

      {/* <View style={styles.filtersBarContainer}> */}
      {/* <FiltersBar /> */}
      {/* </View> */}
      {!loading ? (<>

        {currentIndex < items.length ? (
          <>
            {currentIndex + 1 < items.length && (
              <Animated.View
                style={[
                  styles.card,
                  {
                    position: 'absolute',
                    top: 90,
                    zIndex: 0,
                    transform: [
                      { scale: nextCardScale },
                      { translateY: nextCardTranslateY },
                    ],
                  },
                ]}

              >
                <Image
                  source={{ uri: `${API_BASE_URL}/v1/items/getimage?url=${encodeURIComponent(items[currentIndex + 1].image_url)}` }}
                  // source={require('../assets/sample1.jpg')}
                  style={styles.backgroundImage}
                  resizeMode="cover"
                />
                {/* <Text style={[{position:'absolute',color:'white', fontSize:40, top:0, left:10,  fontFamily: 'STIXTwoTextBold',}]}>{items[currentIndex+1].store}</Text> */}
                <LinearGradient
                  colors={['rgba(0,0,0,1.0)', 'rgba(0,0,0,0.6)', 'transparent']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height:140,
                    
                  }}
                >
                  <View style={{ flexDirection: 'row', marginBottom: 10, alignItems: 'center' }}>
                    {/* Sizes */}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {items[currentIndex].sizes.map((size) => (
                        <TouchableOpacity key={size.size} onPress={() => setSelectedSize(size)}>
                          <Text
                            style={{
                              fontSize: 18,
                              color: selectedSize === size ? "black" : "white",
                              paddingHorizontal: 8,
                              // paddingVertical: 2,
                              borderWidth: 2,
                              borderColor: 'white',
                              borderBottomWidth: 2,
                              borderRadius: selectedSize === size ? 5 : 0,
                              backgroundColor: selectedSize === size ? "white" : "transparent",

                              // borderBottomColor: selectedSize === size ? '#ffffffff' : 'transparent',
                              fontWeight: selectedSize === size ? 'bold' : 'normal',
                            }}
                          >
                            {size.size}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Size Chart Link */}
                    {/* <TouchableOpacity onPress={() => console.log('Open Size Chart')}>
                      <Text style={{ fontSize: 14, color: '#ffffffff', textDecorationLine: 'underline', marginLeft: 10 }}>
                        Size Chart
                      </Text>
                    </TouchableOpacity> */}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      // flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      paddingHorizontal:20
                    }}>
                    <Text
                      style={{ fontSize: 15, color: 'white', marginRight: 8, flex: 1 }}
                      numberOfLines={2}
                    >
                      {items[currentIndex + 1].title}
                    </Text>
                    <Text style={{ fontSize: 35, color: 'white', marginLeft: 8 }}>
                      {items[currentIndex + 1].price.replace(/INR$/i, "").trim()}
                    </Text>
                  </View>

                  {/* <Text style={{fontSize: 15, color: 'grey', marginTop: 8}}>
                {items[currentIndex].description}
              </Text> */}
                </LinearGradient>
              </Animated.View>
            )}
            <Animated.View
              {...(!isFlipped ? panResponder.panHandlers : {})}
              style={[
                styles.card,
                // frontAnimatedStyle,
                {
                  zIndex: 1,

                  transform: [
                    { rotateY: frontInterpolate },
                    { translateX: translateX },
                    { translateY: translateY },
                    {
                      rotate: translateX.interpolate({
                        inputRange: [-width, 0, width],
                        outputRange: ['-15deg', '0deg', '15deg'],
                      }),
                    },
                  ],
                },
              ]}

            >
              {!isFlipped ? (<>
                <View style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  zIndex: 20
                }}>
                  <TouchableOpacity onPress={() => {
                    // handle info click
                    flipCard();
                  }}
                    style={{ padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Image
                      source={require('../assets/images/info.png')}
                      style={{ width: 34, height: 34, tintColor: 'black' }}
                    />
                  </TouchableOpacity>
                </View>
                 


                <Animated.View style={[
                  styles.imageContainer,
                  {
                    transform: [{ translateX: imageSlideX }],

                  }
                ]}>
                 
                  {items[currentIndex].images?.length===0 || !items[currentIndex]?.images?(<Animated.Image

                    source={{ uri: `${API_BASE_URL}/v1/items/getimage?url=${encodeURIComponent(items[currentIndex].image_url)}` }}
                    // source={require('../assets/sample1.jpg')}
                    style={[styles.backgroundImage, {
                      transform: [{ scale: imageScale }],
                    },]}
                    onError={(e) => {
                      console.log(items[currentIndex].images[0])
                      console.log('❌ Image Load Error:', e.nativeEvent);
                    }}
                    resizeMode="cover" />):(
                      <Animated.Image

                    source={{ uri: `${API_BASE_URL}/v1/items/getimage?url=${encodeURIComponent(items[currentIndex].images[cardimageindex])}` }}
                    // source={require('../assets/sample1.jpg')}
                    style={[styles.backgroundImage, {
                      transform: [{ scale: imageScale }],
                    },]}
                    onError={(e) => {
                      console.log(items[currentIndex].images[0])
                      console.log('❌ Image Load Error:', e.nativeEvent);
                    }}
                    resizeMode="cover" />
                    )}
                  {showFallbackMessage && (
                    <View style={{
                      position: 'absolute',
                      bottom: 200,
                      left: 20,
                      right: 20,
                      padding: 12,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      borderRadius: 8
                    }}>
                      <Text style={{ color: 'white', fontSize: 24 }}>
                        This is a representative alternative image of the product. Since we are testing, we have only one image/item.
                      </Text>
                    </View>
                  )}
                </Animated.View>
                <View style={{

                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 120,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    {Array.from({ length: items[currentIndex]?.images?.length>0?items[currentIndex]?.images?.length:1 }).map((_, i) => (
                      <View
                        key={i}
                        style={{
                          width: i === cardimageindex ? 20 : 5,
                          height: 5,
                          borderRadius: 20 / 2,
                          backgroundColor: i === cardimageindex ? 'black' : 'white',
                          marginHorizontal: 3,
                        }}
                      />
                    ))}
                  </View>
                </View>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFillObject,
                    {
                      backgroundColor: 'black',
                      opacity: darkenOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.3], // adjust 0.4 to control darkness
                        extrapolate: 'clamp',
                      }),
                    },
                  ]}
                />
                <Animated.Image
                  source={require('../assets/images/like.png')}
                  style={{
                    position: 'absolute', top: '50%',
                    left: '50%',
                    transform: [{ translateX: -110 }, { translateY: -110 }], opacity: likeOpacity, width: 220, height: 220
                  }}
                />


                <Animated.Image
                  source={require('../assets/images/dislike.png')}
                  style={{
                    position: 'absolute', top: '50%',
                    left: '50%',
                    transform: [{ translateX: -110 }, { translateY: -110 }], opacity: dislikeOpacity, width: 220, height: 220
                  }}
                />

                <Animated.Image
                  source={require('../assets/images/bookmark.png')}
                  style={{
                    position: 'absolute', top: '50%',
                    left: '50%',
                    transform: [{ translateX: -110 }, { translateY: -110 }], opacity: saveOpacity, width: 220, height: 220
                  }}
                />

                <Animated.Image
                  source={require('../assets/images/shopping-cart.png')}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: [{ translateX: -110 }, { translateY: -110 }],
                    opacity: cartOpacity,
                    width: 220,
                    height: 220,
                    tintColor: 'white'  // <-- this makes it white
                  }}
                />
                <View style={{ position: 'absolute', top: 24, left: 20 }}>
                  <TouchableWithoutFeedback
                    onPress={async () => {
                      try {
                        await Share.share({
                          message: `Check this product! https://www.shazlo.store/product/${items[currentIndex].item_id}`,
                        });
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                  >
                    <Image source={require('../assets/images/share.png')} style={{ width: 30, height: 30, tintColor: 'black' }} />
                  </TouchableWithoutFeedback>
                </View>
                <LinearGradient
                  colors={['rgba(0,0,0,1.0)', 'rgba(0,0,0,0.6)', 'transparent']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                     height: 140,
                    //  height: 165,
                    // height:120,
                    // paddingHorizontal: 15,
                    // paddingVertical: 10,
                  }}
                >
                  <View style={{ flexDirection: 'row', marginBottom: 10, alignItems: 'center', padding:20 }}>
                    {/* Sizes */}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {items[currentIndex].sizes.map((size) => (
                        <TouchableOpacity key={size.size} onPress={() => { setcardClicks(prev => prev + 1); setSelectedSize(size) }}>
                          <Text
                            style={{
                              fontSize: 18,
                              color: selectedSize === size ? "black" : "white",
                              paddingHorizontal: 8,
                              // paddingVertical: 2,
                              borderWidth: 2,
                              borderColor: 'white',
                              borderBottomWidth: 2,
                              borderRadius: selectedSize === size ? 5 : 0,
                              backgroundColor: selectedSize === size ? "white" : "transparent",

                              // borderBottomColor: selectedSize === size ? '#ffffffff' : 'transparent',
                              fontWeight: selectedSize === size ? 'bold' : 'normal',
                            }}
                          >
                            {size.size}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  <View
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  }}
>
                      {items[currentIndex]?.link && (<View style={{
                  marginLeft:'auto',
                  
                }}>
                  <IconPressButton
                   iconSource={require('../assets/images/follow.png')}
                   tintColor='white'
                   size="30"
                  onPress={() => {
        const url = items[currentIndex].link;
        if (url && items[currentIndex].store==='MnS') {
          Linking.openURL(`https://www.marksandspencer.in/${url}`);
        }
        else
          if(url)
          {
            Linking.openURL(url);
          }
      }}
                    style={{ padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  />
                  
                   
                </View>
)}
</View>
                    </View>

                    {/* Size Chart Link */}
                    {/* <TouchableOpacity onPress={() => console.log('Open Size Chart')}>
                      <Text style={{ fontSize: 14, color: '#ffffffff', textDecorationLine: 'underline', marginLeft: 10 }}>
                        Size Chart
                      </Text>
                    </TouchableOpacity> */}

                    <View style={{ flexDirection: 'row', marginTop: 0, }}>
                      {/* <ColorSelector
  colors={colors}
  selectedColor={selectedColor}
  selectedSize={selectedSize}
  selectvariant={selectvariant}
/> */}

                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      // flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      paddingHorizontal: 20,
                    }}>
                    <Text
                      style={{ fontSize: 15, color: 'white', marginRight: 8, flex: 1 }}
                      numberOfLines={2}
                    >
                      {items[currentIndex].title}
                    </Text>
                    <Text style={{ fontSize: 35, color: 'white', marginLeft: 8 }}>
                      {items[currentIndex ].price.replace(/INR$/i, "").trim()}
                    </Text>
                  </View>

                  {/* <Text style={{fontSize: 15, color: 'grey', marginTop: 8}}>
                {items[currentIndex].description}
              </Text> */}
                </LinearGradient>
                {/* </ImageBackground> */}
              </>) : (
                // BACK SIDE (info card)
                <View
                  style={{
                    flex: 1,
                    backgroundColor: '#ccc', // greyish neutral background
                    justifyContent: 'center',
                    // alignItems: 'center',
                    padding: 20,
                    transform: [{ scaleX: -1 }],
                  }}
                >
                  <TouchableOpacity
                    onPress={flipCard}
                    style={{ position: 'absolute', top: 20, right: 20, padding: 10 }}
                  >
                    <Text style={{ fontSize: 16, color: 'black' }}>✕</Text>
                  </TouchableOpacity>

                  <Text style={{ fontSize: 20, color: 'black', marginBottom: 15, fontWeight: 'bold' }}>
                    Material
                  </Text>
                  <Text style={{ fontSize: 16, color: 'black', marginBottom: 25, }}>
                    100% premium cotton. Breathable and lightweight for all-day comfort.
                  </Text>

                  <Text style={{ fontSize: 20, color: 'black', marginBottom: 15, fontWeight: 'bold' }}>
                    Care Instructions
                  </Text>
                  <Text style={{ fontSize: 16, color: 'black', marginBottom: 25, }}>
                    Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron on reverse side if needed.
                  </Text>

                  <Text style={{ fontSize: 20, color: 'black', marginBottom: 15, fontWeight: 'bold' }}>
                    Return Policy
                  </Text>
                  <Text style={{ fontSize: 16, color: 'black', }}>
                    Easy 7-day return policy. Items must be unused and in original packaging. Refunds processed within 5–7 business days.
                  </Text>
                </View>

              )}
            </Animated.View>
          </>
        ) : (
          <View style={styles.noMoreCards}>
            <Text style={styles.noMoreText}>You are all caught up!</Text>
          </View>
        )}
        {saving && (
          <>
            <TouchableWithoutFeedback onPress={() => setsaving(null)}>
              <View
                style={[
                  {
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  },
                ]}
              />
            </TouchableWithoutFeedback>

          </>
        )}
        <SelectClosetSheet ref={closetRef} itemId={items[currentIndex]?.item_id} movetonext={movetonext} itemimage={items[currentIndex]?.image_url} handleScreenChange={handleScreenChange} closets={closets} setclosets={setclosets}/>
        

      </>) : (<SwipeSkeleton />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    //backgroundColor: '#323278',
    //padding:20,
    //justifyContent: 'center',
    alignItems: 'center',
    marginTop: isLargeIPad?10:50,
  },
  card: {
    width: width * 0.92,
    height: '65%',
    borderRadius: 16,
    elevation: 5,
    marginTop: 7,
    backgroundColor: 'white',
    //justifyContent: 'center',
    //alignItems: 'center',
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center', // Adjust as needed
    alignItems: 'center', // Adjust as needed
    borderRadius: 16,
  },
  gossipText: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    fontFamily: 'STIXTwoTextBold',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
    paddingHorizontal: 15
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 400,
    backgroundColor: '#282a3a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 10,
  },
  filtersBarContainer: {
    width: '100%',
    height: 85, // a narrow bar height
    zIndex: 10, // keeps it above animated cards
    backgroundColor: 'rgba(255,255,255,0.9)', // subtle background for contrast
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 5,
  },


  noMoreCards: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMoreText: {
    fontSize: 20,
    color: 'lightgrey',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.3,
    backgroundColor: '#282a3a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 10,
  },
  logoInsideBar: {
    width: 95,
    height: 45,
    resizeMode:'contain',
    marginRight: 8,
    borderRadius: 4,
    marginLeft: 10,
  },
  discussion: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  discussionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  discussionText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
});