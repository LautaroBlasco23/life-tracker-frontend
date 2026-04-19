'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
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
import { ThemeToggle } from '@/components/theme-toggle';
import { authService } from '@/services/auth-service';
import { userService } from '@/services/user-service';
import type { User } from '@/types/user';
import { LogOut, KeyRound, Mail, Languages } from 'lucide-react';
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
  const { locale, setLocale } = useLanguage();

  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userService.getMyProfile();
        setUser(profile);
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
      } catch {
        const cachedUser = authService.getCurrentUser();
        if (cachedUser) {
          setUser(cachedUser);
          setFirstName(cachedUser.firstName);
          setLastName(cachedUser.lastName);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const updatedUser = await userService.updateUser({
        firstName,
        lastName,
      });
      setUser(updatedUser);
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
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-muted-foreground">{t('loading')}</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <Navigation />
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                {t('title')}
              </h1>
              <p className="text-muted-foreground">{t('description')}</p>
            </div>
            <ThemeToggle />
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
