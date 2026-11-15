export const content = {
  actions: {
    signOut: 'Abmelden',
  },
  app: {
    description: 'Eine Vorlage für Next.js-Anwendungen',
    title: 'Kickstarter',
  },
  forms: {
    validation: {
      confirmPasswordRequired: 'Bestätigen Sie Ihr Passwort.',
      email: 'Geben Sie eine gültige E-Mail-Adresse ein.',
      emailTooLong: 'Verwenden Sie höchstens 256 Zeichen.',
      passwordRequired: 'Geben Sie Ihr Passwort ein.',
    },
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
      email: 'E-Mail',
      errors: {
        invalidCredentials: 'Die E-Mail-Adresse oder das Passwort ist falsch.',
        unavailable: 'Die Anmeldung ist nicht möglich. Bitte versuche es erneut.',
      },
      password: 'Passwort',
      register: 'Konto erstellen',
      registered: 'Ihr Konto wurde erstellt. Melden Sie sich an, um fortzufahren.',

      title: 'Anmelden',
    },
    register: {
      confirmPassword: 'Passwort bestätigen',
      email: 'E-Mail',
      errors: {
        invalidDetails: 'Geben Sie eine gültige E-Mail-Adresse und ein Passwort ein.',
        passwordMismatch: 'Die Passwörter stimmen nicht überein.',
        rejected:
          'Das Konto konnte nicht erstellt werden. Prüfen Sie die Passwortanforderungen oder melden Sie sich an, wenn Sie bereits ein Konto haben.',
        unavailable: 'Zurzeit kann kein Konto erstellt werden. Bitte versuchen Sie es erneut.',
      },
      password: 'Passwort',
      passwordHelp:
        'Verwenden Sie ein sicheres Passwort mit Groß- und Kleinbuchstaben, einer Zahl und einem Sonderzeichen.',
      signIn: 'Sie haben bereits ein Konto? Anmelden',
      submit: 'Konto erstellen',
      title: 'Konto erstellen',
    },
    restricted: { title: 'Restricted example' },
  },
} as const;
