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
  ScrollView
} from 'react-native';
import { io } from 'socket.io-client';
import { User, Lock, GraduationCap, Home, BookOpen, Calendar, Clock, AlertCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from './src/api/client';

export default function App() {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAttendance();
      
      // Real-time connection
      const socket = io('https://unspleenish-mittie-curvilinear.ngrok-free.dev');
      
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
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
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

  if (!user) {
    return (
      <View style={styles.loginContainer}>
        <StatusBar barStyle="light-content" />
        {showComingSoon && <ComingSoon />}
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 30, paddingTop: 80, paddingBottom: 40 }}>
          
          {/* LOGO BOX */}
          <View style={styles.logoSquare}>
             <GraduationCap color="#FFF" size={28} />
          </View>

          {/* WELCOME TEXT */}
          <Text style={styles.loginWelcome}>Welcome to</Text>
          <Text style={styles.loginBrand}>Unitransform</Text>
          <Text style={styles.loginSubText}>Your gateway to a smart academic experience. Sign in to track your progress.</Text>

          {/* INPUTS */}
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

             {/* LOGIN ACTIONS */}
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

             {/* SIGN IN BUTTON */}
             <TouchableOpacity 
               style={styles.modernLoginBtn}
               onPress={handleLogin}
               disabled={loading}
             >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnTxtFinal}>Sign In</Text>}
             </TouchableOpacity>

             <View style={styles.socialHeaderRow}>
                <Text style={styles.socialText}>Or sign in with</Text>
                <View style={styles.socialIconsRow}>
                   <TouchableOpacity style={styles.socialBox} onPress={() => setShowComingSoon(true)}><User color="#444" size={20} /></TouchableOpacity>
                   <TouchableOpacity style={styles.socialBox} onPress={() => setShowComingSoon(true)}><User color="#444" size={20} /></TouchableOpacity>
                   <TouchableOpacity style={styles.socialBox} onPress={() => setShowComingSoon(true)}><User color="#444" size={20} /></TouchableOpacity>
                </View>
             </View>

             {/* FOOTER */}
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

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <StatusBar barStyle="light-content" />
      
      {showComingSoon && <ComingSoon />}

      {/* DARK HEADER */}
      <View style={styles.header}>
          <Text style={styles.welcome}>Good Morning 👋</Text>
          <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
          <View style={styles.headerRight}>
             <TouchableOpacity 
               style={styles.avatar}
               onPress={() => setShowComingSoon(true)}
             >
                <Text style={styles.avatarText}>{user.first_name[0]}</Text>
             </TouchableOpacity>
          </View>

          <View style={styles.statRow}>
             <TouchableOpacity 
               style={styles.statBox}
               onPress={() => setShowComingSoon(true)}
             >
                <Text style={styles.statValue}>{attendance ? attendance.attended : '0'}</Text>
                <Text style={styles.statLabel}>Attended</Text>
             </TouchableOpacity>
             <TouchableOpacity 
               style={styles.statBox}
               onPress={() => setShowComingSoon(true)}
              >
                <Text style={styles.statValue}>{attendance ? attendance.total : '0'}</Text>
                <Text style={styles.statLabel}>Total</Text>
             </TouchableOpacity>
             <TouchableOpacity 
               style={styles.statBox}
               onPress={() => setShowComingSoon(true)}
             >
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Tasks</Text>
             </TouchableOpacity>
          </View>
      </View>

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
          {/* ATTENDANCE SECTION */}
          <Text style={styles.sectionHeader}>Attendance</Text>
          <TouchableOpacity 
            style={styles.card}
            onPress={() => setShowComingSoon(true)}
          >
              <View style={styles.cardTitleRow}>
                  <View>
                     <Text style={styles.cardLabel}>Cumulative Presence</Text>
                     <Text style={styles.cardLargeText}>{attendance ? `${attendance.percentage}%` : '--%'}</Text>
                  </View>
                  <View>
                     <Text style={styles.targetLabel}>Target 75%</Text>
                  </View>
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

          {/* UPCOMING SECTION */}
          <Text style={styles.sectionHeader}>Upcoming</Text>
          
          <TouchableOpacity 
            style={styles.pCard}
            onPress={() => setShowComingSoon(true)}
          >
             <View style={[styles.pDot, styles.pDotActive]} />
             <View style={styles.pInfo}>
                <Text style={styles.pTitle}>System Analysis & Design</Text>
                <Text style={styles.pSub}>Room 402</Text>
             </View>
             <View style={styles.pRight}>
                <Text style={styles.pMeta}>10:30 AM · Tomorrow</Text>
             </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.pCard}
            onPress={() => setShowComingSoon(true)}
          >
             <View style={styles.pDot} />
             <View style={styles.pInfo}>
                <Text style={styles.pTitle}>Data Structures Lab</Text>
                <Text style={styles.pSub}>Lab 201</Text>
             </View>
             <View style={styles.pRight}>
                <Text style={styles.pMeta}>2:00 PM · Today</Text>
             </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.pCard}
            onPress={() => setShowComingSoon(true)}
          >
             <View style={styles.pDot} />
             <View style={styles.pInfo}>
                <Text style={styles.pTitle}>Mathematics III</Text>
                <Text style={styles.pSub}>Room 301</Text>
             </View>
             <View style={styles.pRight}>
                <Text style={styles.pMeta}>9:00 AM · Mon</Text>
             </View>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.navBar}>
         <TouchableOpacity style={styles.navTab}>
            <Home size={22} color="#121212" />
            <Text style={[styles.navTxt, { color: '#121212' }]}>Home</Text>
            <View style={styles.navDot} />
         </TouchableOpacity>
         <TouchableOpacity 
           style={styles.navTab}
           onPress={() => setShowComingSoon(true)}
         >
            <Calendar size={22} color="#BBB" />
            <Text style={styles.navTxt}>Schedule</Text>
         </TouchableOpacity>
         <TouchableOpacity 
           style={styles.navTab}
           onPress={() => setShowComingSoon(true)}
         >
            <BookOpen size={22} color="#BBB" />
            <Text style={styles.navTxt}>Syllabus</Text>
         </TouchableOpacity>
         <TouchableOpacity 
           style={styles.navTab}
           onPress={() => setShowComingSoon(true)}
         >
            <User size={22} color="#BBB" />
            <Text style={styles.navTxt}>Profile</Text>
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
  }
});
