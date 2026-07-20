import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView, Animated, Easing, BackHandler, findNodeHandle, UIManager, Dimensions, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import NewClosetSheet from '../components/NewCloset';
import BlinkingShaz from '../components/LogoLoader';
import ClosetDetailsSheet from '../components/ClosetSheet';
import ClosetDets from '../components/ClosetDets';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { API_BASE_URL } from '../config/api';
// import NewClosetSheet from '../components/NewCloset';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const AnimatedClosetCard = React.forwardRef(({ item, onPressIn, onPressOut, onPress }, ref) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    const tiltDirection = Math.random() > 0.5 ? 1 : -1;
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: tiltDirection * 0.07,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      })
    ]).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-57.3deg', '57.3deg'],
  });

  return (
    <TouchableOpacity
      ref={ref}
      onPress={onPress}
      onPressIn={() => {  onPressIn && onPressIn(); }}
      onPressOut={() => { onPressOut && onPressOut(); }}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }, { rotate }],
          }
        ]}
      >
        {item.items.length > 0 && (
          <Image source={{ uri: `${API_BASE_URL}/v1/items/getimage?url=${encodeURIComponent(item?.items[0]?.image_url)}` }} style={styles.image} />
        )}
        {/* <View style={styles.overlay}>
          <Text style={styles.text}>{item.name}</Text>
        </View> */}
      </Animated.View>
    </TouchableOpacity>
  );
});

const MoodBoardsScreen = ({ setclosets, handleScreenChange}) => {
  const user = useSelector((state)=>state.auth.user);
  const sheetRef = useRef();
  const [closets, setClosets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedcloset,setselectedcloset]=useState(null);
  const cardRefs = useRef({});
  // track whether the closet sheet is open
  const [isClosetOpen, setIsClosetOpen] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;
  const [cardLayout, setCardLayout] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [pendingOpenClosetId, setPendingOpenClosetId] = useState(null);
  const handleAddCloset = (closet) => {
    console.log(closet);
    setClosets(prev => [ ...prev,closet]);
    setclosets(prev => [closet, ...prev]);
    // You can make API call here
  };

  useEffect(()=>{
    const getclosets=async()=>{
      setLoading(true);
      const response=await fetch(`${API_BASE_URL}/v1/closets/${user.user_id}`,{
        method:'GET'
      });
      const returneddata=await response.json();
      setClosets(returneddata)
      setLoading(false);
      console.log(returneddata)
    }
    getclosets();
  },[])

  const closetSheetRef = useRef();

  // When the closetSheetRef becomes available, wrap its close method so we can track closes that originate from inside the sheet
  useEffect(() => {
    const ref = closetSheetRef.current;
    if (ref && !ref.__closeWrapped) {
      const origClose = ref.close?.bind(ref);
      ref.close = (...args) => {
        if (origClose) origClose(...args);
        // ensure our state reflects closed sheet
        setIsClosetOpen(false);
      };
      // mark wrapped so we don't double-wrap
      ref.__closeWrapped = true;
    }
  }, [closetSheetRef.current]);

  // Back handler: only intercept when sheet is open
  useEffect(() => {
    const onBackPress = () => {
      if (isClosetOpen) {
        closeCloset();
        return true; // consumed
      }
      else if(isSheetOpen)
      {
        // console.log('this running')
         sheetRef.current.close();
        return true; // consumed

      }
      return false; // let system handle (exit screen / app)
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isClosetOpen, isSheetOpen]);
   const openCloset = (item, cardRef) => {
  if (!cardRef) return;
  setIsClosetOpen(true)
  const nodeHandle = findNodeHandle(cardRef);
  UIManager.measure(nodeHandle, (x, y, width, height, pageX, pageY) => {
    setCardLayout({ x: pageX, y: pageY, width, height });
    setselectedcloset(item);
    anim.setValue(0);

    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: false,
      speed: 2,      // controls "snappiness"
      bounciness: 0,  // 0 = no bounce (sleek)
      // damping: 15,    // smooth settling
    }).start();
  });
};

const closeCloset = () => {
   setselectedcloset(null);
  Animated.timing(anim, {
    toValue: 0, // animate back to the card
    duration: 200,
    easing: Easing.inOut(Easing.ease),
    useNativeDriver: false,
  }).start(() => {
    // only reset state AFTER animation completes
     setIsClosetOpen(false);
   
    setCardLayout(null);
   
  });
};

 const route = useRoute();
 const navigation=useNavigation();
// when opened via deep link "closet/:id"
useEffect(() => {
  const handleDeepLink = async () => {
    if (route.name === 'Closet' && route.params?.id) {
      const closetId = route.params.id;
      setLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/v1/closets/add-collab`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.user_id, closet_id: closetId }),
        });

        const data = await response.json();

         if (data.already_member === "True") {
          setLoading(false)
          setPendingOpenClosetId(closetId);
        } else {
          setLoading(false)
          handleAddCloset(data);
          setPendingOpenClosetId(data.closet_id);
        }

      } catch (error) {
        console.error('Error adding collab:', error);
        setLoading(false);
      }finally {
        setLoading(false);

        // 🔥 clear deep link param so it doesn't trigger again
        navigation.setParams({ id: undefined });
      }
    }
  };

  handleDeepLink();
}, [route.params]);

useEffect(() => {
  if (pendingOpenClosetId && closets.length > 0) {
    const closet = closets.find(c => c.closet_id === pendingOpenClosetId);
    const ref = cardRefs.current[pendingOpenClosetId]?.current;

    if (closet && ref) {
      setTimeout(() => {
        openCloset(closet, ref);
        setPendingOpenClosetId(null);
      }, 100);
    }
  }
}, [closets, pendingOpenClosetId]);



  // render item: set isClosetOpen true then open sheet
  const renderMoodboard = ({ item, index }) => {
  if (!cardRefs.current[item.closet_id]) {
    cardRefs.current[item.closet_id] = React.createRef();
  }

  const isLeft = index % 2 === 0;

  return (
    <View
      style={{
        flexDirection: isLeft ? "row" : "row-reverse",
        alignItems: "center",
        marginBottom: 24,
        width: "100%",
      }}
    >
      <AnimatedClosetCard
        ref={cardRefs.current[item.closet_id]}
        item={item}
        onPress={() =>
          openCloset(item, cardRefs.current[item.closet_id].current)
        }
      />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 16,
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "black",
          }}
        >
          {item.name}
        </Text>
      </View>
    </View>
  );
};

   const fullscreenStyle = cardLayout ? {
    position: "absolute",
    left: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [cardLayout.x, 0],
    }),
    top: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [cardLayout.y, 0],
    }),
    width: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [cardLayout.width, SCREEN_WIDTH],
    }),
    height: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [cardLayout.height, SCREEN_HEIGHT],
    }),
      borderRadius: 15, 
    overflow: "hidden",
    backgroundColor: "white",
    zIndex: 2000,
  } : {};

  const overlayOpacity = anim.interpolate({
  inputRange: [0, 1],
  outputRange: [0, 0.4],
});

if(!user?.name)
{
  return(
    <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 28,
      paddingTop: 120,
    }}
  >
    <LinearGradient
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
          />
    <Text
      style={{
        fontSize: 24,
        fontWeight: '800',
        color: '#111',
        textAlign: 'center',
        marginBottom: 10,
      }}
    >
      Closets live in your account
    </Text>

    <Text
      style={{
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 28,
      }}
    >
      Create an account to create, share, and collaborate on closets.  
      
    </Text>

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
  </View>
  )
}
  
  return (
    <View>
     
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}
     refreshControl={
    <RefreshControl
      refreshing={loading}
      onRefresh={async () => {
        setLoading(true);
        try {
          const response = await fetch(`${API_BASE_URL}/v1/closets/${user.user_id}`);
          const data = await response.json();
          setClosets(data);
        } catch (e) {
          console.log(e);
        } finally {
          setLoading(false);
        }
      }}
      tintColor="black"
      colors={['black']} // for Android spinner
    />
  }
    >
     
      
     <View style={{
        flexDirection: 'row',
        display:'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 20,
      }}>
        <Text style={[styles.title, { fontFamily: 'STIXTwoTextBold', fontSize: 28 }]}>
          My Closets
        </Text>

        <TouchableOpacity
          onPress={() => sheetRef.current?.open()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            display:'flex',
            backgroundColor: 'black',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom:20
          }}
        >
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>+</Text>
        </TouchableOpacity>
          <NewClosetSheet ref={sheetRef} onAddCloset={handleAddCloset}  onOpen={() => setIsSheetOpen(true)}
  onClose={() => setIsSheetOpen(false)}/>
      
        {/* <ClosetDetailsSheet ref={closetSheetRef} /> */}
        {/* {isClosetOpen&&(<ClosetDets visible={isClosetOpen} closetData={selectedcloset} onClose={()=>{setselectedcloset(null); setIsClosetOpen(false)}}/>)} */}
      </View>

      {loading ? (
        <BlinkingShaz /> 
      ) : closets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Create your own Closets</Text>
        </View>
      ) : (
        <FlatList
  data={closets}
  renderItem={renderMoodboard}
  keyExtractor={(item) => item.closet_id}
  scrollEnabled={false}
  contentContainerStyle={[styles.grid,{paddingHorizontal:16}]}
/>
      )}
    </ScrollView>
      
      {isClosetOpen &&  cardLayout && (
        <>
        <Animated.View 
      style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "black",
        opacity: overlayOpacity,
        zIndex: 1999,   // below fullscreen card
      }}
    />
      <Animated.View style={fullscreenStyle}>
        <ClosetDets
          visible={isClosetOpen}
          closetData={selectedcloset}
          onClose={closeCloset}
          setClosets={setClosets}
          closets={closets}
          setclosetshome={setclosets}
        />
      </Animated.View>
      </>
    )}
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 40,
    width:SCREEN_WIDTH,
    zIndex:1,
   
  },
  title: {
    color: 'black',
    fontSize: 24,
    // fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '62%',
    aspectRatio: 1.2,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 10,
    //backgroundColor: 'rgba(0,0,0,0.6)',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    color: 'gray',
    fontSize: 16,
  },
  grid: {
    paddingBottom: 400,
  },
});

export default MoodBoardsScreen;
