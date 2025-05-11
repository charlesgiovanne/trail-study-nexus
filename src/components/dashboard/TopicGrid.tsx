
import React from "react";
import TopicCard from "@/components/dashboard/TopicCard";
import { Folder, Topic } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TopicGridProps {
  topics: Topic[];
  emptyTitle: string;
  emptyDescription: string;
  showAddButton?: boolean;
  creatorInfo?: boolean;
  onCreateClick?: () => void;
  showCreateButton?: boolean;
}

const TopicGrid: React.FC<TopicGridProps> = ({ 
  topics, 
  emptyTitle, 
  emptyDescription, 
  showAddButton = false,
  creatorInfo = false,
  onCreateClick,
  showCreateButton = false
}) => {
  if (topics.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">{emptyTitle}</h3>
        <p className="mt-1 text-sm text-gray-500">{emptyDescription}</p>
        {showCreateButton && onCreateClick && (
          <div className="mt-6">
            <Button 
              onClick={onCreateClick}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Topic
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {topics.map((topic) => (
        <TopicCard 
          key={topic.id} 
          topic={topic}
          showAddButton={showAddButton}
          creatorInfo={creatorInfo} 
        />
      ))}
    </div>
  );
};

export default TopicGrid;
