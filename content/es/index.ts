export const content = {
  actions: {
    signOut: 'Cerrar sesión',
  },
  app: {
    description: 'Una plantilla para aplicaciones Next.js',
    title: 'Kickstarter',
  },
  forms: {
    validation: {
      confirmPasswordRequired: 'Confirma tu contraseña.',
      email: 'Introduce una dirección de correo válida.',
      emailTooLong: 'Usa un máximo de 256 caracteres.',
      passwordRequired: 'Introduce tu contraseña.',
    },
  },
  navigation: { breadcrumb: 'Ruta de navegación', home: 'Inicio', navigation: 'Navegación' },
  pages: {
    accessDenied: {
      description: 'Tu cuenta no tiene acceso a esta sección. Cierra sesión para utilizar otra cuenta.',
      title: 'Acceso denegado',
    },
    example: {
      action: 'Cargar ejemplo de la API',
      message: 'Mensaje',
      success: 'La solicitud a la API se completó correctamente.',
      title: 'Ejemplo de la API',
      unavailable: 'La solicitud a la API falló.',
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
    restricted: { title: 'Ejemplo de acceso restringido' },
  },
  records: {
    clearSelection: 'Borrar selección',
    empty: 'Todavía no hay registros.',
    noMatches: 'No hay resultados para esta búsqueda.',
    pageSize: 'Filas por página',
    pagination: 'Páginas de registros',
    record: 'registro',
    records: 'registros',
    search: 'Buscar registros',
    selectRow: 'Seleccionar fila',
    selectVisible: 'Seleccionar filas visibles',
    selected: 'seleccionados',
    view: 'Ver',
  },
} as const;
