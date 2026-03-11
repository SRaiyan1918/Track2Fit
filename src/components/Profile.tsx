import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, 
  Mail, 
  Scale, 
  Save,
  CheckCircle2,
  Calculator
} from 'lucide-react';
import { cn, calculateBMI, getBMICategoryLabel } from '@/lib/utils';
import { updateUserProfile } from '@/lib/firebase';

export function Profile() {
  const { user, userProfile, refreshProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    weight: '',
    targetWeight: '',
    height: '',
    gender: '',
    age: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        weight: userProfile.weight?.toString() || '',
        targetWeight: userProfile.targetWeight?.toString() || '',
        height: userProfile.height?.toString() || '',
        gender: userProfile.gender || '',
        age: userProfile.age?.toString() || ''
      });
    }
  }, [userProfile]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    
    // Safety timeout - agar 8 seconds mein complete nahi hua to loading band kar do
    const timeoutId = setTimeout(() => {
      setSaving(false);
      alert('Save timeout. Please check your internet connection.');
    }, 15000);
    
    try {
      console.log('Saving profile data:', formData);
      
      // Data validation
      const profileData = {
        name: formData.name || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        gender: formData.gender || null,
        age: formData.age ? parseInt(formData.age) : null,
        email: user.email, // Email bhi save karo
        photoURL: user.photoURL // Photo URL bhi save karo
      };
      
      await updateUserProfile(user.uid, profileData);
      await refreshProfile();
      
      clearTimeout(timeoutId); // Timeout clear karo
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
    } catch (error) {
      clearTimeout(timeoutId); // Error mein bhi timeout clear karo
      console.error('Error saving profile:', error);
      
      // User ko error message dikhao
      alert('Failed to save profile. Error: ' + (error as Error).message);
      
    } finally {
      setSaving(false); // Finally mein hamesha false karo
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate BMI
  const bmi = formData.weight && formData.height 
    ? calculateBMI(parseFloat(formData.weight), parseFloat(formData.height))
    : null;

  // Calculate recommended water intake
  const waterIntake = formData.weight 
    ? Math.round(parseFloat(formData.weight) * 32.5 / 100) * 100
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-7 h-7 text-blue-500" />
          Profile
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your personal information and health goals
        </p>
      </div>

      {/* Profile Card */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={userProfile?.photoURL || ''} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white text-2xl">
                {getInitials(formData.name || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {formData.name || 'Your Name'}
              </h2>
              <p className="text-slate-500 flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4" />
                {userProfile?.email}
              </p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                {bmi && (
                  <Badge className={cn(
                    'font-medium',
                    bmi.category === 'normal' ? 'bg-green-100 text-green-700' :
                    bmi.category === 'underweight' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-orange-100 text-orange-700'
                  )}>
                    BMI: {bmi.value}
                  </Badge>
                )}
                {waterIntake && (
                  <Badge className="bg-blue-100 text-blue-700">
                    Water Goal: {waterIntake}ml
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Stats */}
      {bmi && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-500" />
              Health Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                <p className="text-sm text-slate-500 mb-1">BMI</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{bmi.value}</p>
                <p className={cn(
                  'text-sm font-medium',
                  bmi.category === 'normal' ? 'text-green-600' :
                  bmi.category === 'underweight' ? 'text-yellow-600' :
                  'text-orange-600'
                )}>
                  {getBMICategoryLabel(bmi.category)}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                <p className="text-sm text-slate-500 mb-1">Daily Water Goal</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {waterIntake}ml
                </p>
                <p className="text-sm text-slate-500">
                  Based on your weight
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                <p className="text-sm text-slate-500 mb-1">Weight to Goal</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formData.targetWeight && formData.weight 
                    ? `${(parseFloat(formData.weight) - parseFloat(formData.targetWeight)).toFixed(1)} kg`
                    : '--'
                  }
                </p>
                <p className="text-sm text-slate-500">
                  {formData.targetWeight && formData.weight 
                    ? parseFloat(formData.weight) > parseFloat(formData.targetWeight)
                      ? 'to lose'
                      : 'to gain'
                    : 'Set a target'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Profile Form */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => handleChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    placeholder="Your age"
                  />
                </div>
              </div>
            </div>

            {/* Body Measurements */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Body Measurements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Current Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    placeholder="e.g., 70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    step="0.1"
                    value={formData.targetWeight}
                    onChange={(e) => handleChange('targetWeight', e.target.value)}
                    placeholder="e.g., 65"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    placeholder="e.g., 175"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="min-w-[120px]"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : saved ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
