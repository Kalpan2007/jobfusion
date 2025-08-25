import React, { useState } from "react";
import { Document, Page, View, Text, StyleSheet, pdf } from "@react-pdf/renderer";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Phone, Mail, MapPin, Globe, Download, Plus, Trash2 } from "lucide-react";
import ResumeAnalyzer from "../components/ResumeAnalyzer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";

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
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    {...props}
  />
);

// Custom Textarea Component
const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    {...props}
  />
);

// PDF Styles - Optimized to match React component and fit on one A4 page
const styles = StyleSheet.create({
  page: {
    padding: 20, // Reduced padding for more content space
    backgroundColor: "#ffffff",
    fontSize: 10,
    fontFamily: "Helvetica",
    flexDirection: "column",
  },
  header: {
    backgroundColor: "#E0F6F6",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: "2px solid #D3E4E5",
  },
  headerLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#D3E4E5",
  },
  headerContent: {
    flex: 1,
    textAlign: "center",
  },
  name: {
    fontSize: 20, // Matches React's text-3xl scaled for PDF
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 2,
  },
  title: {
    fontSize: 12, // Matches React's text-lg scaled for PDF
    color: "#333333",
    marginBottom: 2,
  },
  twoColumn: {
    flexDirection: "row",
    flexGrow: 1,
    height: "auto", // Ensures content fits dynamically
  },
  sidebar: {
    flex: "0 0 50%",
    padding: 15, // Matches React's p-6 scaled for PDF
    backgroundColor: "#ffffff",
  },
  content: {
    flex: "0 0 50%",
    padding: 15, // Matches React's p-6 scaled for PDF
    backgroundColor: "#ffffff",
  },
  section: {
    marginBottom: 10, // Reduced to fit on one page
    padding: 8, // Matches React's p-4 scaled for PDF
    borderWidth: 1,
    borderColor: "#D3E4E5",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 12, // Matches React's text-lg scaled for PDF
    fontWeight: "bold",
    color: "#333333",
    borderBottom: "1px solid #D3E4E5",
    paddingBottom: 2,
    marginBottom: 4,
  },
  text: {
    fontSize: 9, // Matches React's default text size scaled for PDF
    color: "#4a4a4a",
    marginBottom: 2,
  },
  item: {
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 10, // Matches React's text-md scaled for PDF
    fontWeight: "bold",
    color: "#4a4a4a",
  },
  listItem: {
    marginLeft: 10,
    marginBottom: 2,
  },
});

// PDF Document Component - Matches React component exactly
const TemplatePDF = ({ resumeData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: resumeData.primaryColor }]}>
        <View style={styles.headerLine} />
        <View style={styles.headerContent}>
          <Text style={[styles.name, { color: resumeData.headerTextColor }]}>
            {resumeData.name || "Your Name"}
          </Text>
          <Text style={[styles.title, { color: resumeData.headerTextColor }]}>
            {resumeData.title || "Your Title"}
          </Text>
        </View>
        <View style={styles.headerLine} />
      </View>

      {/* Two-Column Layout */}
      <View style={styles.twoColumn}>
        {/* Sidebar (Left Column) */}
        <View style={[styles.sidebar, { backgroundColor: resumeData.secondaryColor, color: resumeData.sidebarTextColor }]}>
          {resumeData.sectionOrder
            .filter((section) => ["contact", "education", "skills"].includes(section) && resumeData.sectionVisibility[section])
            .map((section) => (
              <View
                key={section}
                style={[styles.section, { backgroundColor: resumeData.sectionStyles[section].bgColor }]}
              >
                <Text style={[styles.sectionTitle, { color: resumeData.headerTextColor }]}>
                  {section === "contact" && "Contact"}
                  {section === "education" && "Education"}
                  {section === "skills" && "Skills"}
                </Text>
                {section === "contact" && (
                  <>
                    <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>
                      {resumeData.phone || "Phone"}
                    </Text>
                    <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>
                      {resumeData.email || "Email"}
                    </Text>
                    <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>
                      {resumeData.address || "Address"}
                    </Text>
                    <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>
                      {resumeData.website || "Website"}
                    </Text>
                  </>
                )}
                {section === "education" &&
                  resumeData.education?.map((edu, index) => (
                    <View key={index} style={styles.item}>
                      <Text style={[styles.itemTitle, { color: resumeData.sectionStyles[section].textColor }]}>
                        {edu.university || "University"}
                      </Text>
                      <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>
                        {edu.degree || "Degree"}
                      </Text>
                      <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>
                        {edu.period || "Period"} {edu.gpa ? `| GPA: ${edu.gpa}` : ""}
                      </Text>
                    </View>
                  ))}
                {section === "skills" &&
                  resumeData.skills?.map((skill, index) => (
                    <Text
                      key={index}
                      style={[styles.listItem, { color: resumeData.sectionStyles[section].textColor }]}
                    >
                      • {skill || "Skill"}
                    </Text>
                  ))}
              </View>
            ))}
        </View>

        {/* Content (Right Column) */}
        <View style={[styles.content, { color: resumeData.mainTextColor }]}>
          {resumeData.sectionOrder
            .filter((section) => ["profile", "workExperience"].includes(section) && resumeData.sectionVisibility[section])
            .map((section) => (
              <View
                key={section}
                style={[styles.section, { backgroundColor: resumeData.sectionStyles[section].bgColor }]}
              >
                <Text style={[styles.sectionTitle, { color: resumeData.headerTextColor }]}>
                  {section === "profile" && "Profile Summary"}
                  {section === "workExperience" && "Work Experience"}
                </Text>
                {section === "profile" && (
                  <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>
                    {resumeData.profile || "Profile Summary"}
                  </Text>
                )}
                {section === "workExperience" &&
                  resumeData.workExperience?.map((exp, index) => (
                    <View key={index} style={styles.item}>
                      <Text style={[styles.itemTitle, { color: resumeData.sectionStyles[section].textColor }]}>
                        {exp.company || "Company"} - {exp.role || "Role"}
                      </Text>
                      <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>
                        {exp.period || "Period"}
                      </Text>
                      {exp.achievements?.map((achievement, i) => (
                        <Text
                          key={i}
                          style={[styles.listItem, { color: resumeData.sectionStyles[section].textColor }]}
                        >
                          • {achievement || "Achievement"}
                        </Text>
                      ))}
                    </View>
                  ))}
              </View>
            ))}
        </View>
      </View>
    </Page>
  </Document>
);

function Template03() {
  const [resumeData, setResumeData] = useState({
    name: "RICHARD SANCHEZ",
    title: "Marketing Manager",
    profile: "Experienced and results-driven Marketing Manager with a proven track record in developing and executing successful marketing strategies.",
    phone: "+123-456-7890",
    email: "hello@reallygreatsite.com",
    address: "123 Anywhere St., Any City",
    website: "www.reallygreatsite.com",
    skills: ["Project Management", "Public Relations", "Teamwork", "Time Management"],
    workExperience: [
      {
        company: "Borcelle Studio",
        role: "Marketing Manager & Specialist",
        period: "2030 - PRESENT",
        achievements: ["Led marketing strategies resulting in a 20% increase in brand visibility."],
      },
      {
        company: "Fauget Studio",
        role: "Marketing Manager & Specialist",
        period: "2025 - 2029",
        achievements: ["Conducted market research for product development insights."],
      },
    ],
    education: [
      {
        university: "BORCELLE UNIVERSITY",
        degree: "Master of Business Management",
        period: "2029 - 2030",
      },
      {
        university: "BORCELLE UNIVERSITY",
        degree: "Bachelor of Business Management",
        period: "2025 - 2029",
        gpa: "3.8/4.0",
      },
    ],
    primaryColor: "#E0F6F6",
    secondaryColor: "#ffffff",
    headerTextColor: "#333333",
    sidebarTextColor: "#333333",
    mainTextColor: "#4a4a4a",
    sectionOrder: ["contact", "education", "skills", "profile", "workExperience"],
    sectionVisibility: {
      contact: true,
      education: true,
      skills: true,
      profile: true,
      workExperience: true,
    },
    sectionStyles: {
      contact: { bgColor: "#ffffff", textColor: "#4a4a4a" },
      education: { bgColor: "#ffffff", textColor: "#4a4a4a" },
      skills: { bgColor: "#ffffff", textColor: "#4a4a4a" },
      profile: { bgColor: "#ffffff", textColor: "#4a4a4a" },
      workExperience: { bgColor: "#ffffff", textColor: "#4a4a4a" },
    },
    templateId: "template03",
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setResumeData((prev) => ({ ...prev, profileImage: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const addItem = (section, defaultItem) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: [...prev[section], defaultItem],
    }));
  };

  const removeItem = (section, index) => {
    if (resumeData[section].length > 1) {
      setResumeData((prev) => ({
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index),
      }));
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await pdf(<TemplatePDF resumeData={resumeData} />).toBlob();
      if (!blob) {
        throw new Error("Failed to generate PDF blob");
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "resume_template03.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!", { position: "top-center", autoClose: 2000 });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF.", { position: "top-center", autoClose: 2000 });
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceDroppableId = source.droppableId;
    const destDroppableId = destination.droppableId;

    const sidebarSections = resumeData.sectionOrder.filter((section) =>
      ["contact", "education", "skills"].includes(section) && resumeData.sectionVisibility[section]
    );
    const contentSections = resumeData.sectionOrder.filter((section) =>
      ["profile", "workExperience"].includes(section) && resumeData.sectionVisibility[section]
    );

    let sourceSections = sourceDroppableId === "sidebar" ? sidebarSections : contentSections;
    let destSections = destDroppableId === "sidebar" ? sidebarSections : contentSections;

    if (sourceDroppableId !== destDroppableId) return;

    const newSections = Array.from(sourceSections);
    const [reorderedItem] = newSections.splice(source.index, 1);
    newSections.splice(destination.index, 0, reorderedItem);

    const updatedSectionOrder = resumeData.sectionOrder.map((section) => {
      if (sourceDroppableId === "sidebar" && ["contact", "education", "skills"].includes(section)) {
        return newSections.shift() || section;
      } else if (sourceDroppableId === "content" && ["profile", "workExperience"].includes(section)) {
        return newSections.shift() || section;
      }
      return section;
    });

    setResumeData((prev) => ({ ...prev, sectionOrder: updatedSectionOrder }));
  };

  const sidebarSections = resumeData.sectionOrder.filter((section) =>
    ["contact", "education", "skills"].includes(section) && resumeData.sectionVisibility[section]
  );
  const contentSections = resumeData.sectionOrder.filter((section) =>
    ["profile", "workExperience"].includes(section) && resumeData.sectionVisibility[section]
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Controls Section with Save Button */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Header Color:</label>
              <Input
                type="color"
                value={resumeData.primaryColor}
                onChange={(e) => setResumeData((prev) => ({ ...prev, primaryColor: e.target.value }))}
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
              <label className="text-sm font-medium">Sidebar Color:</label>
              <Input
                type="color"
                value={resumeData.secondaryColor}
                onChange={(e) => setResumeData((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sidebar Text:</label>
              <Input
                type="color"
                value={resumeData.sidebarTextColor}
                onChange={(e) => setResumeData((prev) => ({ ...prev, sidebarTextColor: e.target.value }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Main Text:</label>
              <Input
                type="color"
                value={resumeData.mainTextColor}
                onChange={(e) => setResumeData((prev) => ({ ...prev, mainTextColor: e.target.value }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            {["contact", "education", "skills", "profile", "workExperience"].map((section) => (
              <div key={section} className="flex items-center gap-2">
                <label className="text-sm font-medium">Show {section.charAt(0).toUpperCase() + section.slice(1)}:</label>
                <input
                  type="checkbox"
                  checked={resumeData.sectionVisibility[section]}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      sectionVisibility: { ...prev.sectionVisibility, [section]: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Download className="h-4 w-4" /> Download PDF
            </button>
            <ResumeAnalyzer />
          </div>
        </div>

        {/* Resume Content with Drag-and-Drop */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ minWidth: "100%" }}>
            {/* Header Section */}
            <div
              style={{
                backgroundColor: resumeData.primaryColor,
                padding: "25px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                margin: 0,
                borderBottom: "2px solid #D3E4E5",
              }}
            >
              <div style={{ flex: 1, height: "2px", backgroundColor: "#D3E4E5" }} />
              <div className="flex-1 text-center">
                <Input
                  value={resumeData.name}
                  onChange={(e) => setResumeData((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-transparent border-none text-3xl font-bold w-full mb-2"
                  style={{ color: resumeData.headerTextColor, wordBreak: "break-word", maxWidth: "100%", textAlign: "center" }}
                  placeholder="Your Name"
                />
                <Input
                  value={resumeData.title}
                  onChange={(e) => setResumeData((prev) => ({ ...prev, title: e.target.value }))}
                  className="bg-transparent border-none text-lg w-full"
                  style={{ color: resumeData.headerTextColor, wordBreak: "break-word", maxWidth: "100%", textAlign: "center" }}
                  placeholder="Your Role"
                />
              </div>
              <div style={{ flex: 1, height: "2px", backgroundColor: "#D3E4E5" }} />
            </div>

            {/* Two-Column Layout */}
            <div className="flex" style={{ minHeight: "calc(100vh - 200px)" }}>
              {/* Sidebar (Left Column, 50%) */}
              <Droppable droppableId="sidebar" direction="vertical">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="p-6"
                    style={{
                      flex: "0 0 50%",
                      backgroundColor: resumeData.secondaryColor,
                      color: resumeData.sidebarTextColor,
                    }}
                  >
                    {sidebarSections.map((section, index) => (
                      <Draggable key={section} draggableId={section} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-6 cursor-move p-4 rounded-lg shadow-sm border border-cyan-200"
                            style={{
                              ...provided.draggableProps.style,
                              backgroundColor: resumeData.sectionStyles[section].bgColor,
                              color: resumeData.sectionStyles[section].textColor,
                            }}
                          >
                            {section === "contact" && (
                              <>
                                <h2 className="text-lg font-semibold mb-3 border-b border-cyan-200 pb-2">Contact</h2>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5" style={{ color: "#D3E4E5" }} />
                                    <Input
                                      value={resumeData.phone}
                                      onChange={(e) => setResumeData((prev) => ({ ...prev, phone: e.target.value }))}
                                      className="bg-transparent border-none"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                    />
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5" style={{ color: "#D3E4E5" }} />
                                    <Input
                                      value={resumeData.email}
                                      onChange={(e) => setResumeData((prev) => ({ ...prev, email: e.target.value }))}
                                      className="bg-transparent border-none"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                    />
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5" style={{ color: "#D3E4E5" }} />
                                    <Input
                                      value={resumeData.address}
                                      onChange={(e) => setResumeData((prev) => ({ ...prev, address: e.target.value }))}
                                      className="bg-transparent border-none"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                    />
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Globe className="h-5 w-5" style={{ color: "#D3E4E5" }} />
                                    <Input
                                      value={resumeData.website}
                                      onChange={(e) => setResumeData((prev) => ({ ...prev, website: e.target.value }))}
                                      className="bg-transparent border-none"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                            {section === "education" && (
                              <>
                                <div className="flex justify-between items-center mb-3">
                                  <h2 className="text-lg font-semibold border-b border-cyan-200 pb-2">Education</h2>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => addItem("education", { university: "", degree: "", period: "", gpa: "" })}
                                    className="text-gray-600"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                {resumeData.education.map((edu, index) => (
                                  <div key={index} className="mb-4 relative">
                                    {resumeData.education.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem("education", index)}
                                        className="absolute right-0 top-0"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Input
                                      value={edu.university}
                                      onChange={(e) => {
                                        const newEducation = [...resumeData.education];
                                        newEducation[index] = { ...edu, university: e.target.value };
                                        setResumeData((prev) => ({ ...prev, education: newEducation }));
                                      }}
                                      className="font-semibold text-md mb-2"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                      placeholder="University"
                                    />
                                    <Input
                                      value={edu.degree}
                                      onChange={(e) => {
                                        const newEducation = [...resumeData.education];
                                        newEducation[index] = { ...edu, degree: e.target.value };
                                        setResumeData((prev) => ({ ...prev, education: newEducation }));
                                      }}
                                      className="mb-2"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                      placeholder="Degree"
                                    />
                                    <Input
                                      value={edu.period}
                                      onChange={(e) => {
                                        const newEducation = [...resumeData.education];
                                        newEducation[index] = { ...edu, period: e.target.value };
                                        setResumeData((prev) => ({ ...prev, education: newEducation }));
                                      }}
                                      className="mb-2"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                      placeholder="Period (e.g., 2014 - 2018)"
                                    />
                                    <Input
                                      value={edu.gpa || ""}
                                      onChange={(e) => {
                                        const newEducation = [...resumeData.education];
                                        newEducation[index] = { ...edu, gpa: e.target.value };
                                        setResumeData((prev) => ({ ...prev, equalducation: newEducation }));
                                      }}
                                      className="text-gray-600"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                      placeholder="GPA (optional)"
                                    />
                                  </div>
                                ))}
                              </>
                            )}
                            {section === "skills" && (
                              <>
                                <div className="flex justify-between items-center mb-3">
                                  <h2 className="text-lg font-semibold border-b border-cyan-200 pb-2">Skills</h2>
                                  <Button variant="ghost" size="icon" onClick={() => addItem("skills", "")} className="text-gray-600">
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                {resumeData.skills.map((skill, index) => (
                                  <div key={index} className="flex items-center gap-2 mb-2">
                                    <Input
                                      value={skill}
                                      onChange={(e) => {
                                        const newSkills = [...resumeData.skills];
                                        newSkills[index] = e.target.value;
                                        setResumeData((prev) => ({ ...prev, skills: newSkills }));
                                      }}
                                      className="bg-transparent border-none flex-1"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                    />
                                    {resumeData.skills.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem("skills", index)}
                                        className="text-gray-600"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
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

              {/* Content (Right Column, 50%) */}
              <Droppable droppableId="content" direction="vertical">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="p-6"
                    style={{
                      flex: "0 0 50%",
                      backgroundColor: "#ffffff",
                      color: resumeData.mainTextColor,
                    }}
                  >
                    {contentSections.map((section, index) => (
                      <Draggable key={section} draggableId={section} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-6 cursor-move p-4 rounded-lg shadow-sm border border-cyan-200"
                            style={{
                              ...provided.draggableProps.style,
                              backgroundColor: resumeData.sectionStyles[section].bgColor,
                              color: resumeData.sectionStyles[section].textColor,
                            }}
                          >
                            {section === "profile" && (
                              <>
                                <h2 className="text-lg font-semibold mb-3 border-b border-cyan-200 pb-2">Profile Summary</h2>
                                <Textarea
                                  value={resumeData.profile}
                                  onChange={(e) => setResumeData((prev) => ({ ...prev, profile: e.target.value }))}
                                  className="bg-transparent border-none resize-none w-full"
                                  style={{ color: resumeData.sectionStyles[section].textColor }}
                                  rows={4}
                                />
                              </>
                            )}
                            {section === "workExperience" && (
                              <>
                                <div className="flex justify-between items-center mb-3">
                                  <h2 className="text-lg font-semibold border-b border-cyan-200 pb-2">Work Experience</h2>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      addItem("workExperience", { company: "", role: "", period: "", achievements: [""] })
                                    }
                                    className="text-gray-600"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                {resumeData.workExperience.map((exp, expIndex) => (
                                  <div key={expIndex} className="mb-4 relative">
                                    {resumeData.workExperience.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem("workExperience", expIndex)}
                                        className="absolute right-0 top-0"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Input
                                      value={`${exp.company} - ${exp.role}`}
                                      onChange={(e) => {
                                        const [company, ...roleParts] = e.target.value.split(" - ");
                                        const newWorkExperience = [...resumeData.workExperience];
                                        newWorkExperience[expIndex] = {
                                          ...exp,
                                          company,
                                          role: roleParts.join(" - "),
                                        };
                                        setResumeData((prev) => ({ ...prev, workExperience: newWorkExperience }));
                                      }}
                                      className="font-semibold text-md mb-2"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                      placeholder="Company - Role"
                                    />
                                    <Input
                                      value={exp.period}
                                      onChange={(e) => {
                                        const newWorkExperience = [...resumeData.workExperience];
                                        newWorkExperience[expIndex] = { ...exp, period: e.target.value };
                                        setResumeData((prev) => ({ ...prev, workExperience: newWorkExperience }));
                                      }}
                                      className="mb-2"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                      placeholder="Period (e.g., 2020 - Present)"
                                    />
                                    {exp.achievements.map((achievement, achIndex) => (
                                      <div key={achIndex} className="flex items-center gap-2 mb-2">
                                        <Input
                                          value={achievement}
                                          onChange={(e) => {
                                            const newWorkExperience = [...resumeData.workExperience];
                                            newWorkExperience[expIndex].achievements[achIndex] = e.target.value;
                                            setResumeData((prev) => ({ ...prev, workExperience: newWorkExperience }));
                                          }}
                                          className="bg-transparent border-none flex-1"
                                          style={{ color: resumeData.sectionStyles[section].textColor }}
                                          placeholder="Achievement"
                                        />
                                        {exp.achievements.length > 1 && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                              const newWorkExperience = [...resumeData.workExperience];
                                              newWorkExperience[expIndex].achievements.splice(achIndex, 1);
                                              setResumeData((prev) => ({ ...prev, workExperience: newWorkExperience }));
                                            }}
                                            className="text-gray-600"
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
                                        const newWorkExperience = [...resumeData.workExperience];
                                        newWorkExperience[expIndex].achievements.push("");
                                        setResumeData((prev) => ({ ...prev, workExperience: newWorkExperience }));
                                      }}
                                      className="mt-2 text-gray-600"
                                    >
                                      <Plus className="h-4 w-4 mr-2" /> Add Achievement
                                    </Button>
                                  </div>
                                ))}
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
          </div>
        </DragDropContext>
      </div>

      {/* Toast Container */}
      <ToastContainer autoClose={2000} hideProgressBar={false} />
    </div>
  );
}

Modal.setAppElement("#root");

export default Template03;