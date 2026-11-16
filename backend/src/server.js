require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { passport } = require('./config/passport');
const authRoutes = require('./routes/auth.routes');
const { notFound, errorHandler } = require('./middlewares/errores');

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
