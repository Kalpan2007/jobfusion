"use client"

import { useState } from "react"
import { Upload, Loader2, AlertTriangle } from "lucide-react"

export default function ATSChecker() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState("")
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type === "application/pdf") {
      setFile(file)
      analyzeResume(file)
    } else {
      setError("Please upload a PDF file")
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type === "application/pdf") {
      setFile(file)
      analyzeResume(file)
    } else {
      setError("Please upload a PDF file")
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  // Fixed PDF text extraction function
  const extractTextFromPDF = async (file) => {
    try {
      // Method 1: Try using PDF.js with proper worker setup
      try {
        const pdfjsLib = await import("pdfjs-dist")

        // Set worker source to a reliable CDN
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`

        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

        let text = ""
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          text += content.items.map((item) => item.str).join(" ") + "\n"
          setLoadingStep(`Processing page ${i} of ${pdf.numPages}...`)
        }

        if (text.trim()) {
          return text
        }
      } catch (pdfError) {
        console.log("PDF.js method failed, trying alternative method")
      }

      // Method 2: Alternative text extraction
      return await alternativeTextExtraction(file)
    } catch (error) {
      throw new Error("Could not extract text from PDF. Please ensure the PDF contains selectable text.")
    }
  }

  // Alternative text extraction method
  const alternativeTextExtraction = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result
          const uint8Array = new Uint8Array(arrayBuffer)
          let text = ""

          // Simple text extraction from PDF binary
          for (let i = 0; i < uint8Array.length - 1; i++) {
            // Look for text patterns in PDF
            if (uint8Array[i] === 0x54 && uint8Array[i + 1] === 0x6a) {
              // "Tj" operator
              let extractedChunk = ""
              for (let j = i + 2; j < i + 200 && j < uint8Array.length; j++) {
                const charCode = uint8Array[j]
                if (charCode >= 32 && charCode <= 126) {
                  // Printable ASCII
                  extractedChunk += String.fromCharCode(charCode)
                }
              }
              if (extractedChunk.length > 3) {
                text += extractedChunk + " "
              }
            }
          }

          // Clean up the extracted text
          text = text.replace(/\s+/g, " ").trim()

          if (text.length > 100) {
            resolve(text)
          } else {
            // If we couldn't extract enough text, try reading as text
            const textReader = new FileReader()
            textReader.onload = (e) => {
              const textContent = e.target.result
              const cleanText = textContent
                .replace(/[^\x20-\x7E\n\r\t]/g, " ")
                .replace(/\s+/g, " ")
                .trim()
              if (cleanText.length > 50) {
                resolve(cleanText)
              } else {
                reject(new Error("Could not extract sufficient text from PDF"))
              }
            }
            textReader.readAsText(file)
          }
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error("Failed to read PDF file"))
      reader.readAsArrayBuffer(file)
    })
  }

  const analyzeResume = async (file) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setLoadingStep("Preparing PDF analysis...")

    try {
      // Check file size
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File too large. Please upload a PDF smaller than 10MB")
      }

      setLoadingStep("Extracting text from PDF...")
      const text = await extractTextFromPDF(file)

      if (!text.trim()) {
        throw new Error("Could not extract text from PDF")
      }

      setLoadingStep("Analyzing resume with AI...")
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "JobFusion ATS",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            {
              role: "system",
              content:
                'You are an ATS (Applicant Tracking System) expert. Analyze the resume and provide: 1) An ATS compatibility score (0-100), 2) Pros - what works well, 3) Cons - what needs improvement, 4) Suggestions for improvement. Format response as JSON like: {"score": number, "pros": string[], "cons": string[], "suggestions": string[]}',
            },
            {
              role: "user",
              content: `Analyze this resume for ATS compatibility:\n\n${text}`,
            },
          ],
          response_format: { type: "json_object" },
        }),
      })

      const responseText = await response.text()

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${responseText}`)
      }

      setLoadingStep("Processing results...")
      const data = JSON.parse(responseText)
      if (!data.choices?.[0]?.message?.content) {
        throw new Error("Invalid API response format")
      }

      const analysis = JSON.parse(data.choices[0].message.content)

      if (!analysis.score || !analysis.pros || !analysis.cons) {
        throw new Error("Invalid analysis format from AI")
      }

      setResult(analysis)
    } catch (err) {
      console.error("Error details:", err)
      let errorMessage = "Failed to analyze resume"

      if (err.message.includes("API Error")) {
        errorMessage = "API Error: Failed to connect to analysis service. Please try again later."
      } else if (err.message.includes("Invalid API response")) {
        errorMessage = "Error: Received invalid response from service. Please try again."
      } else if (err.message.includes("PDF") || err.message.includes("extract")) {
        errorMessage = "Error: Could not read the PDF file. Please ensure it contains selectable text and try again."
      } else if (err.message.includes("File too large")) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setResult(null)
    } finally {
      setLoading(false)
      setLoadingStep("")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ATS Resume Checker</h1>
          <p className="mt-2 text-gray-600">Upload your resume to check its ATS compatibility</p>
        </div>

        <div className="mt-8">
          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              <label
                className="flex flex-col justify-center items-center w-full h-64 bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="flex flex-col justify-center items-center pt-5 pb-6">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF (up to 10MB)</p>
                  {file && <p className="mt-2 text-sm text-blue-600 font-medium">Selected: {file.name}</p>}
                </div>
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          {loading && (
            <div className="mt-8 text-center">
              <Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-500" />
              <p className="mt-2 text-gray-600">{loadingStep}</p>
              <p className="mt-1 text-sm text-gray-500">This may take up to 30 seconds...</p>
            </div>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-red-700">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">ATS Score</h2>
                  <span className="text-2xl font-bold text-blue-600">{result.score}%</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${result.score}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {result.score >= 80
                    ? "Excellent! Your resume is highly ATS-compatible."
                    : result.score >= 60
                      ? "Good. Your resume is moderately ATS-compatible but could use improvements."
                      : "Needs improvement. Your resume may struggle to pass ATS filters."}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">What Works Well</h3>
                  <ul className="space-y-2">
                    {result.pros.map((pro, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-0.5">✓</span>
                        <span className="text-gray-700">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {result.cons.map((con, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2 mt-0.5">✗</span>
                        <span className="text-gray-700">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {result.suggestions && result.suggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Improvement Suggestions</h3>
                    <ul className="space-y-2">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="bg-blue-100 text-blue-800 font-medium rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mr-2 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setFile(null)
                  setResult(null)
                  setError(null)
                }}
                className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Check Another Resume
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
