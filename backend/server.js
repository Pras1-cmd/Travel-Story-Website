require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

const seedDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.info('Admin account seeding skipped. Set ADMIN_EMAIL and ADMIN_PASSWORD to configure one.');
      return;
    }

    const adminExists = await User.findOne({ $or: [{ email: adminEmail }, { role: 'admin' }, { isAdmin: true }] });
    if (!adminExists) {
      await User.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        email: adminEmail,
        password: adminPassword,
        firstName: 'Travel',
        lastName: 'Admin',
        role: 'admin',
        isAdmin: true,
        isVerified: true,
        bio: 'System administrator'
      });
      console.log(`Admin account created for ${adminEmail}`);
    }
  } catch (error) {
    console.error('Admin seed error:', error);
  }
};

const startServer = async (port) => {
  try {
    await connectDB();
    console.log('MongoDB connection attempt completed');
    await seedDefaultAdmin();

    // Middleware
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // Health check route
    app.get('/api/health', (req, res) => {
      res.status(200).json({ success: true, message: 'OK' });
    });

    // Root route
    app.get('/', (req, res) => {
      res.json({ message: 'Travel Story API' });
    });

    // Routes
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/users', require('./routes/userRoutes'));
    app.use('/api/stories', require('./routes/storyRoutes'));
    app.use('/api/comments', require('./routes/commentRoutes'));
    app.use('/api/contact', require('./routes/contactRoutes'));
    app.use('/api/admin', require('./routes/adminRoutes'));
    app.use('/api/notifications', require('./routes/notificationRoutes'));

    // 404 handler
    app.use(errorMiddleware.notFound || ((req, res) => {
      res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
    }));

    // Error handling middleware
    app.use(errorMiddleware);

    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const fallbackPort = port + 1;
        console.warn(`Port ${port} is already in use. Retrying on ${fallbackPort}`);
        startServer(fallbackPort);
        return;
      }

      console.error('Server error:', err);
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

const initialPort = Number(process.env.PORT) || 5001;
startServer(initialPort);
