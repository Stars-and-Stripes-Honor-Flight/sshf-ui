export const paths = {
  home: '/',
  auth: {
    custom: {
      signIn: '/auth/custom/sign-in',
      resetPassword: '/auth/custom/reset-password',
    }
  },
  main: {
    overview: '/',
    settings: {
      account: '/settings/account/',
      billing: '/settings/billing/',
      integrations: '/settings/integrations/',
      notifications: '/settings/notifications/',
      security: '/settings/security/',
      team: '/settings/team/',
    },
    search: {
      list: '/search/'
    },   
    veterans: {
      list: '/veterans/',
      create: '/veterans/create/',
      details: (veteranId) => `/veterans/details?id=${veteranId}`
    },
    guardians: {
      list: '/guardians/',
      create: '/guardians/create/',
      details: (guardianId) => `/guardians/details?id=${guardianId}`
    },
  },
  notAuthorized: '/errors/not-authorized/',
  notFound: '/errors/not-found/',
  internalServerError: '/errors/internal-server-error/'
};
