import React, { useState, useRef, useEffect } from 'react';
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
    ChevronDown,
    ChevronUp,
    Undo,
    Redo,
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Reusable Components (assumed paths)
import Button from '../components/Resume-Template/Button';
import Input from '../components/Resume-Template/Input';
import Textarea from '../components/Resume-Template/Textarea';
import ColorPicker from '../components/Resume-Template/ColorPicker';
import Toggle from '../components/Resume-Template/Toggle';
import Card from '../components/Resume-Template/card';
import TabButton from '../components/Resume-Template/TabButton';
import Section from '../components/Resume-Template/Section';
import Notification from '../components/Resume-Template/Notification';
import SaveResumeButton from '../components/SaveResumeButton';

const Template06 = () => {
    const resumeRef = useRef(null);
    const [activeTab, setActiveTab] = useState('content');
    const [notification, setNotification] = useState({ show: false, message: '' });
    const [sidebarWidth, setSidebarWidth] = useState(350); // Resizable sidebar width
    const [previewMode, setPreviewMode] = useState(false);
    const [previewScale, setPreviewScale] = useState(1);
    const [collapsedSections, setCollapsedSections] = useState({});
    const [history, setHistory] = useState([]); // Undo/Redo history
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Enhanced Resume Data with modern theme
    const [resumeData, setResumeData] = useState({
        templateId: "template06",
        photo: '',
        name: 'Aarav Patel',
        title: 'Frontend Developer',
        address: 'Bengaluru, Karnataka, India',
        phone: '+91-87654-32109',
        email: 'aarav.patel@example.com',
        summary: 'Passionate Frontend Developer with 5+ years of experience...',
        technicalSkills: ['React', 'JavaScript', 'CSS', 'TypeScript', 'Tailwind CSS'],
        professionalExperience: [
            { id: '1', company: 'WebForge Solutions', period: 'Jan 2020 - Present', title: 'Senior Frontend Developer', responsibilities: ['Developed 15+ responsive web apps...'] },
            { id: '2', company: 'NextGen Tech', period: 'Jun 2018 - Dec 2019', title: 'Frontend Engineer', responsibilities: ['Optimized UI performance...'] },
        ],
        education: [
            { id: '1', degree: 'B.Tech in Computer Science', university: 'IIT Bombay', period: '2014 - 2018' },
        ],
        certifications: ['React Professional, Udemy, 2021', 'JavaScript Algorithms, freeCodeCamp, 2020'],
        socialLinks: { linkedin: 'linkedin.com/in/aaravpatel', github: 'github.com/aaravp', twitter: '', website: '' },
        primaryColor: 'linear-gradient(135deg, #4CAF50, #81C784)', // Gradient Green
        secondaryColor: '#F1F8E9',
        accentColor: '#A5D6A7',
        headerTextColor: '#FFFFFF',
        mainTextColor: '#1B5E20',
        backgroundColor: '#FAFAFA',
        fontSize: 'medium',
        fontFamily: 'Poppins, sans-serif',
        sectionOrder: ['summary', 'technicalSkills', 'professionalExperience', 'education', 'certifications'],
        sectionVisibility: { summary: true, technicalSkills: true, professionalExperience: true, education: true, certifications: true, socialLinks: true },
        sectionStyles: {
            summary: { bgColor: '#F1F8E9', textColor: '#1B5E20' },
            technicalSkills: { bgColor: '#4CAF50', textColor: '#FFFFFF' },
            professionalExperience: { bgColor: '#FFFFFF', textColor: '#1B5E20' },
            education: { bgColor: '#FFFFFF', textColor: '#1B5E20' },
            certifications: { bgColor: '#FFFFFF', textColor: '#1B5E20' },
        },
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        sectionSpacing: '16px',
    });

    const [templates] = useState([
        { id: 'vibrant-green', name: 'Vibrant Green', color: 'linear-gradient(135deg, #4CAF50, #81C784)', accent: '#A5D6A7' },
        { id: 'cool-blue', name: 'Cool Blue', color: 'linear-gradient(135deg, #0288D1, #4FC3F7)', accent: '#81D4FA' },
        { id: 'sunset-orange', name: 'Sunset Orange', color: 'linear-gradient(135deg, #FF5722, #FF8A65)', accent: '#FFAB91' },
        { id: 'midnight-purple', name: 'Midnight Purple', color: 'linear-gradient(135deg, #6A1B9A, #AB47BC)', accent: '#CE93D8' },
        { id: 'earthy-brown', name: 'Earthy Brown', color: 'linear-gradient(135deg, #6D4C41, #8D6E63)', accent: '#BCAAA4' },
    ]);

    // Sidebar Resizing Logic
    const handleResize = (e) => {
        const newWidth = e.clientX;
        if (newWidth > 250 && newWidth < 500) setSidebarWidth(newWidth);
    };

    const startResizing = () => {
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResizing);
    };

    const stopResizing = () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResizing);
    };

    // History Management for Undo/Redo
    const saveToHistory = (newData) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newData);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setResumeData(history[historyIndex - 1]);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setResumeData(history[historyIndex + 1]);
        }
    };

    const showNotification = (message) => {
        setNotification({ show: true, message });
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const newData = { ...resumeData, photo: e.target.result };
            setResumeData(newData);
            saveToHistory(newData);
            showNotification('Photo uploaded!');
        };
        reader.readAsDataURL(file);
    };

    const handleDragEnd = (result) => {
        const { source, destination, type } = result;
        if (!destination) return;

        let newData = { ...resumeData };

        if (type === 'section') {
            const newSectionOrder = Array.from(resumeData.sectionOrder);
            const [removed] = newSectionOrder.splice(source.index, 1);
            newSectionOrder.splice(destination.index, 0, removed);
            newData.sectionOrder = newSectionOrder;
        } else if (type === 'experience') {
            const items = Array.from(resumeData.professionalExperience);
            const [reorderedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reorderedItem);
            newData.professionalExperience = items;
        } else if (type === 'education') {
            const items = Array.from(resumeData.education);
            const [reorderedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reorderedItem);
            newData.education = items;
        }

        setResumeData(newData);
        saveToHistory(newData);
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

    const updateField = (field, value) => {
        const newData = { ...resumeData, [field]: value };
        setResumeData(newData);
        saveToHistory(newData);
    };

    const applyTemplate = (template) => {
        const newData = {
            ...resumeData,
            primaryColor: template.color,
            secondaryColor: '#F1F8E9',
            accentColor: template.accent,
        };
        setResumeData(newData);
        saveToHistory(newData);
        showNotification(`${template.name} template applied!`);
    };

    const toggleSection = (section) => {
        const newData = {
            ...resumeData,
            sectionVisibility: { ...resumeData.sectionVisibility, [section]: !resumeData.sectionVisibility[section] },
        };
        setResumeData(newData);
        saveToHistory(newData);
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
            className="shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
            style={{
                maxWidth: '850px',
                fontFamily: resumeData.fontFamily,
                fontSize: getFontSize(),
                backgroundColor: resumeData.backgroundColor,
                borderRadius: resumeData.borderRadius,
                boxShadow: resumeData.boxShadow,
                transform: `scale(${previewScale})`,
                transformOrigin: 'top center',
            }}
        >
            <div
                style={{ background: resumeData.primaryColor, color: resumeData.headerTextColor }}
                className="p-8 flex items-center gap-6"
            >
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/70 shadow-md">
                    {resumeData.photo ? (
                        <img src={resumeData.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">No Photo</div>
                    )}
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">{resumeData.name || 'Your Name'}</h1>
                    <p className="text-xl mt-1 opacity-90">{resumeData.title || 'Your Title'}</p>
                    <div className="flex gap-6 mt-3 text-sm">
                        <p className="flex items-center gap-1"><Phone className="h-4 w-4" /> {resumeData.phone || 'N/A'}</p>
                        <p className="flex items-center gap-1"><Mail className="h-4 w-4" /> {resumeData.email || 'N/A'}</p>
                        <p className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {resumeData.address || 'N/A'}</p>
                    </div>
                </div>
            </div>
            <div className="p-8 space-y-6" style={{ color: resumeData.mainTextColor }}>
                {resumeData.sectionOrder.map((section) => (
                    resumeData.sectionVisibility[section] && (
                        <div
                            key={section}
                            style={{
                                backgroundColor: resumeData.sectionStyles[section].bgColor,
                                color: resumeData.sectionStyles[section].textColor,
                                borderRadius: resumeData.borderRadius,
                                padding: '1.5rem',
                                marginBottom: resumeData.sectionSpacing,
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                            }}
                            className="transition-all duration-300"
                        >
                            {section === 'summary' && (
                                <>
                                    <h2 className="text-2xl font-semibold mb-4">Summary</h2>
                                    <p className="leading-relaxed">{resumeData.summary || 'Your summary here'}</p>
                                </>
                            )}
                            {section === 'technicalSkills' && (
                                <>
                                    <h2 className="text-2xl font-semibold mb-4">Skills</h2>
                                    <div className="flex flex-wrap gap-3">
                                        {resumeData.technicalSkills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 rounded-full text-sm font-medium transition-transform hover:scale-105 shadow-sm"
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
                                    <h2 className="text-2xl font-semibold mb-4">Professional Experience</h2>
                                    {resumeData.professionalExperience.map((exp) => (
                                        <div key={exp.id} className="mb-5">
                                            <h3 className="font-semibold text-lg">{exp.company}</h3>
                                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                <span>{exp.title}</span>
                                                <span>{exp.period}</span>
                                            </div>
                                            <ul className="list-disc pl-5 space-y-2">
                                                {exp.responsibilities.map((resp, respIndex) => <li key={respIndex}>{resp}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </>
                            )}
                            {section === 'education' && (
                                <>
                                    <h2 className="text-2xl font-semibold mb-4">Education</h2>
                                    {resumeData.education.map((edu) => (
                                        <div key={edu.id} className="mb-4">
                                            <h3 className="font-semibold text-lg">{edu.university}</h3>
                                            <p>{edu.degree}</p>
                                            <p className="text-sm text-gray-600">{edu.period}</p>
                                        </div>
                                    ))}
                                </>
                            )}
                            {section === 'certifications' && (
                                <>
                                    <h2 className="text-2xl font-semibold mb-4">Certifications</h2>
                                    <ul className="list-disc pl-5 space-y-2">
                                        {resumeData.certifications.map((cert, index) => <li key={index}>{cert}</li>)}
                                    </ul>
                                </>
                            )}
                        </div>
                    )
                ))}
                {resumeData.sectionVisibility.socialLinks && (
                    <div
                        style={{ backgroundColor: resumeData.secondaryColor, color: resumeData.mainTextColor, borderRadius: resumeData.borderRadius, padding: '1.5rem' }}
                        className="transition-all duration-300"
                    >
                        <h2 className="text-2xl font-semibold mb-4">Social Links</h2>
                        <div className="flex flex-wrap gap-6">
                            {resumeData.socialLinks.linkedin && (
                                <a href={resumeData.socialLinks.linkedin} target="_blank" className="flex items-center gap-2 hover:text-green-600 transition-colors">
                                    <Linkedin className="h-5 w-5" /> {resumeData.socialLinks.linkedin}
                                </a>
                            )}
                            {resumeData.socialLinks.github && (
                                <a href={resumeData.socialLinks.github} target="_blank" className="flex items-center gap-2 hover:text-green-600 transition-colors">
                                    <Github className="h-5 w-5" /> {resumeData.socialLinks.github}
                                </a>
                            )}
                            {resumeData.socialLinks.twitter && (
                                <a href={resumeData.socialLinks.twitter} target="_blank" className="flex items-center gap-2 hover:text-green-600 transition-colors">
                                    <Twitter className="h-5 w-5" /> {resumeData.socialLinks.twitter}
                                </a>
                            )}
                            {resumeData.socialLinks.website && (
                                <a href={resumeData.socialLinks.website} target="_blank" className="flex items-center gap-2 hover:text-green-600 transition-colors">
                                    <Globe className="h-5 w-5" /> {resumeData.socialLinks.website}
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 py-10 px-6 relative overflow-hidden">
            {/* Floating Toolbar */}
            <div className="fixed top-4 right-4 z-50 flex gap-2 bg-white p-2 rounded-full shadow-lg">
                <Button variant="ghost" onClick={undo} disabled={historyIndex <= 0} className="p-2">
                    <Undo size={20} />
                </Button>
                <Button variant="ghost" onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2">
                    <Redo size={20} />
                </Button>
                <Button onClick={generatePDF} className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full">
                    <Download size={20} />
                </Button>
                <SaveResumeButton resumeData={resumeData} />
            </div>

            <div className="max-w-7xl mx-auto flex gap-6">
                {/* Resizable Sidebar */}
                {!previewMode && (
                    <div
                        style={{ width: `${sidebarWidth}px` }}
                        className="relative bg-white rounded-xl shadow-lg p-6 transition-all duration-300"
                    >
                        <div
                            className="absolute right-0 top-0 w-2 h-full bg-gray-300 cursor-ew-resize"
                            onMouseDown={startResizing}
                        ></div>

                        <header className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">Resume Builder</h1>
                            <div className="flex border-b border-gray-200 mt-4">
                                <TabButton
                                    active={activeTab === 'content'}
                                    label="Content"
                                    icon={<Layout className="h-4 w-4" />}
                                    onClick={() => setActiveTab('content')}
                                />
                                <TabButton
                                    active={activeTab === 'style'}
                                    label="Style"
                                    icon={<Sliders className="h-4 w-4" />}
                                    onClick={() => setActiveTab('style')}
                                />
                                <TabButton
                                    active={activeTab === 'templates'}
                                    label="Templates"
                                    icon={<Copy className="h-4 w-4" />}
                                    onClick={() => setActiveTab('templates')}
                                />
                            </div>
                        </header>

                        {activeTab === 'content' && (
                            <div className="space-y-6 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                                <Section
                                    title="Personal Info"
                                    collapsible
                                    onToggle={() =>
                                        setCollapsedSections({
                                            ...collapsedSections,
                                            personal: !collapsedSections.personal,
                                        })
                                    }
                                >
                                    {!collapsedSections.personal && (
                                        <div className="space-y-4">
                                            <Input
                                                value={resumeData.name}
                                                onChange={(e) => updateField('name', e.target.value)}
                                                placeholder="Your Full Name"
                                            />
                                            <Input
                                                value={resumeData.title}
                                                onChange={(e) => updateField('title', e.target.value)}
                                                placeholder="Your Job Title"
                                            />
                                            <Input
                                                value={resumeData.email}
                                                onChange={(e) => updateField('email', e.target.value)}
                                                placeholder="your.email@example.com"
                                            />
                                            <Input
                                                value={resumeData.phone}
                                                onChange={(e) => updateField('phone', e.target.value)}
                                                placeholder="+91-87654-32109"
                                            />
                                            <Input
                                                value={resumeData.address}
                                                onChange={(e) => updateField('address', e.target.value)}
                                                placeholder="Your Address"
                                            />
                                            <Input type="file" accept="image/*" onChange={handleFileUpload} />
                                        </div>
                                    )}
                                </Section>

                                <Section
                                    title="Summary"
                                    collapsible
                                    onToggle={() =>
                                        setCollapsedSections({
                                            ...collapsedSections,
                                            summary: !collapsedSections.summary,
                                        })
                                    }
                                >
                                    {!collapsedSections.summary && (
                                        <Textarea
                                            value={resumeData.summary}
                                            onChange={(e) => updateField('summary', e.target.value)}
                                            placeholder="Your professional summary"
                                            rows={3}
                                        />
                                    )}
                                </Section>

                                {/* Add other sections similarly with collapsible logic */}
                            </div>
                        )}

                        {activeTab === 'style' && (
                            <div className="space-y-6">
                                <Section title="Quick Styles">
                                    <div className="grid grid-cols-2 gap-4">
                                        <ColorPicker
                                            label="Primary"
                                            value={resumeData.primaryColor.split(',')[0].replace('linear-gradient(135deg, ', '')}
                                            onChange={(e) =>
                                                updateField(
                                                    'primaryColor',
                                                    `linear-gradient(135deg, ${e.target.value}, ${resumeData.accentColor})`
                                                )
                                            }
                                        />
                                        <ColorPicker
                                            label="Accent"
                                            value={resumeData.accentColor}
                                            onChange={(e) => updateField('accentColor', e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            value={parseInt(resumeData.sectionSpacing)}
                                            onChange={(e) => updateField('sectionSpacing', `${e.target.value}px`)}
                                            placeholder="Section Spacing"
                                        />
                                        <Input
                                            type="text"
                                            value={resumeData.boxShadow}
                                            onChange={(e) => updateField('boxShadow', e.target.value)}
                                            placeholder="Box Shadow"
                                        />
                                    </div>
                                </Section>
                            </div>
                        )}

                        {activeTab === 'templates' && (
                            <Section title="Templates">
                                <div className="grid grid-cols-2 gap-4">
                                    {templates.map((template) => (
                                        <div
                                            key={template.id}
                                            className="border rounded-lg p-4 cursor-pointer hover:border-green-500"
                                            onClick={() => applyTemplate(template)}
                                        >
                                            <div
                                                className="w-full h-20 rounded-lg mb-2"
                                                style={{ background: template.color }}
                                            ></div>
                                            <h3 className="text-center font-medium">{template.name}</h3>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}
                    </div>
                )}

                {/* Centered Preview */}
                <div className="flex-1 flex justify-center items-start">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex justify-between mb-4">
                            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                                {previewMode ? 'Edit Mode' : 'Preview Mode'}
                            </Button>
                            {previewMode && (
                                <input
                                    type="range"
                                    min="0.5"
                                    max="1.5"
                                    step="0.1"
                                    value={previewScale}
                                    onChange={(e) => setPreviewScale(e.target.value)}
                                    className="w-32"
                                />
                            )}
                        </div>
                        <ResumePreview />
                    </div>
                </div>
            </div>

            <Notification show={notification.show} message={notification.message} />
            <ToastContainer />
        </div>
    );
};

export default Template06;