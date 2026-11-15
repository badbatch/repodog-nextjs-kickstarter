export const content = {
  actions: {
    signOut: 'Sign out',
  },
  app: {
    description: 'An opinionated Next.js application starter',
    title: 'Kickstarter',
  },
  pages: {
    accessDenied: {
      description: 'Your account does not have access to this area. Sign out to use a different account.',
      title: 'Access denied',
    },
    example: {
      action: 'Load API example',
      success: 'The API request succeeded.',
      title: 'API example',
      unavailable: 'The API request failed.',
    },
    home: {
      description:
        'This starter Next.js project includes a minimal setup for server-side rendering. To get started, edit page.tsx.',
      linkText: 'Mantine Next.js guide',
      title: 'Welcome to Mantine',
    },
    login: {
      email: 'Email',
      errors: {
        invalidCredentials: 'The email or password is incorrect.',
        unavailable: 'Unable to sign in. Please try again.',
      },
      password: 'Password',
      register: 'Create an account',
      registered: 'Your account has been created. Sign in to continue.',

      title: 'Sign in',
    },
    register: {
      confirmPassword: 'Confirm password',
      email: 'Email',
      errors: {
        invalidDetails: 'Enter a valid email address and password.',
        passwordMismatch: 'The passwords do not match.',
        rejected:
          'Unable to create the account. Check the password requirements, or sign in if you already have an account.',
        unavailable: 'Unable to create an account right now. Please try again.',
      },
      password: 'Password',
      passwordHelp: 'Use a strong password with uppercase and lowercase letters, a number and a symbol.',
      signIn: 'Already have an account? Sign in',
      submit: 'Create account',
      title: 'Create an account',
    },
    restricted: { title: 'Restricted example' },
  },
} as const;
