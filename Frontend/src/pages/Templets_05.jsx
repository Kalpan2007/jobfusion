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
    Palette,
    RotateCcw,
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

const Template05 = () => {
    const resumeRef = useRef(null);
    const [activeTab, setActiveTab] = useState('content');
    const [notification, setNotification] = useState({ show: false, message: '' });
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [previewMode, setPreviewMode] = useState(false);

    // Default resume data with light theme
    const defaultResumeData = {
        photo: '',
        name: 'Priya Sharma',
        title: 'UI/UX Designer',
        address: 'Mumbai, Maharashtra, India',
        phone: '+91-98765-43210',
        email: 'priya.sharma@example.com',
        summary: 'Creative UI/UX Designer with 7+ years of experience in designing user-centric digital solutions...',
        technicalSkills: ['UI/UX Design', 'Wireframing', 'Prototyping', 'Figma', 'Adobe XD'],
        professionalExperience: [
            { id: '1', company: 'TechTrend Innovations', period: 'March 2019 - Present', title: 'Senior UI/UX Designer', responsibilities: ['Led design for 20+ mobile apps...'] },
            { id: '2', company: 'CreativeLabs', period: 'July 2016 - February 2019', title: 'UI Designer', responsibilities: ['Designed user interfaces for web platforms...'] },
        ],
        education: [
            { id: '1', degree: 'B.Des in Interaction Design', university: 'National Institute of Design, Ahmedabad', period: '2012 - 2016' },
        ],
        certifications: ['Certified UX Designer, Coursera, 2020', 'Advanced Figma, Udemy, 2019'],
        socialLinks: { linkedin: 'linkedin.com/in/priyasharma', github: '', twitter: 'twitter.com/priya_ui', website: 'priyasharma.design' },
        primaryColor: '#0288D1', // Light Blue
        secondaryColor: '#F5F6F5', // Light Gray
        accentColor: '#4FC3F7', // Sky Blue
        headerTextColor: '#FFFFFF',
        sidebarTextColor: '#455A64', // Dark Gray
        mainTextColor: '#212121', // Near Black
        backgroundColor: '#FFFFFF', // White
        fontSize: 'medium',
        fontFamily: 'Poppins, sans-serif',
        sectionOrder: ['summary', 'technicalSkills', 'professionalExperience', 'education', 'certifications'],
        sectionVisibility: { summary: true, technicalSkills: true, professionalExperience: true, education: true, certifications: true, socialLinks: true },
        sectionStyles: {
            summary: { bgColor: '#F5F6F5', textColor: '#212121' },
            technicalSkills: { bgColor: '#0288D1', textColor: '#FFFFFF' },
            professionalExperience: { bgColor: '#FFFFFF', textColor: '#212121' },
            education: { bgColor: '#FFFFFF', textColor: '#212121' },
            certifications: { bgColor: '#FFFFFF', textColor: '#212121' },
        },
        layout: 'full-width',
        borderRadius: '12px', // Slightly larger for a softer look
    };

    const [resumeData, setResumeData] = useState(defaultResumeData);

    const [templates] = useState([
        { id: 'light-modern', name: 'Light Modern', color: '#0288D1', accent: '#4FC3F7' },
        { id: 'sunny', name: 'Sunny', color: '#FBC02D', accent: '#FFEE58' },
        { id: 'pastel', name: 'Pastel', color: '#7E57C2', accent: '#B39DDB' },
        { id: 'clean', name: 'Clean', color: '#455A64', accent: '#90A4AE' },
        { id: 'fresh', name: 'Fresh', color: '#4CAF50', accent: '#81C784' },
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
            showNotification('Photo uploaded successfully!');
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
        html2canvas(input, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: resumeData.backgroundColor,
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(`${resumeData.name.toLowerCase().replace(/\s+/g, '-')}-resume.pdf`);
            toast.success('PDF downloaded successfully!', { position: 'top-center', autoClose: 2000 });
        }).catch((error) => {
            console.error('Error generating PDF:', error);
            toast.error('Failed to download PDF.', { position: 'top-center', autoClose: 2000 });
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
                { id: Date.now().toString(), company: 'New Company', period: 'Start - End', title: 'Your Title', responsibilities: ['Add your responsibilities here'] },
            ],
        });
        showNotification('Experience added!');
    };

    const addEducation = () => {
        setResumeData({
            ...resumeData,
            education: [
                ...resumeData.education,
                { id: Date.now().toString(), degree: 'Your Degree', university: 'University Name', period: 'Start - End' },
            ],
        });
        showNotification('Education added!');
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
        setResumeData({
            ...resumeData,
            primaryColor: template.color,
            secondaryColor: '#F5F6F5',
            accentColor: template.accent,
        });
        showNotification(`${template.name} template applied!`);
    };

    const resetTemplate = () => {
        setResumeData(defaultResumeData);
        showNotification('Template reset to default!');
    };

    const toggleSection = (section) => {
        setResumeData({
            ...resumeData,
            sectionVisibility: { ...resumeData.sectionVisibility, [section]: !resumeData.sectionVisibility[section] },
        });
    };

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
                backgroundColor: resumeData.backgroundColor,
                borderRadius: resumeData.borderRadius,
            }}
        >
            {/* Header Section */}
            <div
                style={{ backgroundColor: resumeData.primaryColor, color: resumeData.headerTextColor }}
                className="p-8 flex items-center justify-between"
            >
                <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/30">
                        {resumeData.photo ? (
                            <img src={resumeData.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">No Photo</div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">{resumeData.name || 'Your Name'}</h1>
                        <p className="text-xl mt-2 opacity-90">{resumeData.title || 'Your Title'}</p>
                    </div>
                </div>
                <div className="text-right space-y-2">
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {resumeData.phone || 'N/A'}</p>
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {resumeData.email || 'N/A'}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {resumeData.address || 'N/A'}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-8 grid grid-cols-1 gap-8" style={{ color: resumeData.mainTextColor }}>
                {resumeData.sectionOrder.map((section) => (
                    resumeData.sectionVisibility[section] && (
                        <div
                            key={section}
                            style={{
                                backgroundColor: resumeData.sectionStyles[section].bgColor,
                                color: resumeData.sectionStyles[section].textColor,
                                borderRadius: resumeData.borderRadius,
                            }}
                            className="p-6 shadow-sm"
                        >
                            {section === 'summary' && (
                                <>
                                    <h2 className="text-2xl font-semibold mb-4 border-b-2 pb-2" style={{ borderBottomColor: resumeData.accentColor }}>
                                        Summary
                                    </h2>
                                    <p className="leading-relaxed">{resumeData.summary || 'Your summary here'}</p>
                                </>
                            )}
                            {section === 'technicalSkills' && (
                                <>
                                    <h2 className="text-2xl font-semibold mb-4 border-b-2 pb-2" style={{ borderBottomColor: resumeData.accentColor }}>
                                        Skills
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        {resumeData.technicalSkills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 rounded-full text-sm font-medium"
                                                style={{ backgroundColor: resumeData.accentColor, color: '#FFFFFF' }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                            {section === 'professionalExperience' && (
                                <>
                                    <h2 className="text-2xl font-semibold mb-4 border-b-2 pb-2" style={{ borderBottomColor: resumeData.accentColor }}>
                                        Professional Experience
                                    </h2>
                                    {resumeData.professionalExperience.map((exp) => (
                                        <div key={exp.id} className="mb-6">
                                            <h3 className="font-semibold text-lg">{exp.company}</h3>
                                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                <span>{exp.title}</span>
                                                <span>{exp.period}</span>
                                            </div>
                                            <ul className="list-disc pl-5 space-y-1">
                                                {exp.responsibilities.map((resp, respIndex) => <li key={respIndex}>{resp}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </>
                            )}
                            {section === 'education' && (
                                <>
                                    <h2 className="text-2xl font-semibold mb-4 border-b-2 pb-2" style={{ borderBottomColor: resumeData.accentColor }}>
                                        Education
                                    </h2>
                                    {resumeData.education.map((edu) => (
                                        <div key={edu.id} className="mb-4">
                                            <h3 className="font-semibold">{edu.university}</h3>
                                            <p>{edu.degree}</p>
                                            <p className="text-sm text-gray-600">{edu.period}</p>
                                        </div>
                                    ))}
                                </>
                            )}
                            {section === 'certifications' && (
                                <>
                                    <h2 className="text-2xl font-semibold mb-4 border-b-2 pb-2" style={{ borderBottomColor: resumeData.accentColor }}>
                                        Certifications
                                    </h2>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {resumeData.certifications.map((cert, index) => <li key={index}>{cert}</li>)}
                                    </ul>
                                </>
                            )}
                        </div>
                    )
                ))}
                {resumeData.sectionVisibility.socialLinks && (
                    <div
                        style={{ backgroundColor: resumeData.secondaryColor, color: resumeData.sidebarTextColor, borderRadius: resumeData.borderRadius }}
                        className="p-6 shadow-sm"
                    >
                        <h2 className="text-2xl font-semibold mb-4 border-b-2 pb-2" style={{ borderBottomColor: resumeData.accentColor }}>
                            Social Links
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {resumeData.socialLinks.linkedin && <p className="flex items-center gap-2"><Linkedin className="h-4 w-4" /> {resumeData.socialLinks.linkedin}</p>}
                            {resumeData.socialLinks.github && <p className="flex items-center gap-2"><Github className="h-4 w-4" /> {resumeData.socialLinks.github}</p>}
                            {resumeData.socialLinks.twitter && <p className="flex items-center gap-2"><Twitter className="h-4 w-4" /> {resumeData.socialLinks.twitter}</p>}
                            {resumeData.socialLinks.website && <p className="flex items-center gap-2"><Globe className="h-4 w-4" /> {resumeData.socialLinks.website}</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold">Modern Resume Builder</h1>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)} className="flex items-center gap-2" title="Toggle between edit and preview modes">
                                {previewMode ? 'Edit Mode' : 'Preview Mode'}
                            </Button>
                            <Button onClick={generatePDF} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700" title="Download your resume as PDF">
                                <Download className="h-4 w-4" /> Download PDF
                            </Button>
                        </div>
                    </div>
                    {!previewMode && (
                        <div className="flex border-b border-gray-300">
                            <TabButton active={activeTab === 'content'} label="Content" icon={<Layout className="h-4 w-4" />} onClick={() => setActiveTab('content')} />
                            <TabButton active={activeTab === 'style'} label="Style" icon={<Sliders className="h-4 w-4" />} onClick={() => setActiveTab('style')} />
                            <TabButton active={activeTab === 'templates'} label="Templates" icon={<Copy className="h-4 w-4" />} onClick={() => setActiveTab('templates')} />
                            <TabButton active={activeTab === 'settings'} label="Settings" icon={<Settings className="h-4 w-4" />} onClick={() => setActiveTab('settings')} />
                        </div>
                    )}
                </header>
                {previewMode ? (
                    <div className="p-8 bg-white rounded-lg shadow-md">
                        <ResumePreview />
                    </div>
                ) : (
                    <div className="flex gap-6">
                        {sidebarVisible && (
                            <div className="w-1/3 space-y-4">
                                {activeTab === 'content' && (
                                    <Card className="p-6 bg-white text-gray-900 shadow-md">
                                        <Section title="Personal Information">
                                            <div className="space-y-4">
                                                <Input value={resumeData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Your Full Name" className="bg-gray-50" />
                                                <Input value={resumeData.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Your Job Title" className="bg-gray-50" />
                                                <Input value={resumeData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="your.email@example.com" className="bg-gray-50" />
                                                <Input value={resumeData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+91-98765-43210" className="bg-gray-50" />
                                                <Input value={resumeData.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Your Address" className="bg-gray-50" />
                                                <Input type="file" accept="image/*" onChange={handleFileUpload} className="block w-full text-sm text-gray-600" />
                                            </div>
                                        </Section>
                                        <Section title="Summary">
                                            <Textarea
                                                value={resumeData.summary}
                                                onChange={(e) => updateField('summary', e.target.value)}
                                                placeholder="Your professional summary"
                                                rows={4}
                                                className="bg-gray-50"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">Characters: {resumeData.summary.length}/500</p>
                                        </Section>
                                        <Section title="Professional Experience">
                                            <DragDropContext onDragEnd={handleDragEnd}>
                                                <Droppable droppableId="experience" type="experience">
                                                    {(provided) => (
                                                        <div {...provided.droppableProps} ref={provided.innerRef}>
                                                            {resumeData.professionalExperience.map((exp, index) => (
                                                                <Draggable key={exp.id} draggableId={exp.id} index={index}>
                                                                    {(provided) => (
                                                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-gray-50 rounded-lg p-4 mb-3 shadow-sm">
                                                                            <div className="flex justify-between items-center mb-3">
                                                                                <h3 className="font-medium">{exp.company}</h3>
                                                                                <button className="text-red-500 hover:text-red-700" onClick={() => removeItem('professionalExperience', index)} title="Remove experience">
                                                                                    <Trash2 size={16} />
                                                                                </button>
                                                                            </div>
                                                                            <Input value={exp.title} onChange={(e) => updateExperience(index, 'title', e.target.value)} placeholder="Job Title" className="bg-white mb-2" />
                                                                            <Input value={exp.period} onChange={(e) => updateExperience(index, 'period', e.target.value)} placeholder="Period" className="bg-white mb-2" />
                                                                            <div>
                                                                                {exp.responsibilities.map((resp, respIndex) => (
                                                                                    <div key={respIndex} className="flex gap-2 mb-2">
                                                                                        <Input
                                                                                            value={resp}
                                                                                            onChange={(e) => updateResponsibilities(index, respIndex, e.target.value)}
                                                                                            placeholder="Responsibility"
                                                                                            className="flex-1 bg-white"
                                                                                        />
                                                                                        <button className="text-red-500" onClick={() => removeResponsibility(index, respIndex)} title="Remove responsibility">
                                                                                            <Trash2 size={16} />
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                                <button className="text-blue-600 flex items-center gap-1" onClick={() => addResponsibility(index)} title="Add new responsibility">
                                                                                    <Plus size={14} /> Add Responsibility
                                                                                </button>
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
                                            <Button variant="outline" onClick={addExperience} className="mt-3 text-blue-600 border-blue-600" title="Add new experience">
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
                                                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-gray-50 rounded-lg p-4 mb-3 shadow-sm">
                                                                            <div className="flex justify-between items-center mb-3">
                                                                                <h3 className="font-medium">{edu.university}</h3>
                                                                                <button className="text-red-500 hover:text-red-700" onClick={() => removeItem('education', index)} title="Remove education">
                                                                                    <Trash2 size={16} />
                                                                                </button>
                                                                            </div>
                                                                            <Input value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} placeholder="Degree" className="bg-white mb-2" />
                                                                            <Input value={edu.period} onChange={(e) => updateEducation(index, 'period', e.target.value)} placeholder="Period" className="bg-white" />
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            </DragDropContext>
                                            <Button variant="outline" onClick={addEducation} className="mt-3 text-blue-600 border-blue-600" title="Add new education">
                                                <Plus size={16} /> Add Education
                                            </Button>
                                        </Section>
                                        <Section title="Certifications">
                                            <Textarea
                                                value={resumeData.certifications.join('\n')}
                                                onChange={(e) => setResumeData({ ...resumeData, certifications: e.target.value.split('\n') })}
                                                placeholder="Enter certifications (one per line)"
                                                rows={4}
                                                className="bg-gray-50"
                                            />
                                        </Section>
                                        <Section title="Social Links">
                                            <div className="space-y-3">
                                                <Input
                                                    value={resumeData.socialLinks.linkedin}
                                                    onChange={(e) => setResumeData({ ...resumeData, socialLinks: { ...resumeData.socialLinks, linkedin: e.target.value } })}
                                                    placeholder="LinkedIn URL"
                                                    className="bg-gray-50"
                                                />
                                                <Input
                                                    value={resumeData.socialLinks.github}
                                                    onChange={(e) => setResumeData({ ...resumeData, socialLinks: { ...resumeData.socialLinks, github: e.target.value } })}
                                                    placeholder="GitHub URL"
                                                    className="bg-gray-50"
                                                />
                                                <Input
                                                    value={resumeData.socialLinks.twitter}
                                                    onChange={(e) => setResumeData({ ...resumeData, socialLinks: { ...resumeData.socialLinks, twitter: e.target.value } })}
                                                    placeholder="Twitter URL"
                                                    className="bg-gray-50"
                                                />
                                                <Input
                                                    value={resumeData.socialLinks.website}
                                                    onChange={(e) => setResumeData({ ...resumeData, socialLinks: { ...resumeData.socialLinks, website: e.target.value } })}
                                                    placeholder="Personal Website URL"
                                                    className="bg-gray-50"
                                                />
                                            </div>
                                        </Section>
                                    </Card>
                                )}
                                {activeTab === 'style' && (
                                    <Card className="p-6 bg-white text-gray-900 shadow-md space-y-6">
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
                                        <Section title="Typography & Design">
                                            <div className="space-y-4">
                                                <select value={resumeData.fontFamily} onChange={(e) => setResumeData({ ...resumeData, fontFamily: e.target.value })} className="w-full p-2 bg-gray-50 rounded border">
                                                    <option value="Poppins, sans-serif">Poppins</option>
                                                    <option value="Roboto, sans-serif">Roboto</option>
                                                    <option value="Montserrat, sans-serif">Montserrat</option>
                                                    <option value="Lora, serif">Lora</option>
                                                </select>
                                                <select value={resumeData.fontSize} onChange={(e) => setResumeData({ ...resumeData, fontSize: e.target.value })} className="w-full p-2 bg-gray-50 rounded border">
                                                    <option value="small">Small (12px)</option>
                                                    <option value="medium">Medium (14px)</option>
                                                    <option value="large">Large (16px)</option>
                                                </select>
                                                <Input
                                                    type="number"
                                                    value={parseInt(resumeData.borderRadius)}
                                                    onChange={(e) => setResumeData({ ...resumeData, borderRadius: `${e.target.value}px` })}
                                                    placeholder="Border Radius (px)"
                                                    className="bg-gray-50"
                                                />
                                            </div>
                                        </Section>
                                    </Card>
                                )}
                                {activeTab === 'templates' && (
                                    <Card className="p-6 bg-white text-gray-900 shadow-md">
                                        <Section title="Template Presets">
                                            <div className="grid grid-cols-2 gap-4">
                                                {templates.map((template) => (
                                                    <div key={template.id} className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors" onClick={() => applyTemplate(template)}>
                                                        <div className="w-full h-32 rounded-lg mb-2" style={{ backgroundColor: template.color }} />
                                                        <h3 className="font-medium text-center">{template.name}</h3>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button variant="outline" onClick={resetTemplate} className="mt-4 text-gray-600 border-gray-600" title="Reset to default template">
                                                <RotateCcw size={16} /> Reset Template
                                            </Button>
                                        </Section>
                                    </Card>
                                )}
                                {activeTab === 'settings' && (
                                    <Card className="p-6 bg-white text-gray-900 shadow-md">
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
                                            <select
                                                value={resumeData.layout}
                                                onChange={(e) => setResumeData({ ...resumeData, layout: e.target.value })}
                                                className="w-full p-2 bg-gray-50 rounded border"
                                            >
                                                <option value="full-width">Full Width</option>
                                                <option value="sidebar-left">Sidebar Left</option>
                                                <option value="sidebar-right">Sidebar Right</option>
                                            </select>
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
                <ToastContainer autoClose={2000} position="top-center" hideProgressBar={false} theme="light" />
            </div>
        </div>
    );
};

export default Template05;