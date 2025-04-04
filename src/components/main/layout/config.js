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
            { key: 'search/', title: 'Veterans & Guardians', href: paths.main.search.list }
          ],
        },
        {
          key: 'veteran',
          title: 'Veteran',
          icon: 'veteran',
          items: [
            { key: 'veteran/', title: 'List veterans', href: paths.main.veterans.list},
            { key: 'veteran:create', title: 'Create veteran profile', href: paths.main.veterans.create }
          ],
        },
        {
          key: 'guardian',
          title: 'Guardian',
          icon: 'guardian',
          items: [
            { key: 'guardian/', title: 'List guardians', href: paths.main.guardians.list},
            { key: 'guardian:create', title: 'Create guardian profile', href: paths.main.guardians.create }
          ],
        },
        {
          key: 'settings',
          title: 'Settings',
          href: paths.main.settings.account,
          icon: 'gear',
          matcher: { type: 'startsWith', href: '/main/settings' },
        },
      ],
    },
  ],
};
