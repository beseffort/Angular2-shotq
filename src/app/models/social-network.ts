type SocialNetworkType = 'facebook' | 'instagram' | 'twitter' | 'website';

// SocialNetworkSerializer
export class SocialNetwork {
  static readonly Empty: SocialNetwork = Object.assign(new SocialNetwork(), {id: -1});
  static readonly FACEBOOK: SocialNetworkType = 'facebook';
  static readonly INSTAGRAM: SocialNetworkType = 'instagram';
  static readonly TWITTER: SocialNetworkType = 'twitter';
  static readonly WEBSITE: SocialNetworkType = 'website';
  id: number;  // PK for the person.SocialNetwork object
  network: SocialNetworkType;
  network_id: string;  // network username or user ID
  visible: boolean;
  person: number;

  // The fields not included in the serializer
  isLoading: boolean; // virtual field for contact edit

  constructor() {
    this.isLoading = false;
  }

  toString(): string {
    return this.network_id;
  }

  get isFacebook(): boolean {
    return this.network === SocialNetwork.FACEBOOK;
  }

  get isInstagram(): boolean {
    return this.network === SocialNetwork.INSTAGRAM;
  }

  get isTwitter(): boolean {
    return this.network === SocialNetwork.TWITTER;
  }

  get isWebsite(): boolean {
    return this.network === SocialNetwork.WEBSITE;
  }
}
