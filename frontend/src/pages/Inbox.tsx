import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Bell, Check, X, MailOpen, UserPlus, Server, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Inbox() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    api.get('/inbox/')
       .then(res => setNotifications(res.data))
       .catch(console.error)
       .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAction = async (inviteId: number, action: 'accept' | 'reject') => {
    try {
      await api.post(`/chat-invites/${inviteId}/${action}/`);
      fetchNotifications(); // Refresh list to drop the invite
    } catch (err) {
      console.error(`Failed to ${action} invite:`, err);
    }
  };

  const markRead = async (notifId: number) => {
    try {
      await api.post(`/inbox/${notifId}/mark_read/`);
      setNotifications(notifications.map(n => 
        n.id === notifId ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'chat_invite': return <UserPlus className="h-5 w-5 text-blue-500" />;
      case 'ticket_reply': return <Reply className="h-5 w-5 text-emerald-500" />;
      default: return <Server className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inbox</h2>
          <p className="text-muted-foreground">Manage your notifications and pending invites.</p>
        </div>
        <Bell className="h-8 w-8 text-muted-foreground opacity-20" />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-card rounded-lg" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
           <MailOpen className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
           <h3 className="text-lg font-medium">You're all caught up!</h3>
           <p className="text-muted-foreground">No pending notifications in your inbox.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notif => (
            <Card key={notif.id} className={`transition-colors ${notif.is_read ? 'opacity-60 bg-muted/50' : 'border-primary/20 bg-primary/5'}`}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-1">
                  {getIcon(notif.notification_type)}
                </div>
                
                <div className="flex-1 space-y-1">
                  <p className="font-medium leading-none mb-2">
                    {notif.notification_type === 'chat_invite' ? 'New Group Chat Invitation' : 'System Alert'}
                  </p>
                  <p className="text-sm text-foreground/80">
                    {notif.body}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {notif.notification_type === 'chat_invite' && !notif.is_read ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" onClick={() => handleAction(notif.reference_id, 'accept')}>
                        <Check className="h-4 w-4 mr-2"/> Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(notif.reference_id, 'reject')}>
                        <X className="h-4 w-4 mr-2"/> Reject
                      </Button>
                    </div>
                  ) : (
                    !notif.is_read && (
                      <Button size="sm" variant="ghost" onClick={() => markRead(notif.id)}>
                        Mark as Read
                      </Button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
