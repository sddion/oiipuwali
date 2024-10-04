import React, { useState, useEffect, useRef } from 'react';
import {StyleSheet,Text,View,SafeAreaView,KeyboardAvoidingView,TextInput,Pressable,Alert,ImageBackground,Platform,} from 'react-native';
import { supabase } from '../supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PhoneInput from 'react-native-phone-number-input';
import { useNavigation } from '@react-navigation/native';
import { setUser } from '../redux/UserReducer';
import { useDispatch } from 'react-redux';

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputRefs = useRef([]);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    checkLogin();
  }, []);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const checkLogin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigation.replace('Home');
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      Alert.alert('An error occurred while checking user status.');
    }
  };

  const sendOtp = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw error;

      setOtpSent(true);
      setResendTimer(60);
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', error.message);
    }
  };

  const verifyOtp = async () => {
    if (!otp.join('')) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp.join(''),
        type: 'sms',
      });

      if (error) throw error;

      if (data.session) {
        await AsyncStorage.setItem('authToken', data.session.access_token);
        
        // Save user to the database
        await saveUserToDatabase(data.user);
        dispatch(setUser({ id: data.user.id, phone: data.user.phone }));
        navigation.replace('Home');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', error.message);
    }
  };

  const saveUserToDatabase = async (user) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          phone: user.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          saved_addresses: []
        }, { onConflict: 'id' });
  
      if (error) throw error;
      console.log('User saved to database:', data);
    } catch (error) {
      console.error('Error saving user to database:', error);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (index < otp.length - 1 && value) {
      otpInputRefs.current[index + 1]?.focus();
    } else if (index > 0 && !value) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    if (resendTimer === 0) {
      sendOtp();
    }
  };

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.formWrapper}
          >
            <View style={styles.formContainer}>
              {!otpSent ? (
                <View style={styles.phoneInputWrapper}>
                  <PhoneInput
                    defaultValue={phoneNumber}
                    defaultCode="IN"
                    layout="first"
                    onChangeFormattedText={setPhoneNumber}
                    withDarkTheme
                    withShadow
                    containerStyle={styles.phoneInputContainer}
                    textContainerStyle={styles.phoneInputTextContainer}
                  />
                </View>
              ) : (
                <View style={styles.otpContainer}>
                  {Array(6).fill(0).map((_, index) => (
                    <TextInput
                      key={index}
                      style={styles.otpInput}
                      value={otp[index]}
                      onChangeText={(value) => handleOtpChange(index, value)}
                      keyboardType="numeric"
                      maxLength={1}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                    />
                  ))}
                </View>
              )}

              <Pressable
                style={styles.actionButton}
                onPress={otpSent ? verifyOtp : sendOtp}
              >
                <Text style={styles.actionButtonText}>
                  {otpSent ? 'VERIFY' : 'SEND'}
                </Text>
              </Pressable>

              {otpSent && (
                <Pressable onPress={handleResendOtp} disabled={resendTimer > 0}>
                  <Text style={styles.resendText}>
                    {resendTimer > 0
                      ? `Resend OTP in ${resendTimer}s`
                      : 'RESEND OTP'}
                  </Text>
                </Pressable>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formWrapper: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  phoneInputWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  phoneInputContainer: {
    width: '100%',
    borderRadius: 8,
  },
  phoneInputTextContainer: {
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  otpInput: {
    width: 45, 
    height: 45,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 1, 
  },
  actionButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendText: {
    color: '#333333',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoginScreen;