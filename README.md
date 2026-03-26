#Clipart AI — Android App
Transform your photos into stunning AI-generated clipart styles.

## APK Download
[Download APK](PASTE_YOUR_DRIVE_LINK_HERE)

## Screen Recording
[Watch Walkthrough](PASTE_YOUR_DRIVE_LINK_HERE)

## 🛠Tech Stack
- React Native (Expo)
- NativeWind (Tailwind for RN)
- Replicate API (stability-ai/sdxl)
- Cloudinary (image hosting)
- Vercel (secure API proxy)

## Features
- Upload photo from gallery or camera
- Generate 5 styles in parallel (Cartoon, Anime, Flat, Pixel Art, Sketch)
- Skeleton loaders during generation
- Before/After comparison slider
- Download to gallery
- Native share sheet

## ⚙️Setup Steps
1. Clone the repo
2. Run `npm install`
3. Create `.env` with:
   - EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME
   - EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET
   - EXPO_PUBLIC_API_URL
4. Run `npx expo start`

## 🛠Tech Decisions
- Chose Replicate over OpenAI for better image-to-image models
- Vercel proxy keeps API keys off the device
- Cloudinary unsigned preset for fast mobile uploads
- Parallel Promise.all() for all 5 styles simultaneously

## Tradeoffs
- Generation takes 30-60s per style (Replicate cold starts)
- Used emoji instead of icon library for web compatibility
- Vercel free tier has 60s timeout which fits generation window
