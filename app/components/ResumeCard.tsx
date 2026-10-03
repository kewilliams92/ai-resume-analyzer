import { Link } from "react-router"
import ScoreCircle from "./ScoreCircle"
import { useEffect, useState } from "react"
import { usePuterStore } from "~/lib/puter"

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
  selectMode = false,
  selected = false,
  onToggleSelect,
}: {
  resume: Resume
  selectMode?: boolean
  selected?: boolean
  onToggleSelect?: (id: string) => void
}) => {
  const { fs } = usePuterStore()
  const [resumeUrl, setResumeUrl] = useState('')
  useEffect(() => {
    const loadResume = async () => {
      try {
        const blob = await fs.read(imagePath)
        if (!blob) return;
        let url = URL.createObjectURL(blob)
        setResumeUrl(url)
      } catch (e) {
        // ignore failed image load
      }
    }

    loadResume()
  }, [imagePath])

  const content = (
    <>
      {selectMode && (
        <input
          type="checkbox"
          checked={selected}
          readOnly
          className="absolute top-4 right-4 !w-6 !h-6 !p-0 aspect-square accent-black z-10"
        />
      )}
      <div className="resume-card-header">
        <div className="flex flex-col gap-2">
          {companyName && (
            <h2 className="text-black! font-bold wrap-break-word">
              {companyName}
            </h2>
          )}
          {jobTitle && (
            <h3 className="text-lg wrap-break-word text-gray-500">
              {jobTitle}
            </h3>
          )}
          {!companyName && !jobTitle && <h2 className="text-black font-bold">Resume</h2>}
        </div>
        <div className="shrink-0">
          <ScoreCircle score={feedback.overallScore} />
        </div>
      </div>
      {resumeUrl && (
        <div className="gradient-border animate-in fade-in duration-1000">
          <div className="w-full h-full">
            <img
              src={resumeUrl}
              alt="resume"
              className="w-full h-87.5 max-sm:h-62.5 object-cover object-top"
            />
          </div>
        </div>
      )}
    </>
  )

  if (selectMode) {
    return (
      <button
        type="button"
        onClick={() => onToggleSelect?.(id)}
        className={`resume-card relative text-left animate-in fade-in duration-1000 ${selected ? 'ring-2 ring-black' : ''}`}
      >
        {content}
      </button>
    )
  }

  return (
    <Link to={`/resume/${id}`} className="resume-card relative animate-in fade-in duration-1000">
      {content}
    </Link>
  )
}

export default ResumeCard
