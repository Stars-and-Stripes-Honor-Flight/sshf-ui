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
              matcher: { type: 'equals', href: '/search' }
            },
            { 
              key: 'search:flights', 
              title: 'Flights', 
              href: paths.main.search.flights,
              matcher: { type: 'equals', href: '/search-flights' }
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
<<<<<<< 92-recent-changes-ui
          key: 'activity',
          title: 'Recent Activity',
          icon: 'history',
          items: [
            { 
              key: 'activity:list', 
              title: 'Activity Log', 
              href: paths.main.activity.list,
              matcher: { type: 'startsWith', href: '/activity' }
            }
          ],
        },
        {
          key: 'waitlist',
          title: 'Waitlist',
          icon: 'users',
          items: [
            { 
              key: 'waitlist:list', 
              title: 'Waitlist', 
              href: paths.main.waitlist.list,
              matcher: { type: 'startsWith', href: '/waitlist' }
=======
          key: 'flights',
          title: 'Flights',
          icon: 'airplane',
          items: [
            { 
              key: 'flights:details', 
              title: 'Flight Details', 
              href: paths.main.flights.list,
              matcher: { type: 'startsWith', href: '/flights/detail' }
            },
            { 
              key: 'flights:create', 
              title: 'Create Flight', 
              href: paths.main.flights.create,
              matcher: { type: 'startsWith', href: '/flights/create' }
            }
          ],
        },
        {
          key: 'exports',
          title: 'Exports',
          icon: 'download',
          items: [
            {
              key: 'exports:flight',
              title: 'Flight Roster',
              href: paths.main.exports.flight,
              matcher: { type: 'equals', href: '/exports/flight' }
            },
            {
              key: 'exports:callcenter',
              title: 'Call Center Follow-up',
              href: paths.main.exports.callCenterFollowup,
              matcher: { type: 'equals', href: '/exports/callcenterfollowup' }
            },
            {
              key: 'exports:tourlead',
              title: 'Tour Lead',
              href: paths.main.exports.tourLead,
              matcher: { type: 'equals', href: '/exports/tourlead' }
>>>>>>> main
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
