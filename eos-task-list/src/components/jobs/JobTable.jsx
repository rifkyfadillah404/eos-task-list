import { Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export const JobTable = ({ jobs, onJobClick, onDeleteJob }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';

    try {
      const date = new Date(dateString);
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      // Convert to WIB (UTC+7)
      const wibDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      
      const year = wibDate.getFullYear();
      const month = monthNames[wibDate.getMonth()];
      const day = wibDate.getDate();

      return `${year} ${month} ${day}`;
    } catch {
      return dateString;
    }
  };

  // Validate and clean up job data first
  const validJobs = jobs.filter(job => 
    job && 
    job.id !== undefined &&
    (job.parent === null || 
     (job.parent !== undefined && !isNaN(Number(job.parent)) && Number(job.parent) > 0) ||
     String(job.parent) === "null")
  );

  // Filter out invalid parent references
  const cleanedJobs = validJobs.map(job => {
    // If parent is a string that looks like "null", convert it to actual null
    let cleanParentId = job.parent;
    if (job.parent === "null" || job.parent === "undefined") {
      cleanParentId = null;
    } else if (job.parent !== null && !isNaN(Number(job.parent))) {
      cleanParentId = Number(job.parent);
    } else if (typeof job.parent === 'string' && !/^\d+$/.test(job.parent)) {
      // If parent is a string but not a number, treat as null
      cleanParentId = null;
    }
    
    return { ...job, parent: cleanParentId };
  });

  // Let's make this much simpler - just organize based on the relationship as intended
  const result = [];

  // Get all root categories (no parent or invalid parent)
  const rootCategories = cleanedJobs.filter(job => 
    job.parent === null || 
    job.parent === undefined ||
    (typeof job.parent === 'string' && !/^\d+$/.test(job.parent))
  );

  // For each category, add it, then add its children
  rootCategories.forEach(category => {
    result.push({ ...category, level: 0, jobType: 'Category' });
    
    // Find all direct children of this category (parents that reference this category's ID)
    const categoryChildren = cleanedJobs.filter(job => 
      job.parent !== null && 
      job.parent !== undefined && 
      Number(job.parent) === Number(category.id)
    );
    
    categoryChildren.forEach(child => {
      result.push({ ...child, level: 1, jobType: 'Parent' });
      
      // Find all sub-children of this parent (sub-parents that reference this parent's ID)
      const parentChildren = cleanedJobs.filter(job => 
        job.parent !== null && 
        job.parent !== undefined && 
        Number(job.parent) === Number(child.id)
      );
      
      parentChildren.forEach(subChild => {
        result.push({ ...subChild, level: 2, jobType: 'Sub-Parent' });
      });
    });
  });

  // Add any remaining jobs that don't fit the hierarchy (orphans)
  cleanedJobs.forEach(job => {
    if (!result.some(r => r.id === job.id)) {
      // Determine type based on the field values
      let level = 0;
      let jobType = 'Category';
      
      if (job.parent !== null && job.parent !== undefined) {
        if (cleanedJobs.some(j => j.id === Number(job.parent))) {
          // It's linked to a valid job, so determine if it's a parent or sub-parent
          level = 1; // Default to 1, but this might be adjusted based on the actual parent it links to
          jobType = 'Parent'; // We'll determine this differently
        }
      }
      
      result.push({ ...job, level, jobType });
    }
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Category (with Hierarchy)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Department
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Created
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {result && result.length > 0 ? (
            result.map((job) => {
              // Determine level based on how deeply nested this job is
              let level = 0;
              let currentId = job.parent;
              while (currentId !== null) {
                const parentJob = cleanedJobs.find(j => j.id === Number(currentId));
                if (parentJob) {
                  level++;
                  currentId = parentJob.parent;
                } else {
                  break;
                }
              }
              
              // Determine job type based on level depth
              let jobType = 'Category';
              if (level === 1) {
                jobType = 'Parent';
              } else if (level === 2) {
                jobType = 'Sub-Parent';
              } else if (level >= 3) {
                jobType = 'Sub-Parent'; // Anything deeper is still sub-parent
              }
              
              return (
                <tr 
                  key={job.id} 
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => onJobClick && onJobClick(job)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`${level === 0 ? 'ml-0' : level === 1 ? 'ml-6' : 'ml-12'} text-sm ${level === 0 ? 'font-bold text-blue-600' : level === 1 ? 'font-medium text-green-600' : 'font-medium text-purple-600'} flex items-center`}>
                      {level === 0 && (
                         <span className="font-bold">{job.category}</span>
                      )}
                      {level === 1 && (
                         <span className="flex items-center"><span className="text-gray-500 mr-2">├─</span><span>{job.category}</span></span>
                      )}
                      {level === 2 && (
                         <span className="flex items-center"><span className="text-gray-500 mr-2">└─</span><span>{job.category}</span></span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${jobType === 'Category' ? 'bg-blue-100 text-blue-800' : 
                        jobType === 'Parent' ? 'bg-green-100 text-green-800' : 
                        'bg-purple-100 text-purple-800'}`}
                    >
                      {jobType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="text-slate-700">{job.department_name || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatDate(job.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteJob && onDeleteJob(job.id);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                <div className="flex flex-col items-center">
                  <AlertCircle size={48} className="text-slate-300 mb-4" />
                  <p className="text-lg font-semibold">No jobs found</p>
                  <p className="text-sm">Create your first job to get started</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
