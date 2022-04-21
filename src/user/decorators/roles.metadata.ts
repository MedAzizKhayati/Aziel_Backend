import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => {
  console.log('the role is', roles);
  return SetMetadata('roles', roles);
};