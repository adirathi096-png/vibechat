# VibeChat - Social Music & Chat MVP

VibeChat is a premium, mobile-first social music + chat application designed for Android/iOS environments. Users can share vibes, post song highlights, discover other profiles, message in realtime, and host public audio lounges.

---

## Tech Stack

- **Frontend Core**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (v4) with Outfit & Inter typography
- **State Management**: Zustand (Auth, Session, and Profile storage)
- **Database & Backend**: Supabase (PostgreSQL, Auth, RLS Policies, and Realtime WebSocket Channel)
- **Icons**: Lucide React

---

## Project Structure

```
src/
├── components/
│   ├── common/         # Buttons, inputs, and feedback spinners
│   └── layout/
│       └── AppLayout.tsx  # Desktop centering shell & bottom navigation
├── hooks/
│   ├── useAuth.ts      # Auth state hooks (Zustand session tracker)
│   └── useProfile.ts   # Profile completion & edit helper
├── lib/
│   └── supabase.ts     # Supabase client instantiation
├── pages/
│   ├── Splash.tsx      # Landing page session router
│   ├── Login.tsx       # Auth Sign In screen
│   ├── SignUp.tsx      # Auth Register screen
│   ├── ForgotPassword.tsx # Password recovery screen
│   ├── CompleteProfile.tsx # Onboarding user profile completion
│   ├── Home.tsx        # Dashboard showing stories & widget lists
│   ├── Chats.tsx       # Conversation thread explorer
│   ├── ChatRoom.tsx    # Live messaging chat container (Supabase Realtime)
│   ├── Discover.tsx    # Friend explorer & request triggers
│   ├── Music.tsx       # Vibe feed & song publisher
│   ├── Voice.tsx       # Audio loungs creator and listener
│   ├── Profile.tsx     # Display user profile & stats counters
│   └── Settings.tsx    # Preferences & Theme switches
├── routes/
│   ├── AppRoutes.tsx   # React Router maps
│   └── ProtectedRoute.tsx # Route authentication/profile guards
├── types/
│   └── index.ts        # TypeScript database declarations
├── App.tsx             # Context entry point
└── main.tsx            # DOM mounting entry point
```

---

## Setup & Running Locally

### 1. Environment Configuration
Create a `.env` file in the root directory and specify your Supabase keys (use `.env.example` as a template):
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Supabase SQL Setup
Execute the SQL files inside your Supabase project's SQL Editor in the following order:
1. `supabase/schema.sql`: Sets up all profiles, conversations, messaging, vibes, and voice tables.
2. `supabase/policies.sql`: Configures Row-Level Security (RLS) policies to isolate user communications.
3. `supabase/seed_optional.sql` (Optional): Seeds mock profiles (`mia.vibes`, `james.synth`, etc.) to ease local testing without creating bot users.

### 3. Local Commands
To install packages and run the application on your computer:
```bash
# Install dependencies
npm install

# Run the dev server locally
npm run dev

# Verify types and compilation (lint script)
npm run lint

# Build the production bundle
npm run build
```

---

## Staging & Screen Verification Guide

### 1. Session Redirects & Complete Profile
- Navigate to `http://localhost:3000`. The **Splash screen** checking logic executes. Since no session exists, you are redirected to `/login`.
- Click "Sign up" and fill in your registration.
- Once registered (and confirmed, if email confirmation is turned on), log in.
- The router detects `profile_completed: false` and redirects you to `/complete-profile`.
- Complete the form. Try typing spaces in the username input—they are automatically stripped and lowercase is enforced. Tap on an avatar preset to change your photo.
- Save and finish. You are redirected to `/app/home`.

### 2. Vibes and Music Feed
- Go to the **Music tab** (Music icon in bottom nav).
- Click "Share Vibe". Type a song title, artist, and mood.
- Click "Publish Vibe". The cover photo is dynamically assigned a premium high-quality image matching the mood. It is uploaded to Supabase, prepends to the feed, and updates.
- Tap the **Heart icon** to favorite a vibe—it is saved in your local favorites list.
- Tap **Chat Vibe** on other users' vibes to start a direct thread with them about their song choice.

### 3. Audio loungs Lounges
- Go to the **Voice tab**.
- Tap "Host Lounge" to open the live hosting modal. Give the lounge a topic and details.
- Tap "Go Live Now". The lounge details are posted to Supabase, and you are automatically joined as the Host.
- The persistent drawer pops up at the bottom. You can tap the **Mute button** placeholder to toggle microphone statuses.
- Tapping **End** ends the lounge, cleaning up all active member rows in the database.

---

## Future Capacitor Android Notes (Play Store Deploy)

To package this VibeChat application for the Google Play Store using **Capacitor**:

1. **Install Capacitor CLI & Android Core**:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init VibeChat com.vibechat.app --web-dir=dist
   npm install @capacitor/android
   npx cap add android
   ```

2. **Sync the Production Build**:
   Each time you build the React app, synchronize files to the Android project folder:
   ```bash
   npm run build
   npx cap sync
   ```

3. **Open Android Studio to Compile the APK**:
   ```bash
   npx cap open android
   ```
   - In Android Studio, select **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate the test file.
   - For publishing, configure App Signing keys and select **Generate Signed Bundle / APK** to create the `.aab` package for the Play Console.

4. **Permissions Check**:
   For voice and camera streaming integration in Android, add the following requests to `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.RECORD_AUDIO"/>
   <uses-permission android:name="android.permission.CAMERA"/>
   <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>
   ```
