# 🚀 Production Deployment Guide: 'Drop' Mobile App

Since you are using **Expo**, the most professional way to build and deploy your app for real-world use is through **EAS (Expo Application Services)**. 

### Prerequisites
1.  **Expo Account**: Create one at [expo.dev](https://expo.dev/) if you don't have one.
2.  **EAS CLI**: Install it on your computer:
    ```bash
    npm install -g eas-cli
    ```

---

### Step 1: Initialize Production Setup
Open your terminal in the `mobile` folder and login:
```bash
eas login
eas build:configure
```
This will create an `eas.json` file in your project.

### Step 2: Configure for Android Build (APK)
Modify your newly created `eas.json` to allow downloading an APK directly for testing on your phone:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

### Step 3: Verify Production API
Ensure your `mobile/src/api/client.js` is pointing to your live Render server:
```javascript
baseURL: 'https://college-management-mjul.onrender.com/api'
```
> [!IMPORTANT]
> Your backend must be running and the database must be accessible from the internet (Render + Supabase/Railway) for the production app to work.

### Step 4: Build your APK/App
Run the following command in the `mobile` directory to start the build on Expo's servers:

**For a testable APK (Android):**
```bash
eas build -p android --profile preview
```

**For official Play Store / App Store (Production):**
```bash
# Android
eas build -p android --profile production

# iOS (Requires Apple Developer account)
eas build -p ios --profile production
```

### Step 5: Download & Install
Once the build is complete (usually takes 5-10 minutes):
1.  Expo will provide a **link** to download the file.
2.  Scan the QR code with your phone to download the APK.
3.  Install it on your Android device!

---

### Pro Tips for Production:
1.  **Icon & Splash**: Make sure you have high-quality versions of `assets/icon.png` and `assets/splash-icon.png`.
2.  **Version**: Update the `"version": "1.0.0"` in `app.json` every time you release a new update.
3.  **App Name**: You can change `"name": "Drop"` in `app.json` to any name you want to see on your phone's home screen.
