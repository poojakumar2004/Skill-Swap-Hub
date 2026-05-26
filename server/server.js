const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { seedLearningSessionsIfEmpty } = require('./utils/seedLearningSessions');
const { cleanupOrphanLearningSessions } = require('./utils/cleanupOrphanSessions');

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'skillswap-api' });
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api', require('./routes/sessionRoutes'));
app.use('/api', require('./routes/chatRoutes'));
app.use('/api', require('./routes/marketplaceRoutes'));
app.use('/api', require('./routes/matchRoutes'));
app.use('/api', require('./routes/connectionRoutes'));
app.use('/api', require('./routes/chatbotRoutes'));

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    // Drop old index that included 'type' field (now removed)
    try {
      const col = mongoose.connection.collection('connectionrequests');
      const indexes = await col.indexes();
      const oldIdx = indexes.find(i => i.key?.type !== undefined);
      if (oldIdx) {
        await col.dropIndex(oldIdx.name);
        console.log('  Dropped old connection index');
      }
    } catch (e) { /* collection may not exist yet, that's fine */ }
    await seedLearningSessionsIfEmpty();
    await cleanupOrphanLearningSessions();
  })
  .catch((err) => console.log('❌ DB error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://<your-ip>:${PORT}`);
});
