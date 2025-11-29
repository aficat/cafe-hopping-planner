# ☕ Cafe Hopping Planner

A beautiful Progressive Web App for planning your perfect cafe hopping adventure in Singapore! Find cafes, create routes, optimize your journey, and share your plans with friends.

## ✨ Features

- **Search & Discover**: Search for cafes, filter by cuisine, halal options, and price range
- **Popular Cafes**: See what's trending in Singapore
- **Nearby Cafes**: Find cafes near your location
- **Plan Builder**: Create your perfect cafe route with drag-and-drop reordering
- **Route Optimization**: Automatically optimize your route for shortest travel time
- **Map View**: Visualize your route on an interactive map
- **Surprise Plans**: Generate random cafe routes for spontaneous adventures
- **Save & Share**: Save your plans and share them with friends
- **Notes & Details**: Add notes, set start times, and choose transport modes

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cafe-hopping-planner
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📱 PWA Features

This app is a Progressive Web App (PWA), which means:
- Installable on mobile devices and desktops
- Works offline (with service worker)
- Fast and responsive
- App-like experience

## 🎨 Design Theme

The app features a cutesy, Gen Z aesthetic with:
- Pink and purple gradient ribbons
- Playful animations
- Modern, clean UI
- Mobile-first responsive design

## 🛠️ Tech Stack

- **React 18** - UI framework
- **React Router** - Navigation
- **Vite** - Build tool
- **@dnd-kit** - Drag and drop functionality
- **Leaflet** - Map visualization
- **PWA Plugin** - Progressive Web App support

## 📂 Project Structure

```
src/
├── components/       # Reusable components
├── screens/         # Screen components
├── data/           # Mock data and data utilities
├── utils/          # Utility functions (storage, route optimization)
└── App.jsx         # Main app component
```

## 🎯 Usage

1. **Browse Cafes**: Start on the home screen to see popular cafes
2. **Search & Filter**: Use the search bar and filters to find specific cafes
3. **View Details**: Click on any cafe to see full details
4. **Add to Plan**: Add cafes to your day plan
5. **Build Route**: Go to "My Plan" to reorder cafes with drag-and-drop
6. **Optimize**: Click "Optimize Route" to automatically arrange cafes by distance
7. **View Map**: See your route visualized on a map
8. **Save & Share**: Save your plan or share it with friends

## 🔧 Customization

### Adding More Cafes

Edit `src/data/mockData.js` to add more cafes to the mock data.

### Changing Theme Colors

Modify the CSS variables in `src/index.css`:
- `--primary-pink`: Main pink color
- `--accent-purple`: Accent purple color
- `--light-pink`: Light background color

## 📝 Notes

- This is a prototype using mock data
- Location services require user permission
- Plans are stored in browser localStorage
- Map uses OpenStreetMap tiles
- PWA icons (pwa-192x192.png, pwa-512x512.png) need to be added to the `public` folder for full PWA functionality

## 🐛 Known Limitations

- Uses mock cafe data (not connected to real API)
- Route optimization uses simplified distance calculations
- Sharing links are base64 encoded (not production-ready)
- No backend - all data stored locally

## 🚧 Future Enhancements

- Connect to real cafe APIs
- User authentication
- Cloud storage for plans
- Social features (follow friends, share reviews)
- Real-time route optimization with traffic data
- Cafe reviews and ratings from users

## 📄 License

MIT License - feel free to use this project for learning and building!

---

Made with ❤️ and lots of ☕

