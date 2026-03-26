import React, { useState } from 'react';
import { Calendar, Clock, Video, MapPin, Plus, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Schedule() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleOutlookConnect = () => {
    setIsSyncing(true);
    // Mocking OAuth flow initiation
    setTimeout(() => {
      setIsSyncing(false);
      setIsConnected(true);
      alert("Microsoft Graph Connected. Successfully synced 12 upcoming events from Outlook.");
    }, 1500);
  };

  // Generate a mock 35-day grid for UI scaffolding
  const days = Array.from({ length: 35 }, (_, i) => i - 2);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Schedule & Calendar</h2>
          <p className="text-muted-foreground">Manage your lectures, seminars, and study groups.</p>
        </div>
        <div className="flex space-x-3">
           <Button variant="outline">
             <Plus className="h-4 w-4 mr-2" /> New Event
           </Button>
           {isConnected ? (
              <Button variant="secondary" onClick={() => {
                setIsSyncing(true);
                setTimeout(() => setIsSyncing(false), 800);
              }}>
                <RefreshCcw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} /> 
                {isSyncing ? 'Syncing...' : 'Synced with Outlook'}
              </Button>
           ) : (
              <Button className="bg-[#0078D4] hover:bg-[#006cbd] text-white" onClick={handleOutlookConnect} disabled={isSyncing}>
                {isSyncing ? (
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                   <svg className="h-4 w-4 mr-2 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                     <path d="M22.04 2.89l-10 1.6V11H22.04V2.89zm-10 8.11H2L12 11zhzM22.04 13H12v8.57l10-1.63V13zm-10 0H2v8.11h10V13z" />
                   </svg>
                )}
                {isSyncing ? 'Redirecting to Microsoft...' : 'Connect Outlook'}
              </Button>
           )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Calendar View */}
        <Card className="lg:col-span-3 bg-card shadow-sm">
          <div className="p-4 border-b flex items-center justify-between">
             <h3 className="font-semibold text-lg">March 2026</h3>
             <div className="flex space-x-2">
               <Button variant="outline" size="sm">Prev</Button>
               <Button variant="outline" size="sm">Today</Button>
               <Button variant="outline" size="sm">Next</Button>
             </div>
          </div>
          <div className="grid grid-cols-7 border-b text-center text-sm font-medium text-muted-foreground">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="py-3 border-r last:border-r-0">{d}</div>
            ))}
          </div>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-[120px]">
             {days.map((dayNum, i) => {
               const isCurrentMonth = dayNum > 0 && dayNum <= 31;
               const isToday = dayNum === 15;
               return (
                 <div key={i} className={`
                   border-r border-b p-2 transition-colors hover:bg-muted/50 cursor-pointer
                   ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground/50' : ''}
                   ${isToday ? 'bg-primary/5' : ''}
                 `}>
                    <div className="flex justify-between items-start">
                      <span className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                        {dayNum > 0 ? (dayNum <= 31 ? dayNum : dayNum - 31) : 28 + dayNum}
                      </span>
                    </div>
                    
                    {/* Mock Events */}
                    {isCurrentMonth && dayNum === 15 && (
                      <div className="mt-1 space-y-1">
                         <div className="text-[10px] bg-red-500/10 text-red-600 px-1.5 py-0.5 rounded truncate font-medium">
                            10:00 AM - Pharmacology
                         </div>
                         <div className="text-[10px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded truncate font-medium">
                            2:00 PM - Lab Session
                         </div>
                      </div>
                    )}
                    {isCurrentMonth && dayNum === 18 && (
                      <div className="mt-1">
                         <div className="text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded truncate font-medium">
                            Study Group Beta
                         </div>
                      </div>
                    )}
                 </div>
               );
             })}
          </div>
        </Card>

        {/* Upcoming List */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Today</CardTitle>
              <CardDescription>2 scheduled events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative pl-4 border-l-2 border-red-500 space-y-1.5">
                <p className="text-sm font-semibold">Advanced Pharmacology L6</p>
                <div className="flex text-xs text-muted-foreground items-center">
                  <Clock className="h-3 w-3 mr-1" /> 10:00 AM - 11:30 AM
                </div>
                <div className="flex text-xs text-muted-foreground items-center">
                  <Video className="h-3 w-3 mr-1" /> Microsoft Teams
                </div>
              </div>
              <div className="relative pl-4 border-l-2 border-blue-500 space-y-1.5">
                <p className="text-sm font-semibold">Clinical Skills Lab</p>
                <div className="flex text-xs text-muted-foreground items-center">
                  <Clock className="h-3 w-3 mr-1" /> 2:00 PM - 5:00 PM
                </div>
                <div className="flex text-xs text-muted-foreground items-center">
                  <MapPin className="h-3 w-3 mr-1" /> Room 4B, South Wing
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader className="pb-3">
               <CardTitle className="text-lg">Graph API Status</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="flex items-center space-x-3 text-sm">
                  <div className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-destructive'}`}></div>
                  <p className="font-medium">{isConnected ? 'Connected to Azure AD' : 'Disconnected'}</p>
               </div>
               {!isConnected && (
                 <p className="text-xs text-muted-foreground mt-2">
                   Connect your university Outlook account to sync your academic timetable automatically.
                 </p>
               )}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
