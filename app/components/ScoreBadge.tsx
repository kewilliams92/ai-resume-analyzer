const ScoreBadge = ({ score }: { score: number }) => {
  const { badgeColor, textColor, label } =
    score > 69
      ? { badgeColor: "bg-badge-green", textColor: "text-green-600", label: "Strong" }
      : score > 49
        ? { badgeColor: "bg-badge-yellow", textColor: "text-yellow-600", label: "Good Start" }
        : { badgeColor: "bg-badge-red", textColor: "text-red-600", label: "Needs Work" };

  return (
    <div className={`px-3 py-1 rounded-full ${badgeColor}`}>
      <p className={`text-sm font-medium ${textColor}`}>{label}</p>
    </div>
  );
};

export default ScoreBadge;
