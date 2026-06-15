import React from 'react';

interface ReportCardProps {
  data: any;
}

export const ReportCardTemplate = React.forwardRef<HTMLDivElement, ReportCardProps>(({ data }, ref) => {
  if (!data) return null;

  return (
    <div 
      ref={ref} 
      className="bg-[#f1f3f1] text-[#4a5568] p-16 w-[850px] min-h-[1130px] font-serif relative tracking-wide"
    >
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center mb-16 mt-8">
        {/* Laurel Wreath Logo */}
        <svg viewBox="0 0 100 100" className="w-24 h-24 text-[#859ba5] fill-current mb-6">
          <path d="M50 10 C30 10 15 25 15 50 C15 75 35 90 50 90 C65 90 85 75 85 50 C85 25 70 10 50 10 M50 15 C65 15 80 28 80 50 C80 72 63 85 50 85 C37 85 20 72 20 50 C20 28 35 15 50 15 Z" />
          <path d="M25 40 Q40 30 50 50 Q30 60 25 40 Z M75 40 Q60 30 50 50 Q70 60 75 40 Z M20 55 Q35 50 45 70 Q25 75 20 55 Z M80 55 Q65 50 55 70 Q75 75 80 55 Z M30 25 Q45 20 50 40 Q35 45 30 25 Z M70 25 Q55 20 50 40 Q65 45 70 25 Z" />
        </svg>
        
        <h1 className="text-5xl font-normal tracking-[0.2em] mb-4 text-[#334155]">REPORT CARD</h1>
        <p className="text-xl tracking-[0.15em] text-[#859ba5] uppercase">Jamia Hamdard University</p>
      </div>

      {/* Student Details */}
      <div className="grid grid-cols-2 gap-x-16 gap-y-8 mb-12 text-sm uppercase tracking-wider">
        <div className="flex justify-between border-b border-[#a0aec0] pb-1">
          <span className="text-[#4a5568]">Student Name:</span>
          <span className="font-semibold">{data.studentInfo?.name}</span>
        </div>
        <div className="flex justify-between border-b border-[#a0aec0] pb-1">
          <span className="text-[#4a5568]">Student Number:</span>
          <span className="font-semibold">{data.studentInfo?.enrollmentNumber || 'EN123456'}</span>
        </div>
        <div className="flex justify-between border-b border-[#a0aec0] pb-1">
          <span className="text-[#4a5568]">Year and Major:</span>
          <span className="font-semibold">{data.studentInfo?.department}</span>
        </div>
        <div className="flex justify-between border-b border-[#a0aec0] pb-1">
          <span className="text-[#4a5568]">Grading Period:</span>
          <span className="font-semibold">Semester {data.studentInfo?.semester}</span>
        </div>
      </div>

      {/* Academic Record Table */}
      <div className="mb-12">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#859ba5] text-white uppercase tracking-wider h-14">
              <th className="font-normal px-6 text-left w-2/5">Course Name</th>
              <th className="font-normal px-4 text-center">Professor's Name</th>
              <th className="font-normal px-4 text-center">Final Grade</th>
              <th className="font-normal px-6 text-left">Teacher's Comments</th>
            </tr>
          </thead>
          <tbody className="bg-[#dce1e3]">
            {data.grades?.map((g: any, i: number) => (
              <tr key={i} className="h-12 border-b border-[#cbd5e1] last:border-0">
                <td className="px-6 py-3 font-semibold text-[#334155]">{g.courseName}</td>
                <td className="px-4 py-3 text-center text-xs">{g.professorName || 'Dr. Faculty'}</td>
                <td className="px-4 py-3 text-center font-bold">{g.grade}</td>
                <td className="px-6 py-3 text-xs italic opacity-80">{i === 0 ? 'Excellent participation.' : ''}</td>
              </tr>
            ))}
            {/* Fill empty rows to match the visual height of the reference image */}
            {Array.from({ length: Math.max(0, 7 - (data.grades?.length || 0)) }).map((_, i) => (
              <tr key={`empty-${i}`} className="h-12 border-b border-[#cbd5e1] last:border-0">
                <td className="px-6 py-3"></td><td className="px-4 py-3"></td><td className="px-4 py-3"></td><td className="px-6 py-3"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-2 gap-12">
        {/* Grading Scale */}
        <div>
          <div className="bg-[#859ba5] text-white text-center py-4 uppercase tracking-wider text-sm mb-0">
            Grading Scale
          </div>
          <div className="bg-[#dce1e3] p-6 text-[10px] grid grid-cols-2 gap-x-4 gap-y-2 uppercase font-sans tracking-wide">
            <div>A+ - 96.80 to 100.00</div><div>C- - 69.80 to 72.79</div>
            <div>A  - 92.80 to 96.79</div><div>D+ - 66.80 to 69.79</div>
            <div>A- - 89.90 to 92.79</div><div>D  - 62.80 to 66.79</div>
            <div>B+ - 86.80 to 89.79</div><div>D- - 59.80 to 62.79</div>
            <div>B  - 82.80 to 86.79</div><div>F  - 0.00 to 59.79</div>
            <div>B- - 79.80 to 82.79</div><div>INC - Incompleted Course</div>
            <div>C+ - 76.80 to 79.79</div><div>DRP - Dropped by Student</div>
            <div>C  - 72.80 to 76.79</div>
          </div>
        </div>

        {/* Summary & Evaluation */}
        <div className="flex flex-col gap-6 text-sm uppercase tracking-wider font-semibold text-[#4a5568]">
          <div className="flex justify-between border-b border-[#a0aec0] pb-2">
            <span>Current Semester</span>
            <span>{data.studentInfo?.cgpa?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b border-[#a0aec0] pb-2">
            <span>Overall Average (CGPA)</span>
            <span className="text-[#334155] font-bold">{data.studentInfo?.cgpa?.toFixed(2)}</span>
          </div>
          <div className="mt-4 text-xs normal-case tracking-normal font-normal text-justify leading-relaxed italic border-l-2 border-[#859ba5] pl-4">
            <span className="block font-bold uppercase not-italic tracking-wider mb-2 text-[#859ba5]">Dean's Evaluation</span>
            {data.evaluation?.split('\n').map((paragraph: string, i: number) => (
              <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
});
