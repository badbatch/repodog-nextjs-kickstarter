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
      errors: {
        invalidCredentials: 'El correo electrónico o la contraseña son incorrectos.',
        unavailable: 'No se ha podido iniciar sesión. Inténtalo de nuevo.',
      },
    },
    restricted: { title: 'Restricted example' },
  },
} as const;
