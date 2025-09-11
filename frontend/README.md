# 🧘 AI Mental Health Companion - React Web Frontend

This is the **React web frontend** that replaces the original React Native/Expo frontend. It provides the same features with full web compatibility.

## 🚀 **Features**

* ✔️ **Welcome/Onboarding Flow** - Interactive introduction to the app
* ✔️ **Authentication** - Sign in/sign up pages (ready for integration)
* ✔️ **Home Dashboard** - Time-based greetings and quick actions
* ✔️ **AI Chat Companion** - Real-time chat with typing animation and conversation history
* ✔️ **Digital Journaling** - Create and view journal entries by date
* ✔️ **Guided Meditation** - Timer-based sessions with ambient sound options
* ✔️ **Mood Tracking** - Integrated mood selection across all features
* ✔️ **Responsive Design** - Works on desktop, tablet, and mobile browsers

## 🛠 **Tech Stack**

- **Framework**: React 19 with TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Build Tool**: CRACO (Create React App Configuration Override)
- **HTTP Client**: Axios for API calls
- **Authentication**: Ready for Clerk integration (or custom auth)
- **Calendar**: React Calendar for date selection
- **Modal**: React Modal for popups

## 📋 **Setup Instructions**

### Prerequisites
- Node.js 16+ and npm
- Backend server running on `http://192.168.0.102:8000`

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure backend URL** (if different):
   Edit `src/config/config.ts`:
   ```typescript
   export const API_BASE_URL = 'http://your-backend-url:8000';
   ```

3. **Add meditation audio files** (optional):
   Place MP3 files in `public/sounds/`:
   - `beach.mp3`
   - `serene.mp3` 
   - `river.mp3`
   - `forest.mp3`
   - `waterfall.mp3`
   - `stars.mp3`

### Development

```bash
# Start development server (http://localhost:3000)
npm start

# Build for production
npm run build

# Serve production build locally
npm install -g serve
serve -s build
```

## 🌐 **API Integration**

The frontend integrates with the FastAPI backend using these endpoints:

- **POST `/chat/`** - Send chat messages
- **GET `/conversations/?date=YYYY-MM-DD`** - Get conversation history
- **POST `/journal/`** - Save journal entries  
- **GET `/journal/?date=YYYY-MM-DD`** - Get journal entries
- **GET `/receive_hello/`** - Health check

## 🎨 **Design System**

**Colors**:
- `dark`: #253334 (primary background)
- `light`: #D1EAEC (primary text) 
- `medium`: #708A8C (secondary text/borders)

**Typography**: Plus Jakarta Sans font family

**Components**:
- `CustomButton` - Consistent button styling with variants
- `InputField` - Form inputs with proper focus states
- `MoodModal` - Mood selection popup
- `AnimatedBackground` - Meditation screen animations
- `Navigation` - Bottom tab navigation

## 📱 **Pages & Routes**

- `/welcome` - Onboarding swiper
- `/signin` - Login page
- `/signup` - Registration page  
- `/home` - Dashboard with greetings and quick actions
- `/chat` - AI chat companion
- `/journal` - Digital journaling
- `/meditate` - Guided meditation

## 🔧 **Customization**

**Backend URL**: Update `API_BASE_URL` in `src/config/config.ts`

**Theme Colors**: Modify `tailwind.config.js` colors section

**Authentication**: Replace sign in/up logic in auth pages with your preferred provider (Clerk, Auth0, Firebase, etc.)

**Audio Files**: Add your own meditation sounds to `public/sounds/`

## 🚀 **Deployment**

### Production Build
```bash
npm run build
```

### Deploy to Static Hosting
The `build/` folder can be deployed to:
- Netlify
- Vercel  
- AWS S3 + CloudFront
- GitHub Pages
- Any static web hosting service

### Deploy with Docker
```dockerfile
FROM nginx:alpine
COPY build/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📋 **Development Notes**

- The app runs on `http://localhost:3000` in development
- Backend integration is ready - just ensure the backend is running
- ESLint warnings are present but don't break functionality
- Mobile-responsive design works across all screen sizes
- Calendar component requires date strings in `YYYY-MM-DD` format

## 🔄 **Migration from React Native**

This web app maintains **100% feature parity** with the original React Native version:

- ✅ Same screen layouts and navigation flow
- ✅ Same API contracts and data structures  
- ✅ Same styling and color scheme
- ✅ Same user interactions and animations
- ✅ Same mood tracking integration
- ✅ Same meditation timer functionality

**Key Changes**:
- React Navigation → React Router
- React Native components → HTML/CSS
- Expo Audio → HTML5 Audio
- NativeWind → Tailwind CSS
- Expo secure storage → localStorage (for simple data)
