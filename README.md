# Safe Cracker 

A full stack application for cracking 10 digit safe combinations with real time progress tracking.

## 🚀 Features

- **Backend API**: Flask-based REST API with WebSocket support for real-time updates
- **Frontend**: Angular application with modern UI
- **Real-time Tracking**: Watch the safe cracking progress in real-time with live attempt counter
- **Beautiful Design**: Modern, responsive UI with smooth animations
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Progress Visualization**: Real-time progress bar and attempt counter

---

## 🛠️ Prerequisites

- Python 3.8+ installed
- Node.js 18+ and npm installed
- Angular CLI installed globally (`npm install -g @angular/cli`)

---

## 🚀 Quick Start

### Step 1: Setup Backend

Open a terminal and run:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The backend will start on `http://localhost:5000`

### Step 2: Setup Frontend

Open a **NEW** terminal window and run:

```bash
cd frontend
npm install
ng serve
```

The frontend will start on `http://localhost:4200`

### Step 3: Test

1. Open your browser and go to `http://localhost:4200`
2. Enter a 10-digit combination (e.g., "1234567890")
3. Optionally check "Enable real-time progress tracking" for live updates
4. Click "Crack Safe"
5. View the results!

**Important Notes:**
- Keep both terminals running (backend and frontend)
- The backend must be running before the frontend can connect
- For real-time mode, make sure WebSocket connection is established

---

## 📋 Detailed Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the Flask server:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

---

## 🎯 Usage

1. Open your browser and navigate to `http://localhost:4200`
2. Enter a 10-digit combination (e.g., "1234567890")
3. Click "Crack Safe" to start the cracking process
4. View the results showing:
   - Found combination
   - Total attempts
   - Time taken

---

## 🔌 API Endpoints

### POST /api/crack_safe/

Standard REST endpoint for cracking a safe combination.

**Request:**
```json
{
  "actual_combination": "1234567890"
}
```

**Response:**
```json
{
  "attempts": 123,
  "time_taken": 15.75,
  "found_combination": "1234567890"
}
```

### WebSocket: crack_safe_realtime

Real-time endpoint using WebSockets for live progress updates.

**Emit:**
```json
{
  "actual_combination": "1234567890"
}
```

**Listen for:**
- `progress`: Updates with current attempts and guess
- `complete`: Final results when cracking is done
- `error`: Error messages if something goes wrong

---

## 🛠️ Technologies Used

- **Backend**: Flask, Flask-SocketIO, Flask-CORS
- **Frontend**: Angular 17, Socket.IO Client, RxJS
- **Real-time Communication**: WebSockets via Socket.IO

---

## 📁 Project Structure

```
safe-cracker/
├── backend/
│   ├── app.py              # Flask application with API endpoints
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts    # Main Angular component
│   │   │   ├── app.component.html  # Component template
│   │   │   ├── app.component.css   # Component styles
│   │   │   └── socket.service.ts   # WebSocket service
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
├── README.md
└── .gitignore
```

---

## ✨ Key Features Explained

✅ **Real-time Progress Tracking**: Live attempt counter with WebSocket updates  
✅ **Beautiful, Modern UI**: Smooth animations and responsive design  
✅ **Responsive Design**: Works seamlessly on mobile and desktop  
✅ **Error Handling & Validation**: Comprehensive error messages  
✅ **Progress Bar Visualization**: Visual representation of cracking progress  
✅ **Current Guess Display**: Shows each attempt during cracking  

---

## 🔍 Algorithm Details

The algorithm efficiently cracks the safe by testing each position independently, minimizing the total number of attempts required. And the built in real time mode provides live updates as the algorithm progresses.

---

## 🚨 Important Notes

- The algorithm efficiently cracks the safe by testing each position independently
- Real time mode provides live updates as the algorithm progresses
- The frontend automatically connects to the backend
- Keep both terminal windows open while developing and testing

---

## Author

Alexander Mueller

- GitHub: [alexmueller07](https://github.com/alexmueller07)
- LinkedIn: [Alexander Mueller](https://www.linkedin.com/in/alexander-mueller-021658307/)
- Email: amueller.code@gmail.com

