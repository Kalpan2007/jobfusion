"use client"

import { useState } from "react"
import { Upload, Loader2, AlertTriangle, Download } from "lucide-react"
import jsPDF from 'jspdf'

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

  // PDF generation for ATS analysis
  const downloadAnalysisPDF = () => {
    if (!result) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    let y = margin;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('ATS Resume Analysis Report', margin, y);
    y += 32;

    // Score badge
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(37, 99, 235);
    doc.setFillColor(232, 240, 254);
    doc.roundedRect(margin, y, 80, 40, 8, 8, 'FD');
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.text(`${result.score}%`, margin + 40, y + 25, { align: 'center', baseline: 'middle' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('ATS Score', margin + 40, y + 38, { align: 'center', baseline: 'middle' });
    y += 60;

    // Section: What Works Well
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text('What Works Well', margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    result.pros.forEach((pro) => {
      doc.circle(margin + 6, y - 3, 3, 'F');
      doc.text(pro, margin + 16, y);
      y += 18;
    });
    y += 8;

    // Section: Areas for Improvement
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68);
    doc.text('Areas for Improvement', margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    result.cons.forEach((con) => {
      doc.setDrawColor(239, 68, 68);
      doc.setFillColor(239, 68, 68);
      doc.circle(margin + 6, y - 3, 3, 'F');
      doc.text(con, margin + 16, y);
      y += 18;
    });
    y += 8;

    // Section: Suggestions
    if (result.suggestions && result.suggestions.length > 0) {
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Improvement Suggestions', margin, y);
      y += 18;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      result.suggestions.forEach((suggestion, idx) => {
        doc.setDrawColor(37, 99, 235);
        doc.setFillColor(232, 240, 254);
        doc.circle(margin + 6, y - 3, 3, 'F');
        doc.text(`${idx + 1}. ${suggestion}`, margin + 16, y);
        y += 18;
      });
    }

    // Footer
    y = 800;
    doc.setFontSize(10);
    doc.setTextColor(180, 180, 180);
    doc.text('Generated by JobFusion ATS Resume Checker', margin, y);

    doc.save(`ATS-Analysis-${file?.name?.replace(/\.[^.]+$/, '') || 'result'}.pdf`);
  };

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
                className="relative flex flex-col justify-center items-center w-full h-64 bg-white bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-xl rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{ perspective: "800px" }}
              >
                <div className="flex flex-col justify-center items-center pt-5 pb-6">
                  <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-md group-hover:shadow-lg transition-all duration-300 animate-pulse-slow">
                    <Upload className="w-10 h-10 text-blue-400 group-hover:text-blue-600 transition-colors duration-300" />
                  </span>
                  <p className="mb-2 mt-6 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">PDF (up to 10MB)</p>
                  {file && <p className="mt-2 text-sm text-blue-600 font-medium">Selected: {file.name}</p>}
                </div>
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                <div className="absolute inset-0 rounded-2xl pointer-events-none group-hover:ring-4 group-hover:ring-blue-100 transition-all duration-300"></div>
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
            <div className="mt-8 bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
                <div className="flex flex-col items-center md:items-start">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">ATS Compatibility Score</h2>
                  <p className="text-gray-600 text-sm max-w-xs">This score estimates how well your resume will perform with Applicant Tracking Systems.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-20 h-20" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="18" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                      <circle
                        cx="20" cy="20" r="18" fill="none"
                        stroke="#2563EB"
                        strokeWidth="4"
                        strokeDasharray={2 * Math.PI * 18}
                        strokeDashoffset={2 * Math.PI * 18 * (1 - result.score / 100)}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)' }}
                      />
                    </svg>
                    <span className="absolute text-2xl font-bold text-blue-600">{result.score}%</span>
                  </div>
                  <span className="mt-2 text-sm text-gray-500 font-medium">
                    {result.score >= 80
                      ? "Excellent! Highly ATS-compatible."
                      : result.score >= 60
                        ? "Good, but could improve."
                        : "Needs improvement."}
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="py-6">
                  <div className="flex items-center mb-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">What Works Well</h3>
                  </div>
                  <ul className="space-y-2 ml-2">
                    {result.pros.map((pro, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <span className="text-green-500 mr-2 mt-0.5">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="py-6">
                  <div className="flex items-center mb-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 mr-3">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">Areas for Improvement</h3>
                  </div>
                  <ul className="space-y-2 ml-2">
                    {result.cons.map((con, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <span className="text-red-500 mr-2 mt-0.5">✗</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="py-6">
                    <div className="flex items-center mb-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 mr-3">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" /></svg>
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">Improvement Suggestions</h3>
                    </div>
                    <ul className="space-y-2 ml-2">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start text-gray-700">
                          <span className="bg-blue-100 text-blue-800 font-medium rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mr-2 mt-0.5">
                            {index + 1}
                          </span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row md:justify-between gap-4 mt-8">
                <button
                  onClick={() => {
                    setFile(null)
                    setResult(null)
                    setError(null)
                  }}
                  className="w-full md:w-auto bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Check Another Resume
                </button>
                <button
                  onClick={downloadAnalysisPDF}
                  className="flex items-center gap-2 bg-white border border-gray-200 shadow-xl rounded-xl px-6 py-2 text-blue-600 font-semibold hover:shadow-2xl hover:-translate-y-1 hover:bg-blue-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  style={{ boxShadow: "0 4px 24px 0 rgba(30, 64, 175, 0.06)" }}
                >
                  <Download className="w-5 h-5" />
                  Download Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
      @keyframes pulse-slow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.15); }
        50% { box-shadow: 0 0 16px 8px rgba(59,130,246,0.10); }
      }
      .animate-pulse-slow {
        animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      `}</style>
    </div>
  )
}
