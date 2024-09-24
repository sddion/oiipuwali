import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { supabase } from '../supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PhoneInput from 'react-native-phone-number-input';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputRefs = useRef([]);
  const navigation = useNavigation();
  const animation = useRef(null);

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
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        // Existing user, navigate to HomeScreen
        navigation.replace('HomeScreen');
      } else {
        const { error } = await supabase.rpc('create_users_table_if_not_exists');
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      Alert.alert('Error', 'An error occurred while checking login status.');
    }
  };

  const sendOtp = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) {
        throw error;
      }

      if (data) {
        console.log('OTP sent:', data);
        setOtpSent(true);
        setResendTimer(60);
        Alert.alert('OTP sent to your phone number');
      } else {
        Alert.alert('Failed to send OTP: Try again');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', error.message);
    }
  };

  const verifyOtp = async () => {
    if (!otp.join('')) {
      Alert.alert('Error: Please enter the OTP');
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp.join(''),
        type: 'sms',
      });

      if (error) throw error;

      if (data?.session) {
        await AsyncStorage.setItem('authToken', data.session.access_token);

        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error checking user existence:', fetchError);
          Alert.alert('Error: User not found');
          return;
        }

        // If user exists, navigate directly to HomeScreen
        if (existingUser) {
          navigation.replace('HomeScreen', { uid: data.user.id });
        } else {
          // If user doesn't exist, it's a new user, insert into the database and navigate to LocationScreen first
          const { error: insertError } = await supabase
            .from('users')
            .insert({ phone: phoneNumber, user_id: data.user.id });

          if (insertError) {
            console.error('Error creating new user:', insertError);
            Alert.alert('Error: Could not create new user, try again later.');
            return;
          }

          // New user, navigate to LocationScreen
          navigation.replace('LocationScreen', { uid: data.user.id });
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message);
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.content}>
        <View style={styles.animationContainer}>
          <LottieView
            autoPlay
            loop
            ref={animation}
            style={styles.lottieAnimation}
            source={require('../assets/1727122417916.json')}
          />
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            {otpSent
              ? `Enter the OTP sent to ${phoneNumber}`
              : 'We will send you a One Time Password on this mobile number'}
          </Text>

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
              {otpSent ? 'VERIFY & PROCEED' : 'GET OTP'}
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
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
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
    borderColor: '#D1D5DB',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 1, 
  },
  
  actionButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#7C3AED',
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
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoginScreen;
