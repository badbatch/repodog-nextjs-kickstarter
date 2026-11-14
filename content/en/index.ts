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
      errors: {
        invalidCredentials: 'The email or password is incorrect.',
        unavailable: 'Unable to sign in. Please try again.',
      },
    },
    restricted: { title: 'Restricted example' },
  },
} as const;
