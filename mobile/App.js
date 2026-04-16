import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  StatusBar,
  Alert,
  ScrollView,
  Animated,
  Linking
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { io } from 'socket.io-client';
import { VideoView } from 'expo-video';
import * as Updates from 'expo-updates';



import { User, Lock, GraduationCap, Home, BookOpen, Calendar, Clock, AlertCircle, LogOut, MessageSquare, Send, ChevronLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import client, { SOCKET_URL } from './src/api/client';



Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {

  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [detailedAttendance, setDetailedAttendance] = useState({ overall: [], monthly: [] });
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('home');
  const [notificationsHistory, setNotificationsHistory] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [chatText, setChatText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [introVideoFailed, setIntroVideoFailed] = useState(false);

  // Intro animation values
  const introOpacity = useRef(new Animated.Value(0)).current;
  const introScale = useRef(new Animated.Value(0.5)).current;


  // Profile Form States
  const [profileData, setProfileData] = useState({
    first_name: '', last_name: '', father_name: '', phone: '',
    address: '', city: '', zip: '', birthday: '', blood_type: '',
    email: '', nationality: '', religion: '', gender: ''
  });

  // Email OTP States
  const [emailOTP, setEmailOTP] = useState({ new_email: '', otp: '', showOTP: false });
  const [emailLoading, setEmailLoading] = useState(false);

  // Forgot Password States
  const [forgotPassword, setForgotPassword] = useState({ show: false, step: 1, enrollment: '', email: '', newPassword: '', otp: '' });
  const [forgotLoading, setForgotLoading] = useState(false);

  // --- SAFE DATA FETCHERS (wrapped in try/catch to prevent crashes) ---
  const fetchAttendance = useCallback(async () => {
    try {
      const [summaryRes, detailedRes] = await Promise.all([
        client.get('/attendance/student-summary'),
        client.get('/attendance/my-detailed-attendance')
      ]);
      setAttendance(summaryRes.data || { attended: 0, total: 0, percentage: 0 });
      setDetailedAttendance(detailedRes.data || { overall: [], monthly: [] });
    } catch (err) {
      console.error('Failed to fetch attendance:', err?.message || err);
      // Set safe defaults instead of crashing
      setAttendance({ attended: 0, total: 0, percentage: 0 });
      setDetailedAttendance({ overall: [], monthly: [] });
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await client.get('/assignments');
      setAssignments(res.data?.assignments || []);
    } catch (err) {
      console.error('Failed to fetch assignments:', err?.message || err);
      setAssignments([]);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await client.get('/messages/inbox');
      setContacts(res.data?.contacts || []);
    } catch (err) {
      console.error('Failed to fetch inbox:', err?.response?.data || err?.message || err);
      setContacts([]);
    }
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      setSearching(true);
      try {
        const res = await client.get(`/messages/search-contacts?q=${query}`);
        setContacts(res.data?.contacts || []);
      } catch (err) {
        console.error('Search failed:', err?.response?.data || err);
      }
    } else {
      setSearching(false);
      fetchContacts();
    }
  };

  // --- INITIAL APP CHECK (Check for existing token) ---
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          try {
            const res = await client.get('/auth/me');
            if (res.data?.user) {
              setUser(res.data.user);
              setProfileData({
                ...res.data.user,
                father_name: res.data.user.father_name || ''
              });
            } else {
              await AsyncStorage.removeItem('token');
            }
          } catch (e) {
            console.log('Session expired or invalid token');
            await AsyncStorage.removeItem('token');
          }
        }
      } catch (e) {
        console.error('Login check error:', e);
      } finally {
        setAppLoading(false);
      }
    };
    checkLogin();
  }, []);

  // --- APP UPDATE CHECK ---
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        // Check if running in Expo Go
        const isInExpoGo = Constants.appOwnership === 'expo';
        
        if (isInExpoGo) {
          console.log('Updates not supported in Expo Go - skipping update check');
          return;
        }
        
        // 1. Check for JS-only updates via Expo
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          Alert.alert(
            'JS Update Available',
            'A new patch is available. Would you like to update now?',
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Update Now', onPress: async () => await Updates.fetchUpdateAsync().then(() => Updates.reloadAsync()) }
            ]
          );
          return; // Skip server check if Expo update is handled
        }

        // 2. Check for APK updates via custom server
        const res = await client.get('/app-updates/latest');
        const latestInfo = res.data;
        
        // Current version from Constants
        const currentVersionCode = Constants.expoConfig.android.versionCode;
        
        if (latestInfo.version_code > currentVersionCode) {
          Alert.alert(
            'New Version Available',
            `A new version (${latestInfo.version_name}) of Drop is available.\n\nRelease Notes: ${latestInfo.release_notes || 'Improvements and bug fixes.'}`,
            [
              { text: 'Update Later', style: 'cancel' },
              { 
                text: 'Update Now', 
                onPress: () => {
                  // Redirect to download URL
                  Linking.openURL(`${SOCKET_URL}/api/app-updates/download`);
                }
              }
            ]
          );
        }
      } catch (e) {
        console.log('Update check failed:', e.message);
      }
    };

    // Check after intro is complete
    if (introComplete) {
       checkUpdates();
    }
  }, [introComplete]);


  // --- SINGLE UNIFIED SOCKET + DATA LOADING (fixes duplicate socket bug) ---
  useEffect(() => {
    if (!user) return;

    // Load home data first (attendance)
    fetchAttendance();

    // Create ONE socket connection for everything
    let newSocket = null;
    try {
      newSocket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        newSocket.emit('join', user.id);
      });

      newSocket.on('connect_error', (err) => {
        console.log('Socket connection error:', err.message);
      });

      // Attendance real-time updates
      newSocket.on(`attendance-updated-class-${user?.class_id}`, () => {
        fetchAttendance();
      });
      newSocket.on(`attendance-updated-${user?.id}`, () => {
        Alert.alert("Update", "Your attendance was updated.");
        fetchAttendance();
      });

      // Chat real-time updates
      newSocket.on('receive_message', (msg) => {
        if (msg) {
          setChatMessages(prev => [...prev, msg]);
          fetchContacts(); // Refresh inbox list on new message
        }
      });

      setSocket(newSocket);
    } catch (socketErr) {
      console.error('Socket initialization error:', socketErr);
    }

    return () => {
      if (newSocket) {
        try { newSocket.disconnect(); } catch (e) { /* ignore cleanup errors */ }
      }
    };
  }, [user?.id]); // Only re-run when user ID changes, not on every user object change

  // --- LAZY LOAD: Fetch tab data only when needed (fixes duplicate fetch bug) ---
  useEffect(() => {
    if (!user) return;
    if (currentTab === 'chat') fetchContacts();
    if (currentTab === 'schedule') fetchAssignments();
  }, [currentTab, user?.id]);

  // --- PUSH NOTIFICATIONS ---
  useEffect(() => {
    if (!user) return;

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        client.post('/users/push-token', { token })
          .then(() => console.log('Push token saved to backend'))
          .catch(err => console.error('Failed to save push token:', err?.message));
      }
    }).catch(err => {
      console.error('Push notification registration error:', err?.message);
    });

    const notificationListener = Notifications?.addNotificationReceivedListener?.(notification => {
      try {
        const newNotif = {
          id: notification?.request?.identifier || Math.random().toString(),
          title: notification?.request?.content?.title || 'System Alert',
          body: notification?.request?.content?.body || 'New update available',
          data: notification?.request?.content?.data || {},
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString()
        };
        setNotificationsHistory(prev => [newNotif, ...prev].slice(0, 10));
      } catch (e) {
        console.error('Notification listener error:', e);
      }
    });

    const responseListener = Notifications?.addNotificationResponseReceivedListener?.(response => {
      try {
        if (response?.notification?.request?.content?.data?.type === 'attendance') {
           setCurrentTab('attendance');
        }
      } catch (e) {
        console.error('Notification response listener error:', e);
      }
    });

    return () => {
      notificationListener?.remove?.();
      responseListener?.remove?.();
    };
  }, [user?.id]);

  async function registerForPushNotificationsAsync() {
    let token;
    try {
      // Check if running in Expo Go
      const isInExpoGo = Constants.appOwnership === 'expo';
      
      if (isInExpoGo) {
        console.log('Push notifications not supported in Expo Go - skipping registration');
        return null;
      }
      
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.log('Push notification permissions not granted');
          return;
        }
        
        // Use the correct project ID from app.json
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId || 'f1700831-6a33-498e-9058-501039a99a14';
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Expo Push Token:', token);
      } else {
        console.log('Must use physical device for Push Notifications');
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (err) {
      console.error('Push token registration error:', err?.message);
    }

    return token;
  }

  const openChat = async (contact) => {
    setActiveChat(contact);
    setChatMessages([]);
    try {
      const res = await client.get(`/messages/${contact.id}`);
      setChatMessages(res.data?.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err?.message || err);
    }
  };

  const sendMessage = () => {
    if (!chatText.trim() || !socket || !activeChat) return;

    const msgData = {
      sender_id: user.id,
      receiver_id: activeChat.id,
      content: chatText.trim()
    };

    socket.emit('send_message', msgData);
    
    // Optimistic UI update
    setChatMessages(prev => [...prev, { ...msgData, created_at: new Date().toISOString() }]);
    setChatText('');
    fetchContacts(); // Refresh inbox list after sending
  };

  const handleLogin = async () => {
    if (!identity || !password) return setError('Please fill all fields');

    setLoading(true);
    setError('');
    try {
      const res = await client.post('/auth/login', { identity, password });
      const { token, user: userData } = res.data;

      if (!token || !userData) {
        setError('Invalid server response. Try again.');
        return;
      }

      await AsyncStorage.setItem('token', token);
      setUser(userData);
      setProfileData({
        ...userData,
        father_name: userData.father_name || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              if (socket) {
                socket.disconnect();
                setSocket(null);
              }
              await AsyncStorage.removeItem('token');
              setUser(null);
              setCurrentTab('home');
              setAttendance(null);
              setDetailedAttendance({ overall: [], monthly: [] });
              setAssignments([]);
              setContacts([]);
              setChatMessages([]);
              setActiveChat(null);
            } catch (e) {
              console.error('Logout error:', e);
              // Force logout even if cleanup fails
              await AsyncStorage.removeItem('token');
              setUser(null);
            }
          }
        }
      ]
    );
  };

  // --- INTRO SCREEN LOGIC ---
  useEffect(() => {
    // Fail-safe: Skip intro if video hangs for more than 4 seconds
    const timer = setTimeout(() => {
        if (!introComplete) setIntroComplete(true);
    }, 4500);
    return () => clearTimeout(timer);
  }, [introComplete]);

  // Animated fallback intro (when video fails)
  useEffect(() => {
    if (introVideoFailed && !introComplete) {
      Animated.parallel([
        Animated.timing(introOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(introScale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-advance after animation
      const autoSkip = setTimeout(() => setIntroComplete(true), 2500);
      return () => clearTimeout(autoSkip);
    }
  }, [introVideoFailed, introComplete]);

  // --- INTRO SCREEN ---
  if (!introComplete) {
    // If video failed, show animated logo fallback
    if (introVideoFailed) {
      return (
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          <StatusBar hidden />
          <Animated.View style={{ opacity: introOpacity, transform: [{ scale: introScale }], alignItems: 'center' }}>
            <Image
              source={require('./assets/logo.png')}
              style={{ width: 120, height: 120, marginBottom: 20 }}
              resizeMode="contain"
            />
            <Text style={{ color: '#FFF', fontSize: 32, fontWeight: '900', letterSpacing: 2 }}>Drop</Text>
            <Text style={{ color: '#444', fontSize: 12, fontWeight: '700', marginTop: 8 }}>SMART CAMPUS</Text>
          </Animated.View>
        </View>
      );
    }

    // Try video first
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
        <StatusBar hidden />
        <VideoView
          source={require('./assets/drop.mp4')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          allowsLooping={false}
          autoPlay={true}
          onEnd={() => {
            console.log('Video finished playing');
            setIntroComplete(true);
          }}
          onError={() => {
            console.log('Video playback error, switching to fallback');
            setIntroVideoFailed(true);
          }}
        />
      </View>
    );
  }

  // --- MAIN APP LOADING ---
  if (appLoading) return (
    <View style={styles.loadingOverlay}>
      <StatusBar barStyle="light-content" />
      <View style={{ alignItems: 'center' }}>
        <Image 
          source={require('./assets/logo.png')} 
          style={{ width: 80, height: 80, marginBottom: 30, opacity: 0.8 }} 
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={[styles.loadingMsg, { marginTop: 20 }]}>Connecting to infrastructure...</Text>
      </View>
    </View>
  );

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await client.post('/auth/profile', profileData);
      Alert.alert('Success', 'Profile updated successfully!');
      // Refresh user data
      const res = await client.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOTP = async () => {
    if (!emailOTP.new_email) {
      Alert.alert('Error', 'Please enter a new email address');
      return;
    }
    setEmailLoading(true);
    try {
      await client.post('/auth/send-otp', { email: emailOTP.new_email });
      setEmailOTP({ ...emailOTP, showOTP: true });
      Alert.alert('Success', 'OTP sent to your email. Please check your inbox.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!emailOTP.otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }
    setEmailLoading(true);
    try {
      await client.post('/auth/verify-otp', { email: emailOTP.new_email, otp: emailOTP.otp });
      // Update profile data and user state
      setProfileData({ ...profileData, email: emailOTP.new_email });
      setUser({ ...user, email: emailOTP.new_email });
      setEmailOTP({ new_email: '', otp: '', showOTP: false });
      Alert.alert('Success', 'Email updated successfully!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setEmailLoading(false);
    }
  };

  const cancelEmailUpdate = () => {
    setEmailOTP({ new_email: '', otp: '', showOTP: false });
  };

  // Forgot Password Functions
  const handleForgotPasswordVerify = async () => {
    if (!forgotPassword.enrollment && !forgotPassword.email) {
      Alert.alert('Error', 'Please enter enrollment number or email');
      return;
    }
    setForgotLoading(true);
    try {
      await client.post('/auth/forgot-password-verify', {
        enrollment_no: forgotPassword.enrollment,
        email: forgotPassword.email
      });
      setForgotPassword({ ...forgotPassword, step: 2 });
      Alert.alert('Success', 'Identity verified! Please set your new password.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to verify identity');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotPasswordReset = async () => {
    if (!forgotPassword.newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    if (forgotPassword.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    setForgotLoading(true);
    try {
      await client.post('/auth/forgot-password-reset', {
        enrollment_no: forgotPassword.enrollment,
        email: forgotPassword.email,
        new_password: forgotPassword.newPassword
      });
      Alert.alert('Success', 'Password reset successfully! Please login with your new password.');
      setForgotPassword({ show: false, step: 1, enrollment: '', email: '', newPassword: '', otp: '' });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  const cancelForgotPassword = () => {
    setForgotPassword({ show: false, step: 1, enrollment: '', email: '', newPassword: '', otp: '' });
  };

  const ComingSoon = () => (
    <View style={styles.comingSoonLayer}>
      <View style={styles.csContent}>
        <View style={styles.csIconBox}>
          <Clock size={40} color="#FFF" />
        </View>
        <Text style={styles.csTitle}>Coming Soon</Text>
        <Text style={styles.csDesc}>We are working hard to bring this feature to your fingertips. Stay tuned!</Text>
        <TouchableOpacity
          style={styles.csButton}
          onPress={() => setShowComingSoon(false)}
        >
          <Text style={styles.csButtonText}>Got It!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ForgotPasswordScreen = () => (
    <View style={styles.comingSoonLayer}>
      <View style={styles.csContent}>
        <View style={styles.csIconBox}>
          <Lock size={40} color="#FFF" />
        </View>
        <Text style={styles.csTitle}>Reset Password</Text>
        
        {forgotPassword.step === 1 ? (
          <>
            <Text style={styles.csDesc}>Verify your identity to reset your password</Text>
            
            <View style={[styles.modernInputGroup, { marginTop: 20, width: '100%' }]}>
              <TextInput
                style={styles.modernInput}
                placeholder="Enrollment Number"
                placeholderTextColor="#333"
                value={forgotPassword.enrollment}
                onChangeText={(t) => setForgotPassword({ ...forgotPassword, enrollment: t })}
                autoCapitalize="none"
              />
              <User color="#444" size={20} />
            </View>

            <View style={[styles.modernInputGroup, { marginTop: 10, width: '100%' }]}>
              <TextInput
                style={styles.modernInput}
                placeholder="Email Address"
                placeholderTextColor="#333"
                value={forgotPassword.email}
                onChangeText={(t) => setForgotPassword({ ...forgotPassword, email: t })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={{ color: '#444', fontSize: 16 }}>@</Text>
            </View>

            <TouchableOpacity
              style={[styles.csButton, { marginTop: 20 }]}
              onPress={handleForgotPasswordVerify}
              disabled={forgotLoading}
            >
              {forgotLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.csButtonText}>Verify Identity</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.csDesc}>Set your new password</Text>
            
            <View style={[styles.modernInputGroup, { marginTop: 20, width: '100%' }]}>
              <TextInput
                style={styles.modernInput}
                placeholder="New Password"
                placeholderTextColor="#333"
                value={forgotPassword.newPassword}
                onChangeText={(t) => setForgotPassword({ ...forgotPassword, newPassword: t })}
                secureTextEntry
              />
              <Lock color="#444" size={20} />
            </View>

            <TouchableOpacity
              style={[styles.csButton, { marginTop: 20 }]}
              onPress={handleForgotPasswordReset}
              disabled={forgotLoading}
            >
              {forgotLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.csButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.csButton, { backgroundColor: '#333', marginTop: 10 }]}
          onPress={cancelForgotPassword}
        >
          <Text style={styles.csButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.loginContainer}>
        <StatusBar barStyle="light-content" />
        {showComingSoon && <ComingSoon />}
        {forgotPassword.show && <ForgotPasswordScreen />}
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 30, paddingTop: 80, paddingBottom: 40 }}>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Image
              source={require('./assets/logo.png')}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.loginWelcome}>Welcome to</Text>
          <Text style={styles.loginBrand}>Drop</Text>
          <Text style={styles.loginSubText}>Your gateway to a smart academic experience. Sign in to track your progress.</Text>

          <View style={{ marginTop: 40 }}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.modernInputGroup}>
              <TextInput
                style={styles.modernInput}
                placeholder="Username or Enrollment"
                placeholderTextColor="#444"
                value={identity}
                onChangeText={setIdentity}
                autoCapitalize="none"
              />
              <User color="#444" size={20} />
            </View>

            <View style={styles.modernInputGroup}>
              <TextInput
                style={styles.modernInput}
                placeholder="Password"
                placeholderTextColor="#444"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <Lock color="#444" size={20} />
            </View>

            <View style={styles.loginActionsRow}>
              <TouchableOpacity
                style={styles.remGroup}
                onPress={() => setShowComingSoon(true)}
              >
                <View style={styles.miniCheck} />
                <Text style={styles.remText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setForgotPassword({ ...forgotPassword, show: true })}>
                <Text style={styles.remText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.modernLoginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator color="#FFF" style={{ marginRight: 10 }} />
                  <Text style={styles.loginBtnTxtFinal}>Verifying...</Text>
                </View>
              ) : (
                <Text style={styles.loginBtnTxtFinal}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.socialHeaderRow}>
              <Text style={styles.socialText}>Or sign in with</Text>
              <View style={styles.socialIconsRow}>
                <TouchableOpacity style={styles.socialBox} onPress={() => setShowComingSoon(true)}><User color="#444" size={20} /></TouchableOpacity>
                <TouchableOpacity style={styles.socialBox} onPress={() => setShowComingSoon(true)}><User color="#444" size={20} /></TouchableOpacity>
                <TouchableOpacity style={styles.socialBox} onPress={() => setShowComingSoon(true)}><User color="#444" size={20} /></TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={{ marginTop: 40, alignItems: 'center' }} onPress={() => setShowComingSoon(true)}>
              <Text style={styles.footerLinkText}>Don't have an account? <Text style={{ color: '#FFF' }}>Sign Up</Text></Text>
            </TouchableOpacity>

            <View style={{ marginTop: 60, alignItems: 'center' }}>
              <Text style={styles.policyText}>By signing in, you agree to our Privacy</Text>
              <Text style={styles.policyText}>Policy and Terms of Service.</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  const classesNeeded = attendance ? Math.max(0, Math.ceil((0.75 * attendance.total - attendance.attended) / 0.25)) : 0;
  const getMonthName = (m) => new Date(2000, m - 1, 1).toLocaleString('default', { month: 'short' });

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <StatusBar barStyle="light-content" />

      {showComingSoon && <ComingSoon />}

      {currentTab === 'home' && (
        <View style={{ flex: 1 }}>
          {/* DARK HEADER */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <View>
                  <Text style={styles.welcome}>Good Morning 👋</Text>
                  <Text style={styles.userName}>{user?.first_name || 'Student'} {user?.last_name || ''}</Text>
               </View>
               <Image 
                  source={require('./drop-icon.png')} 
                  style={{ width: 45, height: 45, borderRadius: 10 }} 
                  resizeMode="contain"
               />
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.avatar}
                onPress={handleLogout}
              >
                <LogOut size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.statRow}>
              <TouchableOpacity style={styles.statBox} onPress={() => setCurrentTab('attendance')}>
                <Text style={styles.statValue}>
                  {(detailedAttendance?.overall || []).reduce((s, sub) => s + (sub.attended || 0), 0)}
                </Text>
                <Text style={styles.statLabel}>Attended</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statBox} onPress={() => setCurrentTab('attendance')}>
                <Text style={styles.statValue}>
                  {(detailedAttendance?.overall || []).reduce((s, sub) => s + (sub.total || 0), 0)}
                </Text>
                <Text style={styles.statLabel}>Total</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statBox} onPress={() => setCurrentTab('attendance')}>
                {(() => {
                  const arr = detailedAttendance?.overall || [];
                  const tot = arr.reduce((s, sub) => s + (sub.total || 0), 0);
                  const att = arr.reduce((s, sub) => s + (sub.attended || 0), 0);
                  const p = tot > 0 ? Math.round((att / tot) * 100) : 0;
                  return <Text style={[styles.statValue, { color: p >= 75 ? '#2ecc71' : '#FF5A5F' }]}>{p}%</Text>;
                })()}
                <Text style={styles.statLabel}>Overall</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeader}>Semester Attendance Overview</Text>

            {/* OVERALL SEM CARD */}
            <TouchableOpacity style={styles.card} onPress={() => setCurrentTab('attendance')}>
              <View style={styles.cardTitleRow}>
                <View>
                  <Text style={styles.cardLabel}>Cumulative Presence</Text>
                  {(() => {
                    const arr = detailedAttendance?.overall || [];
                    const tot = arr.reduce((s, sub) => s + (sub.total || 0), 0);
                    const att = arr.reduce((s, sub) => s + (sub.attended || 0), 0);
                    const p = tot > 0 ? Math.round((att / tot) * 100) : 0;
                    return <Text style={styles.cardLargeText}>{p}%</Text>;
                  })()}
                </View>
                <View><Text style={styles.targetLabel}>Target 75%</Text></View>
              </View>
              {(() => {
                const arr = detailedAttendance?.overall || [];
                const tot = arr.reduce((s, sub) => s + (sub.total || 0), 0);
                const att = arr.reduce((s, sub) => s + (sub.attended || 0), 0);
                const p = tot > 0 ? Math.round((att / tot) * 100) : 0;
                const needed = Math.max(0, Math.ceil((0.75 * tot - att) / 1));
                return (
                  <>
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBar, { width: `${Math.min(p, 100)}%`, backgroundColor: p >= 75 ? '#2ecc71' : '#FF5A5F' }]} />
                    </View>
                    {needed > 0 && tot > 0 && (
                      <View style={styles.smallAlert}>
                        <AlertCircle size={14} color="#AAA" />
                        <Text style={styles.smallAlertText}>Need {needed} more classes to reach 75%</Text>
                      </View>
                    )}
                  </>
                );
              })()}
            </TouchableOpacity>

            {/* NOTIFICATION SECTION */}
            {notificationsHistory.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Important Alerts</Text>
                {notificationsHistory.map((notif, index) => (
                  <View key={notif.id} style={styles.notificationCard}>
                    <View style={styles.notifStatusDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notifTitle}>{notif.title}</Text>
                      <Text style={styles.notifBody}>{notif.body}</Text>
                      <Text style={styles.notifTime}>{notif.time}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.sectionHeader}>Subject-wise Attendance</Text>
            {(detailedAttendance?.overall || []).map((sub) => {
              const p = sub.total > 0 ? Math.round((sub.attended / sub.total) * 100) : 0;
              return (
                <View key={sub.course_id} style={[styles.monthlyRow, { marginBottom: 10, borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', padding: 16 }]}>
                  <View style={styles.monthlyInfo}>
                    <Text style={[styles.monthlySub, { fontSize: 13 }]} numberOfLines={1}>{sub.subject_name}</Text>
                    <Text style={styles.monthlyDate}>{sub.subject_code}</Text>
                    <View style={{ height: 4, backgroundColor: '#F0F0F0', borderRadius: 2, marginTop: 8, width: '100%' }}>
                      <View style={{ height: 4, width: `${p}%`, backgroundColor: p >= 75 ? '#2ecc71' : '#FF5A5F', borderRadius: 2 }} />
                    </View>
                  </View>
                  <View style={[styles.monthlyStats, { minWidth: 70, alignItems: 'flex-end' }]}>
                    <Text style={styles.monthlyRatio}>{sub.attended}/{sub.total}</Text>
                    <Text style={[styles.monthlyPerc, { color: p >= 75 ? '#2ecc71' : '#FF5A5F' }]}>{p}%</Text>
                  </View>
                </View>
              );
            })}
            {(detailedAttendance?.overall || []).length === 0 && (
              <View style={{ padding: 30, alignItems: 'center' }}>
                <Text style={{ color: '#CCC', fontWeight: '700', fontSize: 13 }}>No attendance data found.</Text>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      )}

      {currentTab === 'attendance' && (
        <View style={{ flex: 1 }}>
          <View style={[styles.header, { paddingBottom: 20 }]}>
            <TouchableOpacity onPress={() => setCurrentTab('home')} style={{ marginBottom: 15 }}>
              <Text style={{ color: '#666', fontWeight: '800' }}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.userName}>Attendance Report</Text>
            {(() => {
              const tot = (detailedAttendance?.overall || []).reduce((s, sub) => s + (sub.total || 0), 0);
              const att = (detailedAttendance?.overall || []).reduce((s, sub) => s + (sub.attended || 0), 0);
              const p = tot > 0 ? Math.round((att / tot) * 100) : 0;
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <Text style={styles.welcome}>{att} / {tot} classes attended  </Text>
                  <View style={{ backgroundColor: p >= 75 ? '#2ecc7120' : '#FF5A5F20', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
                    <Text style={{ color: p >= 75 ? '#2ecc71' : '#FF5A5F', fontWeight: '900', fontSize: 14 }}>{p}%</Text>
                  </View>
                </View>
              );
            })()}
          </View>

          <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
            {/* OVERALL SEM SUMMARY — matches admin report */}
            <Text style={styles.sectionHeader}>Overall Semester Aggregate</Text>
            {(detailedAttendance?.overall || []).map((sub) => {
              const p = sub.total > 0 ? Math.round((sub.attended / sub.total) * 100) : 0;
              return (
                <View key={`overall-${sub.course_id}`} style={[styles.monthlyRow, { marginBottom: 10, borderRadius: 16, borderWidth: 1, borderColor: p >= 75 ? '#e6f7ec' : '#fbe9e9', padding: 16 }]}>
                  <View style={styles.monthlyInfo}>
                    <Text style={[styles.monthlySub, { fontSize: 13 }]} numberOfLines={2}>{sub.subject_name}</Text>
                    <Text style={styles.monthlyDate}>{sub.subject_code}</Text>
                    <View style={{ height: 4, backgroundColor: '#F0F0F0', borderRadius: 2, marginTop: 8, width: '100%' }}>
                      <View style={{ height: 4, width: `${p}%`, backgroundColor: p >= 75 ? '#2ecc71' : '#FF5A5F', borderRadius: 2 }} />
                    </View>
                  </View>
                  <View style={[styles.monthlyStats, { minWidth: 70, alignItems: 'flex-end' }]}>
                    <Text style={styles.monthlyRatio}>{sub.attended} / {sub.total}</Text>
                    <Text style={[styles.monthlyPerc, { color: p >= 75 ? '#2ecc71' : '#FF5A5F' }]}>{p}%</Text>
                  </View>
                </View>
              );
            })}

            {/* OVERALL TOTAL ROW */}
            {(detailedAttendance?.overall || []).length > 0 && (() => {
              const tot = (detailedAttendance?.overall || []).reduce((s, sub) => s + (sub.total || 0), 0);
              const att = (detailedAttendance?.overall || []).reduce((s, sub) => s + (sub.attended || 0), 0);
              const p = tot > 0 ? Math.round((att / tot) * 100) : 0;
              return (
                <View style={{ backgroundColor: p >= 75 ? '#e6f7ec' : '#fbe9e9', borderRadius: 16, padding: 18, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 11, fontWeight: '900', color: '#AAA', textTransform: 'uppercase', letterSpacing: 1 }}>Overall Sem Total</Text>
                    <Text style={{ fontSize: 22, fontWeight: '900', color: '#121212', marginTop: 4 }}>{att} / {tot}</Text>
                  </View>
                  <View style={{ backgroundColor: p >= 75 ? '#2ecc71' : '#FF5A5F', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
                    <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900' }}>{p}%</Text>
                  </View>
                </View>
              );
            })()}

            {(detailedAttendance?.overall || []).length === 0 && (
              <Text style={{ textAlign: 'center', color: '#BBB', marginTop: 10, marginBottom: 20, fontWeight: '700' }}>No attendance data found. Please check with admin.</Text>
            )}

            {/* MONTHLY BREAKDOWN */}
            <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Monthly Breakdown</Text>
            {(detailedAttendance?.monthly || []).map((m, idx) => {
              const p = m.total > 0 ? Math.round((m.attended / m.total) * 100) : 0;
              return (
                <View key={idx} style={styles.monthlyRow}>
                  <View style={styles.monthlyInfo}>
                    <Text style={styles.monthlySub}>{m.subject_name}</Text>
                    <Text style={styles.monthlyDate}>{getMonthName(m.month)} {m.year}</Text>
                  </View>
                  <View style={styles.monthlyStats}>
                    <Text style={styles.monthlyRatio}>{m.attended} / {m.total}</Text>
                    <Text style={[styles.monthlyPerc, { color: p < 75 ? '#FF5A5F' : '#2ecc71' }]}>{p}%</Text>
                  </View>
                </View>
              );
            })}
            {(detailedAttendance?.monthly || []).length === 0 && (
              <Text style={{ textAlign: 'center', color: '#BBB', marginTop: 10, fontWeight: '700' }}>No monthly data found.</Text>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      )}

      {currentTab === 'profile' && (
        <ProfileScreen
          user={user}
          profileData={profileData}
          setProfileData={setProfileData}
          handleUpdateProfile={handleUpdateProfile}
          loading={loading}
          emailOTP={emailOTP}
          setEmailOTP={setEmailOTP}
          emailLoading={emailLoading}
          handleSendEmailOTP={handleSendEmailOTP}
          handleVerifyEmailOTP={handleVerifyEmailOTP}
          cancelEmailUpdate={cancelEmailUpdate}
        />
      )}

      {currentTab === 'schedule' && (
        <AssignmentsScreen 
          assignments={assignments} 
          loading={loading} 
        />
      )}
      {currentTab === 'chat' && (
        <ChatScreen 
          contacts={contacts} 
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          chatMessages={chatMessages}
          openChat={openChat}
          chatText={chatText}
          setChatText={setChatText}
          sendMessage={sendMessage}
          userId={user?.id}
          searchQuery={searchQuery}
          handleSearch={handleSearch}
          searching={searching}
        />
      )}
      {currentTab === 'syllabus' && <ComingSoon />}

      {/* BOTTOM NAV */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setCurrentTab('home')}
        >
          <Home size={22} color={currentTab === 'home' || currentTab === 'attendance' ? "#121212" : "#BBB"} />
          <Text style={[styles.navTxt, { color: currentTab === 'home' || currentTab === 'attendance' ? '#121212' : '#BBB' }]}>Home</Text>
          {(currentTab === 'home' || currentTab === 'attendance') && <View style={styles.navDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setCurrentTab('schedule')}
        >
          <Calendar size={22} color={currentTab === 'schedule' ? "#121212" : "#BBB"} />
          <Text style={[styles.navTxt, { color: currentTab === 'schedule' ? '#121212' : '#BBB' }]}>Tasks</Text>
          {currentTab === 'schedule' && <View style={styles.navDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setCurrentTab('syllabus')}
        >
          <BookOpen size={22} color={currentTab === 'syllabus' ? "#121212" : "#BBB"} />
          <Text style={[styles.navTxt, { color: currentTab === 'syllabus' ? '#121212' : '#BBB' }]}>Syllabus</Text>
          {currentTab === 'syllabus' && <View style={styles.navDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setCurrentTab('chat')}
        >
          <MessageSquare size={22} color={currentTab === 'chat' ? "#121212" : "#BBB"} />
          <Text style={[styles.navTxt, { color: currentTab === 'chat' ? '#121212' : '#BBB' }]}>Chat</Text>
          {currentTab === 'chat' && <View style={styles.navDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setCurrentTab('profile')}
        >
          <User size={22} color={currentTab === 'profile' ? "#121212" : "#BBB"} />
          <Text style={[styles.navTxt, { color: currentTab === 'profile' ? '#121212' : '#BBB' }]}>Profile</Text>
          {currentTab === 'profile' && <View style={styles.navDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ProfileScreen({ user, profileData, setProfileData, handleUpdateProfile, loading, emailOTP, setEmailOTP, emailLoading, handleSendEmailOTP, handleVerifyEmailOTP, cancelEmailUpdate }) {
  const enrollment_no = user?.enrollment_no || 'NOT ASSIGNED';
  const role = user?.role || 'Student';

  return (
    <ScrollView style={styles.profileContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <View style={styles.largeAvatar}>
          <Text style={styles.largeAvatarTxt}>{user?.first_name?.[0] || '?'}</Text>
        </View>
        <Text style={styles.profileTitle}>Account Settings</Text>
        <Text style={styles.profileSub}>Keep your information up to date</Text>
      </View>

      <View style={styles.profileBody}>
        <Text style={styles.inputLabel}>Enrollment Number (Fixed)</Text>
        <View style={[styles.modernInputGroup, { backgroundColor: '#1A1A1A', borderColor: '#222' }]}>
          <TextInput
            style={[styles.modernInput, { color: '#FFF' }]}
            value={enrollment_no}
            editable={false}
          />
          <Lock color="#444" size={18} />
        </View>

        <Text style={styles.inputLabel}>Academic Role (Fixed)</Text>
        <View style={[styles.modernInputGroup, { backgroundColor: '#1A1A1A', borderColor: '#222' }]}>
          <TextInput
            style={[styles.modernInput, { color: '#FFF', textTransform: 'capitalize' }]}
            value={role}
            editable={false}
          />
          <Lock color="#444" size={18} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            <Text style={styles.inputLabel}>First Name</Text>
            <View style={styles.modernInputGroup}>
              <TextInput style={styles.modernInput} value={profileData.first_name} onChangeText={(t) => setProfileData({ ...profileData, first_name: t })} />
            </View>
          </View>
          <View style={{ width: '48%' }}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <View style={styles.modernInputGroup}>
              <TextInput style={styles.modernInput} value={profileData.last_name} onChangeText={(t) => setProfileData({ ...profileData, last_name: t })} />
            </View>
          </View>
        </View>

        <Text style={styles.inputLabel}>Father's Name</Text>
        <View style={styles.modernInputGroup}>
          <TextInput
            style={styles.modernInput}
            value={profileData.father_name}
            onChangeText={(t) => setProfileData({ ...profileData, father_name: t })}
            placeholder="Enter Father's Name"
            placeholderTextColor="#333"
          />
        </View>

        <Text style={styles.inputLabel}>Mobile Number</Text>
        <View style={styles.modernInputGroup}>
          <TextInput style={styles.modernInput} value={profileData.phone} onChangeText={(t) => setProfileData({ ...profileData, phone: t })} keyboardType="phone-pad" />
        </View>

        <Text style={styles.inputLabel}>Email Address</Text>
        <View style={styles.modernInputGroup}>
          <TextInput 
            style={styles.modernInput} 
            value={emailOTP.showOTP ? emailOTP.new_email : profileData.email} 
            onChangeText={(t) => emailOTP.showOTP ? setEmailOTP({ ...emailOTP, new_email: t }) : setProfileData({ ...profileData, email: t })} 
            keyboardType="email-address" 
            autoCapitalize="none"
            editable={!emailOTP.showOTP}
          />
          {!emailOTP.showOTP && (
            <TouchableOpacity onPress={() => setEmailOTP({ ...emailOTP, showOTP: true })} style={{ padding: 5 }}>
              <Text style={{ color: '#666', fontSize: 12 }}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {emailOTP.showOTP && (
          <View style={{ backgroundColor: '#1A1A1A', padding: 15, borderRadius: 12, marginTop: 10 }}>
            <Text style={{ color: '#AAA', fontSize: 12, marginBottom: 10 }}>Verify new email with OTP:</Text>
            
            <View style={[styles.modernInputGroup, { marginBottom: 10 }]}>
              <TextInput 
                style={styles.modernInput} 
                placeholder="New email address"
                placeholderTextColor="#333"
                value={emailOTP.new_email} 
                onChangeText={(t) => setEmailOTP({ ...emailOTP, new_email: t })} 
                keyboardType="email-address" 
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={handleSendEmailOTP} disabled={emailLoading} style={{ padding: 5 }}>
                {emailLoading ? <ActivityIndicator size="small" color="#666" /> : <Text style={{ color: '#666', fontSize: 12 }}>Send</Text>}
              </TouchableOpacity>
            </View>
            
            <View style={styles.modernInputGroup}>
              <TextInput 
                style={styles.modernInput} 
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#333"
                value={emailOTP.otp} 
                onChangeText={(t) => setEmailOTP({ ...emailOTP, otp: t })} 
                keyboardType="numeric"
                maxLength={6}
              />
              <TouchableOpacity onPress={handleVerifyEmailOTP} disabled={emailLoading} style={{ padding: 5 }}>
                {emailLoading ? <ActivityIndicator size="small" color="#666" /> : <Text style={{ color: '#666', fontSize: 12 }}>Verify</Text>}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity onPress={cancelEmailUpdate} style={{ marginTop: 10 }}>
              <Text style={{ color: '#FF5A5F', fontSize: 12, textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
            
            <Text style={{ color: '#666', fontSize: 10, marginTop: 5 }}>OTP expires in 10 minutes</Text>
          </View>
        )}

        <Text style={styles.inputLabel}>Full Address</Text>
        <View style={styles.modernInputGroup}>
          <TextInput style={styles.modernInput} value={profileData.address} onChangeText={(t) => setProfileData({ ...profileData, address: t })} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            <Text style={styles.inputLabel}>City</Text>
            <View style={styles.modernInputGroup}>
              <TextInput style={styles.modernInput} value={profileData.city} onChangeText={(t) => setProfileData({ ...profileData, city: t })} />
            </View>
          </View>
          <View style={{ width: '48%' }}>
            <Text style={styles.inputLabel}>Zip Code</Text>
            <View style={styles.modernInputGroup}>
              <TextInput style={styles.modernInput} value={profileData.zip} onChangeText={(t) => setProfileData({ ...profileData, zip: t })} keyboardType="numeric" />
            </View>
          </View>
        </View>

        <Text style={styles.inputLabel}>Birthday (YYYY-MM-DD)</Text>
        <View style={styles.modernInputGroup}>
          <TextInput style={styles.modernInput} value={profileData.birthday} onChangeText={(t) => setProfileData({ ...profileData, birthday: t })} placeholder="1999-01-01" placeholderTextColor="#333" />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            <Text style={styles.inputLabel}>Nationality</Text>
            <View style={styles.modernInputGroup}>
              <TextInput style={styles.modernInput} value={profileData.nationality} onChangeText={(t) => setProfileData({ ...profileData, nationality: t })} placeholder="e.g. Indian" placeholderTextColor="#333" />
            </View>
          </View>
          <View style={{ width: '48%' }}>
            <Text style={styles.inputLabel}>Religion</Text>
            <View style={styles.modernInputGroup}>
              <TextInput style={styles.modernInput} value={profileData.religion} onChangeText={(t) => setProfileData({ ...profileData, religion: t })} placeholder="e.g. Hindu" placeholderTextColor="#333" />
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.modernInputGroup}>
              <TextInput style={styles.modernInput} value={profileData.gender} onChangeText={(t) => setProfileData({ ...profileData, gender: t })} placeholder="Male/Female" placeholderTextColor="#333" />
            </View>
          </View>
          <View style={{ width: '48%' }}>
            <Text style={styles.inputLabel}>Blood Type</Text>
            <View style={styles.modernInputGroup}>
              <TextInput style={styles.modernInput} value={profileData.blood_type} onChangeText={(t) => setProfileData({ ...profileData, blood_type: t })} placeholder="O+" placeholderTextColor="#333" />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>Update Profile</Text>}
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </View>
    </ScrollView>
  );
}

function ChatScreen({ 
  contacts, 
  activeChat, 
  setActiveChat, 
  chatMessages, 
  openChat, 
  chatText, 
  setChatText, 
  sendMessage, 
  userId,
  searchQuery,
  handleSearch,
  searching
}) {
  const scrollViewRef = React.useRef(null);

  if (activeChat) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
         <SafeAreaView style={{ backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}>
               <TouchableOpacity onPress={() => {
                  setActiveChat(null);
                  handleSearch(''); // Reset search when closing chat
               }} style={{ marginRight: 15 }}>
                  <ChevronLeft size={24} color="#121212" />
               </TouchableOpacity>
               <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 12, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', color: '#121212' }}>{activeChat?.first_name?.[0] || '?'}</Text>
               </View>
               <View>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{activeChat?.first_name || ''} {activeChat?.last_name || ''}</Text>
                  <Text style={{ fontSize: 12, color: '#2ecc71' }}>Online</Text>
               </View>
            </View>
         </SafeAreaView>

         <ScrollView 
            style={{ flex: 1, padding: 15 }} 
            contentContainerStyle={{ paddingBottom: 20 }}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
         >
            {chatMessages.map((m, i) => {
              const isMine = m.sender_id === userId;
              const senderName = m.sender_name || (isMine ? 'You' : `${activeChat?.first_name || ''} ${activeChat?.last_name || ''}`);
              
              return (
                <View key={i} style={{ 
                  alignSelf: isMine ? 'flex-end' : 'flex-start', 
                  backgroundColor: isMine ? '#121212' : '#FFF',
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  borderRadius: 20,
                  borderBottomRightRadius: isMine ? 5 : 20,
                  borderBottomLeftRadius: isMine ? 20 : 5,
                  maxWidth: '80%',
                  marginBottom: 12,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2
                }}>
                  <Text style={{ 
                    fontSize: 10, 
                    fontWeight: '900', 
                    color: isMine ? '#2ecc71' : '#121212', 
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}>
                    {senderName}
                  </Text>
                  <Text style={{ color: isMine ? '#FFF' : '#121212', fontSize: 15, lineHeight: 20 }}>{m.content}</Text>
                  <Text style={{ color: isMine ? '#AAA' : '#BBB', fontSize: 9, marginTop: 4, alignSelf: 'flex-end', fontWeight: '600' }}>
                    {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Text>
                </View>
              );
            })}
         </ScrollView>

         <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={80}>
            <View style={{ flexDirection: 'row', padding: 15, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE', alignItems: 'center', marginBottom: Platform.OS === 'ios' ? 20 : 0 }}>
               <TextInput 
                  style={{ flex: 1, backgroundColor: '#F8F9FA', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10, marginRight: 10, maxHeight: 100 }}
                  placeholder="Message..."
                  value={chatText}
                  onChangeText={setChatText}
                  multiline
               />
               <TouchableOpacity 
                style={{ width: 45, height: 45, borderRadius: 23, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}
                onPress={sendMessage}
               >
                  <Send size={20} color="#FFF" />
               </TouchableOpacity>
            </View>
         </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <View style={[styles.header, { paddingBottom: 15 }]}>
        <Text style={styles.welcome}>Student Network</Text>
        <Text style={styles.userName}>Messages</Text>
        
        {/* Search Bar */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          backgroundColor: '#222', 
          borderRadius: 15, 
          paddingHorizontal: 15, 
          marginTop: 20 
        }}>
          <TextInput
            style={{ flex: 1, color: '#FFF', height: 45, fontSize: 14 }}
            placeholder="Search classmates to start chat..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <MessageSquare size={18} color="#666" />
        </View>
      </View>

      <ScrollView style={styles.main}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 15 }}>
          <Text style={[styles.sectionHeader, { marginTop: 0, marginBottom: 0 }]}>
            {searching ? 'Search Results' : 'Recent Conversations'}
          </Text>
          {searching && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={{ color: '#FF5A5F', fontSize: 11, fontWeight: '900' }}>CANCEL</Text>
            </TouchableOpacity>
          )}
        </View>

        {contacts.map(c => (
          <TouchableOpacity key={c.id} style={styles.contactCard} onPress={() => openChat(c)}>
            <View style={styles.contactAvatar}>
              <Text style={styles.avatarTxt}>{c?.first_name?.[0] || '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.contactName}>{c?.first_name || ''} {c?.last_name || ''}</Text>
                {c.last_message_time && (
                  <Text style={{ fontSize: 10, color: '#AAA' }}>
                    {new Date(c.last_message_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </Text>
                )}
              </View>
              <Text style={styles.contactRole} numberOfLines={1}>
                {searching ? 'Student • Classmate' : (c.last_message || 'No messages yet')}
              </Text>
            </View>
            {!searching && <View style={styles.onlineDot} />}
          </TouchableOpacity>
        ))}

        {contacts.length === 0 && (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <MessageSquare size={50} color="#EEE" />
            <Text style={{ color: '#BBB', fontWeight: '700', marginTop: 20 }}>
              {searching ? 'No matching classmates' : 'No conversations yet'}
            </Text>
            <Text style={{ color: '#DDD', fontSize: 12, marginTop: 5, textAlign: 'center' }}>
              {searching ? 'Try a different name' : 'Use the search bar above to find classmates and start chatting.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function AssignmentsScreen({ assignments, loading }) {
  const getBadgeColor = (audience) => {
    return audience === 'failure' ? '#FF5A5F' : '#121212';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <View style={[styles.header, { paddingBottom: 25 }]}>
        <Text style={styles.welcome}>My Allotted Work</Text>
        <Text style={styles.userName}>Active Tasks</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <View style={{ backgroundColor: '#2ecc7120', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
            <Text style={{ color: '#2ecc71', fontWeight: '900', fontSize: 13 }}>{assignments.length} Pending</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeader}>Upcoming Deadlines</Text>
        
        {assignments.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={[styles.taskBadge, { backgroundColor: getBadgeColor(task.target_audience) }]}>
                <Text style={styles.taskBadgeText}>
                  {task.target_audience === 'failure' ? 'Remedial' : 'General'}
                </Text>
              </View>
              <Text style={styles.taskSubject}>{task.course_name}</Text>
            </View>
            
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDesc} numberOfLines={3}>{task.description}</Text>
            
            {task.attachments && task.attachments.length > 0 && (
              <View style={{ gap: 8, marginBottom: 15 }}>
                {task.attachments.map((file, i) => (
                  <TouchableOpacity 
                    key={i}
                    style={styles.attachmentPin} 
                    onPress={() => Linking.openURL(`${SOCKET_URL}${file.url}`)}
                  >
                    <AlertCircle size={14} color="#3498db" />
                    <Text style={styles.attachmentText} numberOfLines={1}>
                      {file.name || `Attachment ${i + 1}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.taskFooter}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={14} color="#AAA" />
                <Text style={styles.taskDueDate}>
                  Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
              <TouchableOpacity style={styles.taskBtn}>
                <Text style={styles.taskBtnText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {assignments.length === 0 && (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <Calendar size={50} color="#EEE" />
            <Text style={{ color: '#BBB', fontWeight: '700', marginTop: 20 }}>All caught up!</Text>
            <Text style={{ color: '#DDD', fontSize: 12, marginTop: 5 }}>No active tasks allotted to you.</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  loginContainer: { flex: 1, backgroundColor: '#121212' },
  flex: { flex: 1, paddingHorizontal: 30 },

  logoSquare: { width: 50, height: 50, backgroundColor: '#2A2A2A', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 60, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  loginWelcome: { fontSize: 32, fontWeight: '900', color: '#FFF' },
  loginBrand: { fontSize: 32, fontWeight: '900', color: '#FFF', marginTop: -5 },
  loginSubText: { fontSize: 13, color: '#666', fontWeight: '600', marginTop: 15, lineHeight: 20 },

  modernInputGroup: { flexDirection: 'row', alignItems: 'center', height: 65, borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 16, paddingHorizontal: 20, marginBottom: 15, backgroundColor: '#121212' },
  modernInput: { flex: 1, color: '#FFF', fontSize: 15, fontWeight: '600' },
  errorText: { color: '#FF5A5F', fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 15, backgroundColor: 'rgba(255, 90, 95, 0.1)', paddingVertical: 10, borderRadius: 12 },

  loginActionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 30 },
  remGroup: { flexDirection: 'row', alignItems: 'center' },
  miniCheck: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: '#2A2A2A', marginRight: 10 },
  remText: { fontSize: 13, color: '#666', fontWeight: '700' },

  modernLoginBtn: { height: 65, backgroundColor: '#2A2A2A', borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  loginBtnTxtFinal: { color: '#FFF', fontSize: 16, fontWeight: '900' },

  socialHeaderRow: { marginTop: 40, alignItems: 'center' },
  socialText: { fontSize: 12, color: '#444', fontWeight: '800', marginBottom: 20 },
  socialIconsRow: { flexDirection: 'row', justifyContent: 'center' },
  socialBox: { width: 45, height: 45, borderRadius: 12, borderWidth: 1, borderColor: '#222', justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 },

  footerLinkText: { fontSize: 13, color: '#555', fontWeight: '800' },
  policyText: { fontSize: 11, color: '#333', fontWeight: '700' },

  // --- THE FINAL DASHBOARD THEME ---
  header: { backgroundColor: '#121212', paddingHorizontal: 25, paddingTop: 70, paddingBottom: 40, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  welcome: { color: '#666', fontSize: 13, fontWeight: '700' },
  userName: { fontSize: 26, fontWeight: '900', color: '#FFF', marginTop: 4 },
  headerRight: { position: 'absolute', right: 25, top: 65 },
  avatar: { width: 44, height: 44, backgroundColor: '#222', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '900' },

  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  statBox: { width: '31%', backgroundColor: '#1C1C1C', borderRadius: 16, padding: 18, alignItems: 'flex-start' },
  statValue: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  statLabel: { fontSize: 10, color: '#444', fontWeight: '800', marginTop: 4 },

  main: { flex: 1, backgroundColor: '#FFF', paddingHorizontal: 20 },
  sectionHeader: { fontSize: 11, fontWeight: '900', color: '#BBB', letterSpacing: 1.5, marginTop: 30, marginBottom: 15, textTransform: 'uppercase' },

  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 25, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 1 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  cardLabel: { fontSize: 10, fontWeight: '900', color: '#BBB', textTransform: 'uppercase' },
  cardLargeText: { fontSize: 50, fontWeight: '900', color: '#121212', lineHeight: 55 },
  targetLabel: { fontSize: 11, fontWeight: '700', color: '#CCC', textAlign: 'right' },
  targetValue: { fontSize: 11, fontWeight: '800', color: '#AAA', textAlign: 'right' },

  progressContainer: { height: 6, backgroundColor: '#F2F2F2', borderRadius: 3, marginVertical: 10 },
  progressBar: { height: 6, backgroundColor: '#121212', borderRadius: 3 },

  smallAlert: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  smallAlertText: { fontSize: 12, fontWeight: '700', color: '#AAA', marginLeft: 8 },

  pCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#FDFDFD', backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 15, marginBottom: 10, borderWidth: 1, borderColor: '#F8F8F8' },
  pDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EEE', marginRight: 15 },
  pDotActive: { backgroundColor: '#121212' },
  pInfo: { flex: 1 },
  pTitle: { fontSize: 15, fontWeight: '800', color: '#121212' },
  pSub: { fontSize: 11, color: '#BBB', fontWeight: '700', marginTop: 2 },
  pRight: { alignItems: 'flex-end' },
  pMeta: { fontSize: 11, fontWeight: '800', color: '#999' },

  navBar: { flexDirection: 'row', backgroundColor: '#FFF', height: 90, borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingBottom: 25, justifyContent: 'space-around', alignItems: 'center' },
  navTab: { alignItems: 'center' },
  navDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#121212', marginTop: 4 },
  navTxt: { fontSize: 10, fontWeight: '800', color: '#BBB', marginTop: 5 },

  // --- COMING SOON MODAL ---
  comingSoonLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  csContent: {
    backgroundColor: '#1C1C1C',
    width: '100%',
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  csIconBox: {
    width: 80,
    height: 80,
    backgroundColor: '#2A2A2A',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25
  },
  csTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 10
  },
  csDesc: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 30
  },
  csButton: {
    backgroundColor: '#FFF',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center'
  },
  csButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800'
  },
  // --- LOADING OVERLAY ---
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#121212',
    zIndex: 2000,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingLogoBox: {
    width: 100,
    height: 100,
    backgroundColor: '#1C1C1C',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  loadingLogo: {
    width: 60,
    height: 60,
    resizeMode: 'contain'
  },
  loadingMsg: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 20
  },
  loadingSubMsg: {
    fontSize: 12,
    color: '#444',
    fontWeight: '700',
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  // --- PROFILE SCREEN STYLES ---
  profileContainer: { flex: 1, backgroundColor: '#121212' },
  profileHeader: { paddingHorizontal: 30, paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  largeAvatar: { width: 100, height: 100, borderRadius: 32, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  largeAvatarTxt: { fontSize: 40, fontWeight: '900', color: '#FFF' },
  profileTitle: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  profileSub: { fontSize: 13, color: '#666', marginTop: 5, fontWeight: '600' },
  profileBody: { backgroundColor: '#121212', paddingHorizontal: 25, paddingTop: 20 },
  inputLabel: { fontSize: 11, fontWeight: '900', color: '#444', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, marginTop: 15 },
  saveBtn: {
    height: 65,
    backgroundColor: '#FFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10
  },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },

  // --- NOTIFICATIONS ---
  notificationCard: { backgroundColor: '#F9F9F9', borderRadius: 16, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
  notifStatusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5A5F', marginRight: 12 },
  notifTitle: { fontSize: 13, fontWeight: '900', color: '#111' },
  notifBody: { fontSize: 12, color: '#666', marginTop: 2, lineHeight: 16 },
  notifTime: { fontSize: 9, fontWeight: '800', color: '#AAA', marginTop: 4, textTransform: 'uppercase' },

  // --- SUBJECT MINI CARDS ---
  subjectMiniCard: { width: 140, backgroundColor: '#F8F8F8', borderRadius: 20, padding: 18, marginRight: 15, borderWidth: 1, borderColor: '#F0F0F0' },
  subMiniCode: { fontSize: 10, fontWeight: '900', color: '#AAA', marginBottom: 5 },
  subMiniTitle: { fontSize: 13, fontWeight: '800', color: '#121212', marginBottom: 15 },
  subMiniPercent: { fontSize: 22, fontWeight: '900', color: '#121212', marginBottom: 8 },
  miniProgBg: { height: 4, backgroundColor: '#EAEAEA', borderRadius: 2 },
  miniProgFill: { height: 4, backgroundColor: '#121212', borderRadius: 2 },

  // --- MONTHLY ROW ---
  monthlyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  monthlyInfo: { flex: 1 },
  monthlySub: { fontSize: 15, fontWeight: '800', color: '#121212' },
  monthlyDate: { fontSize: 11, color: '#999', fontWeight: '700', marginTop: 4 },
  monthlyStats: { alignItems: 'flex-end', marginLeft: 15 },
  monthlyRatio: { fontSize: 11, color: '#666', fontWeight: '700', marginBottom: 4 },
  monthlyPerc: { fontSize: 16, fontWeight: '900' },

  // --- TASK CARDS ---
  taskCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  taskBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  taskBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  taskSubject: { fontSize: 11, fontWeight: '800', color: '#AAA', textTransform: 'uppercase' },
  taskTitle: { fontSize: 18, fontWeight: '900', color: '#121212', marginBottom: 6 },
  taskDesc: { fontSize: 13, color: '#666', lineHeight: 20, marginBottom: 15 },
  taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  taskDueDate: { fontSize: 11, fontWeight: '800', color: '#AAA', marginLeft: 6 },
  taskBtnText: { fontSize: 12, fontWeight: '800', color: '#121212' },
  attachmentPin: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e1f5fe', padding: 10, borderRadius: 10, marginBottom: 15 },
  attachmentText: { color: '#01579b', fontSize: 12, fontWeight: '800', marginLeft: 8 },

  // --- CHAT STYLES ---
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F5F5F5' },
  contactAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarTxt: { fontWeight: '900', color: '#121212', fontSize: 18 },
  contactName: { fontSize: 16, fontWeight: '900', color: '#121212' },
  contactRole: { fontSize: 12, color: '#AAA', fontWeight: '800' },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2ecc71', borderWidth: 2, borderColor: '#FFF' }
});
