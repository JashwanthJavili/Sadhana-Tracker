# 🙏 Sadhana Lifeforce

**A spiritual productivity tracker for ISKCON devotees**

Track your daily sadhana practice, spiritual metrics, and personal development with real-time cloud sync.

---

## ✨ Features

- 📅 **Daily Planning** - Set commitments and track completion
- ⏰ **Timeline Management** - Hour-by-hour activity tracking
- 📊 **Spiritual Metrics** - Chanting rounds, study hours, sleep, mood, and more
- 📝 **Reflections** - Daily self-reflection and improvement planning
- 📈 **Analytics** - Visual insights and progress trends
- ☁️ **Cloud Sync** - Firebase Realtime Database integration
- 🎨 **Customizable** - Personalize quotes, center name, spiritual guide
- 🌐 **Multi-language** - English, Hindi, Telugu support
- 🎯 **Guided Tour** - Interactive walkthrough for new users

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Firebase account
- Google account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JashwanthJavili/Sadhana-Tracker.git
   cd Sadhana-Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   VITE_FIREBASE_DATABASE_URL=your_database_url_here
   VITE_FIREBASE_PROJECT_ID=your_project_id_here
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
   ```

4. **Configure Firebase**
   
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing
   - Enable **Realtime Database**
   - Enable **Google Authentication** in Authentication → Sign-in method
   - Deploy database rules from `database.rules.json`

5. **Run the app**
   ```bash
   npm run dev
   ```

   Open http://localhost:3000

---

## 🔐 Security

- ✅ All Firebase credentials are stored in environment variables
- ✅ Database rules ensure user data isolation
- ✅ Google OAuth for secure authentication
- ✅ No secrets committed to repository

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Backend:** Firebase Realtime Database
- **Authentication:** Firebase Auth (Google)
- **Charts:** Recharts
- **Icons:** Lucide React

---

## 📱 Usage

1. **Sign in** with Google account
2. **Complete onboarding** - Set your name, spiritual guide, center
3. **Plan your day** - Add commitments and timeline
4. **Track metrics** - Log spiritual and personal metrics
5. **Reflect** - Daily self-reflection
6. **Analyze** - View progress and trends

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 👨‍💻 Developer

**Javili Jashwanth**
- Guided by: HG Pranavananda Das Prabhuji

---

## 📄 License

This project is for the ISKCON community.

---

## 🙏 Dedication

*Hare Krishna Hare Krishna Krishna Krishna Hare Hare*  
*Hare Rama Hare Rama Rama Rama Hare Hare*

Made with ❤️ for devotees worldwide

---

## 📞 Feedback

Share your feedback: [Feedback Form](https://forms.zohopublic.in/jashwanthjashu684gm1/form/SadhanaTracerFeedbackForm/formperma/KOoeajQ20c3B6YQ6Bmmy76hxc3xkOC9-BAc-Lu7GEjU)
