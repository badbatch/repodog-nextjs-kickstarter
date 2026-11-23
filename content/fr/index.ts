export const content = {
  actions: {
    signOut: 'Se déconnecter',
  },
  app: {
    description: 'Une base pour vos applications Next.js',
    title: 'Kickstarter',
  },
  forms: {
    validation: {
      confirmPasswordRequired: 'Confirmez votre mot de passe.',
      email: 'Saisissez une adresse e-mail valide.',
      emailTooLong: 'Utilisez au maximum 256 caractères.',
      passwordRequired: 'Saisissez votre mot de passe.',
    },
  },
  navigation: { breadcrumb: 'Fil d’Ariane', home: 'Accueil', navigation: 'Navigation' },
  pages: {
    accessDenied: {
      description:
        'Votre compte ne permet pas d’accéder à cette section. Déconnectez-vous pour utiliser un autre compte.',
      title: 'Accès refusé',
    },
    error: { retry: 'Réessayer', title: 'Une erreur est survenue' },
    example: {
      action: 'Charger l’exemple d’API',
      message: 'Message',
      success: 'La requête API a réussi.',
      title: 'Exemple d’API',
      unavailable: 'La requête API a échoué.',
    },
    home: {
      description:
        'Ce projet de démarrage Next.js propose une configuration minimale pour le rendu côté serveur. Pour commencer, modifiez page.tsx.',
      linkText: 'Guide Mantine pour Next.js',
      title: 'Bienvenue dans Mantine',
    },
    login: {
      email: 'Adresse e-mail',
      errors: {
        invalidCredentials: 'L’adresse e-mail ou le mot de passe est incorrect.',
        unavailable: 'Impossible de se connecter. Veuillez réessayer.',
      },
      password: 'Mot de passe',
      register: 'Créer un compte',
      registered: 'Votre compte a été créé. Connectez-vous pour continuer.',

      title: 'Se connecter',
    },
    register: {
      confirmPassword: 'Confirmer le mot de passe',
      email: 'Adresse e-mail',
      errors: {
        invalidDetails: 'Saisissez une adresse e-mail valide et un mot de passe.',
        passwordMismatch: 'Les mots de passe ne correspondent pas.',
        rejected:
          'Impossible de créer le compte. Vérifiez les exigences du mot de passe ou connectez-vous si vous avez déjà un compte.',
        unavailable: 'Impossible de créer un compte pour le moment. Veuillez réessayer.',
      },
      password: 'Mot de passe',
      passwordHelp: 'Utilisez un mot de passe fort avec des majuscules, des minuscules, un chiffre et un symbole.',
      signIn: 'Vous avez déjà un compte ? Connectez-vous',
      submit: 'Créer le compte',
      title: 'Créer un compte',
    },
    restricted: { title: 'Exemple à accès restreint' },
  },
  records: {
    clearSelection: 'Effacer la sélection',
    empty: 'Aucun enregistrement.',
    noMatches: 'Aucun résultat pour cette recherche.',
    pageSize: 'Lignes par page',
    pagination: 'Pages de résultats',
    record: 'enregistrement',
    records: 'enregistrements',
    search: 'Rechercher',
    selectRow: 'Sélectionner la ligne',
    selectVisible: 'Sélectionner les lignes visibles',
    selected: 'sélectionnés',
    view: 'Voir',
  },
} as const;
