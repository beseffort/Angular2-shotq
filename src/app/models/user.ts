// ShortUserProfileSerializer
export class BaseUserProfile {
  id: number;
  name: string;
  phone: string;
  phone_type: string;
  timezone: string;
  avatar: string;
}


// UserAndProfileSerializer
export class CurrentUser {
  static readonly Empty: CurrentUser = Object.assign(new CurrentUser());
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  user_profile: BaseUserProfile;
}
