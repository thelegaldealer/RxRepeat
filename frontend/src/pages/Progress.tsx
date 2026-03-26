import React from 'react';
import { TrendingUp, Award, Target, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Progress() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Progress Tracking</h2>
        <p className="text-muted-foreground">
          Monitor your course completion and flashcard mastery metrics.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <Card className="bg-primary/5 border-primary/20">
           <CardContent className="p-6">
              <div className="flex justify-between items-center space-x-2">
                 <h3 className="font-medium text-sm text-muted-foreground">Current Streak</h3>
                 <Flame className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-3xl font-bold mt-2">12 Days</p>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-6">
              <div className="flex justify-between items-center space-x-2">
                 <h3 className="font-medium text-sm text-muted-foreground">Flashcards Mastered</h3>
                 <Award className="h-4 w-4 text-primary" />
              </div>
              <p className="text-3xl font-bold mt-2">842</p>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-6">
              <div className="flex justify-between items-center space-x-2">
                 <h3 className="font-medium text-sm text-muted-foreground">Papers Attempted</h3>
                 <Target className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold mt-2">14</p>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-6">
              <div className="flex justify-between items-center space-x-2">
                 <h3 className="font-medium text-sm text-muted-foreground">Overall Readiness</h3>
                 <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-3xl font-bold mt-2">78%</p>
           </CardContent>
         </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
         <Card>
            <CardHeader>
               <CardTitle>Course Completion</CardTitle>
               <CardDescription>Based on unique pages viewed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                     <span className="font-medium">MPharm Year 1</span>
                     <span className="text-muted-foreground">45%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                     <div className="bg-primary h-2" style={{width: '45%'}} />
                  </div>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                     <span className="font-medium">Clinical Skills</span>
                     <span className="text-muted-foreground">82%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                     <div className="bg-primary h-2" style={{width: '82%'}} />
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
