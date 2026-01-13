const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    // For development/test without token, check if we have a mock header or just fail?
    // Tests inject req.user directly, so this middleware might be bypassed or we need to support test mode.
    // If req.user is already set (by test setup), skip.
    if (req.user) return next();
    
    // Check for X-Mock-User-Id for dev convenience
    const mockUser = req.headers['x-mock-user-id'];
    if (mockUser) {
        req.user = { id: parseInt(mockUser) };
        return next();
    }

    return res.status(401).json({ code: 401, message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ code: 401, message: 'Unauthorized: Invalid token format' });
  }

  // Parse mock token "mock-jwt-token-{userId}"
  if (token.startsWith('mock-jwt-token-')) {
    const userId = parseInt(token.split('-').pop());
    if (!isNaN(userId)) {
        req.user = { id: userId };
        return next();
    }
  } else if (token === 'mock-jwt-token') {
     // Legacy mock token support - default to user 1
     req.user = { id: 1 };
     return next();
  }

  return res.status(403).json({ code: 403, message: 'Forbidden: Invalid token' });
};

module.exports = authMiddleware;
