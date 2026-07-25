import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Modal,
  BackHandler,
  Linking,
  Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { API_BASE_URL } from '../config/api';

const { width, height } = Dimensions.get('window');

const ProductCard = ({ item, visible, onClose }) => {
  // console.log(item)
  const [isFlipped, setIsFlipped] = useState(false);
  const [isImageCycling, setIsImageCycling] = useState(false);
  const [cardimageindex, setcardimageindex] = useState(0);
  const [showFallbackMessage, setShowFallbackMessage] = useState(false);
  console.log(item)
  const flipAnim = useRef(new Animated.Value(0)).current;
  const imageSlideX = useRef(new Animated.Value(0)).current;

  // Flip interpolation
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Cycle image right
  const cycleImage = () => {
    if (isImageCycling) return;
    console.log(Array.isArray(item.images))
      if (!Array.isArray(item.images) || item.images?.length===0 || item.images?.length==1)  return;
    setIsImageCycling(true);
    setcardimageindex((prev) => prev + 1);

    Animated.timing(imageSlideX, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      imageSlideX.setValue(width);
      Animated.timing(imageSlideX, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setIsImageCycling(false);
        setShowFallbackMessage(true);
      });
    });
  };

  // Cycle image left
  const cycleImageLeft = () => {
    if (isImageCycling || cardimageindex === 0) return;
       if (!Array.isArray(item.images) || item.images?.length===0 || item.images?.length===1)  return;
    setIsImageCycling(true);
    setcardimageindex((prev) => prev - 1);

    Animated.timing(imageSlideX, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      imageSlideX.setValue(-width);
      Animated.timing(imageSlideX, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setIsImageCycling(false);
        setShowFallbackMessage(true);
      });
    });
  };

  // Reset hint after 10 seconds
  useEffect(() => {
    const seconds = setInterval(() => {
      Animated.timing(imageSlideX, {
        toValue: -60,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(imageSlideX, {
          toValue: 0,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }).start();
      });
    }, 10000);

    return () => clearInterval(seconds);
  }, []);

  // Handle back button to close modal
  useEffect(() => {
    const backAction = () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [visible, onClose]);

  const imageUri = Array.isArray(item.images) && item.images?.length>0 ?`${API_BASE_URL}/v1/items/getimage?url=${encodeURIComponent(
    item.images[cardimageindex]
  )}`:`${API_BASE_URL}/v1/items/getimage?url=${encodeURIComponent(
    item.image_url
  )}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>

      <View style={styles.modalContainer}>
        <View style={styles.card}>
          {/* FRONT SIDE */}
          {!isFlipped ? (
            <Animated.View
              style={[
                styles.front,
                {
                  transform: [{ rotateY: frontInterpolate }],
                },
              ]}
            >
              {/* Info Button */}
              <TouchableOpacity
                onPress={flipCard}
                style={{ position: 'absolute', top: 20, right: 20, zIndex: 2 }}
              >
                <Image
                  source={require('../assets/images/info.png')}
                  style={{ width: 34, height: 34, tintColor: 'black' }}
                />
              </TouchableOpacity>

              {/* Image */}
              <Animated.View
                style={{
                  flex: 1,
                  transform: [{ translateX: imageSlideX }],

                }}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </Animated.View>

              {/* Cycle Hint Message */}
              {/* {showFallbackMessage && (
                <View style={styles.hintBox}>
                  <Text
                    style={{ color: 'white', fontSize: 16, textAlign: 'center' }}
                  >
                    This is a representative test image — swipe left/right for
                    more.
                  </Text>
                </View>
              )} */}
              <View style={{ position: 'absolute', top: 24, left: 20, zIndex:20 }}>
                                <TouchableWithoutFeedback
                                  onPress={async () => {
                                    try {
                                      await Share.share({
                                        message: `Check this product! https://www.shazlo.store/product/${item?.item_id}`,
                                      });
                                    } catch (error) {
                                      console.log(error);
                                    }
                                  }}
                                >
                                  <Image source={require('../assets/images/share.png')} style={{ width: 30, height: 30, tintColor: 'black' }} />
                                </TouchableWithoutFeedback>
                              </View>
              {/* Image Dots */}
              <View style={styles.dotsContainer}>
                {Array.from({ length: item.images?.length>0?item.images?.length:1 }).map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: i === cardimageindex ? 20 : 5,
                      height: 5,
                      borderRadius: 5,
                      backgroundColor: i === cardimageindex ? 'black' : 'white',
                      marginHorizontal: 3,
                    }}
                  />
                ))}
              </View>

                 {item?.link && (<View style={{
                  position:'absolute',
                  bottom:60,
                  right:10,
                  zIndex:20
                                // marginLeft:300
                              }}>
                                <TouchableOpacity  onPress={() => {
                      const url = item.link;
                      if (url) {
  if (url.startsWith("/")) {
    console.log('url')
    Linking.openURL(`https://www.marksandspencer.in${url}`);
  } else {
    Linking.openURL(url);
  }
}
                    }}
                                  style={{ padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Image
                                    source={require('../assets/images/follow.png')}
                                    style={{ width: 24, height: 24, tintColor: 'white' }}
                                  />
                                </TouchableOpacity>
                              </View>
              )}

              {/* Product Info Gradient */}
              <LinearGradient
  colors={['rgba(0,0,0,1)', 'rgba(0,0,0,0.6)', 'transparent']}
  start={{ x: 0, y: 1 }}
  end={{ x: 0, y: 0 }}
  style={[
    styles.bottomGradient,
    {
      justifyContent: 'flex-end',   // Push children to bottom
     
    },
  ]}
>
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      padding:20
    }}
  >
                  <Text
                    style={{
                      fontSize: 15,
                      color: 'white',
                      marginRight: 8,
                      flex: 1,
                    }}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{ fontSize: 35, color: 'white', marginLeft: 8 }}
                  >
                    {item.price}
                  </Text>
                </View>
              </LinearGradient>

              {/* Left & Right Image Touch Zones */}
              <TouchableWithoutFeedback onPress={cycleImageLeft}>
                <View style={styles.leftTapZone} />
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={cycleImage}>
                <View style={styles.rightTapZone} />
              </TouchableWithoutFeedback>
            </Animated.View>
          ) : (
            // BACK SIDE
            <Animated.View
              style={[
                styles.back,
                { transform: [{ rotateY: frontInterpolate }, { scaleX: -1 }] },
              ]}
            >
              <TouchableOpacity
                onPress={flipCard}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  padding: 10,
                }}
              >
                <Text style={{ fontSize: 16, color: 'black' }}>✕</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Material</Text>
              <Text style={styles.sectionText}>
                100% premium cotton. Breathable and lightweight.
              </Text>

              <Text style={styles.sectionTitle}>Care Instructions</Text>
              <Text style={styles.sectionText}>
                Machine wash cold. Do not bleach. Iron on reverse side.
              </Text>

              <Text style={styles.sectionTitle}>Return Policy</Text>
              <Text style={styles.sectionText}>
                Easy 7-day return. Refunds processed within 5–7 business days.
              </Text>
            </Animated.View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.64)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    width: width * 0.92,
    height: height * 0.75,
    borderRadius: 16,
    // backgroundColor: 'white',
    overflow: 'hidden',
    alignSelf: 'center',
    elevation: 6,
  },
  front: {
    flex: 1,
    backfaceVisibility: 'hidden',
  },
  back: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 20,
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    // paddingHorizontal: 15,
    // paddingVertical: 10,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 120,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  hintBox: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 20,
  },
  leftTapZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '40%',
    height: '100%',
  },
  rightTapZone: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '40%',
    height: '100%',
  },
});
