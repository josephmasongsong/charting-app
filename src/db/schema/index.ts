export * from './users.schema';
export * from './sites.schema';
import { sites, sitesRelations } from './sites.schema';
import { users, usersRelations } from './users.schema';

export const schema = {
  sites,
  sitesRelations,
  users,
  usersRelations,
};
