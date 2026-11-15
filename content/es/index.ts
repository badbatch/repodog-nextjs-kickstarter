export const content = {
  actions: {
    signOut: 'Cerrar sesión',
  },
  app: {
    description: 'Una plantilla para aplicaciones Next.js',
    title: 'Kickstarter',
  },
  pages: {
    accessDenied: {
      description: 'Tu cuenta no tiene acceso a esta sección. Cierra sesión para utilizar otra cuenta.',
      title: 'Acceso denegado',
    },
    example: {
      action: 'Load API example',
      success: 'The API request succeeded.',
      title: 'API example',
      unavailable: 'The API request failed.',
    },
    home: {
      description:
        'Este proyecto inicial de Next.js incluye una configuración mínima para la representación del lado del servidor. Para empezar, edita page.tsx.',
      linkText: 'Guía de Mantine para Next.js',
      title: 'Te damos la bienvenida a Mantine',
    },
    login: {
      email: 'Correo electrónico',
      errors: {
        invalidCredentials: 'El correo electrónico o la contraseña son incorrectos.',
        unavailable: 'No se ha podido iniciar sesión. Inténtalo de nuevo.',
      },
      password: 'Contraseña',
      register: 'Crear una cuenta',
      registered: 'Tu cuenta se ha creado. Inicia sesión para continuar.',

      title: 'Iniciar sesión',
    },
    register: {
      confirmPassword: 'Confirmar contraseña',
      email: 'Correo electrónico',
      errors: {
        invalidDetails: 'Introduce un correo electrónico válido y una contraseña.',
        passwordMismatch: 'Las contraseñas no coinciden.',
        rejected:
          'No se pudo crear la cuenta. Revisa los requisitos de la contraseña o inicia sesión si ya tienes una cuenta.',
        unavailable: 'No se puede crear una cuenta en este momento. Inténtalo de nuevo.',
      },
      password: 'Contraseña',
      passwordHelp: 'Usa una contraseña segura con mayúsculas, minúsculas, un número y un símbolo.',
      signIn: '¿Ya tienes una cuenta? Inicia sesión',
      submit: 'Crear cuenta',
      title: 'Crear una cuenta',
    },
    restricted: { title: 'Restricted example' },
  },
} as const;
