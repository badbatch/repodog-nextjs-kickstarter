export const content = {
  actions: {
    signOut: 'Se déconnecter',
  },
  app: {
    description: 'Une base pour vos applications Next.js',
    title: 'Kickstarter',
  },
  pages: {
    accessDenied: {
      description:
        'Votre compte ne permet pas d’accéder à cette section. Déconnectez-vous pour utiliser un autre compte.',
      title: 'Accès refusé',
    },
    example: {
      action: 'Load API example',
      success: 'The API request succeeded.',
      title: 'API example',
      unavailable: 'The API request failed.',
    },
    home: {
      description:
        'Ce projet de démarrage Next.js propose une configuration minimale pour le rendu côté serveur. Pour commencer, modifiez page.tsx.',
      linkText: 'Guide Mantine pour Next.js',
      title: 'Bienvenue dans Mantine',
    },
    login: {
      errors: {
        invalidCredentials: 'L’adresse e-mail ou le mot de passe est incorrect.',
        unavailable: 'Impossible de se connecter. Veuillez réessayer.',
      },
    },
    restricted: { title: 'Restricted example' },
  },
} as const;
