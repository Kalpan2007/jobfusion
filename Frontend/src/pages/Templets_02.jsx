import React, { useState, useMemo } from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Phone, Mail, MapPin, Download, Plus, Trash2, Globe } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
// Custom Button Component
const Button = ({ children, onClick, className = "", variant = "primary", size = "md", ...props }) => {
  const baseStyle = "rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
  };
  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    icon: "p-2",
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Custom Input Component
const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    {...props}
  />
);

// Custom Textarea Component
const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    {...props}
  />
);

// PDF Styles
const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: "#ffffff", fontSize: 10 },
  header: { textAlign: "center", marginBottom: 15 },
  name: { fontSize: 24, fontWeight: "bold", color: "#003087" },
  title: { fontSize: 14, fontWeight: "medium", color: "#003087", marginTop: 3 },
  contact: { fontSize: 10, color: "#666666", marginTop: 3, fontWeight: "light" },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#002060", borderBottom: "1px solid #002060", paddingBottom: 3, marginBottom: 8 }, // Darker and bolder
  text: { fontSize: 10, color: "#4a4a4a", marginBottom: 3, fontWeight: "light" }, // Thinner and lighter
  item: { marginBottom: 8 },
  itemTitle: { fontWeight: "bold", fontSize: 12, color: "#4a4a4a" }, // Slightly darker but not as bold as section titles
  skillsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  skillItem: { width: "18%", marginBottom: 5 },
});

// PDF Document Component
const TemplatePDF = ({ resumeData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={[styles.header, { backgroundColor: resumeData.headerBgColor }]}>
        <Text style={[styles.name, { color: resumeData.headerTextColor }]}>{resumeData.name}</Text>
        <Text style={[styles.title, { color: resumeData.headerTextColor }]}>{resumeData.title}</Text>
        <Text style={[styles.contact, { color: resumeData.headerTextColor }]}>
          {resumeData.address} | {resumeData.email} | {resumeData.website}
        </Text>
      </View>
      {resumeData.sectionOrder.map((section) => {
        if (resumeData.sectionVisibility[section]) {
          return (
            <View key={section} style={[styles.section, { backgroundColor: resumeData.sectionStyles[section].bgColor }]}>
              <Text style={[styles.sectionTitle, { color: resumeData.primaryColor, borderBottomColor: resumeData.primaryColor }]}>
                {section.toUpperCase().replace(/([A-Z])/g, " $1").trim()}
              </Text>
              {section === "summary" && (
                <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>{resumeData.summary}</Text>
              )}
              {section === "technicalSkills" && (
                <View style={styles.skillsRow}>
                  {resumeData.technicalSkills.map((skill, index) => (
                    <Text key={index} style={[styles.skillItem, { color: resumeData.sectionStyles[section].textColor }]}>
                      • {skill}
                    </Text>
                  ))}
                </View>
              )}
              {section === "professionalExperience" && resumeData.professionalExperience.map((exp, index) => (
                <View key={index} style={styles.item}>
                  <Text style={[styles.itemTitle, { color: resumeData.sectionStyles[section].textColor }]}>{exp.company}</Text>
                  <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>{exp.period}</Text>
                  {exp.responsibilities.map((resp, i) => (
                    <Text key={i} style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>• {resp}</Text>
                  ))}
                </View>
              ))}
              {section === "education" && resumeData.education.map((edu, index) => (
                <View key={index} style={styles.item}>
                  <Text style={[styles.itemTitle, { color: resumeData.sectionStyles[section].textColor }]}>{edu.degree}</Text>
                  <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>{edu.university}</Text>
                  <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>{edu.period}</Text>
                </View>
              ))}
              {section === "additionalInformation" && (
                <>
                  <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>Languages: {resumeData.additionalInformation.languages.join(", ")}</Text>
                  <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>Certifications: {resumeData.additionalInformation.certifications.join(", ")}</Text>
                  <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>Awards/Activities: {resumeData.additionalInformation.awards.join(", ")}</Text>
                </>
              )}
            </View>
          );
        }
        return null;
      })}
    </Page>
  </Document>
);

function Template02() {
  const [resumeData, setResumeData] = useState({
    templateId: "template02",
    name: "DANIEL GALLEGO",
    title: "UX DESIGNER",
    address: "123 Anywhere St., Any City",
    email: "hello@reallygreatsite.com",
    website: "www.reallygreatsite.com",
    summary: "UX Designer with a focus on delivering impactful results, eager to tackle dynamic challenges and apply creativity to craft intuitive user experiences. Demonstrated proficiency in project management, user-centric problem-solving, and seamless collaboration across teams. Skilled in leveraging state-of-the-art tools and methodologies to streamline processes and elevate user satisfaction",
    technicalSkills: [
      "Prototyping Tools",
      "User Research",
      "Information Architecture",
      "Interaction Design",
      "Visual Design",
      "Usability Heuristics",
      "Accessibility",
      "Responsive Design",
      "User Testing Tools",
    ],
    professionalExperience: [
      {
        company: "Instant Chartz App, Morcelle Program",
        period: "Jan 2023 - Present",
        responsibilities: [
          "Led development of an advanced automation system, achieving a 15% increase in operational efficiency.",
          "Streamlined manufacturing processes, reducing production costs by 10%.",
          "Implemented preventive maintenance strategies, resulting in a 20% decrease in equipment downtime.",
        ],
      },
      {
        company: "System UX Engineer, XarrowAl Industries",
        period: "Feb 2021 - Dec 2022",
        responsibilities: [
          "Designed and optimised a robotic control system, realizing a 12% performance improvement.",
          "Coordinated testing and validation, ensuring compliance with industry standards.",
          "Provided technical expertise, contributing to a 15% reduction in system failures.",
        ],
      },
    ],
    education: [
      {
        degree: "UX Industrial Basics and General Application",
        university: "University of Engineering UX Cohort",
        period: "Aug 2016 - Oct 2019",
      },
      {
        degree: "Bachelor of Design in Process Engineering",
        university: "Engineering University",
        period: "May 2014 - May 2016",
      },
    ],
    additionalInformation: {
      languages: ["English", "French", "Mandarin"],
      certifications: ["Professional Design Engineer (PDE) License", "Project Management Tech (PMT)"],
      awards: ["Most Innovative Employer of the Year (2021)", "Overall Best Employee Division Two (2024)", "Onboarding Project Lead (2023)"],
    },
    primaryColor: "#002060", // Darker blue for section titles
    headerBgColor: "#f5f5f5",
    headerTextColor: "#002060",
    mainTextColor: "#4a4a4a", // Lighter gray for normal text
    sectionOrder: ["summary", "technicalSkills", "professionalExperience", "education", "additionalInformation"],
    sectionVisibility: {
      summary: true,
      technicalSkills: true,
      professionalExperience: true,
      education: true,
      additionalInformation: true,
    },
    sectionStyles: {
      summary: { bgColor: "#ffffff", textColor: "#4a4a4a" },
      technicalSkills: { bgColor: "#ffffff", textColor: "#4a4a4a" },
      professionalExperience: { bgColor: "#ffffff", textColor: "#4a4a4a" },
      education: { bgColor: "#ffffff", textColor: "#4a4a4a" },
      additionalInformation: { bgColor: "#ffffff", textColor: "#4a4a4a" },
    },
  });

  const addItem = (section, defaultItem) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: section === "additionalInformation" 
        ? { ...prev[section], [defaultItem.field]: [...prev[section][defaultItem.field], ""] }
        : [...prev[section], defaultItem],
    }));
  };

  const removeItem = (section, index, field) => {
    setResumeData((prev) => {
      if (section === "additionalInformation") {
        if (prev[section][field].length > 1) {
          return {
            ...prev,
            [section]: { ...prev[section], [field]: prev[section][field].filter((_, i) => i !== index) },
          };
        }
      } else if (prev[section].length > 1) {
        return { ...prev, [section]: prev[section].filter((_, i) => i !== index) };
      }
      return prev;
    });
  };

  const handleDownloadPDF = async () => {
    const blob = await pdf(<TemplatePDF resumeData={resumeData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template02.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const newOrder = Array.from(resumeData.sectionOrder);
    const [reorderedItem] = newOrder.splice(source.index, 1);
    newOrder.splice(destination.index, 0, reorderedItem);
    setResumeData((prev) => ({ ...prev, sectionOrder: newOrder }));
  };

  const visibleSections = useMemo(() => 
    resumeData.sectionOrder.filter((section) => resumeData.sectionVisibility[section]),
    [resumeData.sectionOrder, resumeData.sectionVisibility]
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Controls Section */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Primary Color:</label>
              <Input
                type="color"
                value={resumeData.primaryColor}
                onChange={(e) => setResumeData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Header BG:</label>
              <Input
                type="color"
                value={resumeData.headerBgColor}
                onChange={(e) => setResumeData((prev) => ({ ...prev, headerBgColor: e.target.value }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Header Text:</label>
              <Input
                type="color"
                value={resumeData.headerTextColor}
                onChange={(e) => setResumeData((prev) => ({ ...prev, headerTextColor: e.target.value }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Show Summary:</label>
              <input
                type="checkbox"
                checked={resumeData.sectionVisibility.summary}
                onChange={(e) => setResumeData((prev) => ({ ...prev, sectionVisibility: { ...prev.sectionVisibility, summary: e.target.checked } }))}
                className="h-4 w-4"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Show Skills:</label>
              <input
                type="checkbox"
                checked={resumeData.sectionVisibility.technicalSkills}
                onChange={(e) => setResumeData((prev) => ({ ...prev, sectionVisibility: { ...prev.sectionVisibility, technicalSkills: e.target.checked } }))}
                className="h-4 w-4"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Show Experience:</label>
              <input
                type="checkbox"
                checked={resumeData.sectionVisibility.professionalExperience}
                onChange={(e) => setResumeData((prev) => ({ ...prev, sectionVisibility: { ...prev.sectionVisibility, professionalExperience: e.target.checked } }))}
                className="h-4 w-4"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Show Education:</label>
              <input
                type="checkbox"
                checked={resumeData.sectionVisibility.education}
                onChange={(e) => setResumeData((prev) => ({ ...prev, sectionVisibility: { ...prev.sectionVisibility, education: e.target.checked } }))}
                className="h-4 w-4"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Show Additional:</label>
              <input
                type="checkbox"
                checked={resumeData.sectionVisibility.additionalInformation}
                onChange={(e) => setResumeData((prev) => ({ ...prev, sectionVisibility: { ...prev.sectionVisibility, additionalInformation: e.target.checked } }))}
                className="h-4 w-4"
              />
            </div>
          </div>
          <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>

        {/* Resume Content */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div style={{ backgroundColor: resumeData.headerBgColor, padding: "15px", textAlign: "center", marginBottom: "15px" }}>
              <Input
                value={resumeData.name}
                onChange={(e) => setResumeData((prev) => ({ ...prev, name: e.target.value }))}
                className="text-2xl font-bold mb-1 bg-transparent border-none w-full text-center"
                style={{ color: resumeData.headerTextColor }}
              />
              <Input
                value={resumeData.title}
                onChange={(e) => setResumeData((prev) => ({ ...prev, title: e.target.value }))}
                className="text-lg font-medium bg-transparent border-none w-full text-center"
                style={{ color: resumeData.headerTextColor }}
              />
              <div className="flex justify-center gap-3 mt-1 text-sm font-light">
                <Input
                  value={resumeData.address}
                  onChange={(e) => setResumeData((prev) => ({ ...prev, address: e.target.value }))}
                  className="bg-transparent border-none text-center"
                  style={{ color: resumeData.headerTextColor }}
                />
                <Input
                  value={resumeData.email}
                  onChange={(e) => setResumeData((prev) => ({ ...prev, email: e.target.value }))}
                  className="bg-transparent border-none text-center"
                  style={{ color: resumeData.headerTextColor }}
                />
                <Input
                  value={resumeData.website}
                  onChange={(e) => setResumeData((prev) => ({ ...prev, website: e.target.value }))}
                  className="bg-transparent border-none text-center"
                  style={{ color: resumeData.headerTextColor }}
                />
              </div>
            </div>

            <Droppable droppableId="sections" direction="vertical">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {visibleSections.map((section, index) => (
                    <Draggable key={section} draggableId={section} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-4"
                          style={{ ...provided.draggableProps.style, backgroundColor: resumeData.sectionStyles[section].bgColor }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h2
                              className="text-lg font-bold"
                              style={{ color: resumeData.primaryColor, borderBottom: `1px solid ${resumeData.primaryColor}` }}
                            >
                              {section.toUpperCase().replace(/([A-Z])/g, " $1").trim()}
                            </h2>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => addItem(section, 
                                section === "technicalSkills" ? "" :
                                section === "professionalExperience" ? { company: "", period: "", responsibilities: [""] } :
                                section === "education" ? { degree: "", university: "", period: "" } : null
                              )}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {section === "summary" && (
                            <Textarea
                              value={resumeData.summary}
                              onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))}
                              className="bg-transparent border-none w-full text-sm font-light"
                              style={{ color: resumeData.sectionStyles[section].textColor }}
                              rows={3}
                            />
                          )}
                          {section === "technicalSkills" && (
                            <div className="flex flex-wrap gap-2">
                              {resumeData.technicalSkills.map((skill, idx) => (
                                <div key={idx} className="flex items-center gap-1 w-[18%] mb-2">
                                  <Input
                                    value={skill}
                                    onChange={(e) => {
                                      const newSkills = [...resumeData.technicalSkills];
                                      newSkills[idx] = e.target.value;
                                      setResumeData((prev) => ({ ...prev, technicalSkills: newSkills }));
                                    }}
                                    className="bg-transparent border-none text-sm font-light flex-1"
                                    style={{ color: resumeData.sectionStyles[section].textColor }}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem("technicalSkills", idx)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          {section === "professionalExperience" && resumeData.professionalExperience.map((exp, idx) => (
                            <div key={idx} className="mb-3 relative">
                              {resumeData.professionalExperience.length > 1 && (
                                <Button variant="ghost" size="icon" onClick={() => removeItem("professionalExperience", idx)} className="absolute right-0 top-0">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                              <Input
                                value={exp.company}
                                onChange={(e) => {
                                  const newExp = [...resumeData.professionalExperience];
                                  newExp[idx] = { ...exp, company: e.target.value };
                                  setResumeData((prev) => ({ ...prev, professionalExperience: newExp }));
                                }}
                                className="font-bold text-base mb-1 bg-transparent border-none"
                                style={{ color: resumeData.sectionStyles[section].textColor }}
                              />
                              <Input
                                value={exp.period}
                                onChange={(e) => {
                                  const newExp = [...resumeData.professionalExperience];
                                  newExp[idx] = { ...exp, period: e.target.value };
                                  setResumeData((prev) => ({ ...prev, professionalExperience: newExp }));
                                }}
                                className="mb-1 bg-transparent border-none text-sm font-light"
                                style={{ color: resumeData.sectionStyles[section].textColor }}
                              />
                              {exp.responsibilities.map((resp, rIdx) => (
                                <div key={rIdx} className="flex items-center gap-1 mb-1">
                                  <Input
                                    value={resp}
                                    onChange={(e) => {
                                      const newExp = [...resumeData.professionalExperience];
                                      newExp[idx].responsibilities[rIdx] = e.target.value;
                                      setResumeData((prev) => ({ ...prev, professionalExperience: newExp }));
                                    }}
                                    className="bg-transparent border-none text-sm font-light flex-1"
                                    style={{ color: resumeData.sectionStyles[section].textColor }}
                                  />
                                  {exp.responsibilities.length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const newExp = [...resumeData.professionalExperience];
                                        newExp[idx].responsibilities = newExp[idx].responsibilities.filter((_, i) => i !== rIdx);
                                        setResumeData((prev) => ({ ...prev, professionalExperience: newExp }));
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newExp = [...resumeData.professionalExperience];
                                  newExp[idx].responsibilities.push("");
                                  setResumeData((prev) => ({ ...prev, professionalExperience: newExp }));
                                }}
                              >
                                Add Responsibility
                              </Button>
                            </div>
                          ))}
                          {section === "education" && resumeData.education.map((edu, idx) => (
                            <div key={idx} className="mb-3 relative">
                              {resumeData.education.length > 1 && (
                                <Button variant="ghost" size="icon" onClick={() => removeItem("education", idx)} className="absolute right-0 top-0">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                              <Input
                                value={edu.degree}
                                onChange={(e) => {
                                  const newEdu = [...resumeData.education];
                                  newEdu[idx] = { ...edu, degree: e.target.value };
                                  setResumeData((prev) => ({ ...prev, education: newEdu }));
                                }}
                                className="font-bold text-base mb-1 bg-transparent border-none"
                                style={{ color: resumeData.sectionStyles[section].textColor }}
                              />
                              <Input
                                value={edu.university}
                                onChange={(e) => {
                                  const newEdu = [...resumeData.education];
                                  newEdu[idx] = { ...edu, university: e.target.value };
                                  setResumeData((prev) => ({ ...prev, education: newEdu }));
                                }}
                                className="mb-1 bg-transparent border-none text-sm font-light"
                                style={{ color: resumeData.sectionStyles[section].textColor }}
                              />
                              <Input
                                value={edu.period}
                                onChange={(e) => {
                                  const newEdu = [...resumeData.education];
                                  newEdu[idx] = { ...edu, period: e.target.value };
                                  setResumeData((prev) => ({ ...prev, education: newEdu }));
                                }}
                                className="bg-transparent border-none text-sm font-light"
                                style={{ color: resumeData.sectionStyles[section].textColor }}
                              />
                            </div>
                          ))}
                          {section === "additionalInformation" && (
                            <>
                              <div className="mb-2">
                                <div className="flex justify-between items-center">
                                  <h3 className="font-bold text-sm" style={{ color: resumeData.sectionStyles[section].textColor }}>Languages</h3>
                                  <Button variant="ghost" size="icon" onClick={() => addItem("additionalInformation", { field: "languages" })}>
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                {resumeData.additionalInformation.languages.map((lang, idx) => (
                                  <div key={idx} className="flex items-center gap-1 mb-1">
                                    <Input
                                      value={lang}
                                      onChange={(e) => {
                                        const newInfo = { ...resumeData.additionalInformation };
                                        newInfo.languages[idx] = e.target.value;
                                        setResumeData((prev) => ({ ...prev, additionalInformation: newInfo }));
                                      }}
                                      className="bg-transparent border-none text-sm font-light flex-1"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                    />
                                    {resumeData.additionalInformation.languages.length > 1 && (
                                      <Button variant="ghost" size="icon" onClick={() => removeItem("additionalInformation", idx, "languages")}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className="mb-2">
                                <div className="flex justify-between items-center">
                                  <h3 className="font-bold text-sm" style={{ color: resumeData.sectionStyles[section].textColor }}>Certifications</h3>
                                  <Button variant="ghost" size="icon" onClick={() => addItem("additionalInformation", { field: "certifications" })}>
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                {resumeData.additionalInformation.certifications.map((cert, idx) => (
                                  <div key={idx} className="flex items-center gap-1 mb-1">
                                    <Input
                                      value={cert}
                                      onChange={(e) => {
                                        const newInfo = { ...resumeData.additionalInformation };
                                        newInfo.certifications[idx] = e.target.value;
                                        setResumeData((prev) => ({ ...prev, additionalInformation: newInfo }));
                                      }}
                                      className="bg-transparent border-none text-sm font-light flex-1"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                    />
                                    {resumeData.additionalInformation.certifications.length > 1 && (
                                      <Button variant="ghost" size="icon" onClick={() => removeItem("additionalInformation", idx, "certifications")}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div>
                                <div className="flex justify-between items-center">
                                  <h3 className="font-bold text-sm" style={{ color: resumeData.sectionStyles[section].textColor }}>Awards/Activities</h3>
                                  <Button variant="ghost" size="icon" onClick={() => addItem("additionalInformation", { field: "awards" })}>
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                {resumeData.additionalInformation.awards.map((award, idx) => (
                                  <div key={idx} className="flex items-center gap-1 mb-1">
                                    <Input
                                      value={award}
                                      onChange={(e) => {
                                        const newInfo = { ...resumeData.additionalInformation };
                                        newInfo.awards[idx] = e.target.value;
                                        setResumeData((prev) => ({ ...prev, additionalInformation: newInfo }));
                                      }}
                                      className="bg-transparent border-none text-sm font-light flex-1"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                    />
                                    {resumeData.additionalInformation.awards.length > 1 && (
                                      <Button variant="ghost" size="icon" onClick={() => removeItem("additionalInformation", idx, "awards")}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

export default Template02;