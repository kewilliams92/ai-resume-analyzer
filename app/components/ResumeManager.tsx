import { useState } from "react"
import { usePuterStore } from "~/lib/puter"
import ResumeCard from "./ResumeCard"

const ResumeManager = ({
  resumes,
  setResumes,
}: {
  resumes: Resume[]
  setResumes: React.Dispatch<React.SetStateAction<Resume[]>>
}) => {
  const { fs, kv } = usePuterStore()
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [confirmation, setConfirmation] = useState('')

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const exitSelect = () => {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  const flash = (msg: string) => {
    setConfirmation(msg)
    setTimeout(() => setConfirmation(''), 3000)
  }

  const safeDelete = async (path?: string) => {
    if (!path) return
    try {
      await fs.delete(path)
    } catch (e) {
      // File may already be gone (orphaned record); keep going so the kv record is still removed.
    }
  }

  const deleteResume = async (resume: Resume) => {
    await safeDelete(resume.resumePath)
    await safeDelete(resume.imagePath)
    await kv.delete(`resume:${resume.id}`)
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    const count = selectedIds.size
    if (!window.confirm(`Remove ${count} selected resume${count > 1 ? 's' : ''}? This cannot be undone.`)) return
    setBusy(true)
    try {
      const toDelete = resumes.filter((r) => selectedIds.has(r.id))
      for (const resume of toDelete) {
        await deleteResume(resume)
      }
      setResumes((prev) => prev.filter((r) => !selectedIds.has(r.id)))
      flash(`Deleted ${count} resume${count > 1 ? 's' : ''}.`)
    } catch (e) {
      flash('Some resumes could not be deleted.')
    } finally {
      exitSelect()
      setBusy(false)
    }
  }

  const handleWipe = async () => {
    if (!window.confirm('Delete ALL resumes and app data? This cannot be undone.')) return
    setBusy(true)
    try {
      for (const resume of resumes) {
        await deleteResume(resume)
      }
      await kv.flush()
      setResumes([])
      flash('All data wiped.')
    } catch (e) {
      flash('Wipe did not fully complete.')
    } finally {
      exitSelect()
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      <div className="flex flex-row flex-wrap gap-3 items-center justify-center">
        {!selectMode ? (
          <button
            className="primary-button w-fit"
            onClick={() => setSelectMode(true)}
            disabled={busy}
          >
            Select
          </button>
        ) : (
          <>
            <button
              className="rounded-full px-4 py-2 cursor-pointer bg-red-500 text-white disabled:opacity-50"
              onClick={handleDeleteSelected}
              disabled={busy || selectedIds.size === 0}
            >
              {busy ? 'Deleting...' : `Delete (${selectedIds.size})`}
            </button>
            <button
              className="rounded-full px-4 py-2 cursor-pointer border border-gray-300"
              onClick={exitSelect}
              disabled={busy}
            >
              Cancel
            </button>
          </>
        )}
        <button
          className="rounded-full px-4 py-2 cursor-pointer border border-red-300 text-red-500 disabled:opacity-50"
          onClick={handleWipe}
          disabled={busy}
        >
          Wipe all
        </button>
      </div>

      {confirmation && <p className="text-green-600">{confirmation}</p>}

      <div className="resumes-section">
        {resumes.map((resume) => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            selectMode={selectMode}
            selected={selectedIds.has(resume.id)}
            onToggleSelect={toggleSelect}
          />
        ))}
      </div>
    </div>
  )
}

export default ResumeManager
