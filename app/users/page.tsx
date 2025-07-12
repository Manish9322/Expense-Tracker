"use client"

import { useState } from 'react';
import { currentUser } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, CreditCard, Settings, User, Mail } from 'lucide-react';

export default function UsersPage() {
  const [user, setUser] = useState(currentUser);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
        <p className="text-muted-foreground">Manage your account</p>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="https://i.pravatar.cc/150?u=1" alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="mr-1 h-4 w-4" />
                  {user.email}
                </div>
                <Badge variant="outline" className="mt-2">Free Plan</Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Manage your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">{user.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">January 1, 2023</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-sm text-muted-foreground">Today at 10:30 AM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Activity</CardTitle>
                <CardDescription>
                  Your recent activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { icon: Settings, text: "Updated account settings", time: "Today at 9:30 AM" },
                    { icon: CreditCard, text: "Added new expense", time: "Yesterday at 3:15 PM" },
                    { icon: User, text: "Profile updated", time: "Aug 20, 2023" },
                  ].map((activity, i) => {
                    const Icon = activity.icon;
                    return (
                      <div key={i} className="flex items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {activity.text}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plan & Billing</CardTitle>
                <CardDescription>
                  Manage your subscription and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Free Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        Basic expense tracking features
                      </p>
                    </div>
                    <Badge>Current</Badge>
                  </div>
                  <div className="mt-4 text-sm">
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Track up to 10 expense categories
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Basic reporting
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="mr-2">✗</span> Export data
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="mr-2">✗</span> Advanced analytics
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Pro Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        $5.99/month
                      </p>
                    </div>
                    <Badge variant="outline">Upgrade</Badge>
                  </div>
                  <div className="mt-4 text-sm">
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Unlimited expense categories
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Advanced reporting
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Export data
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Advanced analytics
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Preferences</CardTitle>
                <CardDescription>
                  Manage your app experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Currency</p>
                    <p className="text-sm text-muted-foreground">
                      {user.preferences.currency}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Auto-Add Behavior</p>
                    <p className="text-sm text-muted-foreground">
                      {user.preferences.autoAddBehavior === 'daily' && 'Add every day'}
                      {user.preferences.autoAddBehavior === 'weekdays' && 'Weekdays only'}
                      {user.preferences.autoAddBehavior === 'weekends' && 'Weekends only'}
                      {user.preferences.autoAddBehavior === 'custom' && 'Custom schedule'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      {user.preferences.notifications ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">
                      {user.preferences.theme.charAt(0).toUpperCase() + user.preferences.theme.slice(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}