"use client"

import { useState } from 'react';
import { currentUser } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [user, setUser] = useState(currentUser);
  const { toast } = useToast();

  const handleSave = () => {
    // Simulate saving settings
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Configure how your expense tracker works
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={user.preferences.currency}
                onValueChange={(value) => 
                  setUser({
                    ...user,
                    preferences: {
                      ...user.preferences,
                      currency: value
                    }
                  })
                }
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive daily expense summaries
                </p>
              </div>
              <Switch
                id="notifications"
                checked={user.preferences.notifications}
                onCheckedChange={(checked) =>
                  setUser({
                    ...user,
                    preferences: {
                      ...user.preferences,
                      notifications: checked
                    }
                  })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label>Auto-Add Behavior</Label>
              <RadioGroup
                value={user.preferences.autoAddBehavior}
                onValueChange={(value: 'daily' | 'weekdays' | 'weekends' | 'custom') =>
                  setUser({
                    ...user,
                    preferences: {
                      ...user.preferences,
                      autoAddBehavior: value
                    }
                  })
                }
                className="space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily">Add every day</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekdays" id="weekdays" />
                  <Label htmlFor="weekdays">Weekdays only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekends" id="weekends" />
                  <Label htmlFor="weekends">Weekends only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">Custom schedule</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave}>Save Changes</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Manage your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave}>Save Changes</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}