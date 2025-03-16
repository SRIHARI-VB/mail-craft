
import React from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ChevronRight, CreditCard, User, Mail, Shield, LogOut } from "lucide-react";

const Settings = () => {
  const handleSaveChanges = () => {
    toast.success("Settings saved");
  };

  return (
    <Layout>
      <div className="p-6 overflow-auto h-screen">
        <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-1">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          <Tabs defaultValue="account" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="api">API & Integrations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveChanges}>Save Changes</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Security</CardTitle>
                      <CardDescription>Manage your password and security settings</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" defaultValue="********" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveChanges}>Update Password</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-destructive/10 p-2 rounded-full">
                      <LogOut className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <CardTitle>Account Actions</CardTitle>
                      <CardDescription>Manage your account status</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="destructive" className="w-full sm:w-auto">
                      Delete Account
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      This will permanently delete your account and all associated data.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="editor" className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Editor Preferences</CardTitle>
                  <CardDescription>Customize how the editor works for you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show grid lines</Label>
                      <p className="text-sm text-muted-foreground">
                        Display alignment grid in the editor
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto save</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save changes as you edit
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show element outlines</Label>
                      <p className="text-sm text-muted-foreground">
                        Display borders around elements in the editor
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveChanges}>Save Preferences</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Email Defaults</CardTitle>
                  <CardDescription>Set default values for new email templates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultWidth">Default Email Width</Label>
                    <Input id="defaultWidth" defaultValue="600px" />
                    <p className="text-xs text-muted-foreground">
                      Standard width for email clients is 600px
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultFont">Default Font</Label>
                    <Input id="defaultFont" defaultValue="Arial, Helvetica, sans-serif" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultFontSize">Default Font Size</Label>
                    <Input id="defaultFontSize" defaultValue="16px" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveChanges}>Save Defaults</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="billing" className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Billing Information</CardTitle>
                      <CardDescription>Manage your subscription and payment methods</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Free Plan</h3>
                        <p className="text-sm text-muted-foreground">Basic access to email templates</p>
                      </div>
                      <Button variant="outline">Upgrade</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Available Plans</h3>
                    <div className="grid gap-3">
                      <div className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                        <div className="flex-1">
                          <div className="font-medium">Pro</div>
                          <div className="text-sm text-muted-foreground">$19/month</div>
                        </div>
                        <div className="text-muted-foreground">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                        <div className="flex-1">
                          <div className="font-medium">Business</div>
                          <div className="text-sm text-muted-foreground">$49/month</div>
                        </div>
                        <div className="text-muted-foreground">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                        <div className="flex-1">
                          <div className="font-medium">Enterprise</div>
                          <div className="text-sm text-muted-foreground">Custom pricing</div>
                        </div>
                        <div className="text-muted-foreground">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="api" className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Email Service Providers</CardTitle>
                      <CardDescription>Connect your email service for sending templates</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailProvider">Email Provider</Label>
                    <Input id="emailProvider" placeholder="Select a provider..." />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input id="apiKey" type="password" placeholder="Enter your API key" />
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label>Verify email templates</Label>
                      <p className="text-sm text-muted-foreground">
                        Test emails on major clients before sending
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveChanges}>Connect Provider</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
