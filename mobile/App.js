import React, { useState, useEffect } from 'react';
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
  Animated
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { io } from 'socket.io-client';
import { Video, ResizeMode } from 'expo-av';

import { User, Lock, GraduationCap, Home, BookOpen, Calendar, Clock, AlertCircle, LogOut } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import client from './src/api/client';



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


  // Profile Form States
  const [profileData, setProfileData] = useState({
    first_name: '', last_name: '', father_name: '', phone: '',
    address: '', city: '', zip: '', birthday: '', blood_type: '',
    email: '', nationality: '', religion: '', gender: ''
  });

  useEffect(() => {
    // Initial App Check (Check for token)
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // Verify token or fetch user
          try {
            const res = await client.get('/auth/me'); // Assuming there's a /me endpoint
            setUser(res.data.user);
            setProfileData({
              ...res.data.user,
              father_name: res.data.user.father_name || ''
            });
          } catch (e) {
            console.log('Session expired');
            await AsyncStorage.removeItem('token');
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkLogin();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAttendance();

      // Real-time connection (Live Render)
      const socket = io('https://college-management-mjul.onrender.com');

      socket.on(`attendance-updated-class-${user.class_id}`, (data) => {
        console.log('Class attendance update received!');
        fetchAttendance();
      });

      socket.on(`attendance-updated-${user.id}`, (data) => {
        Alert.alert("Attendance Update!", "Admin has updated your attendance.");
        fetchAttendance();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          client.post('/users/push-token', { token })
            .then(() => console.log('Push token saved to backend'))
            .catch(err => console.error('Failed to save push token:', err));
        }
      });

      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
        const newNotif = {
          id: notification.request.identifier,
          title: notification.request.content.title,
          body: notification.request.content.body,
          data: notification.request.content.data,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString()
        };
        setNotificationsHistory(prev => [newNotif, ...prev].slice(0, 10)); // Keep last 10
      });


      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
        // Navigate to attendance tab if it's an attendance notification
        if (response.notification.request.content.data?.type === 'attendance') {
           setCurrentTab('attendance');
        }
      });

      return () => {
        Notifications.removeNotificationSubscription(notificationListener);
        Notifications.removeNotificationSubscription(responseListener);
      };
    }
  }, [user]);

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId || 'e711222f-37a2-4217-ac3c-a612e6222d01';
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Expo Push Token:', token);
    } else {

      console.log('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  }

  const fetchAttendance = async () => {

    try {
      const [summaryRes, detailedRes] = await Promise.all([
        client.get('/attendance/student-summary'),
        client.get('/attendance/my-detailed-attendance')
      ]);
      setAttendance(summaryRes.data);
      setDetailedAttendance(detailedRes.data);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    }
  };

  const handleLogin = async () => {
    if (!identity || !password) return setError('Please fill all fields');

    setLoading(true);
    setError('');
    try {
      const res = await client.post('/auth/login', { identity, password });
      const { token, user: userData } = res.data;

      await AsyncStorage.setItem('token', token);
      setUser(userData);
      setProfileData({
        ...userData,
        father_name: userData.father_name || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
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
            await AsyncStorage.removeItem('token');
            setUser(null);
            setCurrentTab('home');
          }
        }
      ]
    );
  };

  const LoadingScreen = ({ message }) => {
    return (
      <View style={styles.loadingOverlay}>
        <StatusBar hidden />
        <Video
          source={require('./assets/drop.mp4')}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping={message ? true : false} 
          onPlaybackStatusUpdate={(status) => {
            // Only transition if it's the initial intro (no message) and video finished
            if (!message && status.didJustFinish) {
              setAppLoading(false); 
            }
          }}
        />
        {message && (
          <View style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 100, backgroundColor: 'rgba(0,0,0,0.3)' }]}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={[styles.loadingMsg, { marginTop: 20 }]}>{message}</Text>
          </View>
        )}
      </View>
    );
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await client.post('/auth/profile', profileData);
      Alert.alert('Success', 'Profile updated successfully!');
      // Refresh user data
      const res = await client.get('/auth/me');
      setUser(res.data.user);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
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

  if (appLoading) return <LoadingScreen />;

  if (!user) {
    return (
      <View style={styles.loginContainer}>
        <StatusBar barStyle="light-content" />
        {showComingSoon && <ComingSoon />}
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 30, paddingTop: 80, paddingBottom: 40 }}>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Image
              source={require('./assets/logo.png')}
              style={{ width: 80, height: 80, objectFit: 'contain' }}
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
              <TouchableOpacity onPress={() => setShowComingSoon(true)}>
                <Text style={styles.remText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modernLoginBtn}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginBtnTxtFinal}>Sign In</Text>
            </TouchableOpacity>

            {loading && <LoadingScreen message="Verifying Identity..." />}

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
            <Text style={styles.welcome}>Good Morning 👋</Text>
            <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
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
                  {detailedAttendance.overall.reduce((s, sub) => s + sub.attended, 0)}
                </Text>
                <Text style={styles.statLabel}>Attended</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statBox} onPress={() => setCurrentTab('attendance')}>
                <Text style={styles.statValue}>
                  {detailedAttendance.overall.reduce((s, sub) => s + sub.total, 0)}
                </Text>
                <Text style={styles.statLabel}>Total</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statBox} onPress={() => setCurrentTab('attendance')}>
                {(() => {
                  const tot = detailedAttendance.overall.reduce((s, sub) => s + sub.total, 0);
                  const att = detailedAttendance.overall.reduce((s, sub) => s + sub.attended, 0);
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
                    const tot = detailedAttendance.overall.reduce((s, sub) => s + sub.total, 0);
                    const att = detailedAttendance.overall.reduce((s, sub) => s + sub.attended, 0);
                    const p = tot > 0 ? Math.round((att / tot) * 100) : 0;
                    return <Text style={styles.cardLargeText}>{p}%</Text>;
                  })()}
                </View>
                <View><Text style={styles.targetLabel}>Target 75%</Text></View>
              </View>
              {(() => {
                const tot = detailedAttendance.overall.reduce((s, sub) => s + sub.total, 0);
                const att = detailedAttendance.overall.reduce((s, sub) => s + sub.attended, 0);
                const p = tot > 0 ? Math.round((att / tot) * 100) : 0;
                const needed = Math.max(0, Math.ceil((0.75 * tot - att) / 0.25));
                return (
                  <>
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBar, { width: `${p}%`, backgroundColor: p >= 75 ? '#2ecc71' : '#FF5A5F' }]} />
                    </View>
                    {needed > 0 && (
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
            {detailedAttendance.overall.map((sub) => {
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
            {detailedAttendance.overall.length === 0 && (
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
              const tot = detailedAttendance.overall.reduce((s, sub) => s + sub.total, 0);
              const att = detailedAttendance.overall.reduce((s, sub) => s + sub.attended, 0);
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
            {detailedAttendance.overall.map((sub) => {
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
            {detailedAttendance.overall.length > 0 && (() => {
              const tot = detailedAttendance.overall.reduce((s, sub) => s + sub.total, 0);
              const att = detailedAttendance.overall.reduce((s, sub) => s + sub.attended, 0);
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

            {detailedAttendance.overall.length === 0 && (
              <Text style={{ textAlign: 'center', color: '#BBB', marginTop: 10, marginBottom: 20, fontWeight: '700' }}>No attendance data found. Please check with admin.</Text>
            )}

            {/* MONTHLY BREAKDOWN */}
            <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Monthly Breakdown</Text>
            {detailedAttendance.monthly.map((m, idx) => {
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
            {detailedAttendance.monthly.length === 0 && (
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
        />
      )}

      {currentTab === 'schedule' && <ComingSoon />}
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
          <Text style={[styles.navTxt, { color: currentTab === 'schedule' ? '#121212' : '#BBB' }]}>Schedule</Text>
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

function ProfileScreen({ user, profileData, setProfileData, handleUpdateProfile, loading }) {
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
          <TextInput style={styles.modernInput} value={profileData.email} onChangeText={(t) => setProfileData({ ...profileData, email: t })} keyboardType="email-address" autoCapitalize="none" />
        </View>

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
  monthlyPerc: { fontSize: 16, fontWeight: '900' }
});
