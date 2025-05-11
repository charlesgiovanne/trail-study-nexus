
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Folder, Search } from "lucide-react";
import { store } from "@/lib/store";
import { Topic } from "@/types";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  isPublic: z.boolean().default(false),
});

const Dashboard = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      isPublic: false,
    },
  });

  useEffect(() => {
    if (user) {
      loadTopics();
    }
  }, [user]);

  const loadTopics = () => {
    if (!user) return;
    
    const userTopics = store.getUserTopics(user.id);
    const publicTopics = store.getPublicTopics().filter(
      topic => !userTopics.some(userTopic => userTopic.id === topic.id)
    );
    
    setTopics([...userTopics, ...publicTopics]);
  };

  const filteredTopics = topics.filter((topic) =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const myTopics = filteredTopics.filter(
    (topic) => topic.createdBy === user?.id
  );
  
  const sharedTopics = filteredTopics.filter(
    (topic) => user?.sharedTopics.includes(topic.id)
  );
  
  const publicTopics = filteredTopics.filter(
    (topic) => 
      topic.isPublic && 
      topic.createdBy !== user?.id && 
      !user?.sharedTopics.includes(topic.id)
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    const newTopic = store.createTopic({
      title: values.title,
      description: values.description,
      isPublic: values.isPublic,
      createdBy: user.id,
      flashcards: [],
    });
    
    toast({
      title: "Success!",
      description: "Your topic has been created.",
    });
    
    loadTopics();
    setIsOpen(false);
    form.reset();
  };

  const handleOpenTopic = (topicId: string) => {
    navigate(`/topic/${topicId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-trailblue-500">My Dashboard</h1>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-trailyellow hover:bg-trailyellow-600 text-trailblue-500">
                <Plus className="h-4 w-4 mr-2" />
                Create Topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Topic</DialogTitle>
                <DialogDescription>
                  Create a new topic to start adding flashcards.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. JavaScript Basics" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description of your topic" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Make this topic public for all users
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">Create Topic</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search topics..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="my-topics">
          <TabsList className="mb-4">
            <TabsTrigger value="my-topics">My Topics</TabsTrigger>
            <TabsTrigger value="shared">Shared with Me</TabsTrigger>
            <TabsTrigger value="public">Public Topics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-topics" className="space-y-4">
            {myTopics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myTopics.map((topic) => (
                  <Card 
                    key={topic.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleOpenTopic(topic.id)}
                  >
                    <CardHeader>
                      <CardTitle>{topic.title}</CardTitle>
                      <CardDescription>
                        {topic.isPublic ? 'Public' : 'Private'} • {topic.flashcards.length} cards
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">{topic.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/topic/${topic.id}/create`);
                      }}>
                        Add Flashcards
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Folder className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No topics created</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new topic.</p>
                <div className="mt-6">
                  <Button 
                    onClick={() => setIsOpen(true)}
                    className="bg-trailyellow hover:bg-trailyellow-600 text-trailblue-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Topic
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="shared" className="space-y-4">
            {sharedTopics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedTopics.map((topic) => (
                  <Card 
                    key={topic.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleOpenTopic(topic.id)}
                  >
                    <CardHeader>
                      <CardTitle>{topic.title}</CardTitle>
                      <CardDescription>
                        Shared • {topic.flashcards.length} cards
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">{topic.description}</p>
                      <p className="text-xs text-gray-400 mt-2">Created by: {topic.createdBy}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No shared topics</h3>
                <p className="mt-1 text-sm text-gray-500">Topics shared with you will appear here.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="public" className="space-y-4">
            {publicTopics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicTopics.map((topic) => (
                  <Card 
                    key={topic.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleOpenTopic(topic.id)}
                  >
                    <CardHeader>
                      <CardTitle>{topic.title}</CardTitle>
                      <CardDescription>
                        Public • {topic.flashcards.length} cards
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">{topic.description}</p>
                      <p className="text-xs text-gray-400 mt-2">Created by: {topic.createdBy}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No public topics found</h3>
                <p className="mt-1 text-sm text-gray-500">Public topics from other users will appear here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
