export const paths = {
  home: '/',
  auth: {
    domain: {
      signIn: '/auth/domain/sign-in'
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
      details: (veteranId) => `/veterans/details?id=${veteranId}`,
      preview: (veteranId) => `/veterans/preview?id=${veteranId}`
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
