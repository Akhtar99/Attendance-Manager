const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const connect = require('./src/config/db');
const User = require('./src/config/models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const socketIo = require('socket.io');
const http = require('http');

require('dotenv').config();

let mainWindow;
let io;

// Set up Socket.IO server
const server = http.createServer(); // Create HTTP server for Socket.IO
io = socketIo(server); // Initialize Socket.IO with the HTTP server

// Create the main window function
function createWindow() {
  // Connect to the database
  connect();

  // Create a browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the login page HTML file
  mainWindow.loadFile('index.html');

  // Open the DevTools (optional)
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Start Socket.IO server on a specific port
  server.listen(4000, () => {
    console.log('Socket.IO server listening on port 4000');
  });

  // Setup socket event listener
  io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('out-going-request', (data) => {
      console.log('Received an out-going request:', data);
      // You can trigger other events or perform tasks here
      // Example: Emit a response back to the connected client
      socket.emit('out-going-response', { data: 'Hello from the main process!' });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}

// Handle login form submission
ipcMain.on("login-form-submit", async (event, data) => {
  try {
    console.log("received login request");
    const { email, password } = data;
    const user = await User.findOne({ email });

    if (!user) {
      return event.reply("login-form-response", { success: false, message: "User not found!" });
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return event.reply("login-form-response", { success: false, message: "Invalid email or password!" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET, // Use an environment variable for the JWT secret
      { expiresIn: '1h' } // Token expiration time
    );

    // Send token or relevant user data to the renderer process
    event.reply("login-form-response", {
      success: true,
      message: "Login successful!",
      token: token,
    });

    // Open the main window after successful login
    createMainWindow(); // Create the new window
  } catch (err) {
    console.error("Error processing login:", err.message);
    event.reply("login-form-response", { success: false, message: "Error processing login!" });
  }
});

// Function to create the main page window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('mainPage.html'); // Load your main page HTML file
}

// Quit when all windows are closed (on macOS, it's common to keep the app running)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Create the initial window when Electron has finished initialization
app.whenReady().then(createWindow);
