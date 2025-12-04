# How to Start and Make It Work

Follow these steps to get your typing tutor app running:

## Quick Start (If Everything is Already Built)

If you've already built the WebAssembly files and installed dependencies:

```bash
# 1. Make sure you're in the project directory
cd /Users/jawadasghar/Desktop/cpp-react-wasm-typing-tutor

# 2. Install/update dependencies (if needed)
npm install

# 3. Start the development server
npm run dev
```

Then open your browser to the URL shown (usually `http://localhost:5173`)

---

## Full Setup (First Time)

### Step 1: Install Dependencies

```bash
cd /Users/jawadasghar/Desktop/cpp-react-wasm-typing-tutor
npm install
```

### Step 2: Build WebAssembly Files (If Not Already Built)

**First, activate Emscripten:**
```bash
source ~/emsdk/emsdk_env.sh
```

**Then build:**
```bash
make
cp typing.js typing.wasm public/
```

### Step 3: Start the App

```bash
npm run dev
```

The app will start at `http://localhost:5173` (or another port if 5173 is taken).

---

## Setting Up Leaderboard (Optional)

1. **Get Supabase credentials:**
   - Go to [supabase.com](https://supabase.com) and create a free account
   - Create a new project
   - Go to Project Settings > API
   - Copy your Project URL and anon/public key

2. **Update `.env` file:**
   ```bash
   # Edit .env file and replace with your actual values:
   VITE_SUPABASE_URL=https://your-actual-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

3. **Set up database:**
   - In Supabase dashboard, go to SQL Editor
   - Copy and paste the SQL from `supabase-schema.sql`
   - Run it to create the leaderboard table

4. **Restart the dev server:**
   ```bash
   # Stop the server (Ctrl+C) and restart:
   npm run dev
   ```

---

## Troubleshooting

### "emcc: command not found"
- Activate Emscripten first: `source ~/emsdk/emsdk_env.sh`
- Or install Emscripten (see QUICKSTART.md)

### "WASM not loading"
- Make sure `typing.js` and `typing.wasm` are in the `public/` directory
- Rebuild: `make && cp typing.js typing.wasm public/`

### "Dependencies not found"
- Run: `npm install`

### Port already in use
- Vite will automatically use the next available port
- Check the terminal for the actual URL

### Leaderboard not working
- Check that `.env` file has correct Supabase credentials
- Make sure you ran the SQL schema in Supabase
- Check browser console for errors

---

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Rebuild WebAssembly (after activating Emscripten)
make && cp typing.js typing.wasm public/
```

---

## That's It!

Once the dev server is running, open your browser and start typing! 🎉

