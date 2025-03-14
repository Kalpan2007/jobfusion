import React, { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Phone,
  Mail,
  MapPin,
  Download,
  Plus,
  Trash2,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Layout,
  Sliders,
  Copy,
  Settings,
  Check,
} from 'lucide-react';

// Import reusable components
import Button from '../components/Resume-Template/Button';
import Input from '../components/Resume-Template/Input';
import Textarea from '../components/Resume-Template/Textarea';
import ColorPicker from '../components/Resume-Template/ColorPicker';
import Toggle from '../components/Resume-Template/Toggle';
import Card from '../components/Resume-Template/Card';
import TabButton from '../components/Resume-Template/TabButton';
import Section from '../components/Resume-Template/Section';
import Notification from '../components/Resume-Template/Notification';

const Template04 = () => {
  const resumeRef = useRef(null);
  const [activeTab, setActiveTab] = useState('content');
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);

  const [resumeData, setResumeData] = useState({
    photo: 'https://via.placeholder.com/100',
    name: 'Juan Hernandez',
    title: 'Sales Executive',
    address: '4759 Sunnydale Lane, Plano, Texas, United States, 75071',
    phone: '123-456-7890',
    email: 'email@yourmail.com',
    summary: 'A Sales Executive with 10+ years of professional experience...',
    technicalSkills: ['Account Management', 'Consultative Selling', 'Strategic Selling', 'Cross-functional Collaboration', 'Sales Management'],
    professionalExperience: [
      {
        id: '1',
        company: 'Accelerate Software',
        period: 'February 2017 - Present',
        title: 'Senior Account Manager',
        responsibilities: [
          'Oversee 35+ enterprise customer accounts generating over $20M+ in yearly revenue...',
          'Lead sales meetings with C-level executives to close new business.',
          'Serve as the point of contact for client accounts...',
          'Lead a team of 10+ Account Executives...',
        ],
      },
      {
        id: '2',
        company: 'Celeste Inc.',
        period: 'June 2013 - February 2017',
        title: 'Sales Account Executive',
        responsibilities: [
          'Managed 20+ client accounts generating $150K to $800K in annual revenue.',
          'Attended high-level sales meetings...',
          'Drove business development activities...',
          'Collaborated with cross-functional teams...',
        ],
      },
    ],
    education: [
      { id: '1', degree: 'Bachelor of Science (B.S.) in Marketing', university: 'University of Florida, Gainesville, FL', period: 'September 2011 - June 2013' },
      { id: '2', degree: 'Associate of Arts in Business', university: 'City Colleges, Chicago, IL', period: 'January 2008 - September 2010' },
    ],
    certifications: [
      'Certified Professional Sales Leader (CPSL), NASP, 2017',
      'Salesforce Certification, Salesforce.com, 2015',
      'Certified Sales Development Representative, AA-ISP, 2013',
      'Professional Program Certificate in Retail, Tacoma College, 2016',
    ],
    socialLinks: { linkedin: 'linkedin.com/in/yourprofile', github: '', twitter: '', website: '' },
    primaryColor: '#2E7D32',
    secondaryColor: '#2E7D32',
    accentColor: '#4CAF50',
    headerTextColor: '#FFFFFF',
    sidebarTextColor: '#FFFFFF',
    mainTextColor: '#333333',
    backgroundColor: '#FFFFFF',
    fontSize: 'medium',
    fontFamily: 'Inter, sans-serif',
    sectionOrder: ['summary', 'technicalSkills', 'professionalExperience', 'education', 'certifications'],
    sectionVisibility: { summary: true, technicalSkills: true, professionalExperience: true, education: true, certifications: true, socialLinks: true },
    sectionStyles: {
      summary: { bgColor: '#FFFFFF', textColor: '#333333' },
      technicalSkills: { bgColor: '#2E7D32', textColor: '#FFFFFF' },
      professionalExperience: { bgColor: '#FFFFFF', textColor: '#333333' },
      education: { bgColor: '#FFFFFF', textColor: '#333333' },
      certifications: { bgColor: '#FFFFFF', textColor: '#333333' },
    },
    layout: 'sidebar-left',
  });

  const [templates] = useState([
    { id: 'minimal', name: 'Minimal', color: '#2E7D32', accent: '#4CAF50' },
    { id: 'professional', name: 'Professional', color: '#1565C0', accent: '#42A5F5' },
    { id: 'creative', name: 'Creative', color: '#7B1FA2', accent: '#BA68C8' },
    { id: 'modern', name: 'Modern', color: '#424242', accent: '#757575' },
    { id: 'executive', name: 'Executive', color: '#004D40', accent: '#00897B' },
  ]);

  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: '' }), 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setResumeData({ ...resumeData, photo: e.target.result });
      showNotification('Photo updated successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === 'section') {
      const newSectionOrder = Array.from(resumeData.sectionOrder);
      const [removed] = newSectionOrder.splice(source.index, 1);
      newSectionOrder.splice(destination.index, 0, removed);
      setResumeData({ ...resumeData, sectionOrder: newSectionOrder });
    } else if (type === 'experience') {
      const items = Array.from(resumeData.professionalExperience);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setResumeData({ ...resumeData, professionalExperience: items });
    } else if (type === 'education') {
      const items = Array.from(resumeData.education);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setResumeData({ ...resumeData, education: items });
    }
  };

  const generatePDF = () => {
    const input = resumeRef.current;
    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight > pdfHeight ? pdfHeight : imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${resumeData.name.toLowerCase().replace(/\s+/g, '-')}-resume.pdf`);
    });
  };

  const updateField = (field, value) => setResumeData({ ...resumeData, [field]: value });

  const updateExperience = (index, field, value) => {
    const updatedExp = [...resumeData.professionalExperience];
    updatedExp[index][field] = value;
    setResumeData({ ...resumeData, professionalExperience: updatedExp });
  };

  const updateEducation = (index, field, value) => {
    const updatedEdu = [...resumeData.education];
    updatedEdu[index][field] = value;
    setResumeData({ ...resumeData, education: updatedEdu });
  };

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      professionalExperience: [
        ...resumeData.professionalExperience,
        { id: Date.now().toString(), company: 'New Company', period: 'Start - End Date', title: 'Your Title', responsibilities: ['Describe your key responsibilities and achievements'] },
      ],
    });
    showNotification('New experience added!');
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        { id: Date.now().toString(), degree: 'Your Degree', university: 'University Name', period: 'Start - End Date' },
      ],
    });
    showNotification('New education added!');
  };

  const updateResponsibilities = (expIndex, respIndex, value) => {
    const updatedExp = [...resumeData.professionalExperience];
    updatedExp[expIndex].responsibilities[respIndex] = value;
    setResumeData({ ...resumeData, professionalExperience: updatedExp });
  };

  const addResponsibility = (expIndex) => {
    const updatedExp = [...resumeData.professionalExperience];
    updatedExp[expIndex].responsibilities.push('New responsibility');
    setResumeData({ ...resumeData, professionalExperience: updatedExp });
  };

  const removeResponsibility = (expIndex, respIndex) => {
    const updatedExp = [...resumeData.professionalExperience];
    if (updatedExp[expIndex].responsibilities.length > 1) {
      updatedExp[expIndex].responsibilities.splice(respIndex, 1);
      setResumeData({ ...resumeData, professionalExperience: updatedExp });
    }
  };

  const removeItem = (section, index) => {
    if (resumeData[section].length > 1) {
      setResumeData((prev) => ({
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index),
      }));
      showNotification(`Item removed from ${section}!`);
    }
  };

  const applyTemplate = (template) => {
    setResumeData({ ...resumeData, primaryColor: template.color, secondaryColor: template.color, accentColor: template.accent });
    showNotification(`${template.name} template applied!`);
  };

  const toggleSection = (section) => {
    setResumeData({
      ...resumeData,
      sectionVisibility: { ...resumeData.sectionVisibility, [section]: !resumeData.sectionVisibility[section] },
    });
  };

  const togglePreviewMode = () => setPreviewMode(!previewMode);

  const sidebarSections = resumeData.sectionOrder.filter(
    (section) => ['summary', 'technicalSkills'].includes(section) && resumeData.sectionVisibility[section]
  );
  const contentSections = resumeData.sectionOrder.filter(
    (section) => ['professionalExperience', 'education', 'certifications'].includes(section) && resumeData.sectionVisibility[section]
  );

  const ResumePreview = () => (
    <div
      id="resume"
      ref={resumeRef}
      className="shadow-lg rounded-lg overflow-hidden flex flex-col bg-white"
      style={{ maxWidth: '100%', fontSize: resumeData.fontSize, fontFamily: resumeData.fontFamily }}
    >
      <div style={{ backgroundColor: resumeData.primaryColor, color: resumeData.headerTextColor }} className="p-6 flex items-center gap-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white/40 flex-shrink-0">
          <img src={resumeData.photo} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-bold">{resumeData.name}</h1>
          <p className="text-xl mt-1">{resumeData.title}</p>
        </div>
      </div>
      <div className="flex flex-1">
        <div style={{ flex: '0 0 35%', backgroundColor: resumeData.secondaryColor, color: resumeData.sidebarTextColor }} className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 border-b-2 border-white/30 pb-2">Contact</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>{resumeData.phone}</span></div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>{resumeData.email}</span></div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{resumeData.address}</span></div>
            </div>
          </div>
          {resumeData.sectionVisibility.socialLinks && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 border-b-2 border-white/30 pb-2">Social</h2>
              <div className="space-y-2">
                {resumeData.socialLinks.linkedin && <div className="flex items-center gap-2"><Linkedin className="h-4 w-4" /><span>{resumeData.socialLinks.linkedin}</span></div>}
                {resumeData.socialLinks.github && <div className="flex items-center gap-2"><Github className="h-4 w-4" /><span>{resumeData.socialLinks.github}</span></div>}
                {resumeData.socialLinks.twitter && <div className="flex items-center gap-2"><Twitter className="h-4 w-4" /><span>{resumeData.socialLinks.twitter}</span></div>}
                {resumeData.socialLinks.website && <div className="flex items-center gap-2"><Globe className="h-4 w-4" /><span>{resumeData.socialLinks.website}</span></div>}
              </div>
            </div>
          )}
          {sidebarSections.map((section) => (
            <div key={section} className="mb-6">
              {section === 'summary' && resumeData.sectionVisibility.summary && (
                <>
                  <h2 className="text-xl font-semibold mb-3 border-b-2 border-white/30 pb-2">Summary</h2>
                  <p>{resumeData.summary}</p>
                </>
              )}
              {section === 'technicalSkills' && resumeData.sectionVisibility.technicalSkills && (
                <>
                  <h2 className="text-xl font-semibold mb-3 border-b-2 border-white/30 pb-2">Skills</h2>
                  <ul className="list-none space-y-2">
                    {resumeData.technicalSkills.map((skill, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white/70"></div>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
        <div style={{ flex: '0 0 65%', backgroundColor: resumeData.backgroundColor, color: resumeData.mainTextColor }} className="p-6">
          {contentSections.map((section) => (
            <div key={section} className="mb-8">
              {section === 'professionalExperience' && resumeData.sectionVisibility.professionalExperience && (
                <>
                  <h2 className="text-xl font-semibold border-b-2 pb-2 mb-4" style={{ color: resumeData.primaryColor, borderBottomColor: resumeData.primaryColor }}>
                    Professional Experience
                  </h2>
                  {resumeData.professionalExperience.map((exp) => (
                    <div key={exp.id} className="mb-6">
                      <h3 className="font-semibold text-lg">{exp.company}</h3>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{exp.title}</span>
                        <span className="text-gray-600">{exp.period}</span>
                      </div>
                      <ul className="list-disc pl-5 space-y-1">
                        {exp.responsibilities.map((resp, respIndex) => <li key={respIndex}>{resp}</li>)}
                      </ul>
                    </div>
                  ))}
                </>
              )}
              {section === 'education' && resumeData.sectionVisibility.education && (
                <>
                  <h2 className="text-xl font-semibold border-b-2 pb-2 mb-4" style={{ color: resumeData.primaryColor, borderBottomColor: resumeData.primaryColor }}>
                    Education
                  </h2>
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="mb-4">
                      <h3 className="font-semibold">{edu.university}</h3>
                      <p>{edu.degree}</p>
                      <p className="text-gray-600">{edu.period}</p>
                    </div>
                  ))}
                </>
              )}
              {section === 'certifications' && resumeData.sectionVisibility.certifications && (
                <>
                  <h2 className="text-xl font-semibold border-b-2 pb-2 mb-4" style={{ color: resumeData.primaryColor, borderBottomColor: resumeData.primaryColor }}>
                    Certifications
                  </h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {resumeData.certifications.map((cert, index) => <li key={index}>{cert}</li>)}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Professional Resume Builder</h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={togglePreviewMode} className="flex items-center gap-2">
                {previewMode ? 'Edit Mode' : 'Preview Mode'}
              </Button>
              <Button onClick={generatePDF} className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>
          {!previewMode && (
            <div className="flex border-b border-gray-200">
              <TabButton active={activeTab === 'content'} label="Content" icon={<Layout className="h-4 w-4" />} onClick={() => setActiveTab('content')} />
              <TabButton active={activeTab === 'style'} label="Style" icon={<Sliders className="h-4 w-4" />} onClick={() => setActiveTab('style')} />
              <TabButton active={activeTab === 'templates'} label="Templates" icon={<Copy className="h-4 w-4" />} onClick={() => setActiveTab('templates')} />
              <TabButton active={activeTab === 'settings'} label="Settings" icon={<Settings className="h-4 w-4" />} onClick={() => setActiveTab('settings')} />
            </div>
          )}
        </header>
        {previewMode ? (
          <div className="bg-white p-8 shadow-lg rounded-lg">
            <ResumePreview />
          </div>
        ) : (
          <div className="flex gap-6">
            {sidebarVisible && (
              <div className="w-1/3 space-y-4">
                {activeTab === 'content' && (
                  <Card className="p-4">
                    <Section title="Personal Information">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <Input key="name" value={resumeData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Your Full Name" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                          <Input key="title" value={resumeData.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Your Job Title" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <Input key="email" value={resumeData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="your.email@example.com" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <Input key="phone" value={resumeData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="(123) 456-7890" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <Input key="address" value={resumeData.address} onChange={(e) => updateField('address', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                          <Input type="file" accept="image/*" onChange={handleFileUpload} className="block w-full text-sm text-gray-500" />
                        </div>
                      </div>
                    </Section>
                    <Section title="Professional Experience">
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="experience" type="experience">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                              {resumeData.professionalExperience.map((exp, index) => (
                                <Draggable key={exp.id} draggableId={exp.id} index={index}>
                                  {(provided) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                                      <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-medium">{exp.company}</h3>
                                        <button className="text-red-500 hover:text-red-700" onClick={() => removeItem('professionalExperience', index)}>
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                      <div className="space-y-3">
                                        <Input value={exp.title} onChange={(e) => updateExperience(index, 'title', e.target.value)} placeholder="Job Title" />
                                        <Input value={exp.period} onChange={(e) => updateExperience(index, 'period', e.target.value)} placeholder="Period (e.g., Jan 2020 - Present)" />
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities</label>
                                          {exp.responsibilities.map((resp, respIndex) => (
                                            <div key={respIndex} className="flex gap-2 mb-2">
                                              <Input
                                                value={resp}
                                                onChange={(e) => updateResponsibilities(index, respIndex, e.target.value)}
                                                placeholder="Responsibility"
                                                className="flex-1"
                                              />
                                              <button className="text-red-500" onClick={() => removeResponsibility(index, respIndex)}>
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          ))}
                                          <button className="text-blue-500 flex items-center gap-1" onClick={() => addResponsibility(index)}>
                                            <Plus size={14} /> Add Responsibility
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                      <Button variant="outline" onClick={addExperience} className="mt-3">
                        <Plus size={16} /> Add Experience
                      </Button>
                    </Section>
                    <Section title="Education">
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="education" type="education">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                              {resumeData.education.map((edu, index) => (
                                <Draggable key={edu.id} draggableId={edu.id} index={index}>
                                  {(provided) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                                      <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-medium">{edu.university}</h3>
                                        <button className="text-red-500 hover:text-red-700" onClick={() => removeItem('education', index)}>
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                      <div className="space-y-3">
                                        <Input value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} placeholder="Degree" />
                                        <Input value={edu.period} onChange={(e) => updateEducation(index, 'period', e.target.value)} placeholder="Period (e.g., 2018-2022)" />
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                      <Button variant="outline" onClick={addEducation} className="mt-3">
                        <Plus size={16} /> Add Education
                      </Button>
                    </Section>
                    <Section title="Certifications">
                      <Textarea
                        value={resumeData.certifications.join('\n')}
                        onChange={(e) => setResumeData({ ...resumeData, certifications: e.target.value.split('\n') })}
                        placeholder="Enter certifications (one per line)"
                        rows={4}
                      />
                    </Section>
                    <Section title="Social Links">
                      <div className="space-y-3">
                        <Input
                          value={resumeData.socialLinks.linkedin}
                          onChange={(e) => setResumeData({ ...resumeData, socialLinks: { ...resumeData.socialLinks, linkedin: e.target.value } })}
                          placeholder="LinkedIn URL"
                        />
                        <Input
                          value={resumeData.socialLinks.github}
                          onChange={(e) => setResumeData({ ...resumeData, socialLinks: { ...resumeData.socialLinks, github: e.target.value } })}
                          placeholder="GitHub URL"
                        />
                        <Input
                          value={resumeData.socialLinks.twitter}
                          onChange={(e) => setResumeData({ ...resumeData, socialLinks: { ...resumeData.socialLinks, twitter: e.target.value } })}
                          placeholder="Twitter URL"
                        />
                        <Input
                          value={resumeData.socialLinks.website}
                          onChange={(e) => setResumeData({ ...resumeData, socialLinks: { ...resumeData.socialLinks, website: e.target.value } })}
                          placeholder="Personal Website URL"
                        />
                      </div>
                    </Section>
                  </Card>
                )}
                {activeTab === 'style' && (
                  <Card className="p-4 space-y-6">
                    <Section title="Colors">
                      <div className="grid grid-cols-2 gap-4">
                        <ColorPicker label="Primary Color" value={resumeData.primaryColor} onChange={(e) => setResumeData({ ...resumeData, primaryColor: e.target.value })} />
                        <ColorPicker label="Secondary Color" value={resumeData.secondaryColor} onChange={(e) => setResumeData({ ...resumeData, secondaryColor: e.target.value })} />
                        <ColorPicker label="Accent Color" value={resumeData.accentColor} onChange={(e) => setResumeData({ ...resumeData, accentColor: e.target.value })} />
                        <ColorPicker label="Header Text" value={resumeData.headerTextColor} onChange={(e) => setResumeData({ ...resumeData, headerTextColor: e.target.value })} />
                        <ColorPicker label="Sidebar Text" value={resumeData.sidebarTextColor} onChange={(e) => setResumeData({ ...resumeData, sidebarTextColor: e.target.value })} />
                        <ColorPicker label="Main Text" value={resumeData.mainTextColor} onChange={(e) => setResumeData({ ...resumeData, mainTextColor: e.target.value })} />
                        <ColorPicker label="Background" value={resumeData.backgroundColor} onChange={(e) => setResumeData({ ...resumeData, backgroundColor: e.target.value })} />
                      </div>
                    </Section>
                    <Section title="Typography">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                          <select value={resumeData.fontFamily} onChange={(e) => setResumeData({ ...resumeData, fontFamily: e.target.value })} className="w-full p-2 border rounded">
                            <option value="Inter, sans-serif">Inter</option>
                            <option value="Roboto, sans-serif">Roboto</option>
                            <option value="Merriweather, serif">Merriweather</option>
                            <option value="Lato, sans-serif">Lato</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                          <select value={resumeData.fontSize} onChange={(e) => setResumeData({ ...resumeData, fontSize: e.target.value })} className="w-full p-2 border rounded">
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        </div>
                      </div>
                    </Section>
                  </Card>
                )}
                {activeTab === 'templates' && (
                  <Card className="p-4">
                    <Section title="Template Presets">
                      <div className="grid grid-cols-2 gap-4">
                        {templates.map((template) => (
                          <div key={template.id} className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors" onClick={() => applyTemplate(template)}>
                            <div className="w-full h-32 rounded-lg mb-2" style={{ backgroundColor: template.color }} />
                            <h3 className="font-medium text-center">{template.name}</h3>
                          </div>
                        ))}
                      </div>
                    </Section>
                  </Card>
                )}
                {activeTab === 'settings' && (
                  <Card className="p-4">
                    <Section title="Section Visibility">
                      <div className="space-y-3">
                        {Object.entries(resumeData.sectionVisibility).map(([section, visible]) => (
                          <Toggle
                            key={section}
                            label={section.charAt(0).toUpperCase() + section.slice(1)}
                            checked={visible}
                            onChange={() => toggleSection(section)}
                          />
                        ))}
                      </div>
                    </Section>
                    <Section title="Layout Options">
                      <div className="space-y-3">
                        <Toggle
                          label="Sidebar Position (Left/Right)"
                          checked={resumeData.layout === 'sidebar-left'}
                          onChange={() => setResumeData({ ...resumeData, layout: resumeData.layout === 'sidebar-left' ? 'sidebar-right' : 'sidebar-left' })}
                        />
                      </div>
                    </Section>
                  </Card>
                )}
              </div>
            )}
            <div className="flex-1">
              <ResumePreview />
            </div>
          </div>
        )}
        <Notification show={notification.show} message={notification.message} />
      </div>
    </div>
  );
};

export default Template04;