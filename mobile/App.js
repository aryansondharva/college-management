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
import { io } from 'socket.io-client';
import { User, Lock, GraduationCap, Home, BookOpen, Calendar, Clock, AlertCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from './src/api/client';

const ProfileScreen = ({ user, profileData, setProfileData, handleUpdateProfile, loading }) => (
  <ScrollView style={styles.profileContainer} showsVerticalScrollIndicator={false}>
     <View style={styles.profileHeader}>
        <View style={styles.largeAvatar}>
           <Text style={styles.largeAvatarTxt}>{user.first_name[0]}</Text>
        </View>
        <Text style={styles.profileTitle}>Account Settings</Text>
        <Text style={styles.profileSub}>Keep your information up to date</Text>
     </View>

     <View style={styles.profileBody}>
        <Text style={styles.inputLabel}>Enrollment Number (Fixed)</Text>
        <View style={[styles.modernInputGroup, { backgroundColor: '#1A1A1A', borderColor: '#222' }]}>
           <TextInput style={[styles.modernInput, { color: '#666' }]} value={user.enrollment_no} editable={false} />
           <Lock color="#444" size={18} />
        </View>

        <Text style={styles.inputLabel}>Academic Role (Fixed)</Text>
        <View style={[styles.modernInputGroup, { backgroundColor: '#1A1A1A', borderColor: '#222' }]}>
           <TextInput style={[styles.modernInput, { color: '#666', textTransform: 'capitalize' }]} value={user.role} editable={false} />
           <Lock color="#444" size={18} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
           <View style={{ width: '48%' }}>
              <Text style={styles.inputLabel}>First Name</Text>
              <View style={styles.modernInputGroup}>
                 <TextInput style={styles.modernInput} value={profileData.first_name} onChangeText={(t) => setProfileData({...profileData, first_name: t})} />
              </View>
           </View>
           <View style={{ width: '48%' }}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <View style={styles.modernInputGroup}>
                 <TextInput style={styles.modernInput} value={profileData.last_name} onChangeText={(t) => setProfileData({...profileData, last_name: t})} />
              </View>
           </View>
        </View>

        <Text style={styles.inputLabel}>Father's Name</Text>
        <View style={styles.modernInputGroup}>
           <TextInput style={styles.modernInput} value={profileData.father_name} onChangeText={(t) => setProfileData({...profileData, father_name: t})} />
        </View>

        <Text style={styles.inputLabel}>Mobile Number</Text>
        <View style={styles.modernInputGroup}>
           <TextInput style={styles.modernInput} value={profileData.phone} onChangeText={(t) => setProfileData({...profileData, phone: t})} keyboardType="phone-pad" />
        </View>

        <Text style={styles.inputLabel}>Email Address</Text>
        <View style={styles.modernInputGroup}>
           <TextInput style={styles.modernInput} value={profileData.email} onChangeText={(t) => setProfileData({...profileData, email: t})} keyboardType="email-address" autoCapitalize="none" />
        </View>

        <Text style={styles.inputLabel}>Full Address</Text>
        <View style={styles.modernInputGroup}>
           <TextInput style={styles.modernInput} value={profileData.address} onChangeText={(t) => setProfileData({...profileData, address: t})} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
           <View style={{ width: '48%' }}>
              <Text style={styles.inputLabel}>City</Text>
              <View style={styles.modernInputGroup}>
                 <TextInput style={styles.modernInput} value={profileData.city} onChangeText={(t) => setProfileData({...profileData, city: t})} />
              </View>
           </View>
           <View style={{ width: '48%' }}>
              <Text style={styles.inputLabel}>Zip Code</Text>
              <View style={styles.modernInputGroup}>
                 <TextInput style={styles.modernInput} value={profileData.zip} onChangeText={(t) => setProfileData({...profileData, zip: t})} keyboardType="numeric" />
              </View>
           </View>
        </View>

        <Text style={styles.inputLabel}>Birthday (YYYY-MM-DD)</Text>
        <View style={styles.modernInputGroup}>
           <TextInput style={styles.modernInput} value={profileData.birthday} onChangeText={(t) => setProfileData({...profileData, birthday: t})} placeholder="1999-01-01" placeholderTextColor="#333" />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
           <View style={{ width: '48%' }}>
              <Text style={styles.inputLabel}>Nationality</Text>
              <View style={styles.modernInputGroup}>
                 <TextInput style={styles.modernInput} value={profileData.nationality} onChangeText={(t) => setProfileData({...profileData, nationality: t})} placeholder="e.g. Indian" placeholderTextColor="#333" />
              </View>
           </View>
           <View style={{ width: '48%' }}>
              <Text style={styles.inputLabel}>Religion</Text>
              <View style={styles.modernInputGroup}>
                 <TextInput style={styles.modernInput} value={profileData.religion} onChangeText={(t) => setProfileData({...profileData, religion: t})} placeholder="e.g. Hindu" placeholderTextColor="#333" />
              </View>
           </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
           <View style={{ width: '48%' }}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.modernInputGroup}>
                 <TextInput style={styles.modernInput} value={profileData.gender} onChangeText={(t) => setProfileData({...profileData, gender: t})} placeholder="Male/Female" placeholderTextColor="#333" />
              </View>
           </View>
           <View style={{ width: '48%' }}>
              <Text style={styles.inputLabel}>Blood Type</Text>
              <View style={styles.modernInputGroup}>
                 <TextInput style={styles.modernInput} value={profileData.blood_type} onChangeText={(t) => setProfileData({...profileData, blood_type: t})} placeholder="O+" placeholderTextColor="#333" />
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

export default function App() {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('home');

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
      } finally {
        setTimeout(() => setAppLoading(false), 2000); // 2 second delay for premium feel
      }
    };
    checkLogin();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAttendance();
      
      // Real-time connection (Live Render)
      const socket = io('https://college-management-mjul.onrender.com');
      
      socket.on(`attendance-updated-${user.id}`, (data) => {
        Alert.alert("Attendance Update!", "Admin has updated your attendance.");
        fetchAttendance();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const fetchAttendance = async () => {
    try {
      const res = await client.get('/attendance/student-summary');
      setAttendance(res.data);
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

  const LoadingScreen = ({ message }) => {
    const pulseAnim = React.useRef(new Animated.Value(1)).current;
    const dropAnim = React.useRef(new Animated.Value(-300)).current;
    const lineAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      // Drop animation
      Animated.spring(dropAnim, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true }).start();

      // Expansion line animation
      Animated.timing(lineAnim, {
        toValue: 80,
        duration: 1500,
        useNativeDriver: false,
      }).start();

      // Pulse loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }, []);

    return (
      <View style={styles.loadingOverlay}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContent}>
          <Animated.View style={[
            styles.loadingLogoBox, 
            { transform: [{ translateY: dropAnim }, { scale: pulseAnim }] }
          ]}>
            <Image source={require('./assets/logo.png')} style={styles.loadingLogo} />
          </Animated.View>
          
          <View style={{ height: 40, justifyContent: 'center', alignItems: 'center' }}>
             {/* SLEEK PROGRESS LINE */}
             <Animated.View style={{ 
               width: lineAnim, 
               height: 1.5, 
               backgroundColor: 'rgba(255,255,255,0.4)', 
               borderRadius: 2 
             }} />
          </View>

          <Text style={styles.loadingMsg}>{message || 'Launching Drop...'}</Text>
          <Text style={styles.loadingSubMsg}>Your academic journey starts here</Text>
        </View>
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

  if (appLoading) return <LoadingScreen message="Launching Drop..." />;

  if (!user) {
    // ... LOGIN VIEW REMAINS ACCESSIBLE ...
  }

  const classesNeeded = attendance ? Math.max(0, Math.ceil((0.75 * attendance.total - attendance.attended) / 0.25)) : 0;

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
                  onPress={() => setCurrentTab('profile')}
                >
                    <Text style={styles.avatarText}>{user.first_name[0]}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statRow}>
                <TouchableOpacity style={styles.statBox} onPress={() => setShowComingSoon(true)}>
                    <Text style={styles.statValue}>{attendance ? attendance.attended : '0'}</Text>
                    <Text style={styles.statLabel}>Attended</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statBox} onPress={() => setShowComingSoon(true)}>
                    <Text style={styles.statValue}>{attendance ? attendance.total : '0'}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statBox} onPress={() => setShowComingSoon(true)}>
                    <Text style={styles.statValue}>3</Text>
                    <Text style={styles.statLabel}>Tasks</Text>
                </TouchableOpacity>
              </View>
          </View>

          <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionHeader}>Attendance</Text>
              <TouchableOpacity style={styles.card} onPress={() => setShowComingSoon(true)}>
                  <View style={styles.cardTitleRow}>
                      <View>
                        <Text style={styles.cardLabel}>Cumulative Presence</Text>
                        <Text style={styles.cardLargeText}>{attendance ? `${attendance.percentage}%` : '--%'}</Text>
                      </View>
                      <View><Text style={styles.targetLabel}>Target 75%</Text></View>
                  </View>
                  <View style={styles.progressContainer}>
                      <View style={[styles.progressBar, { width: attendance ? `${attendance.percentage}%` : '0%' }]} />
                  </View>
                  {classesNeeded > 0 && (
                    <View style={styles.smallAlert}>
                        <AlertCircle size={14} color="#AAA" />
                        <Text style={styles.smallAlertText}>Need {classesNeeded} more classes to reach 75%</Text>
                    </View>
                  )}
              </TouchableOpacity>

              <Text style={styles.sectionHeader}>Upcoming</Text>
              <TouchableOpacity style={styles.pCard} onPress={() => setShowComingSoon(true)}>
                <View style={[styles.pDot, styles.pDotActive]} />
                <View style={styles.pInfo}>
                    <Text style={styles.pTitle}>System Analysis & Design</Text>
                    <Text style={styles.pSub}>Room 402</Text>
                </View>
                <View style={styles.pRight}><Text style={styles.pMeta}>10:30 AM · Tomorrow</Text></View>
              </TouchableOpacity>
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
            <Home size={22} color={currentTab === 'home' ? "#121212" : "#BBB"} />
            <Text style={[styles.navTxt, { color: currentTab === 'home' ? '#121212' : '#BBB' }]}>Home</Text>
            {currentTab === 'home' && <View style={styles.navDot} />}
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
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '900' }
});
