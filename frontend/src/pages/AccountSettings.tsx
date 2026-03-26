import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, User, Bell, Shield, LogOut, Key, ServerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground">
          Manage your profile, billing, and system preferences.
        </p>
      </div>
      <Separator />

      <div className="flex flex-col lg:flex-row gap-8">
        <Tabs defaultValue="profile" className="w-full">
          <div className="flex flex-col lg:flex-row gap-6">
            <TabsList className="flex flex-col h-auto w-full lg:w-48 bg-transparent space-y-1">
              <TabsTrigger value="profile" className="w-full justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2">
                <User className="mr-2 h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="billing" className="w-full justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2">
                <CreditCard className="mr-2 h-4 w-4" /> Subscription
              </TabsTrigger>
              <TabsTrigger value="notifications" className="w-full justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2">
                <Bell className="mr-2 h-4 w-4" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="w-full justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2">
                <Shield className="mr-2 h-4 w-4" /> Security
              </TabsTrigger>
              {user?.role === 'super_admin' && (
                <TabsTrigger value="admin" className="w-full justify-start data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600 px-4 py-2">
                  <ServerOff className="mr-2 h-4 w-4" /> Developer Tools
                </TabsTrigger>
              )}
            </TabsList>

            <div className="flex-1">
              <TabsContent value="profile" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update how you appear on the platform.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input id="firstName" defaultValue={user?.first_name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input id="lastName" defaultValue={user?.last_name} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input id="email" type="email" defaultValue={user?.email} disabled />
                      <p className="text-xs text-muted-foreground">
                        Your email address is your identity and cannot be changed here.
                      </p>
                    </div>
                    <Button className="mt-2">Save Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>University Details</CardTitle>
                    <CardDescription>Verified academic linkage.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Mocks dynamic linkage */}
                    <div className="flex items-center space-x-4 bg-muted/30 p-4 rounded-lg border">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        UNI
                      </div>
                      <div>
                         <p className="font-medium">University College London (UCL)</p>
                         <p className="text-sm text-muted-foreground">Pharmacy MPharm</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>Manage your active subscriptions and billing cycle.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between sm:items-center bg-card">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">Premium Student Bundle</p>
                          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                            Active
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Renews on April 1st, 2026</p>
                      </div>
                      <p className="text-2xl font-bold mt-4 sm:mt-0">
                        £149<span className="text-sm text-muted-foreground font-normal">/year</span>
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <Button>Manage in Stripe</Button>
                      <Button variant="outline">View Invoices</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Preferences</CardTitle>
                    <CardDescription>Control what alerts we send to your inbox.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">New Uploads</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive an email when a tutor uploads new Module Content.
                        </p>
                      </div>
                      <Switch checked={notifications} onCheckedChange={setNotifications} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Community Replies</Label>
                        <p className="text-sm text-muted-foreground">
                          Get alerts when someone replies to your question in the forum.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Authentication</CardTitle>
                    <CardDescription>Manage your password and active sessions.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Key className="mr-2 h-4 w-4" /> Change Password
                    </Button>
                    <div className="pt-4">
                      <h4 className="font-medium mb-2">Active Sessions</h4>
                      <div className="text-sm p-3 bg-muted/30 border rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium">Windows 11 • Chrome</p>
                          <p className="text-muted-foreground">Current Session</p>
                        </div>
                        <p className="text-xs text-green-600 font-medium">Active Now</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive/20">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible account actions.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive">
                      Delete Account via SLA
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="admin" className="mt-0">
                <Card className="border-red-500/20">
                  <CardHeader>
                    <CardTitle className="text-red-500 flex items-center">
                      <ServerOff className="mr-2 h-5 w-5" /> Operational Controls
                    </CardTitle>
                    <CardDescription>Superadmin overrides. Use with caution.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-lg bg-red-500/5">
                      <div className="space-y-0.5">
                        <Label className="text-base text-red-600 font-semibold">Maintenance Mode</Label>
                        <p className="text-sm text-red-600/80">
                          Block all non-admin traffic immediately via 503 response.
                        </p>
                      </div>
                      <Switch className="data-[state=checked]:bg-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
