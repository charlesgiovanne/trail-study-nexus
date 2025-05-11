
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Image, Save, ArrowLeft, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import { store } from "@/lib/store";
import { Topic, Flashcard } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const FlashcardCreator = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (topicId) {
      const fetchedTopic = store.getTopic(topicId);
      if (fetchedTopic) {
        setTopic(fetchedTopic);
        // Check if the user is the creator of the topic
        if (user?.id !== fetchedTopic.createdBy) {
          toast({
            title: "Permission Error",
            description: "You can only add flashcards to your own topics",
            variant: "destructive",
          });
          navigate(`/topic/${topicId}`);
        }
      } else {
        toast({
          title: "Error",
          description: "Topic not found",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    }
  }, [topicId, user?.id, navigate, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    // Clear the file input
    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSaveFlashcard = () => {
    if (!user || !topic || !question.trim() || !answer.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both question and answer fields",
        variant: "destructive",
      });
      return;
    }

    // In a real app, we'd upload the image to a server
    // For this demo, we'll just use the preview URL
    const newFlashcard = store.createFlashcard({
      topicId: topic.id,
      question: question.trim(),
      answer: answer.trim(),
      imageUrl: imagePreview || undefined,
      createdBy: user.id,
    });

    toast({
      title: "Success",
      description: "Flashcard added successfully",
    });

    // Reset form
    setQuestion("");
    setAnswer("");
    setImageUrl("");
    setSelectedFile(null);
    setImagePreview(null);
    
    // Refresh the topic data
    const updatedTopic = store.getTopic(topic.id);
    if (updatedTopic) {
      setTopic(updatedTopic);
    }
  };

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          Loading topic...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/topic/${topic.id}`)}
            className="text-trailblue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Topic
          </Button>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-trailblue-500">
              Add Flashcards to {topic.title}
            </h1>
            <p className="text-gray-500">{topic.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Flashcard</CardTitle>
              <CardDescription>
                Fill in the question and answer for your new flashcard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <Textarea
                  id="question"
                  placeholder="Enter your question here..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <Textarea
                  id="answer"
                  placeholder="Enter your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">
                  Add Image (optional)
                </label>
                <div className="flex items-center space-x-2">
                  <label 
                    htmlFor="image-upload" 
                    className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Choose Image
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  
                  {imagePreview && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500"
                      onClick={handleClearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-40 rounded-md object-contain"
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveFlashcard}
                className="bg-trailyellow hover:bg-trailyellow-600 text-trailblue-500"
                disabled={!question.trim() || !answer.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Flashcard
              </Button>
            </CardFooter>
          </Card>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Current Flashcards</CardTitle>
                <CardDescription>
                  {topic.flashcards.length} card{topic.flashcards.length !== 1 ? 's' : ''} in this topic
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topic.flashcards.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {topic.flashcards.map((flashcard, index) => (
                      <div 
                        key={flashcard.id} 
                        className="p-3 border rounded-md hover:bg-gray-50"
                      >
                        <p className="font-medium">Q: {flashcard.question}</p>
                        <p className="text-gray-500 mt-1">A: {flashcard.answer}</p>
                        {flashcard.imageUrl && (
                          <div className="mt-2">
                            <img 
                              src={flashcard.imageUrl} 
                              alt="Flashcard" 
                              className="max-h-20 object-contain"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No flashcards added yet
                  </p>
                )}
              </CardContent>
              {topic.flashcards.length > 0 && (
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/topic/${topic.id}`)}
                  >
                    View All Flashcards
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

export default FlashcardCreator;
