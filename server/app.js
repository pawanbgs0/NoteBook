const express = require('express');
const app = express();
const cookie = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const ErrorMiddleWare = require('./src/middleware/error');
const DATA_LIMIT = require('./src/utils/constants');
const cors = require('cors');

app.use(cors());

// Parse JSON request bodies with specified data limit
app.use(
    express.json({
        limit: DATA_LIMIT,
    })
);

// Parse cookies in the request headers
app.use(cookie());

// Parse URL-encoded request bodies
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// Enable file uploads middleware
app.use(fileUpload());

const { 
    ensureStatsEntryExists 
} = require('./src/middleware/stats');
app.use(ensureStatsEntryExists)

// Import and mount user routes
const userRoutes = require('./src/routes/userRouter');
app.use('/api/user', userRoutes);

const filterRoutes = require('./src/routes/filtersRouter');
app.use('/api', filterRoutes)

const postRoutes = require('./src/routes/postRouter');
app.use('/api/posts', postRoutes)

const statsRoutes = require('./src/routes/statsRouter');
app.use('/api/stats', statsRoutes)

// Mount error handling middleware
app.use(ErrorMiddleWare);

module.exports = app;