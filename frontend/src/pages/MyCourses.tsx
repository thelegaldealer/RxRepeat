import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2, BookOpen, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MyCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/my-courses/')
       .then(res => setCourses(res.data))
       .catch(err => console.error('Failed to load courses', err))
       .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here are the courses you are currently studying.</p>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-card border-dashed">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">No active enrollments</h3>
          <p className="text-muted-foreground max-w-sm mt-2 mb-6">
            You aren't subscribed to any courses yet. Browse your university's offerings to start learning.
          </p>
          <Button asChild>
            <Link to="/dashboard?search=all">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <Card key={course.id} className="group hover:border-primary/50 transition-colors flex flex-col">
              <CardHeader>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                  <GraduationCap className="h-4 w-4 shrink-0" />
                  <span className="truncate">Course Content</span>
                </div>
                <CardTitle className="line-clamp-2 leading-tight">{course.title || course.name}</CardTitle>
                <CardDescription>{course.code}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* We can add progress bars here in the future natively supported by Shadcn */}
                <div className="w-full bg-secondary h-2 rounded-full mt-4 overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: '0%' }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">0% Complete</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/dashboard/courses/${course.id}`}>
                    Enter Course View
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
