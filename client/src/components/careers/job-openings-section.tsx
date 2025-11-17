import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobFilters from "./job-filters";
import JobCard from "./job-card";
import { type JobOpening } from "@/data/jobs";

export default function JobOpeningsSection() {
  const [department, setDepartment] = useState("all");
  const [jobType, setJobType] = useState("all");
  
  const queryClient = useQueryClient();

  // Fetch jobs from API with automatic updates
  const { data: jobs = [], isLoading, error, isFetching } = useQuery({
    queryKey: ['/api/jobs'],
    select: (data) => data as JobOpening[],
    refetchInterval: 15000, // Refetch every 15 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    staleTime: 10000, // Consider data stale after 10 seconds
    refetchIntervalInBackground: true, // Keep polling even when tab is not active
  });

  // Manual refresh function
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
  };

  // Filter jobs based on current filter state
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    if (department && department !== "all") {
      filtered = filtered.filter(job => 
        job.department && job.department.trim() !== "" && 
        job.department.toLowerCase() === department.toLowerCase()
      );
    }
    
    if (jobType && jobType !== "all") {
      filtered = filtered.filter(job => {
        const jobTypeNormalized = job.type ? job.type.toLowerCase().replace(/\s+/g, '-') : '';
        return job.type && job.type.trim() !== "" && 
               jobTypeNormalized === jobType.toLowerCase();
      });
    }

    return filtered;
  }, [jobs, department, jobType]);

  const handleFilter = (newDepartment: string, newJobType: string) => {
    setDepartment(newDepartment);
    setJobType(newJobType);
  };

  // Show loading state
  if (isLoading) {
    return (
      <section id="jobs" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="jobs-title">
              Open Positions
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="jobs-subtitle">
              Discover your next career opportunity with us
            </p>
          </div>
          <div className="text-center py-12" data-testid="jobs-loading">
            <p className="text-lg text-muted-foreground">Loading job openings...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section id="jobs" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="jobs-title">
              Open Positions
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="jobs-subtitle">
              Discover your next career opportunity with us
            </p>
          </div>
          <div className="text-center py-12" data-testid="jobs-error">
            <p className="text-lg text-red-600">
              Failed to load job openings. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="jobs" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="jobs-title">
              Open Positions
            </h2>
          </div>
          <div className="hidden">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isFetching}
                data-testid="refresh-jobs-button"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {isFetching && (
                <span className="text-sm text-muted-foreground" data-testid="updating-indicator">
                  Updating...
                </span>
              )}
            </div>
          </div>
          <p className="text-lg text-muted-foreground" data-testid="jobs-subtitle">
            Discover your next career opportunity with us
          </p>
          <p className="text-sm text-muted-foreground mt-2 hidden" data-testid="auto-refresh-info">
            Job listings automatically refresh every 15 seconds
          </p>
        </div>

        <div className="hidden">
          <JobFilters onFilter={handleFilter} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {filteredJobs.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-12" data-testid="no-jobs-message">
              <p className="text-lg text-muted-foreground">
                No positions match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
