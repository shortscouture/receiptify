require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, initializeModels } = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const receiptRoutes = require('./routes/receipt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/receipts', receiptRoutes);

const startServer = async () => {
    try {
        initializeModels();
        await sequelize.authenticate();
        await sequelize.sync();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app;