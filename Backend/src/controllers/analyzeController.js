const { validateResumeStructure } = require('../services/templateValidation');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to calculate impact score
const calculateImpactScore = (bullets) => {
  const actionVerbs = ['led', 'developed', 'created', 'implemented', 'managed', 'increased', 'decreased', 'improved', 'reduced', 'achieved'];
  const metrics = /\d+%|\$\d+|\d+ [a-zA-Z]+/;
  
  return bullets.reduce((score, bullet) => {
    const hasActionVerb = actionVerbs.some(verb => bullet.toLowerCase().includes(verb));
    const hasMetrics = metrics.test(bullet);
    const impactScore = (hasActionVerb ? 2 : 0) + (hasMetrics ? 3 : 0);
    return score + impactScore;
  }, 0) / bullets.length;
};

// Helper function to extract text content from PDF
const extractPdfText = async (buffer) => {
  const data = await pdf(buffer);
  return data.text;
};

// Helper function to extract text content from DOCX
const extractDocxText = async (buffer) => {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
};

// Helper function to parse text content into structured resume data
const parseResumeText = (text) => {
  // This is a simplified parser - in production you'd want a more robust solution
  const sections = text.split(/\\n{2,}/);
  const resumeData = {
    contact: {},
    experience: [],
    education: [],
    skills: [],
    projects: []
  };

  // Basic parsing logic - this would need to be much more sophisticated in production
  sections.forEach(section => {
    if (section.toLowerCase().includes('email') || section.toLowerCase().includes('phone')) {
      // Parse contact info
      const emailMatch = section.match(/\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b/);
      const phoneMatch = section.match(/\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b/);
      if (emailMatch) resumeData.contact.email = emailMatch[0];
      if (phoneMatch) resumeData.contact.phone = phoneMatch[0];
    } else if (section.toLowerCase().includes('experience')) {
      // Parse experience
      // Add more sophisticated parsing logic here
    }
    // Add more section parsing logic
  });

  return resumeData;
};

const analyzeResume = async (req, res) => {
  try {
    let resumeData;

    if (req.file) {
      // Handle file upload
      const buffer = req.file.buffer;
      let textContent;

      if (req.file.mimetype === 'application/pdf') {
        textContent = await extractPdfText(buffer);
      } else {
        textContent = await extractDocxText(buffer);
      }

      resumeData = parseResumeText(textContent);
    } else {
      // Handle JSON input
      resumeData = req.body;
    }

    // Validate resume structure
    const violations = validateResumeStructure(resumeData);

    // Calculate scores and build report
    const report = {
      templateVersion: 'v1',
      resumeTemplateMatched: violations.length === 0,
      templateViolations: violations,
      summary: {
        overallScore: 0,
        highlights: [],
        risks: []
      },
      sections: {
        contact: resumeData.contact,
        experience: resumeData.experience.map(exp => ({
          ...exp,
          impactScore: calculateImpactScore(exp.bullets)
        })),
        education: resumeData.education,
        skills: resumeData.skills,
        projects: resumeData.projects.map(proj => ({
          ...proj,
          impactScore: calculateImpactScore([proj.description])
        }))
      },
      recommendations: []
    };

    // Calculate overall score
    const expScores = report.sections.experience.map(e => e.impactScore);
    const avgExpScore = expScores.length ? expScores.reduce((a, b) => a + b) / expScores.length : 0;
    report.summary.overallScore = Math.round(avgExpScore * 20); // Scale to 0-100

    // Generate recommendations
    if (violations.length > 0) {
      report.recommendations.push({
        title: 'Fix Template Violations',
        detail: 'Your resume is missing required sections or fields.',
        priority: 'high'
      });
    }

    if (avgExpScore < 2.5) {
      report.recommendations.push({
        title: 'Improve Impact Descriptions',
        detail: 'Add more measurable achievements and action verbs to your experience descriptions.',
        priority: 'medium'
      });
    }

    // Add highlights
    report.sections.experience.forEach(exp => {
      if (exp.impactScore > 3) {
        report.summary.highlights.push(`Strong impact demonstrated in role at ${exp.company}`);
      }
    });

    // Add risks
    if (!resumeData.skills?.length) {
      report.summary.risks.push('No skills section could impact ATS performance');
    }

    logger.info('Resume analysis completed successfully');
    return res.json({
      success: true,
      data: report
    });

  } catch (error) {
    logger.error('Error analyzing resume:', error);
    return res.status(500).json({
      success: false,
      error: 'Error analyzing resume'
    });
  }
};

module.exports = {
  analyzeResume,
  upload: upload.single('resume')
};
