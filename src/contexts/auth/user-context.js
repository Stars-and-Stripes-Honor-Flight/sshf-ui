import { config } from '@/config';
import { AuthStrategy } from '@/lib/auth/strategy';

import { UserContext as CustomUserContext, UserProvider as CustomUserProvider } from './custom/user-context';
import { UserContext as DomainUserContext, UserProvider as DomainUserProvider } from './domain/user-context';

// eslint-disable-next-line import/no-mutable-exports -- Export based on config
let UserProvider;

// eslint-disable-next-line import/no-mutable-exports -- Export based on config
let UserContext;

switch (config.auth.strategy) {
  case AuthStrategy.CUSTOM:
    UserContext = CustomUserContext;
    UserProvider = CustomUserProvider;
    break;
  case AuthStrategy.DOMAIN:
    UserContext = DomainUserContext;
    UserProvider = DomainUserProvider;
    break;
  default:
    throw new Error('Invalid auth strategy');
}


export { UserProvider, UserContext };
