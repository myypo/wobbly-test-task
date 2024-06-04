import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Makes the route accessible without JWT auth
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
