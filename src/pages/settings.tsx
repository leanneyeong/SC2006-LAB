import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Toaster, toast } from 'sonner';
import { Navigation } from '~/components/global/navigation';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
import { Eye, EyeOff, User, Lock, Moon, Sun, Check, Loader2 } from 'lucide-react';
import { api } from '~/utils/api';
import { TopBar } from '~/components/global/top-bar-others';

const ProfileSettings: React.FC = () => {
  const router = useRouter();
  
  // User data query
  const { data: userData, isLoading: isUserLoading } = api.user.get.useQuery();

  // Mutations
  const { mutateAsync: updateNameDetailsMutation } = api.user.updateNames.useMutation();
  const { mutateAsync: updatePasswordMutation } = api.user.updatePassword.useMutation();

  // Define types for form states
  interface PasswordFormState {
    newPassword: string;
    confirmPassword: string;
    showNew: boolean;
    showConfirm: boolean;
  }

  // Form states - now including name fields
  const [nameForm, setNameForm] = useState({
    firstName: '',
    lastName: ''
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    newPassword: '',
    confirmPassword: '',
    showNew: false,
    showConfirm: false
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNameSubmitting, setIsNameSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // Initialize name form state with user data when it becomes available
  useEffect(() => {
    if (userData) {
      setNameForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || ''
      });
    }
  }, [userData]);

  // Load dark mode preference from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark/light mode
  const handleThemeToggle = (): void => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    
    if (newDarkModeState) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    toast.success('Theme preference saved');
  };

  // Handle name field changes
  const handleNameChange = (field: keyof typeof nameForm, value: string): void => {
    setNameForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle form password field changes
  const handlePasswordChange = (field: keyof Pick<PasswordFormState, 'newPassword' | 'confirmPassword'>, value: string): void => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle visibility toggle for password fields
  const togglePasswordVisibility = (field: keyof Pick<PasswordFormState, 'showNew' | 'showConfirm'>): void => {
    setPasswordForm(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Handle name update - now uses the nameForm state
  const handleNameUpdate = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!userData) return;
    
    setIsNameSubmitting(true);
    
    const loadingToast = toast.loading('Updating name...');
    
    try {
      await updateNameDetailsMutation({
        firstName: nameForm.firstName,
        lastName: nameForm.lastName
      });
      
      toast.dismiss(loadingToast);
      toast.success('Name updated successfully');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to update name');
    } finally {
      setIsNameSubmitting(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Validation
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 12 characters');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setIsPasswordSubmitting(true);
    
    const loadingToast = toast.loading('Updating password...');
    
    try {
      await updatePasswordMutation({
        password: passwordForm.newPassword,
      });
      
      toast.dismiss(loadingToast);
      toast.success('Password updated successfully');
      
      // Reset form
      setPasswordForm({
        newPassword: '',
        confirmPassword: '',
        showNew: false,
        showConfirm: false
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to update password');
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  if (isUserLoading) {
    return (
      <Navigation>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Navigation>
    );
  }

  return (
    <Navigation>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <TopBar />
        
        {/* Content */}
        <main className="p-6 flex-1 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Profile Settings</h2>
            
            <Toaster closeButton />
            
            {/* Name Card */}
            <Card className="mb-6 dark:bg-gray-700 dark:text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Update your first and last name
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNameUpdate}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input
                          id="first-name"
                          value={nameForm.firstName}
                          onChange={(e) => handleNameChange('firstName', e.target.value)}
                          className="dark:bg-gray-600 dark:text-white dark:border-gray-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input
                          id="last-name"
                          value={nameForm.lastName}
                          onChange={(e) => handleNameChange('lastName', e.target.value)}
                          className="dark:bg-gray-600 dark:text-white dark:border-gray-500"
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      disabled={isNameSubmitting}
                    >
                      {isNameSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Name'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {/* Password Card */}
            <Card className="mb-6 dark:bg-gray-700 dark:text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Update your password to secure your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={passwordForm.showNew ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          className="pr-10 dark:bg-gray-600 dark:text-white dark:border-gray-500"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('showNew')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300"
                        >
                          {passwordForm.showNew ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={passwordForm.showConfirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          className="pr-10 dark:bg-gray-600 dark:text-white dark:border-gray-500"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('showConfirm')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300"
                        >
                          {passwordForm.showConfirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      disabled={isPasswordSubmitting}
                    >
                      {isPasswordSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {/* Theme Toggle Card */}
            <Card className="dark:bg-gray-700 dark:text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {isDarkMode ? (
                    <Moon className="mr-2 h-5 w-5" />
                  ) : (
                    <Sun className="mr-2 h-5 w-5" />
                  )}
                  Appearance
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Toggle between light and dark mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    <span className="dark:text-gray-300">Light</span>
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={handleThemeToggle}
                  />
                  <div className="flex items-center space-x-2">
                    <span className="dark:text-gray-300">Dark</span>
                    <Moon className="h-5 w-5 text-blue-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </Navigation>
  );
};

export default ProfileSettings;