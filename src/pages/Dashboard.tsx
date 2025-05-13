
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Folder, Search } from "lucide-react";
import { toast } from "sonner";
import { store } from "@/lib/store";
import { Topic } from "@/types";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import NewTopicDialog from "@/components/dashboard/NewTopicDialog";
import TopicGrid from "@/components/dashboard/TopicGrid";

const Dashboard = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
    (topic) => user?.sharedTopics?.includes(topic.id)
  );
  
  const publicTopics = filteredTopics.filter(
    (topic) => 
      topic.isPublic && 
      topic.createdBy !== user?.id && 
      !(user?.sharedTopics?.includes(topic.id))
  );

  const onSubmit = (values: { title: string; description: string; isPublic: boolean }) => {
    if (!user) return;
    
    const newTopic = store.createTopic({
      title: values.title,
      description: values.description,
      isPublic: values.isPublic,
      createdBy: user.id,
      flashcards: [],
    });
    
    toast.success("Your topic has been created.");
    
    loadTopics();
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">My Dashboard</h1>
          
          <Button 
            className="bg-secondary hover:bg-secondary/80 text-primary font-medium w-full sm:w-auto"
            onClick={() => setIsOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Topic
          </Button>
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
        
        <Tabs defaultValue="my-topics" className="w-full">
          <TabsList className="mb-4 w-full grid grid-cols-3 bg-muted">
            <TabsTrigger value="my-topics" className="data-[state=active]:bg-secondary data-[state=active]:text-primary data-[state=active]:font-medium">My Topics</TabsTrigger>
            <TabsTrigger value="shared" className="data-[state=active]:bg-secondary data-[state=active]:text-primary data-[state=active]:font-medium">Shared</TabsTrigger>
            <TabsTrigger value="public" className="data-[state=active]:bg-secondary data-[state=active]:text-primary data-[state=active]:font-medium">Public</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-topics" className="space-y-4">
            <TopicGrid
              topics={myTopics}
              emptyTitle="No topics created"
              emptyDescription="Get started by creating a new topic."
              showAddButton={true}
              onCreateClick={() => setIsOpen(true)}
              showCreateButton={true}
            />
          </TabsContent>
          
          <TabsContent value="shared" className="space-y-4">
            <TopicGrid
              topics={sharedTopics}
              emptyTitle="No shared topics"
              emptyDescription="Topics shared with you will appear here."
              creatorInfo={true}
            />
          </TabsContent>
          
          <TabsContent value="public" className="space-y-4">
            <TopicGrid
              topics={publicTopics}
              emptyTitle="No public topics found"
              emptyDescription="Public topics from other users will appear here."
              creatorInfo={true}
            />
          </TabsContent>
        </Tabs>
      </div>

      <NewTopicDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default Dashboard;
