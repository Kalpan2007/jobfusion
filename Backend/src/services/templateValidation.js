const RESUME_TEMPLATE = require('../domain/resumeTemplate');

const validateResumeStructure = (resumeData) => {
  const violations = [];
  
  // Validate each required section
  Object.entries(RESUME_TEMPLATE.sections).forEach(([sectionName, config]) => {
    // Check if section exists
    if (!resumeData[sectionName]) {
      violations.push({
        field: sectionName,
        issue: 'Required section is missing'
      });
      return;
    }

    // Check if section is array when expected
    if (config.type === 'array' && !Array.isArray(resumeData[sectionName])) {
      violations.push({
        field: sectionName,
        issue: 'Section must be an array',
        expected: 'array',
        received: typeof resumeData[sectionName]
      });
      return;
    }

    // For object sections, validate required fields
    if (config.required) {
      if (Array.isArray(resumeData[sectionName])) {
        // Validate each item in array sections (experience, education, projects)
        resumeData[sectionName].forEach((item, index) => {
          config.required.forEach(field => {
            if (!item[field]) {
              violations.push({
                field: `${sectionName}[${index}].${field}`,
                issue: 'Required field is missing',
                expected: 'non-empty value',
                received: 'undefined'
              });
            }
          });
        });
      } else {
        // Validate single object sections (contact)
        config.required.forEach(field => {
          if (!resumeData[sectionName][field]) {
            violations.push({
              field: `${sectionName}.${field}`,
              issue: 'Required field is missing',
              expected: 'non-empty value',
              received: 'undefined'
            });
          }
        });
      }
    }
  });

  return violations;
};

module.exports = { validateResumeStructure };
