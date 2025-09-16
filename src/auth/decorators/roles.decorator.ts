import { SetMetadata } from '@nestjs/common';
import { ROLE_VALUES } from 'models/user/user.schema';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ROLE_VALUES[]) => SetMetadata(ROLES_KEY, roles);
