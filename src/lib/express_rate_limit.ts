import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 6000,
    limit: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: "You have sent too many requests in a short period of time. Please try again later." }
});

export default limiter;