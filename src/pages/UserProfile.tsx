
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, File } from "lucide-react";
import Navigation from "@/components/Navigation";
import { store } from "@/lib/store";
import { Topic } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const UserProfile = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    if (!user) return;
    
    const userTopics = store.getUserTopics(user.id);
    setTopics(userTopics);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">My Profile</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                <p className="mt-1">{user.fullName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                <p className="mt-1">{user.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Topics</h3>
                <p className="mt-1">{topics.length}</p>
              </div>

            </CardContent>
          </Card>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Topics</CardTitle>
                <CardDescription>All your created topics</CardDescription>
              </CardHeader>
              <CardContent>
                {topics.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {topics.map((topic) => (
                      <Card 
                        key={topic.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/topic/${topic.id}`)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center space-x-2">
                            <File className="h-5 w-5 text-blue-400" />
                            <CardTitle className="text-base">{topic.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-gray-500 truncate">
                            {topic.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {topic.flashcards.length} cards • {topic.isPublic ? 'Public' : 'Private'}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">You haven't created any topics yet</p>
                  </div>
                )}
              </CardContent>
              {topics.length > 0 && (
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/dashboard')}
                  >
                    View All Topics
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
