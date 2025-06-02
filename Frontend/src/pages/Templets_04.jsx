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
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import reusable components (adjust paths as per your project structure)
import Button from '../components/Resume-Template/Button';
import Input from '../components/Resume-Template/Input';
import Textarea from '../components/Resume-Template/Textarea';
import ColorPicker from '../components/Resume-Template/ColorPicker';
import Toggle from '../components/Resume-Template/Toggle';
import Card from '../components/Resume-Template/card';
import TabButton from '../components/Resume-Template/TabButton';
import Section from '../components/Resume-Template/Section';
import Notification from '../components/Resume-Template/Notification';
import SaveResumeButton from '../components/Resume-Template/SaveResumeButton';

const Template04 = () => {
    const resumeRef = useRef(null);
    const [activeTab, setActiveTab] = useState('content');
    const [notification, setNotification] = useState({ show: false, message: '' });
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [previewMode, setPreviewMode] = useState(false);    // Initial Resume Data State
    const [resumeData, setResumeData] = useState({
        templateId: "template04",
        photo: '',
        name: 'Juan Hernandez',
        title: 'Sales Executive',
        address: '4759 Sunnydale Lane, Plano, Texas, United States, 75071',
        phone: '123-456-7890',
        email: 'email@yourmail.com',
        summary: 'A Sales Executive with 10+ years of professional experience...',
        technicalSkills: [
            'Sales Strategy',
            'Client Relations',
            'Market Analysis',
            'Team Leadership',
            'Sales Training',
            'Contract Negotiation'
        ],
        professionalExperience: [
            {
                company: 'XYZ Corporation',
                period: '2020 - Present',
                responsibilities: [
                    'Led a team of 10 sales representatives, achieving 120% of annual sales targets',
                    'Developed and implemented new sales strategies resulting in 30% revenue growth'
                ]
            }
        ],
        education: [
            {
                degree: 'Bachelor of Business Administration',
                university: 'University of Texas',
                period: '2010 - 2014'
            }
        ],
        certifications: [
            'Certified Sales Professional (CSP)',
            'Advanced Negotiation Certification'
        ],
        fontFamily: 'Inter, sans-serif',
        fontSize: 'medium',
        primaryColor: '#2563eb',
        headerTextColor: '#ffffff',
        backgroundColor: '#ffffff',
        sectionVisibility: {
            summary: true,
            technicalSkills: true,
            professionalExperience: true,
            education: true,
            certifications: true
        },
        sectionOrder: [
            'summary',
            'technicalSkills',
            'professionalExperience',
            'education',
            'certifications'
        ]
    });

    const [templates] = useState([
        { id: 'minimal', name: 'Minimal', color: '#2E7D32', accent: '#4CAF50' },
        { id: 'professional', name: 'Professional', color: '#1565C0', accent: '#42A5F5' },
        { id: 'creative', name: 'Creative', color: '#7B1FA2', accent: '#BA68C8' },
        { id: 'modern', name: 'Modern', color: '#424242', accent: '#757575' },
        { id: 'executive', name: 'Executive', color: '#004D40', accent: '#00897B' },
    ]);

    const generatePDF = async () => {
        const resume = resumeRef.current;
        if (!resume) return;

        try {
            const canvas = await html2canvas(resume);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('resume.pdf');
            showNotification('PDF downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showNotification('Error generating PDF. Please try again.');
        }
    };

    const showNotification = (message) => {
        setNotification({ show: true, message });
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setResumeData((prev) => ({ ...prev, photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const addItem = (section, defaultItem) => {
        setResumeData((prev) => ({
            ...prev,
            [section]: Array.isArray(prev[section]) ? [...prev[section], defaultItem] : defaultItem
        }));
        showNotification(`Added new item to ${section}!`);
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

    const getFontSize = () => {
        switch (resumeData.fontSize) {
            case 'small': return '12px';
            case 'medium': return '14px';
            case 'large': return '16px';
            default: return '14px';
        }
    };

    const ResumePreview = () => (
        <div
            id="resume"
            ref={resumeRef}
            className="shadow-lg rounded-lg overflow-hidden bg-white"
            style={{
                maxWidth: '100%',
                fontFamily: resumeData.fontFamily,
                fontSize: getFontSize(),
            }}
        >
            {/* Header Section */}
            <div
                style={{ backgroundColor: resumeData.primaryColor, color: resumeData.headerTextColor }}
                className="p-8"
            >
                <div className="flex items-center gap-6">
                    {resumeData.photo && (
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/40">
                            <img src={resumeData.photo} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">{resumeData.name}</h1>
                        <h2 className="text-xl mt-2">{resumeData.title}</h2>
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        <span>{resumeData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        <span>{resumeData.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        <span>{resumeData.address}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-8">
                {resumeData.sectionVisibility.summary && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2">Summary</h3>
                        <p>{resumeData.summary}</p>
                    </div>
                )}

                {resumeData.sectionVisibility.technicalSkills && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2">Technical Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {resumeData.technicalSkills.map((skill, index) => (
                                <span 
                                    key={index}
                                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {resumeData.sectionVisibility.professionalExperience && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2">Professional Experience</h3>
                        {resumeData.professionalExperience.map((exp, index) => (
                            <div key={index} className="mb-6">
                                <h4 className="text-lg font-semibold">{exp.company}</h4>
                                <p className="text-gray-600 mb-2">{exp.period}</p>
                                <ul className="list-disc ml-6">
                                    {exp.responsibilities.map((resp, idx) => (
                                        <li key={idx}>{resp}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {resumeData.sectionVisibility.education && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2">Education</h3>
                        {resumeData.education.map((edu, index) => (
                            <div key={index} className="mb-4">
                                <h4 className="text-lg font-semibold">{edu.degree}</h4>
                                <p>{edu.university}</p>
                                <p className="text-gray-600">{edu.period}</p>
                            </div>
                        ))}
                    </div>
                )}

                {resumeData.sectionVisibility.certifications && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2">Certifications</h3>
                        <ul className="list-disc ml-6">
                            {resumeData.certifications.map((cert, index) => (
                                <li key={index}>{cert}</li>
                            ))}
                        </ul>
                    </div>
                )}
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
                            <SaveResumeButton resumeData={resumeData} />
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
                                                    <Input value={resumeData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Your Full Name" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                                    <Input value={resumeData.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Your Job Title" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                    <Input value={resumeData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="your.email@example.com" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                    <Input value={resumeData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="(123) 456-7890" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                                    <Input value={resumeData.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Your Address" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                                                    <Input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500" />
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
                                                        <option value="small">Small (12px)</option>
                                                        <option value="medium">Medium (14px)</option>
                                                        <option value="large">Large (16px)</option>
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
                <ToastContainer autoClose={2000} position="top-center" hideProgressBar={false} />
            </div>
        </div>
    );
};

export default Template04;