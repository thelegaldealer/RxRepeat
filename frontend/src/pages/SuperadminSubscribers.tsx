import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuperadminSubscribers() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/subscribers/')
       .then(res => setSubscribers(res.data))
       .catch(err => setError(err.response?.data?.detail || 'Failed to fetch subscribers.'))
       .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full flex justify-center pt-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-xl mx-auto border-destructive/50 bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">Access Denied</CardTitle>
          <CardDescription className="text-destructive/80">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscribers Directory</h2>
        <p className="text-muted-foreground">View all actively subscribed students across all universities.</p>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[150px]">First Name</TableHead>
                  <TableHead className="w-[150px]">Last Name</TableHead>
                  <TableHead className="w-[250px]">Email</TableHead>
                  <TableHead>Active Enrollments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No active subscribers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  subscribers.map((sub: any) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.first_name}</TableCell>
                      <TableCell>{sub.last_name}</TableCell>
                      <TableCell className="text-muted-foreground">{sub.email}</TableCell>
                      <TableCell>
                        {sub.subscribed_courses.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {sub.subscribed_courses.map((course: string, idx: number) => (
                              <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                {course}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">None</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
