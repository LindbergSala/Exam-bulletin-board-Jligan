const express = require('express');
const app = express();

const channelRoutes = require('./src/routes/channelsRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const userRoutes = require('./src/routes/userRoutes');

app.use(express.json());
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/users', userRoutes);

app.listen(3000, () => console.log('Server running'));