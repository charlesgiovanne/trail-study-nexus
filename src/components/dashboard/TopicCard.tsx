
import React from "react";
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
import { Topic } from "@/types";

interface TopicCardProps {
  topic: Topic;
  showAddButton?: boolean;
  creatorInfo?: boolean;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, showAddButton = false, creatorInfo = false }) => {
  const navigate = useNavigate();

  const handleOpenTopic = () => {
    navigate(`/topic/${topic.id}`);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col"
      onClick={handleOpenTopic}
    >
      <CardHeader>
        <CardTitle className="line-clamp-2">{topic.title}</CardTitle>
        <CardDescription>
          {topic.isPublic ? 'Public' : 'Private'} • {topic.flashcards.length} cards
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-500 line-clamp-3">{topic.description}</p>
        {creatorInfo && (
          <p className="text-xs text-gray-400 mt-2">Created by: {topic.createdBy}</p>
        )}
      </CardContent>
      {showAddButton && (
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/topic/${topic.id}/create`);
            }}
          >
            Add Flashcards
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TopicCard;
