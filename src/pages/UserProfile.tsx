
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
import { Folder, Plus, File, FolderPlus } from "lucide-react";
import Navigation from "@/components/Navigation";
import { store } from "@/lib/store";
import { Folder as FolderType, Topic } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const folderFormSchema = z.object({
  name: z.string().min(2, {
    message: "Folder name must be at least 2 characters.",
  }),
});

const addToFolderFormSchema = z.object({
  folderId: z.string({
    required_error: "Please select a folder.",
  }),
  topicId: z.string({
    required_error: "Please select a topic.",
  }),
});

const UserProfile = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isAddToFolderDialogOpen, setIsAddToFolderDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
  const navigate = useNavigate();

  const folderForm = useForm<z.infer<typeof folderFormSchema>>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const addToFolderForm = useForm<z.infer<typeof addToFolderFormSchema>>({
    resolver: zodResolver(addToFolderFormSchema),
    defaultValues: {
      folderId: "",
      topicId: "",
    },
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    if (!user) return;
    
    const userFolders = store.getUserFolders(user.id);
    const userTopics = store.getUserTopics(user.id);
    
    setFolders(userFolders);
    setTopics(userTopics);
  };

  const onFolderSubmit = (values: z.infer<typeof folderFormSchema>) => {
    if (!user) return;
    
    store.createFolder({
      name: values.name,
      topics: [],
      createdBy: user.id,
    });
    
    loadData();
    setIsFolderDialogOpen(false);
    folderForm.reset();
    
    toast.success("Folder created successfully");
  };

  const onAddToFolderSubmit = (values: z.infer<typeof addToFolderFormSchema>) => {
    if (!user) return;
    
    const success = store.addTopicToFolder(values.folderId, values.topicId);
    
    if (success) {
      loadData();
      setIsAddToFolderDialogOpen(false);
      addToFolderForm.reset();
      
      toast.success("Topic added to folder successfully");
    } else {
      toast.error("Failed to add topic to folder");
    }
  };

  const handleFolderClick = (folder: FolderType) => {
    setSelectedFolder(folder);
  };

  const renderFolderContent = () => {
    if (!selectedFolder) return null;
    
    const folderTopics = store.getTopicsInFolder(selectedFolder.id);
    
    return (
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{selectedFolder.name}</CardTitle>
            <CardDescription>Topics in this folder</CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedFolder(null)}
          >
            Back to Folders
          </Button>
        </CardHeader>
        <CardContent>
          {folderTopics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {folderTopics.map((topic) => (
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
              <p className="text-gray-500">No topics in this folder yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
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
          <div className="flex space-x-2">
            <Dialog open={isAddToFolderDialogOpen} onOpenChange={setIsAddToFolderDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Add Topic to Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Topic to Folder</DialogTitle>
                  <DialogDescription>
                    Select a topic and folder to organize your content.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...addToFolderForm}>
                  <form onSubmit={addToFolderForm.handleSubmit(onAddToFolderSubmit)} className="space-y-4">
                    <FormField
                      control={addToFolderForm.control}
                      name="topicId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a topic" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {topics.map((topic) => (
                                <SelectItem key={topic.id} value={topic.id}>
                                  {topic.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addToFolderForm.control}
                      name="folderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Folder</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a folder" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {folders.map((folder) => (
                                <SelectItem key={folder.id} value={folder.id}>
                                  {folder.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit">Add to Folder</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
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
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Folders</h3>
                <p className="mt-1">{folders.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="md:col-span-2">
            {!selectedFolder ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Folders</CardTitle>
                    <CardDescription>Organize your topics into folders</CardDescription>
                  </div>
                  <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Folder
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                        <DialogDescription>
                          Create a new folder to organize your topics.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...folderForm}>
                        <form onSubmit={folderForm.handleSubmit(onFolderSubmit)} className="space-y-4">
                          <FormField
                            control={folderForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Folder Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Math 101" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter>
                            <Button type="submit">Create Folder</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {folders.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {folders.map((folder) => (
                        <Card 
                          key={folder.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleFolderClick(folder)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center space-x-2">
                              <Folder className="h-5 w-5 text-blue-400" />
                              <CardTitle className="text-base">{folder.name}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm text-gray-500">
                              {folder.topics.length} topics
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Folder className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">No folders created</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new folder.</p>
                      <div className="mt-6">
                        <Button 
                          onClick={() => setIsFolderDialogOpen(true)}
                          className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Folder
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : renderFolderContent()}
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Topics</CardTitle>
                <CardDescription>Your recently created topics</CardDescription>
              </CardHeader>
              <CardContent>
                {topics.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {topics.slice(0, 4).map((topic) => (
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
