import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { University, Course } from '../types';

export default function Onboarding() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [firstName, setFirstName] = useState(location.state?.first_name || '');
  const [lastName, setLastName] = useState(location.state?.last_name || '');
  const [universityId, setUniversityId] = useState('');
  const [courseId, setCourseId] = useState('');
  
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!location.state?.email) {
      navigate('/login');
    }
  }, [location, navigate]);

  useEffect(() => {
    api.get<University[]>('/universities/').then(res => setUniversities(res.data)).catch(console.error);
    api.get<Course[]>('/courses/').then(res => setCourses(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!universityId || !courseId || !firstName || !lastName) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post('/onboarding/', {
        email: location.state?.email,
        first_name: firstName,
        last_name: lastName,
        university: universityId,
        course: courseId
      });
      login(res.data.access, res.data.refresh);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(c => c.universityId === universityId);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Complete your profile
          </CardTitle>
          <CardDescription className="text-center">
            You're almost there! We just need a few more details.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100/50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  required 
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  required 
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <select 
                id="university" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={universityId} 
                onChange={e => { setUniversityId(e.target.value); setCourseId(''); }}
                required
              >
                <option value="">Select University</option>
                {universities.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <select 
                id="course" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={courseId} 
                onChange={e => setCourseId(e.target.value)}
                required
                disabled={!universityId}
              >
                <option value="">Select Course</option>
                {filteredCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Complete Setup'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
