import { v4 as uuidv4 } from 'uuid';

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  timezone?: string;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  privacyMode: boolean;
  shareData: boolean;
  updatedAt: Date;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  timezone?: string;
  language?: string;
}

export class UserService {
  private profiles: Map<string, UserProfile> = new Map();
  private settings: Map<string, UserSettings> = new Map();

  // Create user profile
  createProfile(userId: string, email: string, data: Partial<UserProfile>): UserProfile {
    const profile: UserProfile = {
      id: uuidv4(),
      userId,
      email,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      displayName: data.displayName,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      timezone: data.timezone || 'UTC',
      language: data.language || 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.profiles.set(userId, profile);

    // Create default settings
    this.createDefaultSettings(userId);

    return profile;
  }

  // Get user profile
  getProfile(userId: string): UserProfile | null {
    return this.profiles.get(userId) || null;
  }

  // Update user profile
  updateProfile(userId: string, data: UpdateProfileDto): UserProfile | null {
    const profile = this.profiles.get(userId);

    if (!profile) {
      return null;
    }

    const updated: UserProfile = {
      ...profile,
      ...data,
      updatedAt: new Date(),
    };

    this.profiles.set(userId, updated);

    return updated;
  }

  // Delete user profile
  deleteProfile(userId: string): boolean {
    const deleted = this.profiles.delete(userId);
    
    if (deleted) {
      this.settings.delete(userId);
    }

    return deleted;
  }

  // Get all profiles (admin only)
  getAllProfiles(): UserProfile[] {
    return Array.from(this.profiles.values());
  }

  // Search profiles by name
  searchProfiles(query: string): UserProfile[] {
    const lowerQuery = query.toLowerCase();

    return Array.from(this.profiles.values()).filter(profile => {
      const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
      const displayName = profile.displayName?.toLowerCase() || '';
      
      return (
        fullName.includes(lowerQuery) ||
        displayName.includes(lowerQuery) ||
        profile.email.toLowerCase().includes(lowerQuery)
      );
    });
  }

  // Create default settings
  private createDefaultSettings(userId: string): UserSettings {
    const settings: UserSettings = {
      userId,
      theme: 'auto',
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: true,
      privacyMode: false,
      shareData: true,
      updatedAt: new Date(),
    };

    this.settings.set(userId, settings);

    return settings;
  }

  // Get user settings
  getSettings(userId: string): UserSettings | null {
    let settings = this.settings.get(userId);

    if (!settings) {
      // Create default settings if they don't exist
      settings = this.createDefaultSettings(userId);
    }

    return settings;
  }

  // Update user settings
  updateSettings(userId: string, data: Partial<UserSettings>): UserSettings | null {
    let settings = this.settings.get(userId);

    if (!settings) {
      settings = this.createDefaultSettings(userId);
    }

    const updated: UserSettings = {
      ...settings,
      ...data,
      userId, // Ensure userId doesn't change
      updatedAt: new Date(),
    };

    this.settings.set(userId, updated);

    return updated;
  }

  // Get user statistics
  getUserStats(userId: string): {
    profileComplete: boolean;
    profileCompleteness: number;
    memberSince: Date;
    daysActive: number;
  } | null {
    const profile = this.profiles.get(userId);

    if (!profile) {
      return null;
    }

    // Calculate profile completeness
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.bio,
      profile.avatarUrl,
      profile.dateOfBirth,
      profile.gender,
    ];

    const filledFields = fields.filter(field => field !== undefined && field !== '').length;
    const completeness = Math.round((filledFields / fields.length) * 100);

    // Calculate days since creation
    const now = new Date();
    const created = new Date(profile.createdAt);
    const daysActive = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

    return {
      profileComplete: completeness === 100,
      profileCompleteness: completeness,
      memberSince: profile.createdAt,
      daysActive,
    };
  }

  // Validate profile data
  validateProfileData(data: Partial<UpdateProfileDto>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.firstName !== undefined && data.firstName.length < 2) {
      errors.push('First name must be at least 2 characters');
    }

    if (data.lastName !== undefined && data.lastName.length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    if (data.bio !== undefined && data.bio.length > 500) {
      errors.push('Bio must not exceed 500 characters');
    }

    if (data.dateOfBirth !== undefined) {
      const dob = new Date(data.dateOfBirth);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      
      if (age < 13) {
        errors.push('User must be at least 13 years old');
      }
      
      if (age > 150) {
        errors.push('Invalid date of birth');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
