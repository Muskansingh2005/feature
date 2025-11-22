# 🗺️ Architecture & Data Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR LIBRARY APP                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐      ┌──────────────────────────────┐
│       FRONTEND                │      │       BACKEND                │
│    (React + Vite)            │      │    (Node + Express)          │
├──────────────────────────────┤      ├──────────────────────────────┤
│ localhost:5173               │      │ localhost:5000               │
│                              │      │                              │
│ ┌─────────────────────────┐  │      │ ┌──────────────────────────┐ │
│ │   React Components      │  │      │ │   Express Routes         │ │
│ ├─────────────────────────┤  │      │ ├──────────────────────────┤ │
│ │ • AddBook               │  │      │ │ GET  /api/books          │ │
│ │ • ViewBooks            │  │      │ │ POST /api/books          │ │
│ │ • ScanQR               │  │      │ │                          │ │
│ │ • MyBooks              │  │      │ │ GET  /api/students       │ │
│ │ • Dashboard            │  │      │ │ POST /api/students       │ │
│ └─────────────────────────┘  │      │                          │ │
│              │                │      │ GET  /api/transactions   │ │
│              │ API Calls      │      │ POST /api/transactions   │ │
│              │                │      │ └──────────────────────────┘ │
│ ┌─────────────────────────┐  │      │              │                │
│ │   API Module            │  │      │              │                │
│ ├─────────────────────────┤  │      │ ┌──────────────────────────┐ │
│ │ • axios instance        │──┼──────────────────┤  MongoDB         │ │
│ │ • baseURL: :5000/api    │  │      │ └──────────────────────────┘ │
│ │ • Interceptors          │  │      │              │                │
│ │ • Error handling        │  │      │ ┌──────────────────────────┐ │
│ └─────────────────────────┘  │      │ │  Controllers             │ │
│              │                │      │ ├──────────────────────────┤ │
│              └────────────────┼──────────────  Business Logic  │ │
│              HTTP GET/POST    │      │ └──────────────────────────┘ │
└──────────────────────────────┘      └──────────────────────────────┘
```

---

## API Call Flow

### Example: Load Books Page

```
1. User clicks "View Books"
   ↓
2. React component mounts
   ├─ useEffect hook runs
   └─ Calls: API.get("/books")
   ↓
3. Request goes to Axios instance
   ├─ baseURL: "http://localhost:5000/api"
   ├─ Full URL: "http://localhost:5000/api/books"
   └─ Method: GET
   ↓
4. Vite dev server (localhost:5173)
   ├─ Sees request to /api/*
   └─ Proxy forwards to localhost:5000
   ↓
5. Backend Express server receives request
   ├─ Matches route: GET /api/books
   └─ Runs bookRoutes handler
   ↓
6. Controller queries MongoDB
   ├─ Finds all books
   └─ Returns books array
   ↓
7. Response sent back to frontend
   ├─ Status: 200 OK
   ├─ Content-Type: application/json
   └─ Body: [{"_id": "...", "title": "..."}, ...]
   ↓
8. Axios Response Interceptor
   ├─ Checks if response exists
   ├─ If yes: returns response ✅
   └─ If error: handles with toast ❌
   ↓
9. React component receives data
   ├─ setState(books, data)
   └─ Component re-renders with books ✅
```

---

## Error Flow (Before Fix)

```
❌ OLD BROKEN FLOW:

1. User clicks "View Books"
   ↓
2. App calls API.get("/books")
   ↓
3. Request sent to backend
   ↓
4. Backend route NOT found ❌
   ├─ No handler for GET /api/books
   └─ Express returns 404 error
   ↓
5. Browser returns HTML error page
   ├─ <!doctype html>
   ├─ <html>...404 Not Found...</html>
   └─ Content-Type: text/html
   ↓
6. Axios receives response
   ├─ Status 404 (error) but has response
   └─ Passes to error handler
   ↓
7. Frontend tries to parse as JSON
   ├─ Expected: {"title": "Book"}
   ├─ Got: <!doctype html>
   └─ ❌ SyntaxError!
   ↓
8. Error shown in console
   └─ "Uncaught SyntaxError: Unexpected token '<'"
```

---

## Fixed Flow

```
✅ NEW FIXED FLOW:

1. User clicks "View Books"
   ↓
2. App calls API.get("/books")
   ↓
3. Request sent to backend
   ↓
4. Backend routes registered ✅
   ├─ bookRoutes imported
   ├─ studentRoutes imported
   └─ transactionRoutes imported ✅
   ↓
5. Express finds matching route
   ├─ GET /api/books → bookRoutes
   └─ Handler executes
   ↓
6. MongoDB query executed
   ├─ Book.find()
   └─ Returns array
   ↓
7. Response sent back
   ├─ Status: 200 OK ✅
   ├─ Content-Type: application/json
   └─ Body: [{"_id": "...", "title": "..."}, ...]
   ↓
8. Axios Response Interceptor
   ├─ Success handler: (response) => response ✅
   └─ Returns response directly
   ↓
9. Frontend receives data
   ├─ setBooks(response.data)
   ├─ Component re-renders
   └─ Books display on page ✅
```

---

## Route Registration Flow

```
Backend Startup:
└─ server.js loads
   ├─ Imports routes/index.js
   │  └─ index.js imports all route files
   │     ├─ bookRoutes ✅
   │     ├─ studentRoutes ✅
   │     ├─ transactionRoutes ✅ (WAS MISSING)
   │     └─ Registers each with router.use()
   │
   ├─ app.use("/api", routes)
   └─ Routes mounted at /api path

Result:
✅ GET /api/books          → bookRoutes
✅ GET /api/students       → studentRoutes
✅ GET /api/transactions   → transactionRoutes
✅ POST /api/books         → bookRoutes
✅ POST /api/students      → studentRoutes
✅ POST /api/transactions  → transactionRoutes
```

---

## Port Assignments

```
                    YOUR COMPUTER
    ┌──────────────────────────────────────────┐
    │                                          │
    │  PORT 5000 ← Backend (Express)           │
    │  ├─ Listens for HTTP requests            │
    │  ├─ Connects to MongoDB                  │
    │  ├─ Responds with JSON                   │
    │  └─ URL: http://localhost:5000           │
    │                                          │
    │  PORT 5173 ← Frontend (Vite Dev Server)  │
    │  ├─ Serves React app                     │
    │  ├─ Hot module reloading                 │
    │  ├─ Proxies /api to port 5000            │
    │  └─ URL: http://localhost:5173           │
    │                                          │
    │  MongoDB Cloud ← External Database       │
    │  ├─ Cloud-hosted MongoDB                 │
    │  ├─ Connection from Backend              │
    │  └─ No local port needed                 │
    │                                          │
    └──────────────────────────────────────────┘
```

---

## File Structure with Fixes

```
library-feature(QR)/
│
├─ Backend/
│  ├─ routes/
│  │  ├─ index.js ✅ FIXED
│  │  │  ├─ +import transactionRoutes
│  │  │  └─ +router.use("/transactions", ...)
│  │  ├─ bookRoutes.js ✅ OK
│  │  ├─ studentRoutes.js ✅ OK
│  │  └─ transactionRoutes.js ✅ OK
│  │
│  ├─ models/ ✅ OK
│  ├─ controllers/ ✅ OK
│  ├─ config/ ✅ OK
│  ├─ server.js ✅ OK
│  ├─ package.json ✅ OK
│  └─ .env ✅ OK
│
├─ Frontend/
│  ├─ src/
│  │  ├─ api/
│  │  │  └─ api.js ✅ FIXED
│  │  │     ├─ +(response) => response
│  │  │     └─ +error handling
│  │  │
│  │  ├─ pages/
│  │  │  ├─ Librarian/
│  │  │  │  ├─ AddBook.jsx ✅ FIXED
│  │  │  │  │  └─ Removed module-level code
│  │  │  │  ├─ Dashboard.jsx ✅ OK
│  │  │  │  └─ ViewBooks.jsx ✅ OK
│  │  │  │
│  │  │  └─ Student/
│  │  │     ├─ MyBooks.jsx ✅ FIXED
│  │  │     │  └─ Fixed s._id typo
│  │  │     ├─ ScanQR.jsx ✅ FIXED
│  │  │     │  └─ Added DOM check
│  │  │     └─ Dashboard.jsx ✅ OK
│  │  │
│  │  ├─ components/ ✅ OK
│  │  ├─ App.jsx ✅ OK
│  │  ├─ main.jsx ✅ OK
│  │  └─ index.css ✅ OK
│  │
│  ├─ vite.config.js ✅ FIXED
│  │  └─ +proxy configuration
│  │
│  ├─ .env.local ✅ NEW FILE
│  │  └─ +VITE_API_URL=...
│  │
│  ├─ package.json ✅ OK
│  ├─ index.html ✅ OK
│  └─ eslint.config.js ✅ OK
│
└─ Documentation/
   ├─ TROUBLESHOOTING.md ✅ NEW
   ├─ FIXES_APPLIED.md ✅ NEW
   ├─ ERROR_ANALYSIS.md ✅ NEW
   └─ SETUP_CHECKLIST.md ✅ NEW
```

---

## Environment Variables

```
Backend (.env):
─────────────────
MONGO_URI = mongodb+srv://...
PORT = 5000
JWT_SECRET = ...
QR_SECRET = ...

Frontend (.env.local):
──────────────────────
VITE_API_URL = http://localhost:5000/api
```

---

**All components are now connected correctly!** ✅
