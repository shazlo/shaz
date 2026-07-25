import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
  Image,
  BackHandler,
  Linking,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { setlogin } from '../store/authSlice';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Animated } from 'react-native';
import { useRef } from 'react';
import { Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCart } from '../QueryHooks/Cart';
import { setCartCount } from '../store/cartSlice';
// const { width } = Dimensions.get('window');
const { width, height } = Dimensions.get('window');

const isTablet = Platform.OS === 'ios' && Math.min(width, height) >= 768;

// iPhone 17 family (includes all Dynamic Island iPhones)
const isModernIPhone =
  Platform.OS === 'ios' &&
  !isTablet &&
  height >= 852;

// iPad Air 11" / 13" (and newer large iPads)
const isLargeIPad =
  isTablet &&
  Math.max(width, height) >= 1180;

const topMargin =
  isModernIPhone || isLargeIPad ? 30 : 5;
const AuthScreenProfile = () => {
  const [mode, setMode] = useState('signup');
  const [gender, setGender] = useState('');
  const [otpMethod, setOtpMethod] = useState('sms');
  const [isStudent, setIsStudent] = useState('');
 const [loading, setLoading] = useState(false);
 const [email,setEmail]=useState('');
  const [mobile, setMobile] = useState('');
  const [birthday, setBirthday] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [university, setUniversity] = useState('');
  const user=useSelector((state)=>state.auth.user);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthday(selectedDate);
    }
  };

  const shakeAnim = {
  email: useRef(new Animated.Value(0)).current,   
  email: useRef(new Animated.Value(0)).current,
  birthday: useRef(new Animated.Value(0)).current,
  name: useRef(new Animated.Value(0)).current,
  password: useRef(new Animated.Value(0)).current,
  gender: useRef(new Animated.Value(0)).current,
  isStudent: useRef(new Animated.Value(0)).current,
  university: useRef(new Animated.Value(0)).current,
  emailOrPhone:useRef(new Animated.Value(0)).current,
};

const triggerShake = (key) => {
  setLoading(false)
  
  Vibration.vibrate([0, 50, 50, 50, 50, 50]); 

  Animated.sequence([
    Animated.timing(shakeAnim[key], {
      toValue: 10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(shakeAnim[key], {
      toValue: -10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(shakeAnim[key], {
      toValue: 6,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(shakeAnim[key], {
      toValue: -6,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(shakeAnim[key], {
      toValue: 0,
      duration: 50,
      useNativeDriver: true,
    }),
  ]).start();
};

  const dispatch=useDispatch();
  const navigation = useNavigation();
  const signup = async() => {
    setLoading(true);
    if(mode==="login" && !emailOrPhone.trim()) return triggerShake('emailOrPhone');
      if (mode==="signup"&&!email.trim()) return triggerShake('email');
  // if (mode==="signup"&&!birthday) return triggerShake('birthday');
  if (mode==="signup"&&!name.trim()) return triggerShake('name');
  if (!password.trim()) return triggerShake('password');
  if (mode==="signup"&&!gender.trim()) return triggerShake('gender');
  // if (mode==="signup"&&!isStudent.trim()) return triggerShake('isStudent');
  // if (mode==="signup"&&isStudent === 'Yes' && !university.trim()) return triggerShake('university');
//   console.log(user?.user_id)
    const data = {
    user_id:user?.user_id,
    name:name,
    phone_number:email,
    password:password,
    // data_of_birth:birthday,
    gender:gender,
   
    identifier:emailOrPhone
    };
    console.log(data)
    try {
      const response=await fetch(`https://api.shazlo.store/v1/auth/${mode}`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data)
      })
     const userdata = await response.json();

if (!response.ok) {
  setLoading(false);

  // Show backend error
  setErrorMsg(userdata.error || 'Something went wrong');

  // Shake relevant field
  if (userdata.error?.toLowerCase().includes('password')) {
    triggerShake('password');
  } else {
    triggerShake('emailOrPhone');
  }

  return;
}

      // console.log(userdata)
       dispatch(setlogin({ user: userdata.user }));
         if(mode==='login')
               { const cartItems = await fetchCart(userdata.user.user_id); // fetch cart items from API
                   
                    dispatch(setCartCount(cartItems.length));}
              else
              {
               dispatch(setCartCount(0));
              }
       navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Home' }],
                      })
                    );
                    // navigation.goBack()
       
    } catch (error) {
      console.log(error)
    } finally {
    setLoading(false); // Stop loader
  }
  };

  


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow:1,paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[{padding:0,  alignItems: 'center'}]}>
      <Image source={require('../assets/images/shazlo-logo-v4.png')} style={[{width:300,height:100, resizeMode:'contain'}]} />
      </View>
      <View style={styles.tabContainer}>
        {['login', 'signup'].map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.tab, mode === m && styles.activeTab]}
            onPress={() => setMode(m)}
          >
            <Text style={mode === m ? styles.activeText : styles.inactiveText}>
              {m.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'signup' ? (
        <>
          <Text style={styles.label}>Email ID</Text>
          <Animated.View style={{ transform: [{ translateX: shakeAnim.email }] }}>
         
            <TextInput
              placeholder="Enter email"
                placeholderTextColor="#888"
              style={styles.input}
              // keyboardType="phone-pad"
              value={email}
              onChangeText={setEmail}
            />
          
          </Animated.View>
          
        
          <Text style={styles.label}>Name</Text>
          <Animated.View style={{ transform: [{ translateX: shakeAnim.name }] }}>
          <TextInput
            placeholder="Your full name"
            placeholderTextColor="#888"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
          </Animated.View>
          <Text style={styles.label}>Password</Text>
          <Animated.View style={{ transform: [{ translateX: shakeAnim.password }] }}>
          <TextInput
            placeholder="Create a strong password"
             placeholderTextColor="#888"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          </Animated.View>
          <Text style={styles.label}>Gender</Text>
          <Animated.View style={{ transform: [{ translateX: shakeAnim.gender }] }}>
          <View style={styles.radioRow}>
            {['Male', 'Female', 'Other'].map(option => (
              <TouchableOpacity key={option} onPress={() => setGender(option)} style={styles.radioOption}>
                <View style={[styles.radioDot, gender === option && styles.radioSelected]} />
                <Text style={styles.radioText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
          </Animated.View>

          {/* <Text style={styles.label}>Are you a student?</Text>
          <Animated.View style={{ transform: [{ translateX: shakeAnim.isStudent }] }}>
          <View style={styles.radioRow}>
            {['Yes', 'No'].map(option => (
              <TouchableOpacity key={option} onPress={() => setIsStudent(option)} style={styles.radioOption}>
                <View style={[styles.radioDot, isStudent === option && styles.radioSelected]} />
                <Text style={styles.radioText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
          </Animated.View> */}
          {/* {isStudent === 'Yes' && (
            <>
              <Text style={styles.label}>University Name</Text>
              <Animated.View style={{ transform: [{ translateX: shakeAnim.university }] }}>
              <TextInput
                placeholder="Your university"
                style={styles.input}
                value={university}
                onChangeText={setUniversity}
              />
              </Animated.View>
            </>
          )} */}
        </>
      ) : (
        <>
          <Text style={styles.label}>Email</Text>
          <Animated.View style={{ transform: [{ translateX: shakeAnim.emailOrPhone }] }}>
          <TextInput
  placeholder="Enter email"
  style={styles.input}
  value={emailOrPhone}
  onChangeText={(text) => {
    setEmailOrPhone(text);
    setErrorMsg('');
  }}
   placeholderTextColor="#888"
/>

          </Animated.View>
          <Text style={styles.label}>Password</Text>
            <Animated.View style={{ transform: [{ translateX: shakeAnim.password }] }}>
          <TextInput
  placeholder="Enter your password"
  secureTextEntry
  style={styles.input}
  value={password}
  onChangeText={(text) => {
    setPassword(text);
    setErrorMsg(''); // clear backend error on typing
  }}
  placeholderTextColor="#888"
/>
          {errorMsg ? (
  <Text style={styles.errorText}>{errorMsg}</Text>
) : null}

          </Animated.View>
        </>
      )}

     {loading ? (
  <View style={styles.loadingBtn}>
    <Text style={styles.loadingText}>Please wait...</Text>
  </View>
) : (
  <TouchableOpacity style={styles.signupBtn} onPress={signup} disabled={loading}>
    <Text style={styles.signupText}>{mode === 'signup' ? 'Sign Up' : 'Login'}</Text>
  </TouchableOpacity>
)}

     <Text style={styles.termsText}>
  I agree to{' '}
  <Text
    style={styles.linkText}
    onPress={() => Linking.openURL('https://www.shazlo.store/terms-of-service')}
  >
    Terms of Service
  </Text>{' '}
  and{' '}
  <Text
    style={styles.linkText}
    onPress={() => Linking.openURL('https://www.shazlo.store/privacy')}
  >
    Privacy Policy
  </Text>
</Text>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flex: 1 , marginTop:topMargin},
  logo: {
    fontSize: 46,
    alignSelf: 'center',
    marginBottom: 20,
    textTransform: 'lowercase',
    fontFamily:  'STIXTwoTextRegular'
  },

  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    borderColor: '#000',
  },
  errorText: {
  color: '#d32f2f',
  marginTop: 6,
  fontSize: 13,
  fontWeight: '500',
},

  activeText: {
    fontWeight: '700',
    color: '#000',
  },
  inactiveText: {
    color: '#aaa',
    fontWeight: '500',
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    marginBottom: 4,
    marginTop: 12,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeBox: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#000',
    // marginBottom: 10,
    flex: 1,
    backgroundColor: '#fafafa',
  },

  radioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginTop: 4,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#000',
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: '#000',
  },
  radioText: {
    fontSize: 14,
  },

  signupBtn: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  signupText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loadingBtn: {
  backgroundColor: '#555',
  paddingVertical: 14,
  borderRadius: 8,
  marginTop: 20,
  alignItems: 'center',
},
loadingText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 16,
},


  termsText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 18,
    color: '#666',
    lineHeight: 18,
  },
  linkText: {
    color: '#000',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});

export default AuthScreenProfile;