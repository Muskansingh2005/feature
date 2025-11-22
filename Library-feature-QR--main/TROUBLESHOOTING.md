# 🔧 Complete Setup & Troubleshooting Guide

## ✅ Issues Fixed

### 1. **JSON Parse Error**

- **Cause**: Frontend was trying to parse HTML as JSON
- **Reason**:
  - Backend routes weren't properly registered
  - API interceptor was missing success handler
  - AddBook.jsx had code executing at module level
- **Fixed**:
  - ✅ Added transaction routes to backend
  - ✅ Fixed API interceptor
  - ✅ Removed problematic module-level code
  - ✅ Added Vite proxy configuration

### 2. **Video Element Not Found**

- **Cause**: QR scanner initializing before DOM element was ready
- **Fixed**: ✅ Added DOM existence check in ScanQR component

### 3. **MyBooks Dropdown Issue**

- **Cause**: Typo `s._1` instead of `s._id`
- **Fixed**: ✅ Corrected to `s._id`

---

## 🚀 Complete Setup Steps

### Step 1: Install Dependencies

```bash
# Terminal 1 - Backend
cd Backend
npm install

# Terminal 2 - Frontend
cd Frontend
npm install
```

### Step 2: Configure Environment Variables

**Backend** - Already configured in `.env`:

```properties
MONGO_URI=mongodb+srv://Muskan_Singh:muskan2005@cluster0.rhlju9l.mongodb.net/?appName=Cluster0
PORT=5000
JWT_SECRET=e398d39f1f52f94dc4b0f56969ad925b83eb749fc210a20d2c1605109bd1434a
QR_SECRET=af5d7aadbffa225e658a57e2c0842b2590c09d7d214d1aca8c1f4a1def82faa8bcf3fba8a2236eeee98b750476b8424653332fdb2e798807a5a3687b58bb206e
VITE_API_URL=http://localhost:5000/api
```

**Frontend** - Created `.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Start Backend

```bash
cd Backend
npm run dev
# or: node server.js
# or: npm start
```

✅ You should see: `🚀 Server running on port 5000`

### Step 4: Start Frontend (in new terminal)

```bash
cd Frontend
npm run dev
```

✅ You should see: `VITE v7.1.7 ready in XXX ms`

### Step 5: Open Browser

- Go to `http://localhost:5173`
- Check the console for errors
- All API calls should now work!

---

## 🧪 Testing Each Feature

### Test API Connectivity

Open browser DevTools Console and run:

```javascript
// Test if API is responding
fetch("http://localhost:5000/api/students")
  .then((r) => r.json())
  .then((d) => console.log("✅ API Working:", d))
  .catch((e) => console.error("❌ API Error:", e));
```

### Test Each Endpoint

```javascript
// Books
fetch("http://localhost:5000/api/books")
  .then((r) => r.json())
  .then((d) => console.log("Books:", d));

// Students
fetch("http://localhost:5000/api/students")
  .then((r) => r.json())
  .then((d) => console.log("Students:", d));

// Transactions
fetch("http://localhost:5000/api/transactions")
  .then((r) => r.json())
  .then((d) => console.log("Transactions:", d));
```

---

## 🐛 Debugging Tips

### If you still get JSON Parse Error:

1. **Check Backend is Running**

   - Open `http://localhost:5000` in browser
   - Should show: `📚 Library Management Backend Running`

2. **Check Console Errors**

   - Press F12 in browser
   - Look at Console tab
   - Network tab shows actual API responses

3. **Check Network Requests**

   - In DevTools, go to Network tab
   - Click on API request
   - Look at Response tab
   - Should be JSON, not HTML

4. **Clear Cache**
   ```bash
   # Frontend
   npm run dev  # Stop and restart
   Ctrl+Shift+R in browser  # Hard refresh
   ```

### If QR Scanner Fails:

1. **Allow Camera Permission**

   - Click the camera icon in address bar
   - Select "Allow"

2. **Use Fallback Input**
   - Manually enter Book ID or upload QR image

### If Dropdown Shows No Students:

1. **Seed Database**

   ```bash
   cd Backend
   node seed/seed.js
   ```

2. **Check MongoDB Connection**
   - Verify MONGO_URI is correct in `.env`

---

## 📋 File Changes Made

✅ **Backend**:

- `/Backend/routes/index.js` - Added transaction routes

✅ **Frontend**:

- `/Frontend/src/api/api.js` - Fixed interceptor
- `/Frontend/src/pages/Librarian/AddBook.jsx` - Removed problematic code
- `/Frontend/src/pages/Student/MyBooks.jsx` - Fixed typo (s.\_id)
- `/Frontend/vite.config.js` - Added proxy config
- `/Frontend/.env.local` - Created env file

---

## 🎯 Expected Behavior

### ✅ Should Work Now:

- ✅ View Books page loads books
- ✅ Add Book form submits successfully
- ✅ Student dropdown shows all students
- ✅ My Books shows transactions
- ✅ QR Scanner loads (with camera or fallback)
- ✅ All API calls return JSON (not HTML)

### ❌ If Still Broken:

1. Restart backend: `npm run dev`
2. Restart frontend: `npm run dev`
3. Hard refresh browser: `Ctrl+Shift+R`
4. Check DevTools Console for specific errors
5. Share error message for more help

---

## 💡 Key Points

- **Port 5000**: Backend Express server
- **Port 5173**: Frontend Vite dev server
- **CORS**: Enabled in backend for `http://localhost:5173`
- **API URL**: Both use `http://localhost:5000/api`
- **Proxy**: Vite routes `/api` requests to backend automatically

---

Made all necessary fixes! Try the complete setup now.
