/**
 * Validation helper functions
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number
  return phoneRegex.test(phone);
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const validateUserData = (userData) => {
  const errors = {};

  if (!validateName(userData.name)) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!validateEmail(userData.email)) {
    errors.email = 'Invalid email address';
  }

  if (!validatePhone(userData.contactNumber)) {
    errors.contactNumber = 'Invalid phone number';
  }

  if (!userData.position || userData.position.trim().length === 0) {
    errors.position = 'Position is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};