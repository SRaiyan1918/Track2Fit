# Track2Fit - Health Discipline Web App

![Track2Fit Logo](https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=T2F)

**Track2Fit** is a comprehensive daily health discipline system that helps users track hydration, exercise, nutrition habits, and weight progress. Build consistency through streaks and badges!

## Features

### Core Features

- **Authentication**: Secure Google Sign-In via Firebase Auth
- **User Profile**: Store personal info, calculate BMI, set weight goals
- **Water Tracker**: Track daily hydration with goals and status indicators
- **Exercise Tracker**: Log workouts with sets/reps, track completion
- **Nutrition Tracker**: Daily habit checklist (egg, fruit, protein, custom)
- **Progress Analytics**: Charts for weight history and hydration trends
- **Badge System**: Earn achievements for consistency
- **AI Health Advice**: Rule-based personalized health tips

### Special Features

- **Ramadan Mode**: Special tracking for fasting periods (Sehri/Iftar hydration)
- **Dark/Light Mode**: Toggle between themes
- **Browser Notifications**: Reminders for water and exercise
- **Responsive Design**: Works on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Firebase (Authentication + Firestore)
- **Charts**: Chart.js + react-chartjs-2
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account (free tier works)

### 1. Clone and Install

```bash
git clone <repository-url>
cd track2fit
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Sign-in method → **Google**
4. Enable **Firestore Database** (start in test mode)
5. Go to Project Settings → General → Your apps → Web app
6. Copy the Firebase config object

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Database Structure

The app will automatically create the following collections:

```
users/{userId}
  - uid: string
  - email: string
  - displayName: string
  - photoURL: string
  - name: string
  - weight: number
  - targetWeight: number
  - height: number
  - gender: string
  - age: number
  - createdAt: timestamp
  - updatedAt: timestamp

users/{userId}/dailyLogs/{date}
  - date: string (YYYY-MM-DD)
  - waterIntake: number (ml)
  - waterGoal: number (ml)
  - exercises: object
  - nutrition: object
  - weight: number
  - streak: number
  - ramadanMode: boolean
  - sehriWater: number
  - iftarWater: number

users/{userId}/weightHistory/{docId}
  - weight: number
  - date: string
  - createdAt: timestamp

users/{userId}/badges/{badgeId}
  - id: string
  - name: string
  - description: string
  - category: string
  - awardedAt: timestamp
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard

### Firebase Hosting

1. Install Firebase CLI: `npm i -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Set build directory to `dist`
5. Deploy: `firebase deploy`

## Project Structure

```
src/
├── components/          # React components
│   ├── LoginPage.tsx   # Authentication page
│   ├── Layout.tsx      # Main app layout
│   ├── Dashboard.tsx   # Home dashboard
│   ├── WaterTracker.tsx
│   ├── ExerciseTracker.tsx
│   ├── NutritionTracker.tsx
│   ├── ProgressTracker.tsx
│   ├── Badges.tsx
│   ├── Profile.tsx
│   └── Settings.tsx
├── contexts/           # React context providers
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── DataContext.tsx
├── lib/               # Utilities and Firebase
│   ├── firebase.ts    # Firebase config & functions
│   ├── notifications.ts
│   └── utils.ts
├── types/             # TypeScript types
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Features in Detail

### Water Tracker

- Quick add buttons: +250ml, +500ml, +750ml
- Custom amount input
- Visual progress ring
- Status indicators:
  - < 60%: Mild Dehydration Warning (Red)
  - 60-80%: Good (Yellow)
  - 80-100%: Perfect Hydration (Green)
  - > 100%: Overhydration Warning (Purple)
- Daily reset at midnight
- Weekly hydration chart

### Exercise Tracker

- Default exercises: Squats, Pushups, Plank
- Add custom exercises
- Track sets/reps
- Visual progress indicator
- Streak counter
- Weekly progress chart

### Nutrition Tracker

- Default habits: 1 egg, 1 fruit, protein goal
- Add custom habits
- Checkbox system
- Daily completion percentage

### Ramadan Mode

Toggle in settings or user menu:
- Replaces normal water tracking
- Sehri hydration tracker (before sunrise)
- Iftar hydration tracker (after sunset)
- Special tips for fasting hydration
- Auto-disable after Ramadan

### Badge System

**Hydration Badges:**
- Hydration Beginner (3 days)
- Hydration Warrior (15 days)
- Hydration Master (30 days)

**Exercise Badges:**
- Fitness Starter (3 days)
- Fitness Pro (15 days)
- Fitness Champion (30 days)

**Nutrition Badges:**
- Nutrition Beginner (3 days)
- Protein Pro (10 protein goals)

**Streak Badges:**
- Consistency King (7 days)
- Streak Master (30 days)
- Unstoppable (100 days)

**Special Badges:**
- Ramadan Discipline Star
- All-Rounder (7 days all goals)

### AI Advice Engine

Rule-based system providing:
- Hydration reminders
- Exercise motivation
- Nutrition tips
- Streak encouragement
- Ramadan-specific advice

**To integrate real AI (OpenAI):**

1. Install OpenAI SDK: `npm install openai`
2. Create API route (requires backend)
3. Add your OpenAI API key to environment variables
4. Replace `getHealthAdvice()` in DataContext.tsx

Example integration:
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
});

async function getAIAdvice(userData: UserData) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{
      role: 'system',
      content: 'You are a health advisor. Give brief, encouraging advice.'
    }, {
      role: 'user',
      content: `Hydration: ${userData.hydration}%, Exercise: ${userData.exercise}%, Streak: ${userData.streak} days`
    }]
  });
  return response.choices[0].message.content;
}
```

### Browser Notifications

**Setup:**
1. User must grant permission
2. Configure in Settings:
   - Water reminder interval (1-4 hours)
   - Exercise reminder time
   - Quiet hours

**Features:**
- Water drinking reminders
- Exercise time alerts
- Quiet hours support
- Test notification button

## Security

- Firebase Authentication handles secure sign-in
- Firestore security rules isolate user data
- Environment variables for API keys
- No sensitive data in client-side code

### Recommended Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /dailyLogs/{date} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /weightHistory/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /badges/{badgeId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Customization

### Colors

Edit `tailwind.config.js` to customize:
- Primary colors
- Dark mode colors
- Component variants

### Water Goal Formula

Default: `Weight (kg) × 32.5 ml`

Edit in `src/lib/utils.ts`:
```typescript
export function calculateWaterGoal(weight: number): number {
  // Customize formula here
  return Math.round(weight * 35); // More aggressive
}
```

### Default Exercises

Edit in `src/components/ExerciseTracker.tsx`:
```typescript
const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'squats', name: 'Squats', targetSets: 3, targetReps: 15, completedSets: 0 },
  // Add or modify exercises
];
```

## Troubleshooting

### Common Issues

**Firebase Auth not working:**
- Check environment variables
- Enable Google Sign-In in Firebase Console
- Add authorized domain in Firebase

**Notifications not showing:**
- Browser must support notifications (Chrome, Firefox, Safari)
- User must grant permission
- Check quiet hours settings

**Charts not rendering:**
- Ensure Chart.js is installed
- Check browser console for errors

**Dark mode not persisting:**
- Check localStorage permissions
- Verify ThemeContext is wrapping app

## Future Roadmap

### Version 2.0 Ideas

- [ ] Social features (friends, leaderboards)
- [ ] Meal logging with photo capture
- [ ] Sleep tracking integration
- [ ] Step counter (mobile sensors)
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Export data to CSV/PDF
- [ ] Multiple language support
- [ ] AI-powered meal suggestions
- [ ] Integration with fitness devices (Fitbit, Apple Health)
- [ ] Custom theme colors

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - feel free to use for personal or commercial projects.

## Support

For issues or questions:
- Open a GitHub issue
- Email: support@track2fit.app

---

**Built with ❤️ for better health habits**
