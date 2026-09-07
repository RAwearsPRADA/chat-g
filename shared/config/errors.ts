export const ERROR_MESSAGES: Record<string, string> = {
    'space in name': 'Nick has not to contain spaces',
    'name': 'User with this name already exists',
    'name length': 'Name length must be more than 3 symbols',
    'email': 'Incorrect email or is already registered',
    'password': 'Password length must be more than 6 and it has to contain one of special symbols !@#$%^&*()_=+',
} as const