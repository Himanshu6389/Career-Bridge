// MIDDLEWARES/validation.middleware.js
export const validateEmail = (req, res, next) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (req.body.email && !emailRegex.test(req.body.email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }
  next();
};

export const validatePassword = (req, res, next) => {
  if (req.body.password && req.body.password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters'
    });
  }
  next();
};

export const validatePhoneNumber = (req, res, next) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  if (req.body.phoneNumber && !phoneRegex.test(req.body.phoneNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid Indian phone number'
    });
  }
  next();
};
