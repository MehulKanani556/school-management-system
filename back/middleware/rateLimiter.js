const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 40;
const hits = new Map();

/**
 * Simple in-memory rate limiter for auth endpoints.
 */
module.exports = function rateLimiter(req, res, next) {
    const key = `${req.ip || 'unknown'}:${req.path}`;
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || now - entry.start > WINDOW_MS) {
        entry = { start: now, count: 0 };
        hits.set(key, entry);
    }

    entry.count += 1;
    if (entry.count > MAX_REQUESTS) {
        return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    return next();
};
