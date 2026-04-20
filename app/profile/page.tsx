'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthGuard } from '@/components/auth-guard';
import { Navigation } from '@/components/navigation';
import { authService } from '@/services/auth-service';
import { userService } from '@/services/user-service';
import type { User, ProfilePrivacyStatus } from '@/types/user';
import {
  LogOut,
  KeyRound,
  Mail,
  Languages,
  AtSign,
  Lock,
  Check,
  X,
} from 'lucide-react';
import { showToast } from '@/lib/toast';
import { UpdatePasswordModal } from './modals/update-password-modal';
import { UpdateEmailModal } from './modals/update-email-modal';
import {
  useTranslations,
  useLanguage,
  type Locale,
} from '@/contexts/language-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tPrivacy = useTranslations('privacy');
  const { locale, setLocale } = useLanguage();

  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [profilePrivacyStatus, setProfilePrivacyStatus] =
    useState<ProfilePrivacyStatus>('public');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Username availability check state
  const [usernameStatus, setUsernameStatus] = useState<
    'available' | 'taken' | 'checking' | null
  >(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userService.getMyProfile();
        setUser(profile);
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        setUsername(profile.username || '');
        setProfilePrivacyStatus(profile.profilePrivacyStatus || 'public');
      } catch {
        const cachedUser = authService.getCurrentUser();
        if (cachedUser) {
          setUser(cachedUser);
          setFirstName(cachedUser.firstName);
          setLastName(cachedUser.lastName);
          setUsername(cachedUser.username || '');
          setProfilePrivacyStatus(cachedUser.profilePrivacyStatus || 'public');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Debounced username availability check
  const checkUsername = useCallback(
    async (value: string) => {
      if (!value || value.length < 3) {
        setUsernameStatus(null);
        setUsernameError(null);
        return;
      }

      // Don't check if username hasn't changed from current user's username
      if (value === user?.username) {
        setUsernameStatus(null);
        setUsernameError(null);
        return;
      }

      setUsernameStatus('checking');
      setUsernameError(null);

      try {
        const isAvailable = await userService.checkUsernameAvailability(value);
        if (isAvailable) {
          setUsernameStatus('available');
        } else {
          setUsernameStatus('taken');
          setUsernameError(t('usernameTaken') || 'Username is already taken');
        }
      } catch (error) {
        setUsernameStatus(null);
        setUsernameError(null);
      }
    },
    [user?.username, t]
  );

  // Debounced effect for username check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username && username !== user?.username) {
        checkUsername(username);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, user?.username, checkUsername]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const updates: {
        firstName: string;
        lastName: string;
        username?: string;
        profilePrivacyStatus?: ProfilePrivacyStatus;
      } = {
        firstName,
        lastName,
      };

      // Only include username if it has changed and is not empty
      if (username && username !== user.username) {
        updates.username = username.toLowerCase().trim();
      }

      // Only include profilePrivacyStatus if it has changed
      if (profilePrivacyStatus !== user.profilePrivacyStatus) {
        updates.profilePrivacyStatus = profilePrivacyStatus;
      }

      const updatedUser = await userService.updateUser(updates);
      setUser(updatedUser);
      setUsername(updatedUser.username || '');
      setProfilePrivacyStatus(updatedUser.profilePrivacyStatus || 'public');
      showToast({
        title: t('profileUpdated'),
        description: t('profileUpdatedDescription'),
      });
    } catch (error) {
      showToast({
        title: t('updateFailed'),
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingImage(true);
    try {
      const updatedUser = await userService.uploadProfilePicture(file);
      setUser(updatedUser);
      showToast({
        title: t('profilePictureUpdated'),
        description: t('profilePictureUpdatedDescription'),
      });
      e.target.value = '';
    } catch (error) {
      showToast({
        title: t('uploadFailed'),
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSignOut = async () => {
    await authService.logout();
    showToast({
      title: t('signedOut'),
      description: t('signedOutDescription'),
    });
    router.push('/login');
  };

  const handleEmailUpdated = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background pb-20 lg:pb-0 lg:pl-64">
          <Navigation />
          <div className="flex items-center justify-center h-[calc(100vh-4rem)] lg:h-screen">
            <div className="text-muted-foreground">{t('loading')}</div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20 lg:pb-0 lg:pl-64">
        <Navigation />
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                {t('title')}
              </h1>
              <p className="text-muted-foreground">{t('description')}</p>
            </div>
          </div>
          <div className="space-y-6">
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle>{t('profilePicture')}</CardTitle>
                <CardDescription>{t('updateProfilePicture')}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={user?.profilePicUrl || '/placeholder.svg'}
                    alt="Profile picture"
                  />
                  <AvatarFallback className="text-lg">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="profile-picture" className="cursor-pointer">
                    <Button
                      variant="outline"
                      disabled={isUploadingImage}
                      asChild
                    >
                      <span>
                        {isUploadingImage ? t('uploading') : t('changePicture')}
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('pictureSizeHint')}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle>{t('personalInformation')}</CardTitle>
                <CardDescription>{t('updatePersonalDetails')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('firstName')}</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('lastName')}</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email ?? ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('emailChangeHint')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className="flex items-center gap-2"
                    >
                      <AtSign className="h-4 w-4" />
                      {t('username')}
                    </Label>
                    <div className="relative">
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) =>
                          setUsername(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9_]/g, '')
                          )
                        }
                        placeholder={t('usernamePlaceholder')}
                        className={`bg-input pr-10 transition-colors ${
                          usernameStatus === 'available'
                            ? 'border-green-500 focus-visible:ring-green-500'
                            : usernameStatus === 'taken'
                              ? 'border-red-500 focus-visible:ring-red-500'
                              : 'border-border'
                        }`}
                      />
                      {usernameStatus === 'available' && (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                      {usernameStatus === 'taken' && (
                        <X className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                      )}
                      {usernameStatus === 'checking' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('usernameHint')}
                    </p>
                    {usernameStatus === 'available' && (
                      <p className="text-xs text-green-600">
                        {t('usernameAvailable') || 'Username is available'}
                      </p>
                    )}
                    {usernameError && (
                      <p className="text-xs text-red-600">{usernameError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="profilePrivacy"
                      className="flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      {tPrivacy('profilePrivacy')}
                    </Label>
                    <Select
                      value={profilePrivacyStatus}
                      onValueChange={(value) =>
                        setProfilePrivacyStatus(value as ProfilePrivacyStatus)
                      }
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          {tPrivacy('public')}
                        </SelectItem>
                        <SelectItem value="private">
                          {tPrivacy('private')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {tPrivacy('profilePrivacyDescription')}
                    </p>
                  </div>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? t('saving') : t('saveChanges')}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle>{t('accountInformation')}</CardTitle>
                <CardDescription>{t('viewAccountDetails')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('memberSince')}
                    </Label>
                    <p className="text-sm text-foreground">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('lastUpdated')}
                    </Label>
                    <p className="text-sm text-foreground">
                      {user?.updatedAt
                        ? new Date(user.updatedAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="space-y-2 mb-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('language')}
                    </Label>
                    <Select
                      value={locale}
                      onValueChange={(value) => setLocale(value as Locale)}
                    >
                      <SelectTrigger className="w-full">
                        <Languages className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder={t('selectLanguage')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">{t('english')}</SelectItem>
                        <SelectItem value="es">{t('spanish')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <KeyRound className="h-4 w-4" />
                      {t('changePassword')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEmailModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      {t('changeEmail')}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive bg-transparent"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('signOut')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <UpdatePasswordModal
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
      />

      <UpdateEmailModal
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        currentEmail={user?.email ?? ''}
        onEmailUpdated={handleEmailUpdated}
      />
    </AuthGuard>
  );
}
