import { User } from '../../users/entities/user.entity';

export interface AuthenticatedRequest {
  user: User;
}
