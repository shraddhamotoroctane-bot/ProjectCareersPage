import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JobFiltersProps {
  onFilter: (department: string, jobType: string) => void;
}

export default function JobFilters({ onFilter }: JobFiltersProps) {
  const [department, setDepartment] = useState("all");
  const [jobType, setJobType] = useState("all");

  // Initialize filters on mount
  useEffect(() => {
    onFilter("all", "all");
  }, [onFilter]);

  const handleFilterChange = (type: string, value: string) => {
    let newDepartment = department;
    let newJobType = jobType;

    switch (type) {
      case "department":
        newDepartment = value;
        setDepartment(value);
        break;
      case "type":
        newJobType = value;
        setJobType(value);
        break;
    }

    onFilter(newDepartment, newJobType);
  };

  return (
    <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
      <Select value={department} onValueChange={(value) => handleFilterChange("department", value)}>
        <SelectTrigger className="w-full sm:w-48" data-testid="filter-department">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          <SelectItem value="production">Production</SelectItem>
          <SelectItem value="consultancy">Consultancy</SelectItem>
          <SelectItem value="backend">Backend</SelectItem>
          <SelectItem value="content">Content</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
        </SelectContent>
      </Select>

      <Select value={jobType} onValueChange={(value) => handleFilterChange("type", value)}>
        <SelectTrigger className="w-full sm:w-48" data-testid="filter-type">
          <SelectValue placeholder="All Job Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Job Types</SelectItem>
          <SelectItem value="full-time">Full-time</SelectItem>
          <SelectItem value="internship">Internship</SelectItem>
          <SelectItem value="contract">Contract/Freelancing</SelectItem>
        </SelectContent>
      </Select>

    </div>
  );
}
