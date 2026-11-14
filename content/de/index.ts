export const content = {
  actions: {
    signOut: 'Abmelden',
  },
  app: {
    description: 'Eine Vorlage für Next.js-Anwendungen',
    title: 'Kickstarter',
  },
  pages: {
    accessDenied: {
      description:
        'Dein Konto hat keinen Zugriff auf diesen Bereich. Melde dich ab, um ein anderes Konto zu verwenden.',
      title: 'Zugriff verweigert',
    },
    example: {
      action: 'Load API example',
      success: 'The API request succeeded.',
      title: 'API example',
      unavailable: 'The API request failed.',
    },
    home: {
      description:
        'Dieses Next.js-Starterprojekt bietet eine minimale Einrichtung für serverseitiges Rendering. Bearbeite zum Einstieg page.tsx.',
      linkText: 'Mantine-Next.js-Leitfaden',
      title: 'Willkommen bei Mantine',
    },
    login: {
      errors: {
        invalidCredentials: 'Die E-Mail-Adresse oder das Passwort ist falsch.',
        unavailable: 'Die Anmeldung ist nicht möglich. Bitte versuche es erneut.',
      },
    },
    restricted: { title: 'Restricted example' },
  },
} as const;
