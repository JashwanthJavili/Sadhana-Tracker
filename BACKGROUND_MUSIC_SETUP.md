# Background Music Setup Guide

## How to Add Hare Krishna Mantra Audio

### Option 1: Use Local Audio File (Recommended)

1. **Download** a Hare Krishna mantra MP3 file
   - Recommended: Search for "Hare Krishna Maha Mantra" on YouTube
   - Use a YouTube to MP3 converter
   - Or download from: https://www.iskcon.org/audio/

2. **Add to your project**:
   - Create a folder: `public/audio/`
   - Place your MP3 file there, name it: `hare-krishna-mantra.mp3`

3. **Update the component**:
   - The code is already set to use: `/audio/hare-krishna-mantra.mp3`
   - No changes needed if you follow the naming above

### Option 2: Use Online URL

If you have a reliable CDN link to a Hare Krishna mantra:

1. Open `components/BackgroundMusic.tsx`
2. Find line with `src="..."`
3. Replace with your URL:
   ```tsx
   <source 
     src="YOUR_HARE_KRISHNA_MANTRA_URL_HERE" 
     type="audio/mpeg" 
   />
   ```

### Features Included:

✅ **Auto-play**: Starts after first user interaction (browser requirement)
✅ **Loop**: Plays continuously
✅ **Volume Control**: Slider to adjust volume (default 30%)
✅ **Mute/Unmute**: Toggle button with preference saving
✅ **Persistent Settings**: Remembers if user muted the music
✅ **Beautiful UI**: Floating control panel in bottom-right corner
✅ **Mobile Responsive**: Works on all devices

### Current Behavior:

- **When**: Plays when user is logged in
- **Where**: Available on all pages
- **Default Volume**: 30% (not too loud)
- **User Control**: Full control via floating panel
- **Persistence**: User's mute preference saved in localStorage

### Testing:

1. Login to the app
2. Click anywhere on the page (browser auto-play requirement)
3. Music should start playing
4. Look for floating music control in bottom-right corner
5. Test play/pause, volume, and mute buttons

### Customization:

To change default volume, edit `BackgroundMusic.tsx` line:
```tsx
const [volume, setVolume] = useState(0.3); // 0.3 = 30%
```

To disable auto-play:
```tsx
<BackgroundMusic autoPlay={false} />
```

### File Structure:
```
sadhana-lifeforce/
├── public/
│   └── audio/
│       └── hare-krishna-mantra.mp3  ← Add your file here
├── components/
│   └── BackgroundMusic.tsx          ← Music player component
└── App.tsx                          ← Component is added here
```
