import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MessageSquare, Megaphone, Hash, Users, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

export default function Community() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'announcements' | 'chat'>('announcements');

  useEffect(() => {
    api.get('/announcements/')
       .then(res => setAnnouncements(res.data))
       .catch(err => console.error('Failed to load announcements', err));
  }, []);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Community & Forums</h2>
          <p className="text-muted-foreground">Stay updated and collaborate with your peers.</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Sidebar - Navigation */}
        <div className="w-64 flex flex-col space-y-4">
          <div className="space-y-1">
            <Button 
              variant={activeTab === 'announcements' ? 'secondary' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('announcements')}
            >
              <Megaphone className="mr-2 h-4 w-4" />
              Official Announcements
            </Button>
            <Button 
              variant={activeTab === 'chat' ? 'secondary' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              My Chats
            </Button>
          </div>

          {activeTab === 'chat' && (
            <div className="mt-8 flex-1">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Direct Messages</h3>
              <ScrollArea className="h-full pr-4">
                {/* Scaffolded Chat List */}
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                    <Hash className="mr-2 h-4 w-4" /> MPharm Year 1
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" /> Study Group Alpha
                  </Button>
                  <div className="p-4 text-xs text-center text-muted-foreground border border-dashed rounded mt-4">
                    More chats will appear here after accepting invites in your Inbox.
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <Card className="flex-1 flex flex-col overflow-hidden bg-card/50">
          {activeTab === 'announcements' ? (
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {announcements.length === 0 ? (
                  <div className="text-center py-20">
                    <Megaphone className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                    <h3 className="text-lg font-medium">No Announcements</h3>
                    <p className="text-muted-foreground">You have no new broadcast messages.</p>
                  </div>
                ) : (
                  announcements.map((a: any) => (
                    <div key={a.id} className="p-6 rounded-lg border bg-background space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold leading-none tracking-tight">{a.title}</h3>
                        <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
                           {new Date(a.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{a.body}</p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex flex-col">
               <div className="flex-1 flex items-center justify-center text-muted-foreground">
                 <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto opacity-20 mb-4" />
                    <p>Select a chat from the sidebar to start messaging.</p>
                    <p className="text-xs mt-2">Real-time sync coming soon.</p>
                 </div>
               </div>
               <div className="p-4 border-t bg-background flex gap-4">
                  <Input placeholder="Type your message disabled..." disabled />
                  <Button disabled><Send className="h-4 w-4"/></Button>
               </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
