"use client"

import { useState } from "react"
import { Upload, Loader2, AlertTriangle, Download, CheckCircle, XCircle, Info, Star } from "lucide-react"
// Use bundled PDF.js and worker to avoid CORS/CDN issues
import * as pdfjsLib from "pdfjs-dist"
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url"

// Configure worker once at module load
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export default function ATSChecker() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState("")
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  

  // Your OpenRouter API key (prefer env; fallback to provided key for dev)
  const OPENROUTER_API_KEY = import.meta.env?.VITE_OPENROUTER_API_KEY || "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"

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

  // Frontend PDF text extraction using PDF.js
  const extractTextFromPDFFrontend = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let text = ""

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items.map((item) => item.str).join(" ")
        text += pageText + "\n"
      }

      const cleanText = text.replace(/\s+/g, " ").trim()
      if (!cleanText) {
        throw new Error("No text content found in PDF")
      }

      return cleanText
    } catch (error) {
      console.error('Frontend PDF extraction failed:', error)
      throw new Error(`Frontend PDF processing failed: ${error.message}`)
    }
  }

  // Extract text from PDF using backend with fallback to frontend
  const extractTextFromPDF = async (file) => {
    try {
      const formData = new FormData()
      formData.append('resume', file)

      console.log('Sending file to backend...')
      console.log('File size:', file.size, 'bytes')
      console.log('File type:', file.type)
      
      const response = await fetch('https://jobfusion.onrender.com/api/ats/ats-checker', {
        method: 'POST',
        body: formData
      })

      console.log('Backend response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error response:', errorText)
        throw new Error(`Backend error: ${response.status} - ${errorText}`)
      }

      const responseText = await response.text()
      console.log('Raw response text:', responseText)
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError)
        console.error('Response text was:', responseText)
        throw new Error('Backend returned invalid JSON response')
      }
      
      console.log('Parsed backend response data:', data)
      
      if (!data.success) {
        throw new Error(data.message || 'Backend processing failed')
      }
      
      if (!data.data || !data.data.text) {
        console.error('Backend response missing text:', data)
        throw new Error('Backend did not return resume text')
      }

      console.log('Successfully extracted text, length:', data.data.text.length)
      return data.data.text
    } catch (error) {
      console.error('Backend text extraction failed:', error)
      
      // Fallback to frontend PDF processing
      try {
        const text = await extractTextFromPDFFrontend(file)
        return text
      } catch (fallbackError) {
        throw new Error(`Failed to extract text from PDF: ${error.message}`)
      }
    }
  }

  // AI-powered resume analysis
  const analyzeResumeWithAI = async (text) => {
    
    const extractJson = (raw) => {
      if (!raw) throw new Error('Empty AI response')
      let cleaned = raw.trim()
      // Remove Markdown code fences like ```json ... ``` or ``` ... ```
      cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/g, '').replace(/\n?```$/g, '')
      // If extra prose surrounds JSON, slice between first { and last }
      const first = cleaned.indexOf('{')
      const last = cleaned.lastIndexOf('}')
      if (first !== -1 && last !== -1 && last > first) {
        cleaned = cleaned.slice(first, last + 1)
      }
      // Remove trailing commas which break strict JSON
      cleaned = cleaned.replace(/,\s*([}\]])/g, '$1')
      return JSON.parse(cleaned)
    }
    const prompt = `You are an expert ATS (Applicant Tracking System) analyst and resume consultant. Analyze the following resume and provide a comprehensive assessment.

Please analyze this resume and provide a detailed response in the following JSON format:

{
  "atsScore": number (0-100),
  "grade": string (A+, A, B+, B, C+, C, D, F),
  "overallAssessment": string,
  "strengths": [
    "List 3-5 specific strengths of this resume"
  ],
  "weaknesses": [
    "List 3-5 specific areas that need improvement"
  ],
  "specificRecommendations": [
    "Provide 5-8 specific, actionable recommendations to improve the resume"
  ]
}

Resume text to analyze:
${text}

Please ensure your response is valid JSON and focuses on providing actionable, specific feedback that will help improve the resume's ATS performance.`

    try {
      // Try primary + fallback models with retries on 429/5xx
      const candidateModels = [
        'deepseek/deepseek-r1-0528:free',
        'deepseek/deepseek-chat',
        'meta-llama/llama-3.1-8b-instruct:free',
        'qwen/qwen-2.5-7b-instruct:free'
      ]

      const callModelWithRetry = async (model) => {
        const maxAttempts = 3
        let attempt = 0
        while (attempt < maxAttempts) {
          attempt++
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.origin,
              'X-Title': 'JobFusion ATS'
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: 'You are an expert ATS analyst and resume consultant. Respond ONLY with a JSON object matching the requested schema. Do NOT include code fences or any extra text.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.3,
              max_tokens: 4000,
              response_format: { type: 'json_object' }
            })
          })

          if (response.ok) {
            return await response.json()
          }

          const errorText = await response.text()
          // Handle 429/5xx with backoff + jitter
          if (response.status === 429 || (response.status >= 500 && response.status <= 599)) {
            const backoffMs = Math.min(3000 * attempt + Math.floor(Math.random() * 500), 8000)
            await new Promise(r => setTimeout(r, backoffMs))
            continue
          }
          // For other errors, fail fast
          throw new Error(`AI API Error: ${response.status} - ${errorText}`)
        }
        throw new Error('AI API Error: Exhausted retries due to rate limiting')
      }

      let data
      let lastError
      for (const model of candidateModels) {
        try {
          data = await callModelWithRetry(model)
          break
        } catch (err) {
          lastError = err
          // try next model
        }
      }

      if (!data) {
        throw lastError || new Error('AI API Error: No response from any model')
      }
      if (!data.choices?.[0]?.message?.content) {
        throw new Error("Invalid AI API response format")
      }

      const aiContent = data.choices[0].message.content
      let analysis
      try {
        analysis = extractJson(aiContent)
      } catch (e) {
        analysis = extractJson(aiContent)
      }
      
      // Validate the response structure
      if (!analysis.atsScore || !analysis.strengths || !analysis.weaknesses) {
        throw new Error("AI response missing required fields")
      }
      
      return analysis
    } catch (error) {
      console.error('AI analysis error:', error)
      throw error
    }
  }

  const analyzeResume = async (file) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setLoadingStep("Processing PDF file...")

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
      const analysis = await analyzeResumeWithAI(text)

      setResult(analysis)
      setLoadingStep("")
    } catch (err) {
      console.error("Error details:", err)
      let errorMessage = "Failed to analyze resume"

      if (err.message.includes("AI API Error")) {
        errorMessage = "AI Analysis Error: Please try again later."
      } else if (err.message.includes("Backend error")) {
        errorMessage = "File processing error. Please try again."
      } else if (err.message.includes("PDF") || err.message.includes("extract")) {
        errorMessage = "Error: Could not read the PDF file. Please ensure it contains selectable text."
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI-Powered ATS Resume Checker</h1>
          <p className="text-lg text-gray-600">Get professional, consistent ATS analysis powered by advanced AI</p>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <span className="text-sm text-gray-500">Powered by Advanced AI</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500">Consistent Results</span>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              <label
                className="relative flex flex-col justify-center items-center w-full h-64 bg-white bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-dashed border-blue-300 shadow-xl rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="flex flex-col justify-center items-center pt-5 pb-6">
                  <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 shadow-md group-hover:shadow-lg transition-all duration-300">
                    <Upload className="w-10 h-10 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                  </span>
                  <p className="mb-2 mt-6 text-sm text-gray-600">
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
              <p className="mt-1 text-sm text-gray-500">AI analysis in progress...</p>
            </div>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <AlertTriangle className="h-5 h-5 text-red-400" />
                <p className="ml-3 text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Debug Information */}
          

          {result && (
            <div className="mt-8 space-y-6">
              {/* Score Overview */}
              <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
                  <div className="flex flex-col items-center md:items-start">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">ATS Compatibility Score</h2>
                    <p className="text-gray-600 text-sm max-w-xs">AI-powered analysis of your resume's ATS performance</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-24 h-24" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="18" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                        <circle
                          cx="20" cy="20" r="18" fill="none"
                          stroke={result.atsScore >= 80 ? "#10B981" : result.atsScore >= 60 ? "#F59E0B" : "#EF4444"}
                          strokeWidth="4"
                          strokeDasharray={2 * Math.PI * 18}
                          strokeDashoffset={2 * Math.PI * 18 * (1 - result.atsScore / 100)}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)' }}
                        />
                      </svg>
                      <span className="absolute text-3xl font-bold text-gray-900">{result.atsScore}%</span>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-lg font-bold text-gray-900">{result.grade}</span>
                      <p className="text-sm text-gray-500">
                        {result.atsScore >= 90 ? "Outstanding ATS performance" :
                         result.atsScore >= 80 ? "Excellent ATS compatibility" :
                         result.atsScore >= 70 ? "Good ATS performance" :
                         result.atsScore >= 60 ? "Fair ATS compatibility" :
                         "Needs improvement for ATS"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Overall Assessment */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">AI Assessment</h3>
                      <p className="text-blue-800 text-sm">{result.overallAssessment}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Key Strengths</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <XCircle className="w-6 h-6 text-red-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Areas for Improvement</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <span className="text-red-500 mr-2 mt-1">✗</span>
                        <span className="text-sm">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actionable Recommendations</h3>
                <div className="space-y-3">
                  {result.specificRecommendations?.map((recommendation, index) => (
                    <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <span className="bg-blue-100 text-blue-800 font-medium rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm mr-3 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <button
                  onClick={() => {
                    setFile(null)
                    setResult(null)
                    setError(null)
                    setDebugInfo("")
                  }}
                  className="w-full md:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Analyze Another Resume
                </button>
                <button
                  onClick={() => alert("PDF download feature coming soon!")}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  Download Full Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
