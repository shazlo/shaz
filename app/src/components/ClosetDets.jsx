import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  BackHandler,
  Share,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { useDispatch, useSelector } from 'react-redux';
import IconPressButton from './IconPressButton';
import ConfirmDialog from './ConfirmClosetDelete';
import ProductCard from './Productcard';
import SwipeUI from '../screens/SwipeUIDiscover';
import { finishCartUpdate, setCartCount, startCartUpdate } from '../store/cartSlice';
import { API_BASE_URL } from '../config/api';

const { width, height } = Dimensions.get('window');

const ClosetDets = ({ closetData, visible, onClose, setClosets, setclosetshome, closets }) => {
  const [closet, setCloset] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [expanded, setExpanded] = useState(false);
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch();
  const { count: cartCount, isUpdating } = useSelector((state) => state.cart)
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(1)).current; // for closet name
  const similarFade = useRef(new Animated.Value(0)).current; // for similar text
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const selectedItemIds = Object.keys(selectedItems).filter(
    (id) => selectedItems[id] === true
  );
  const [showprod, setshowprod] = useState();
  const handleDeletePress = () => {
    if (selectedItemIds.length > 0) {
      deleteSelectedItems();
    } else {
      setConfirmVisible(true); // delete entire closet
    }
  };

  const deleteSelectedItems = async () => {
    // 1️⃣ Optimistic UI update – current closet
    setCloset((prev) => ({
      ...prev,
      items: prev.items.filter(
        (item) => !selectedItemIds.includes(item.item_id)
      ),
    }));

    // 2️⃣ Optimistic UI update – closets list
    setClosets((prevClosets) =>
      prevClosets.map((c) =>
        c.closet_id === closet.closet_id
          ? {
            ...c,
            items: c.items.filter(
              (item) => !selectedItemIds.includes(item.item_id)
            ),
          }
          : c
      )
    );

    // 3️⃣ Clear selection
    setSelectedItems({});

    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/closets/delete-item`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.user_id,
            closet_id: closet.closet_id,
            item_ids: selectedItemIds,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.log("❌ Failed to delete items:", result.error);
        // optional rollback here if you want
      }
    } catch (error) {
      console.log("⚠️ Error deleting items:", error);
      // optional rollback here
    }
  };



  const borderRadiusAnim = scaleAnim.interpolate({
    inputRange: [1, 50],
    outputRange: [30, 0],
    extrapolate: 'clamp',
  });

  const expand = () => {
    setExpanded(true);
    fadeAnim.setValue(0);
    setShowAllItems(false);
    // text crossfade
    Animated.sequence([
      Animated.timing(titleFade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(similarFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // existing animations
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 55,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();


  };

  useEffect(() => {
    let timer;
    if (visible) {
      timer = setTimeout(() => {
        setShowAllItems(true);
        console.log("✅ showAllItems set to true via timeout");
      }, 600); // match total animation duration (600–800ms)
    } else {
      setShowAllItems(false);
    }

    return () => clearTimeout(timer);
  }, [visible]);


  const crumble = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(colorAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),

    ]).start();
    titleFade.setValue(1);
    similarFade.setValue(0);
    fadeAnim.setValue(0); // reset opacity for next open
    setExpanded(false);
  };


  const bgColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['black', 'white'],
  });

  useEffect(() => {
    if (visible && closetData) {
      setCloset(closetData);
      setSelectedItems({});
    } else {
      setCloset(null);
    }
  }, [visible, closetData]);

  useEffect(() => {
    const onBackPress = () => {
      if (expanded) {
        crumble();
        return true;
      }
      if (visible) {
        onClose?.();
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [expanded, visible]);

  if (!closet) return null;

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  const handleShare = async () => {
    if (!closet) return;

    try {
      const shareUrl = `https://www.shazlo.store/closet/${closet.closet_id}`;
      const message = `Let's make a closet together, join and edit \n${shareUrl}`;

      await Share.share({
        message,
        url: shareUrl,
        title: 'Share Closet',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };



  const handleAddToCart = async () => {
    try {
      const selectedIds = Object.keys(selectedItems).filter(
        (id) => selectedItems[id] === true
      );

      if (selectedIds.length === 0) {
        console.log("No items selected to add to cart");
        return;
      }

      dispatch(startCartUpdate());

      const data = {
        user_id: user.user_id,
        closet_id: closet.closet_id,
        item_ids: selectedIds,
      };

      const response = await fetch(
        `${API_BASE_URL}/v1/closets/add-to-cart`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (response.ok) {
        const addedCount = result.added_item_ids?.length || selectedIds.length;

        console.log(`✅ ${addedCount} item(s) added to cart.`);
        dispatch(setCartCount(cartCount + addedCount));

        setSelectedItems({});
      } else {
        console.log("❌ Failed to add:", result.error);
      }
    } catch (error) {
      console.log("⚠️ Error adding to cart:", error);
    } finally {
      dispatch(finishCartUpdate());
    }
  };



  const deletecloset = async () => {
    try {

      setClosets((prevClosets) =>
        prevClosets.filter((c) => c.closet_id !== closet.closet_id)
      );
      onClose();
      const response = await fetch(`${API_BASE_URL}/v1/closets/delete`, {
        method: 'POST',

        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, closet_id: closet.closet_id }),
      })
      setclosetshome((prevClosets) =>
        prevClosets.filter((c) => c.closet_id !== closet.closet_id)
      );

    } catch (error) {
      console.log(error)
    }
  }


  return (
    <View style={styles.sheet}>

      {/* Close button */}
      <TouchableOpacity onPress={onClose} style={styles.cross}>
        <Text style={{ fontSize: 20 }}>✕</Text>
      </TouchableOpacity>

      {/* Title */}

      <View style={{ alignItems: 'center', justifyContent: 'center', height: 60 }}>
        <Animated.Text style={[styles.title, { opacity: titleFade }]}>
          {closet.name}
        </Animated.Text>

        <Animated.Text
          style={[
            styles.title,
            {
              position: 'absolute', // 👈 makes it overlap
              opacity: similarFade,
              marginTop:30
            },
          ]}
        >
          Similar to {closet.name}
        </Animated.Text>
      </View>


      {/* Top row */}
      <View style={styles.topRow}>
        <Text style={styles.selectionText}>
          {selectedCount}/{closet.items.length} selected
        </Text>
        <View style={styles.buttonRow}>
          <IconPressButton
            iconSource={require('../assets/images/share.png')}
            onPress={handleShare}
          />

          {!isUpdating ? (<IconPressButton
            iconSource={require('../assets/images/add-to-bag.png')}
            onPress={handleAddToCart}
          />) : (<ActivityIndicator size="small" color="black" />)}

          <IconPressButton
            iconSource={require('../assets/images/delete.png')}
            onPress={handleDeletePress}
          />
        </View>

      </View>

      {/* Items list */}
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {closet.items.length === 0 ? (
            <Text style={styles.empty}>No items in this closet.</Text>
          ) : (
            <View style={styles.gridContainer}>
              {(showAllItems ? closet.items : closet.items.slice(0, 4)).map((item, index) => (
                <View key={`${item.item_id}-${index}`} style={styles.gridItem}>
                  <View style={{ position: 'relative' }}>
                    <TouchableWithoutFeedback onPress={() => { setshowprod(item) }}>
                      <Image
                        source={{ uri: `${API_BASE_URL}/v1/items/getimage?url=${encodeURIComponent(item.image_url)}` }}
                        style={styles.gridImage}
                      />
                    </TouchableWithoutFeedback>
                    <Pressable
                      style={styles.checkboxContainer}
                      hitSlop={12}
                      onPress={() => {
                        setSelectedItems(prev => ({
                          ...prev,
                          [item.item_id]: !prev[item.item_id],
                        }));
                      }}
                    >
                      <CheckBox
                        value={!!selectedItems[item.item_id]}
                        onValueChange={() => { }}
                        disabled={true}
                        tintColors={{ true: 'black', false: 'black' }}
                      />
                    </Pressable>
                  </View>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.price}>{item.price}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
      {showprod && (<ProductCard item={showprod} visible={!!showprod} onClose={() => setshowprod(null)} />)}
      {/* Bottom button */}
      <View style={styles.bottomButtonContainer}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.animatedBubble,
            {
              position: 'absolute',
              transform: [{ scale: scaleAnim }],
              backgroundColor: bgColor,
              borderRadius: borderRadiusAnim,
            },
          ]}
        />

        {!expanded && (
          <TouchableOpacity onPress={expand} style={styles.bottomButtonForeground}>
            <Text style={styles.bottomButtonText}>Discover Similar</Text>
          </TouchableOpacity>
        )}


        <ConfirmDialog
          visible={confirmVisible}
          title="Delete Closet?"
          message={`Are you sure you want to delete "${closet.name}"?`}
          onCancel={() => setConfirmVisible(false)}
          onConfirm={deletecloset}
        />
      </View>
      {expanded && (
        <Animated.View style={[styles.fullContent, { opacity: fadeAnim }]}>
          <SwipeUI closet={closet} closets={closets} setclosets={setclosetshome} setClosets={setClosets} />
        </Animated.View>
      )}
    </View>
  );
};

export default ClosetDets;

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',      // make it overlay
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width,
    maxWidth: '100%',
    backgroundColor: 'white',
    padding: 16,
    zIndex: 1000,              // ensure it sits on top
    paddingTop: 30,
  },

  cross: {
    position: 'absolute',
    top: 30,
    right: 20,
    zIndex: 10,
    paddingTop: 30
  },
  checkboxContainer: {
  position: 'absolute',
  top: 8,
  left: 8,
  zIndex: 100,
},
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    // marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'gray',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 30,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 6,
  },
  scroll: {
    marginTop: 10,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },

  gridItem: {
    width: '48%', // two per row
    marginBottom: 20,
    // alignItems: 'center',
  },

  gridImage: {
    width: '100%',
    aspectRatio: 0.75, // consistent image size
    borderRadius: 10,
    backgroundColor: '#f3f3f3',
  },

  gridCheckbox: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
  },

  card: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 8,
  },
  image: {
    width: 160,
    height: 180,
    borderRadius: 8,
    marginRight: 12,
  },
  checkbox: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 100,
    borderRadius: 40
  },
  details: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: 'gray',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'gray',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  animatedBubble: {
    width: 20,
    height: 23,
    overflow: 'hidden',
    zIndex: 0,
  },
  bottomButtonForeground: {
    zIndex: 10,
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  bottomButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fullContent: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
