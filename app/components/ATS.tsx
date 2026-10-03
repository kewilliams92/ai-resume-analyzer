interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

const ATS = ({ score, suggestions }: { score: number; suggestions: Suggestion[] }) => {
  const gradientClass =
    score > 69
      ? "from-green-100"
      : score > 49
        ? "from-yellow-100"
        : "from-red-100";

  const iconSrc =
    score > 69
      ? "/icons/ats-good.svg"
      : score > 49
        ? "/icons/ats-warning.svg"
        : "/icons/ats-bad.svg";

  return (
    <div className={`bg-gradient-to-b ${gradientClass} to-white rounded-2xl shadow-md w-full p-6 flex flex-col gap-4`}>
      <div className="flex flex-row items-center gap-4">
        <img src={iconSrc} alt="ATS Score Icon" className="w-10 h-10" />
        <h2 className="text-2xl font-bold">ATS Score – {score}/100</h2>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-semibold">How well does your resume pass through Applicant Tracking Systems?</h3>
        <p className="text-gray-500">
          Your resume was scanned the way an employer's Applicant Tracking System (ATS) would read it.
          Here's how it performed and what you can do to improve your chances of getting noticed.
        </p>

        <ul className="flex flex-col gap-3">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex flex-row items-center gap-2">
              <img
                src={suggestion.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                alt={suggestion.type === "good" ? "Check" : "Warning"}
                className="w-5 h-5"
              />
              <p className="text-gray-700">{suggestion.tip}</p>
            </li>
          ))}
        </ul>

        <p className="text-gray-700 italic">
          Keep refining your resume to boost your ATS score and increase your chances of landing an interview.
        </p>
      </div>
    </div>
  );
};

export default ATS;
