import React from 'react';
import { HeadphonesIcon, Send, Clock, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Contact an Expert</h2>
        <p className="text-muted-foreground">
          Submit a secure academic ticket. Tutors evaluate submissions anonymously.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="e.g. Question regarding Week 3 Pharmacokinetics" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module">Related Module (Optional)</Label>
                <select id="module" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                   <option value="">Select a module...</option>
                   <option value="1">MPharm - Cell Biology</option>
                   <option value="2">MPharm - Anatomy</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Detailed Message</Label>
                <textarea 
                  id="message" 
                  className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe what you need help with..."
                />
              </div>
              <Button className="w-full">
                <Send className="mr-2 h-4 w-4" /> Submit Ticket
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="bg-primary/5 border-primary/20">
             <CardContent className="p-6">
                <HeadphonesIcon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-medium mb-1">Student Support SLA</h3>
                <p className="text-sm text-muted-foreground">
                  Our academic team responds to high-priority tickets within 24 working hours. 
                  Your identity is preserved anonymously to standard admins during grading.
                </p>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-6">
                <Clock className="h-8 w-8 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-1">Past Tickets</h3>
                <div className="text-sm text-muted-foreground flex items-center justify-center p-6 border-2 border-dashed rounded-lg mt-4">
                  No past tickets found.
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
