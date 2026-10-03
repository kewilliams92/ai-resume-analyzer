import { useState, type FormEvent, type HTMLAttributes } from "react"
import { useNavigate } from "react-router"
import FileUploader from "~/components/FileUploader"
import Navbar from "~/components/Navbar"
import { convertPdfToImage } from "~/lib/pdfToImage"
import { usePuterStore } from "~/lib/puter"
import { generateUUID } from "~/lib/utils"
import { prepareInstructions } from "../../constants"

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusText, setStatustext] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const handleFileSelect = (file: File | null) => {
    setFile(file)
  }

  const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File }) => {
    setIsProcessing(true)
    setStatustext('Uploading the file...')
    const uploadedFile = await fs.upload([file])

    if (!uploadedFile) return setStatustext('Error failed to upload file')

    setStatustext('Converting to image ...');

    const imageFile = await convertPdfToImage(file)

    if (!imageFile.file) return setStatustext('Error: Failed to convert PDF to image')

    setStatustext('Uploading the image...')
    const uploadedImage = await fs.upload([imageFile.file])
    if (!uploadedImage) return setStatustext('Error: Failed to upload image')

    setStatustext('Preparing data...')

    const uuid = generateUUID()

    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle, jobDescription,
      feedback: ''
    }

    await kv.set(`resume:${uuid}`, JSON.stringify(data))

    setStatustext('Analyzing...')

    const feedback = await ai.feedback(
      uploadedImage.path,
      prepareInstructions({ jobTitle, jobDescription })
    )

    if (!feedback) return setStatustext("Error: Failed to analyze resume")

    const feedbackText = typeof feedback.message.content === 'string'
      ? feedback.message.content
      : feedback.message.content[0].text;


    data.feedback = JSON.parse(feedbackText)

    await kv.set(`resume:${uuid}`, JSON.stringify(data))

    setStatustext("Analysis complete! Redirecting...")

    console.log(data)
    navigate(`/resume/${uuid}`)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget.closest('form')
    if (!form) return;

    const formData = new FormData(form);

    const companyName = formData.get('company-name') as string
    const jobTitle = formData.get('job-title') as string
    const jobDescription = formData.get('job-description') as string

    if (!file) return;

    handleAnalyze({ companyName, jobTitle, jobDescription, file })
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          Smart Feeback For Your Dream Job
        </div>
        {isProcessing ? (
          <>
            <h2>{statusText}</h2>
            <img src="/images/resume-scan.gif" className="w-full" />
          </>
        ) : (
          <h2>Drop your resume for an ATS score and improvement tips</h2>
        )}

        {!isProcessing && (
          <form id='upload-form' onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-div">
              <label htmlFor="company-name">Company Name</label>
              <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
            </div><div className="form-div">
              <label htmlFor="job-title">Job Title</label>
              <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
            </div><div className="form-div">
              <label htmlFor="job-description">Job Description</label>
              <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
            </div>
            <div className="form-div">
              <label htmlFor="uploader">Upload Resume</label>
              <FileUploader file={file} onFileSelect={handleFileSelect} />
            </div>
            <button className="primary-button" type="submit">
              Analyze Resume
            </button>
          </form>
        )}
      </section>
    </main>
  )
}

export default Upload
