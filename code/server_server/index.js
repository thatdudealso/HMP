const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const promptRoutes = require("./routes/promptRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const authRoutes = require("./routes/authRoutes");
const subscribeRoutes = require('./routes/subscribeRoutes');

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3001;

// Define CORS options first
const corsOptions = {
  origin: [
    'http://helpmypetai-frontend.s3-website.us-east-2.amazonaws.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    '*'  // More permissive during development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
};

// Ensure MONGO_URI is defined
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("🔴 MONGO_URI is missing in .env file");
  process.exit(1); // Exit process if MongoDB URI is missing
}

// Ensure JWT_SECRET is defined
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error("🔴 JWT_SECRET is missing in .env file");
  process.exit(1); // Exit process if JWT secret is missing
}

// Add environment detection after all configurations are set
const getServerEnvironment = () => {
  // AWS EC2 instances have specific environment variables
  const isEC2 = process.env.AWS_EXECUTION_ENV || process.env.AWS_REGION;
  return isEC2 ? 'EC2' : 'localhost';
};

const serverEnv = getServerEnvironment();
console.log(`
🌍 Server Environment Detection:
📍 Running on: ${serverEnv}
🔌 Port: ${port}
🌐 Allowed Origins: ${JSON.stringify(corsOptions.origin, null, 2)}
`);

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json()); // Enable JSON Parsing

// Enhanced logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.headers.origin || 'Unknown Origin';
  console.log(`
🔔 [${timestamp}] New Request:
📍 Origin: ${origin}
🛣️  Path: ${req.method} ${req.url}
🔑 Headers: ${JSON.stringify(req.headers)}
📦 Body: ${JSON.stringify(req.body)}
  `);
  next();
});

// Add CORS pre-flight handling
app.options('*', cors(corsOptions));

// API Routes
app.use("/api/prompt", promptRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use('/api', subscribeRoutes);

// Root Route (Test if server is running)
app.get("/", (req, res) => {
  res.send("HelpMyPet API is running!");
});

// Add this right after your middleware setup
app.get('/test', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ 
    message: 'Backend is reachable!',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Add this with your other routes
app.get('/api/environment', (req, res) => {
  const envInfo = {
    environment: getServerEnvironment(),
    serverTime: new Date().toISOString(),
    cors: {
      allowedOrigins: corsOptions.origin
    },
    headers: {
      origin: req.headers.origin,
      host: req.headers.host
    }
  };
  
  res.json(envInfo);
});

// MongoDB Connection with enhanced logging
mongoose.connect(mongoUri)  // Remove deprecated options
  .then(() => {
    console.log(`
✅ Database Connection Successful:
📊 MongoDB URI: ${mongoUri.split('@')[1]} // Only showing host part for security
🔌 Connection Status: Connected
    `);
  })
  .catch((err) => {
    console.error(`
🔴 MongoDB Connection Error:
❌ Error Details: ${err.message}
🔍 Stack: ${err.stack}
    `);
    process.exit(1);
  });

const startServer = async (retries = 3) => {
  const ports = [3001, 3002, 3003, 3004]; // Avoiding 5000 completely
  let server;
  
  for (let i = 0; i < retries; i++) {
    try {
      const currentPort = ports[i];
      console.log(`
📡 Attempting to start server on port ${currentPort}...
      `);

      await new Promise((resolve, reject) => {
        server = app.listen(currentPort, '0.0.0.0', () => {
          console.log(`
🚀 Server Successfully Started:
📡 Port: ${currentPort}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
🔗 CORS Enabled for: ${corsOptions.origin}
🌍 Local URL: http://localhost:${currentPort}
🔄 API Health Check: http://localhost:${currentPort}/api/health
          `);
          resolve();
        });

        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`⚠️ Port ${currentPort} is busy, trying next port...`);
            reject(err);
          } else {
            console.error('Server error:', err);
            reject(err);
          }
        });
      });
      
      // Add graceful shutdown handlers
      const gracefulShutdown = async () => {
        console.log('\n🛑 Received shutdown signal. Starting graceful shutdown...');
        
        // Close the server
        if (server) {
          server.close(() => {
            console.log('📡 HTTP server closed');
          });
        }

        // Close MongoDB connection
        try {
          await mongoose.connection.close();
          console.log('📊 MongoDB connection closed');
        } catch (err) {
          console.error('Error closing MongoDB connection:', err);
        }

        console.log('👋 Graceful shutdown completed');
        process.exit(0);
      };

      // Handle different termination signals
      process.on('SIGTERM', gracefulShutdown);
      process.on('SIGINT', gracefulShutdown);
      
      return;
    } catch (err) {
      if (i === retries - 1) {
        throw new Error(`Failed to start server after ${retries} attempts`);
      }
      // Continue to next port
    }
  }
};

// Replace the existing app.listen with this:
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date(),
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version
    },
    database: {
      connected: mongoose.connection.readyState === 1,
      host: mongoUri.split('@')[1].split('/')[0]
    },
    cors: {
      allowedOrigins: corsOptions.origin
    }
  };
  
  res.json(healthData);
});

// Enhanced error handling
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`
🔴 Error Occurred [${timestamp}]:
❌ Error Message: ${err.message}
📍 Path: ${req.method} ${req.url}
🔍 Stack: ${err.stack}
  `);
  
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    path: req.url,
    timestamp: timestamp
  });
});