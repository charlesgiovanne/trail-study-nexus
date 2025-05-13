import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check, X, RotateCcw, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import { store } from "@/lib/store";
import { Topic, Flashcard } from "@/types";
import { Progress } from "@/components/ui/progress";

interface QuizResult {
  flashcardId: string;
  correct: boolean;
  userAnswer?: string;
}

const QuizMode = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (topicId) {
      const fetchedTopic = store.getTopic(topicId);
      if (fetchedTopic) {
        setTopic(fetchedTopic);
        // Shuffle flashcards for quiz mode
        const shuffled = [...fetchedTopic.flashcards].sort(() => Math.random() - 0.5);
        setFlashcards(shuffled);
      } else {
        toast.error("Topic not found");
        navigate("/dashboard");
      }
    }
  }, [topicId, navigate]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleUserAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserAnswer(e.target.value);
  };

  const handleSubmitAnswer = () => {
    if (userAnswer.trim() === "") {
      toast.error("Please enter an answer");
      return;
    }
    setShowAnswer(true);
  };

  const handleAnswer = (correct: boolean) => {
    if (!flashcards[currentIndex]) return;
    
    const result: QuizResult = {
      flashcardId: flashcards[currentIndex].id,
      correct,
      userAnswer
    };
    
    setResults([...results, result]);
    
    // Move to next card or end quiz
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setUserAnswer("");
    } else {
      setQuizComplete(true);
    }
  };

  const restartQuiz = () => {
    // Reshuffle cards
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
    setUserAnswer("");
    setResults([]);
    setQuizComplete(false);
  };

  const returnToTopic = () => {
    navigate(`/topic/${topicId}`);
  };

  const currentCard = flashcards[currentIndex];
  const progress = flashcards.length > 0 ? ((currentIndex + (quizComplete ? 1 : 0)) / flashcards.length) * 100 : 0;
  const correctAnswers = results.filter(r => r.correct).length;

  if (!topic || flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          Loading quiz...
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
            <h1 className="text-3xl font-bold text-trailblue-500">Quiz: {topic.title}</h1>
            <p className="text-gray-500">Test your knowledge</p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={returnToTopic}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Topic
          </Button>
        </div>
        
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>Progress: {currentIndex + (quizComplete ? 1 : 0)}/{flashcards.length}</span>
            <span>Score: {correctAnswers}/{results.length}</span>
          </div>
        </div>
        
        {!quizComplete ? (
          <div className="max-w-lg mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-center">Question</CardTitle>
              </CardHeader>
              <CardContent className="text-center p-6">
                <p className="text-lg">{currentCard.question}</p>
                {currentCard.imageUrl && (
                  <img 
                    src={currentCard.imageUrl}
                    alt="Question"
                    className="mt-4 max-h-48 mx-auto object-contain"
                  />
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                {!showAnswer ? (
                  <div className="w-full space-y-4">
                    <Textarea
                      placeholder="Type your answer here..."
                      className="w-full min-h-24"
                      value={userAnswer}
                      onChange={handleUserAnswerChange}
                    />
                    <Button 
                      className="w-full bg-trailblue-500 hover:bg-trailblue-600"
                      onClick={handleSubmitAnswer}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit Answer
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 w-full mb-4">
                      <div className="bg-gray-100 p-4 rounded-md w-full">
                        <h3 className="font-semibold mb-2">Your Answer:</h3>
                        <p>{userAnswer}</p>
                      </div>
                      <div className="bg-trailyellow p-4 rounded-md w-full">
                        <h3 className="font-semibold mb-2">Correct Answer:</h3>
                        <p>{currentCard.answer}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 w-full">
                      <Button 
                        className="flex-1 bg-red-500 hover:bg-red-600"
                        onClick={() => handleAnswer(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Incorrect
                      </Button>
                      <Button 
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        onClick={() => handleAnswer(true)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Correct
                      </Button>
                    </div>
                  </>
                )}
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="max-w-lg mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-center">Quiz Complete!</CardTitle>
              </CardHeader>
              <CardContent className="text-center p-6">
                <div className="text-4xl font-bold mb-4">
                  {correctAnswers} / {results.length}
                </div>
                <p className="text-lg mb-6">
                  You got {correctAnswers} out of {results.length} correct ({Math.round((correctAnswers / results.length) * 100)}%)
                </p>
                
                <div className="mb-6 max-h-60 overflow-y-auto border rounded-md">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="p-3 border-b">Question</th>
                        <th className="p-3 border-b">Your Answer</th>
                        <th className="p-3 border-b">Correct Answer</th>
                        <th className="p-3 border-b">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => {
                        const flashcard = flashcards.find(f => f.id === result.flashcardId);
                        return (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="p-3 border-b">{flashcard?.question}</td>
                            <td className="p-3 border-b">{result.userAnswer}</td>
                            <td className="p-3 border-b">{flashcard?.answer}</td>
                            <td className="p-3 border-b">
                              {result.correct ? 
                                <span className="text-green-500 flex items-center"><Check className="h-4 w-4 mr-1" /> Correct</span> : 
                                <span className="text-red-500 flex items-center"><X className="h-4 w-4 mr-1" /> Incorrect</span>
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={returnToTopic}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Topic
                  </Button>
                  <Button 
                    className="flex-1 bg-trailblue-500 hover:bg-trailblue-600"
                    onClick={restartQuiz}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restart Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizMode;
