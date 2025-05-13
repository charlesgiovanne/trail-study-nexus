
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Play } from "lucide-react";
import Navigation from "@/components/Navigation";
import { store } from "@/lib/store";
import { Topic, Flashcard } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const TopicView = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (topicId) {
      const fetchedTopic = store.getTopic(topicId);
      if (fetchedTopic) {
        setTopic(fetchedTopic);
      } else {
        toast.error("Topic not found");
        navigate("/dashboard");
      }
    }
  }, [topicId, navigate]);

  const handleNext = () => {
    if (!topic?.flashcards.length) return;
    setFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % topic.flashcards.length);
  };

  const handlePrevious = () => {
    if (!topic?.flashcards.length) return;
    setFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + topic.flashcards.length) % topic.flashcards.length);
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const startQuiz = () => {
    // Navigate to the quiz mode page
    navigate(`/quiz/${topicId}`);
  };

  const isCreator = user?.id === topic?.createdBy;
  const currentCard = topic?.flashcards[currentIndex];
  const totalCards = topic?.flashcards.length || 0;

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-trailblue-500">{topic.title}</h1>
            <p className="text-gray-500">{topic.description}</p>
          </div>
          
          <div className="flex space-x-2">
            {isCreator && (
              <Button 
                onClick={() => navigate(`/topic/${topic.id}/create`)}
                className="bg-trailyellow hover:bg-trailyellow-600 text-trailblue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Cards
              </Button>
            )}
            
            {topic.flashcards.length > 0 && (
              <Button onClick={startQuiz}>
                <Play className="h-4 w-4 mr-2" />
                Start Quiz
              </Button>
            )}
          </div>
        </div>
        
        {topic.flashcards.length > 0 ? (
          <>
            <div className="max-w-lg mx-auto mb-6">
              <div 
                className={`flashcard ${flipped ? 'flipped' : ''} h-64 w-full cursor-pointer`}
                onClick={handleFlip}
              >
                <div className="flashcard-inner h-full">
                  <div className="flashcard-front rounded-lg shadow-lg bg-white p-6 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-2">Question</h2>
                      <p>{currentCard?.question}</p>
                      {currentCard?.imageUrl && (
                        <img 
                          src={currentCard.imageUrl}
                          alt="Flashcard question"
                          className="mt-4 max-h-32 mx-auto object-contain"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flashcard-back rounded-lg shadow-lg bg-trailyellow p-6 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-2">Answer</h2>
                      <p>{currentCard?.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-500 mt-2">
                Click on the card to flip it
              </div>
            </div>
            
            <div className="flex justify-center items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm">
                {currentIndex + 1} / {totalCards}
              </span>
              
              <Button 
                variant="outline" 
                onClick={handleNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No flashcards yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isCreator 
                ? "Start adding flashcards to your topic." 
                : "This topic doesn't have any flashcards yet."
              }
            </p>
            
            {isCreator && (
              <div className="mt-6">
                <Button 
                  onClick={() => navigate(`/topic/${topic.id}/create`)}
                  className="bg-trailyellow hover:bg-trailyellow-600 text-trailblue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Flashcards
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicView;
