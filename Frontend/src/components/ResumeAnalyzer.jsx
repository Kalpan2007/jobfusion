import React, { useState } from 'react';
import axios from 'axios';
import { Loader } from 'lucide-react';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [inputMethod, setInputMethod] = useState('file'); // 'file' or 'json'

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFile(file);
      setError(null);
    } else {
      setError('Please upload a PDF or DOCX file');
      setFile(null);
    }
  };

  const handleJsonChange = (e) => {
    setJsonInput(e.target.value);
    try {
      JSON.parse(e.target.value);
      setError(null);
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (inputMethod === 'file' && file) {
        const formData = new FormData();
        formData.append('resume', file);
        response = await axios.post('https://jobfusion.onrender.com/api/resume/analyze', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else if (inputMethod === 'json' && jsonInput) {
        const jsonData = JSON.parse(jsonInput);
        response = await axios.post('https://jobfusion.onrender.com/api/resume/analyze', jsonData);
      } else {
        throw new Error('Please provide a resume file or JSON data');
      }

      setReport(response.data.data);
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Error analyzing resume');
    } finally {
      setLoading(false);
    }
  };

  const exportJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-analysis.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (!report) return;
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Resume Analysis</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setInputMethod('file')}
            className={`px-4 py-2 rounded ${inputMethod === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Upload File
          </button>
          <button
            onClick={() => setInputMethod('json')}
            className={`px-4 py-2 rounded ${inputMethod === 'json' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Paste JSON
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {inputMethod === 'file' ? (
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          ) : (
            <textarea
              value={jsonInput}
              onChange={handleJsonChange}
              placeholder="Paste your resume JSON here..."
              className="w-full h-48 p-4 border rounded-lg resize-none"
            />
          )}

          {error && <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center"
          >
            {loading ? <Loader className="animate-spin" /> : 'Analyze Resume'}
          </button>
        </form>
      </div>

      {report && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-end gap-4 mb-6">
            <button
              onClick={exportJson}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Export JSON
            </button>
            <button
              onClick={exportPdf}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Export PDF
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Summary</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-lg mb-2">Overall Score: {report.summary.overallScore}/100</p>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Highlights:</h4>
                  <ul className="list-disc pl-5">
                    {report.summary.highlights.map((highlight, i) => (
                      <li key={i} className="text-green-600">{highlight}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Risks:</h4>
                  <ul className="list-disc pl-5">
                    {report.summary.risks.map((risk, i) => (
                      <li key={i} className="text-red-600">{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {report.templateViolations.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Template Violations</h3>
                <div className="bg-red-50 p-4 rounded">
                  <ul className="space-y-2">
                    {report.templateViolations.map((violation, i) => (
                      <li key={i} className="text-red-700">
                        {violation.field}: {violation.issue}
                        {violation.expected && ` (Expected: ${violation.expected}, Received: ${violation.received})`}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold mb-2">Recommendations</h3>
              <div className="space-y-4">
                {report.recommendations.map((rec, i) => (
                  <div key={i} className={`p-4 rounded ${
                    rec.priority === 'high' ? 'bg-red-50 border-l-4 border-red-500' :
                    rec.priority === 'medium' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                    'bg-blue-50 border-l-4 border-blue-500'
                  }`}>
                    <h4 className="font-medium mb-1">{rec.title}</h4>
                    <p className="text-gray-600">{rec.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Sections Analysis</h3>
              {report.sections.experience.map((exp, i) => (
                <div key={i} className="mb-4 p-4 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{exp.company} - {exp.role}</h4>
                      <p className="text-sm text-gray-600">{exp.startDate} - {exp.endDate}</p>
                    </div>
                    <div className="bg-blue-100 px-3 py-1 rounded">
                      Impact Score: {exp.impactScore.toFixed(1)}/5
                    </div>
                  </div>
                  <ul className="list-disc pl-5 mt-2">
                    {exp.bullets.map((bullet, j) => (
                      <li key={j} className="text-gray-700">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
