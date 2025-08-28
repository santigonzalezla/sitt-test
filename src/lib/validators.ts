export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean =>
{
    return Boolean(password && password.length >= 2);
};

export const validateUserInput = (email: string, password: string) =>
{
    const errors: string[] = [];

    if (!email) errors.push('Email is required');
    else if (!isValidEmail(email)) errors.push('Please provide a valid email address');

    if (!password) errors.push('Password is required');
    else if (!isValidPassword(password)) errors.push('Password must be at least 8 characters');

    return {isValid: errors.length === 0, errors};
};