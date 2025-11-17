import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { type JobOpening } from "@/data/jobs";
import JobApplicationForm from "./job-application-form";

interface JobCardProps {
  job: JobOpening;
}

export default function JobCard({ job }: JobCardProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);

  const handleApply = () => {
    setShowApplicationForm(true);
  };

  const handleViewDetails = () => {
    setShowFullDetails(true);
  };

  // Utility function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  // Utility function to truncate requirements array
  const truncateRequirements = (requirements: string[], maxItems: number) => {
    if (requirements.length <= maxItems) return requirements;
    return requirements.slice(0, maxItems);
  };

  const getDepartmentColor = (department: string) => {
    switch (department.toLowerCase()) {
      case "engineering":
        return "bg-blue-100 text-blue-800";
      case "design":
        return "bg-purple-100 text-purple-800";
      case "marketing":
        return "bg-green-100 text-green-800";
      case "sales":
        return "bg-orange-100 text-orange-800";
      case "operations":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "full-time":
        return "text-green-600";
      case "part-time":
        return "text-yellow-600";
      case "contract":
        return "text-blue-600";
      case "remote":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  // Constants for consistent sizing
  const MAX_DESCRIPTION_LENGTH = 100;
  const MAX_REQUIREMENTS = 2;
  const CARD_HEIGHT = "h-[420px]"; // Fixed height for all cards (shorter)

  const displayDescription = truncateText(job.description, MAX_DESCRIPTION_LENGTH);
  const displayRequirements = truncateRequirements(job.requirements, MAX_REQUIREMENTS);

  return (
    <>
      <Card 
        className={`job-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${CARD_HEIGHT} flex flex-col`}
        data-testid={`job-card-${job.id}`}
      >
        <CardContent className="p-5 flex flex-col h-full">
          {/* Header Section - Fixed Height */}
          <div className="flex items-start justify-between mb-3 flex-shrink-0">
            <Badge className={`text-xs font-medium px-2.5 py-0.5 rounded ${getDepartmentColor(job.department)}`}>
              {job.department}
            </Badge>
            <div className={`text-sm font-medium ${getTypeColor(job.type)}`}>
              {job.type}
            </div>
          </div>
          
          {/* Title and Location - Fixed Height */}
          <div className="mb-3 flex-shrink-0">
            <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2" data-testid={`job-title-${job.id}`}>
              {job.title}
            </h3>
            <p className="text-muted-foreground text-sm" data-testid={`job-location-${job.id}`}>
              {job.location}
            </p>
          </div>
          
          {/* Content Section - Flexible Height */}
          <div className="flex-grow overflow-hidden">
            {/* Description */}
            <div className="mb-3">
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`job-description-${job.id}`}>
                {displayDescription}
              </p>
            </div>
            
            {/* Requirements */}
            <div className="mb-3">
              <h4 className="font-medium text-foreground mb-1.5 text-sm">Key Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-0.5">
                {displayRequirements.map((requirement, index) => (
                  <li key={index} className="flex items-start" data-testid={`job-requirement-${job.id}-${index}`}>
                    <span className="text-primary mr-2 flex-shrink-0">•</span>
                    <span className="line-clamp-2">{requirement}</span>
                  </li>
                ))}
                {job.requirements.length > MAX_REQUIREMENTS && (
                  <li className="text-muted-foreground/70 italic">
                    +{job.requirements.length - MAX_REQUIREMENTS} more requirements...
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Action Buttons - Fixed at Bottom */}
          <div className="flex-shrink-0">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleViewDetails}
                className="flex-1 text-sm"
                data-testid={`button-details-${job.id}`}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              <Button 
                onClick={handleApply}
                className="flex-1 bg-primary text-primary-foreground hover:bg-blue-700 transition-colors text-sm"
                data-testid={`button-apply-${job.id}`}
              >
                Apply Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Details Modal */}
      <Dialog open={showFullDetails} onOpenChange={setShowFullDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {job.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Job Info */}
            <div className="flex items-center gap-4 flex-wrap">
              <Badge className={`text-sm font-medium px-3 py-1 rounded ${getDepartmentColor(job.department)}`}>
                {job.department}
              </Badge>
              <div className={`text-sm font-medium ${getTypeColor(job.type)}`}>
                {job.type}
              </div>
              <div className="text-sm text-muted-foreground">
                {job.location}
              </div>
            </div>
            
            {/* Full Description */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Job Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {job.description}
              </p>
            </div>
            
            {/* Full Requirements */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Requirements</h3>
              <ul className="space-y-2">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start text-muted-foreground">
                    <span className="text-primary mr-3 flex-shrink-0 font-bold">•</span>
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Apply Button in Modal */}
            <div className="pt-4 border-t">
              <Button 
                onClick={() => {
                  setShowFullDetails(false);
                  handleApply();
                }}
                className="w-full bg-primary text-primary-foreground hover:bg-blue-700 transition-colors"
              >
                Apply for this Position
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <JobApplicationForm 
        job={job} 
        open={showApplicationForm} 
        onOpenChange={setShowApplicationForm} 
      />
    </>
  );
}
