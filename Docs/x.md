🔍 8 Bugs Found & Fixed
Critical Fixes (App Crashing After Login)
#	Bug	Root Cause	Fix
🔴 1	Crash after login	Two duplicate useEffect hooks creating separate socket.io connections + avalanche of simultaneous API calls overwhelming the app	Merged into single unified socket + staggered data loading
🔴 2	Intro video (drop.mp4) not working	expo-av Video component fails silently on many Android APK builds	Added animated Image fallback — tries video first, falls back to a branded logo animation
🔴 3	Push notifications broken	attendance.js imported sendPushNotifications (plural) but the export is sendPushNotification (singular) → TypeError: not a function	Fixed import name in attendance.js
Important Fixes
#	Bug	Root Cause	Fix
🟡 4	Project ID mismatch	app.json had different project IDs in eas.projectId vs updates.url, and App.js had a third hardcoded fallback	Unified all IDs to f1700831-6a33-498e-9058-501039a99a14
🟡 5	<LoadingScreen /> undefined	Component referenced on lines 400 & 468 but never defined → runtime crash during login	Replaced with inline ActivityIndicator
🟡 6	Calendar icon missing	Not in the import statement but used in nav tabs and empty assignments screen	Added to import
🟡 7	Double API calls	fetchAssignments and fetchContacts each called in 2 separate useEffect hooks	Removed duplicates, kept only lazy-load approach
🟢 8	objectFit: 'contain'	Invalid React Native style property	Changed to resizeMode="contain" prop
