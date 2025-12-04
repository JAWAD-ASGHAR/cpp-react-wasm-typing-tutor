# 🚀 How to Start - Quick Guide

## ✅ If Everything is Already Set Up

Your project looks ready! Just run:

```bash
cd /Users/jawadasghar/Desktop/cpp-react-wasm-typing-tutor
npm run dev
```

Then open your browser to the URL shown (usually `http://localhost:5173`)

---

## 📋 Step-by-Step Instructions

### 1. Open Terminal

Navigate to your project:
```bash
cd /Users/jawadasghar/Desktop/cpp-react-wasm-typing-tutor
```

### 2. Install Dependencies (If Needed)

```bash
npm install
```

*(Skip if you see "node_modules" folder already exists)*

### 3. Check WASM Files

Make sure these files exist in `public/` folder:
- `public/typing.js`
- `public/typing.wasm`

If missing, build them:
```bash
# First activate Emscripten
source ~/emsdk/emsdk_env.sh

# Then build
make
cp typing.js typing.wasm public/
```

### 4. Start the App

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 5. Open in Browser

Click the link or go to `http://localhost:5173`

---

## 🏆 Leaderboard Setup (Optional)

The app works without the leaderboard! But if you want it:

1. **Create `.env` file** (if you haven't):
   - Copy `.env.example` to `.env`
   - Or create `.env` with:
     ```env
     VITE_SUPABASE_URL=your-url-here
     VITE_SUPABASE_ANON_KEY=your-key-here
     ```

2. **Set up Supabase** (see `SUPABASE_SETUP.md`)

3. **Restart the server** after updating `.env`

---

## ❌ Troubleshooting

**"Port 5173 already in use"**
- Vite will use the next available port automatically
- Check the terminal for the new URL

**"WASM not loading"**
- Check `public/typing.js` and `public/typing.wasm` exist
- Rebuild: `make && cp typing.js typing.wasm public/`

**"emcc: command not found"**
- Activate Emscripten: `source ~/emsdk/emsdk_env.sh`
- See `QUICKSTART.md` for full Emscripten setup

**"Module not found"**
- Run: `npm install`

---

## 🎯 That's It!

Once you run `npm run dev`, the app will be running. Just open your browser!

