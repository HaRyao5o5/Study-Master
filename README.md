# Study Master 📚

**Study Master** is a modern, feature-rich learning management web application built with React + Firebase. Create custom quizzes, track your progress with gamification elements, and study smarter with AI-powered features.

![Version](https://img.shields.io/badge/version-2.17.0-blue)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-12.8-FFCA28?logo=firebase)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 📝 Learning Features
- **Multiple Question Types**: Single choice, multiple choice, and text input questions
- **Image Support**: Add images to questions via URL or file upload (auto-optimized)
- **Smart Quiz Modes**: Randomized questions, shuffled options, instant/batch feedback
- **Review Mode**: Automatically practice only the questions you got wrong
- **Mock Exams**: Test yourself with randomly generated comprehensive tests
- **Explanations**: Add explanations to help understand the correct answers

### 🎮 Gamification
- **XP & Leveling System**: Earn experience points for every quiz completed
- **Streak Tracking**: Build daily study habits with consecutive day tracking
- **Achievements**: Unlock special titles and badges
- **Global Leaderboard**: Compete with other users worldwide (Top 50)

### 🤖 AI Integration
- **AI Quiz Generation**: Generate quiz questions from text using Gemini API
- **Smart Content Creation**: Automatically convert study materials into quizzes

### ☁️ Cloud Sync & Sharing
- **Google Authentication**: Sync your data across all devices
- **Firebase Cloud Storage**: Unlimited data storage with real-time sync
- **Share Courses**: Share your courses with friends via public or unlisted links
- **Import/Export**: Backup and restore your data as JSON files

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful, modern interface with transparency effects
- **Dark Mode**: Fully supported with system preference detection
- **Responsive**: Works seamlessly on desktop, tablet, and mobile
- **PWA Ready**: Install as a native app on any device
- **Animations**: Smooth transitions and visual feedback
- **Sound Effects & TTS**: Audio feedback and text-to-speech support

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **Firebase Project** (for cloud features)
- **Gemini API Key** (optional, for AI quiz generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HaRyao5o5/Study-Master.git
   cd Study-Master
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Gemini AI (Optional)
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

   > **Note**: You can find your Firebase credentials in the [Firebase Console](https://console.firebase.google.com/)

4. **Configure Firestore Security Rules**
   
   Go to Firebase Console → Firestore Database → Rules, and add:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users collection
       match /users/{userId} {
         allow read: if true;  // Anyone can read for leaderboard
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Courses collection (shared courses)
       match /courses/{courseId} {
         allow read: if true;  // Anyone with link can view
         allow write: if request.auth != null;
       }
     }
   }
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## 📁 Project Structure

```
Study-Master/
├── src/
│   ├── components/       # Reusable React components
│   │   ├── common/       # Shared UI components (Toast, Breadcrumbs, etc.)
│   │   ├── course/       # Course-related components
│   │   ├── editor/       # Quiz editor components
│   │   ├── game/         # Quiz game components
│   │   └── layout/       # Layout components (Settings, Stats, etc.)
│   ├── config/           # Configuration files
│   │   └── constants.js  # App-wide constants
│   ├── context/          # React Context providers
│   │   ├── AppContext.jsx     # Global app state
│   │   └── ToastContext.jsx   # Toast notifications
│   ├── data/             # Static data files
│   │   └── changelog.js  # Version changelog
│   ├── hooks/            # Custom React hooks
│   │   └── useAppData.js # Main data management hook
│   ├── lib/              # External service integrations
│   │   └── firebase.js   # Firebase configuration
│   ├── pages/            # Page components (routes)
│   ├── utils/            # Utility functions
│   │   ├── cloudSync.js  # Firebase sync logic
│   │   ├── fileIO.js     # Import/export functions
│   │   ├── gamification.js # XP & leveling logic
│   │   ├── gemini.js     # AI quiz generation
│   │   ├── helpers.js    # General helpers
│   │   ├── imageUtils.js # Image processing
│   │   └── sound.js      # Sound effects & TTS
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # App entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── .env                  # Environment variables (create this)
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

---

## 🧪 Testing

Run tests with Vitest:

```bash
npm run test
```

---

## 🔧 Technologies Used

- **Frontend Framework**: React 19.2 with Hooks
- **Build Tool**: Vite 7.2
- **Styling**: TailwindCSS 3.4
- **Routing**: React Router 7.12
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI Integration**: Google Gemini API
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library
- **PWA**: vite-plugin-pwa

---

## 📖 Usage Guide

### Creating a Course

1. Click **+ 新しい科目** (New Subject) on the home screen
2. Enter the course name and description
3. Choose visibility (Private / Public / Unlisted)

### Creating a Quiz

1. Open a course
2. Click **問題を作成** (Create Quiz)
3. Add questions with different types:
   - Single Choice (単一選択)
   - Multiple Choice (複数選択)
   - Text Input (記述式)
4. Optionally add images and explanations
5. Save the quiz

### AI Quiz Generation

1. Open a course
2. Click **AI 作成** (AI Create)
3. Enter your study material or topic
4. The AI will generate quiz questions automatically

### Taking a Quiz

1. Select a quiz from the course
2. Configure options (randomize, shuffle, instant feedback)
3. Start the quiz
4. Review your results and earn XP!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License.

---

## 👤 Author

**HaRyao5o5**

- GitHub: [@HaRyao5o5](https://github.com/HaRyao5o5)

---

## 🙏 Acknowledgments

- Google Gemini API for AI quiz generation
- Firebase for backend services
- Lucide React for beautiful icons
- The React and Vite communities

---

## 📝 Changelog

See [CHANGELOG.md](src/data/changelog.js) for detailed version history.

**Latest Version: v2.17.0** (2026-01-24)
- Toast notification system implementation
- Image file upload with auto-optimization
- Multiple correct answers for text input questions
- Enhanced image preview functionality
- Bug fixes for quiz playback and sharing

---

## 💡 Support

If you find this project helpful, please consider giving it a ⭐️!

For questions or issues, please open an issue on GitHub.
