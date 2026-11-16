const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');

passport.use(new Strategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  (payload, done) => done(null, payload)
));

// Responde 401 en JSON si el token falta, es inválido o expiró
const requireAuth = (req, res, next) =>
  passport.authenticate('jwt', { session: false }, (err, usuario) => {
    if (err) return next(err);
    if (!usuario) return res.status(401).json({ error: 'No autenticado: token inválido o ausente' });
    req.user = usuario;
    next();
  })(req, res, next);

module.exports = { passport, requireAuth };
