import { paths } from '@/paths';

//If adding any new navItems, make sure "Clients" are still hidden in vertical-layout.js
export const layoutConfig = {
  navItems: [
    {
      key: 'general',
      title: 'General',
      items: [
        {
          key: 'search',
          title: 'Search',
          icon: 'address-book',
          items: [
            { 
              key: 'search', 
              title: 'Veterans & Guardians', 
              href: paths.main.search.list,
              matcher: { type: 'startsWith', href: '/search' }
            }
          ],
        },
        {
          key: 'veteran',
          title: 'Veteran',
          icon: 'veteran',
          items: [
            { 
              key: 'veteran:details', 
              title: 'Veteran Details', 
              href: paths.main.veterans.list,
              matcher: { type: 'startsWith', href: '/veterans/detail' }
            },
            { 
              key: 'veteran:create', 
              title: 'Create veteran profile', 
              href: paths.main.veterans.create,
              matcher: { type: 'startsWith', href: '/veterans/create' }
            }
          ],
        },
        {
          key: 'guardian',
          title: 'Guardian',
          icon: 'guardian',
          items: [
            { 
              key: 'guardian:details', 
              title: 'Guardian Details', 
              href: paths.main.guardians.list,
              matcher: { type: 'startsWith', href: '/guardians/detail' }
            },
            { 
              key: 'guardian:create', 
              title: 'Create guardian profile', 
              href: paths.main.guardians.create,
              matcher: { type: 'startsWith', href: '/guardians/create' }
            }
          ],
        },
        {
          key: 'settings',
          title: 'Settings',
          href: paths.main.settings.account,
          icon: 'gear',
          matcher: { type: 'startsWith', href: '/settings' },
        },
      ],
    },
  ],
};
