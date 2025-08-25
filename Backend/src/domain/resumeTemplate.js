const RESUME_TEMPLATE = {
  version: 'v1',
  sections: {
    contact: {
      required: ['name', 'email', 'phone'],
      optional: ['location', 'linkedin', 'github']
    },
    experience: {
      required: ['company', 'role', 'startDate', 'endDate', 'bullets'],
      optional: ['technologies']
    },
    education: {
      required: ['school', 'degree', 'startYear', 'endYear'],
      optional: ['gpa']
    },
    skills: {
      type: 'array',
      required: true
    },
    projects: {
      required: ['name', 'description', 'stack'],
      optional: ['link']
    }
  }
};

module.exports = RESUME_TEMPLATE;
