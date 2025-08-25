import React, { useState, useCallback } from "react";
import { Document, Page, View, Text, StyleSheet, pdf } from "@react-pdf/renderer";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Mail, Phone, MapPin, Globe, Trash2, Plus, Download, Linkedin, Twitter, Github } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
// Custom Button Component (unchanged)
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

// Custom Input Component (unchanged)
const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    {...props}
  />
);

// Custom Textarea Component (unchanged)
const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    {...props}
  />
);

// PDF Styles (unchanged)
const styles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#ffffff", padding: 20 },
  header: { padding: 25, flexDirection: "row", alignItems: "center", gap: 20, backgroundColor: "#003087" },
  profileImage: { width: 110, height: 110, borderRadius: 55, objectFit: "cover", border: "5px solid rgba(255, 255, 255, 0.4)" },
  name: { fontSize: 32, fontWeight: "bold", color: "#ffffff", flexWrap: "wrap", maxWidth: "70%" },
  title: { fontSize: 18, color: "#ffffff", opacity: 0.9, marginTop: 6, flexWrap: "wrap", maxWidth: "70%" },
  container: { flexDirection: "row" },
  leftColumn: { width: "35%", padding: 20 },
  rightColumn: { width: "65%", padding: 20, backgroundColor: "#ffffff" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, paddingBottom: 4, borderBottom: "2px solid" },
  text: { fontSize: 12, marginBottom: 6 },
  whiteText: { fontSize: 12, marginBottom: 6 },
});

// PDF Document Component (unchanged)
const TemplatePDF = ({ resumeData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={[styles.header, { backgroundColor: resumeData.primaryColor }]}>
        <Image src={resumeData.profileImage || "https://via.placeholder.com/100"} style={styles.profileImage} />
        <View>
          <Text style={[styles.name, { color: resumeData.headerTextColor }]}>{resumeData.name}</Text>
          <Text style={[styles.title, { color: resumeData.headerTextColor }]}>{resumeData.title}</Text>
        </View>
      </View>

      <View style={styles.container}>
        <View style={[styles.leftColumn, { backgroundColor: resumeData.secondaryColor }]}>
          {resumeData.sectionOrder.map((section) => {
            if (["about", "contact", "socialLinks", "languages", "skills"].includes(section) && resumeData.sectionVisibility[section]) {
              return (
                <View
                  key={section}
                  style={{
                    marginBottom: 20,
                    backgroundColor: resumeData.sectionStyles[section].bgColor,
                    color: resumeData.sectionStyles[section].textColor,
                  }}
                >
                  <Text
                    style={{
                      ...styles.sectionTitle,
                      color: resumeData.sectionStyles[section].textColor,
                      borderBottomColor: "rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    {section === "about" && "About Me"}
                    {section === "contact" && "Contact"}
                    {section === "socialLinks" && "Social Links"}
                    {section === "languages" && "Languages"}
                    {section === "skills" && "Skills"}
                  </Text>
                  {section === "about" && <Text style={[styles.whiteText, { color: resumeData.sectionStyles[section].textColor }]}>{resumeData.about}</Text>}
                  {section === "contact" && (
                    <>
                      <Text style={[styles.whiteText, { color: resumeData.sectionStyles[section].textColor }]}>
                        <Phone size={14} style={{ display: "inline", marginRight: 8 }} /> {resumeData.phone}
                      </Text>
                      <Text style={[styles.whiteText, { color: resumeData.sectionStyles[section].textColor }]}>
                        <Mail size={14} style={{ display: "inline", marginRight: 8 }} /> {resumeData.email}
                      </Text>
                      <Text style={[styles.whiteText, { color: resumeData.sectionStyles[section].textColor }]}>
                        <MapPin size={14} style={{ display: "inline", marginRight: 8 }} /> {resumeData.address}
                      </Text>
                    </>
                  )}
                  {section === "socialLinks" && resumeData.socialLinks.map((link, index) => (
                    <Text key={index} style={[styles.whiteText, { color: resumeData.sectionStyles[section].textColor }]}>
                      {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}: {link.url}
                    </Text>
                  ))}
                  {section === "languages" && resumeData.languages.map((language, index) => (
                    <Text key={index} style={[styles.whiteText, { color: resumeData.sectionStyles[section].textColor }]}>
                      {language}
                    </Text>
                  ))}
                  {section === "skills" && resumeData.skills.map((skill, index) => (
                    <Text key={index} style={[styles.whiteText, { color: resumeData.sectionStyles[section].textColor }]}>
                      • {skill}
                    </Text>
                  ))}
                </View>
              );
            }
            return null;
          })}
        </View>

        <View style={styles.rightColumn}>
          {resumeData.sectionOrder.map((section) => {
            if (["projects", "education", "certificates"].includes(section) && resumeData.sectionVisibility[section]) {
              return (
                <View
                  key={section}
                  style={{
                    marginBottom: 20,
                    backgroundColor: resumeData.sectionStyles[section].bgColor,
                    color: resumeData.sectionStyles[section].textColor,
                  }}
                >
                  <Text
                    style={{
                      ...styles.sectionTitle,
                      color: resumeData.primaryColor,
                      borderBottomColor: resumeData.primaryColor,
                    }}
                  >
                    {section === "projects" && "Projects"}
                    {section === "education" && "Education"}
                    {section === "certificates" && "Certificates"}
                  </Text>
                  {section === "projects" && resumeData.projects.map((project, index) => (
                    <View key={index} style={{ marginBottom: 15 }}>
                      <Text style={{ fontWeight: "bold", fontSize: 14, color: resumeData.sectionStyles[section].textColor, marginBottom: 4 }}>
                        {project.name}
                      </Text>
                      <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>{project.description}</Text>
                      <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>
                        Technologies: {project.technologies}
                      </Text>
                    </View>
                  ))}
                  {section === "education" && resumeData.education.map((edu, index) => (
                    <View key={index} style={{ marginBottom: 15 }}>
                      <Text style={{ fontWeight: "bold", fontSize: 14, color: resumeData.sectionStyles[section].textColor, marginBottom: 2 }}>
                        {edu.university}
                      </Text>
                      <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>{edu.degree}</Text>
                      <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>{edu.period}</Text>
                    </View>
                  ))}
                  {section === "certificates" && resumeData.certificates.map((cert, index) => (
                    <View key={index} style={{ marginBottom: 15 }}>
                      <Text style={{ fontWeight: "bold", fontSize: 14, color: resumeData.sectionStyles[section].textColor, marginBottom: 2 }}>
                        {cert.name}
                      </Text>
                      <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>{cert.issuer}</Text>
                      <Text style={[styles.text, { color: resumeData.sectionStyles[section].textColor }]}>{cert.year}</Text>
                    </View>
                  ))}
                </View>
              );
            }
            return null;
          })}
        </View>
      </View>
    </Page>
  </Document>
);

function Template01() {
  const [resumeData, setResumeData] = useState({
    templateId: "template01",
    name: "RICHARD SANCHEZ",
    title: "Product Designer",
    about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    phone: "+123-456-7890",
    email: "hello@reallygreatsite.com",
    address: "123 Anywhere St., Any City",
    profileImage: "data:image/jpeg;base64,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",
    socialLinks: [
      { platform: "github", url: "https://github.com/username" },
      { platform: "linkedin", url: "https://linkedin.com/in/username" },
    ],
    languages: ["English", "Germany (basic)"],
    skills: ["Management Skills", "Creativity", "Digital Marketing"],
    projects: [
      {
        name: "E-commerce Platform",
        description: "Built a full-stack e-commerce platform using React and Node.js",
        technologies: "React, Node.js, MongoDB",
      },
    ],
    education: [
      {
        university: "Borcelle University",
        degree: "Bachelor of Business Management",
        period: "2014 - 2025",
      },
    ],
    certificates: [
      { name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", year: "2023" },
      { name: "Google Professional Cloud Developer", issuer: "Google Cloud", year: "2022" },
    ],
    primaryColor: "#003087",
    secondaryColor: "#000000",
    headerTextColor: "#ffffff",
    sidebarTextColor: "#ffffff",
    mainTextColor: "#333333",
    sectionOrder: [
      "about",
      "contact",
      "socialLinks",
      "languages",
      "skills",
      "projects",
      "education",
      "certificates",
    ],
    sectionVisibility: {
      about: true,
      contact: true,
      socialLinks: true,
      languages: true,
      skills: true,
      projects: true,
      education: true,
      certificates: true,
    },
    sectionStyles: {
      about: { bgColor: "#000000", textColor: "#ffffff" },
      contact: { bgColor: "#000000", textColor: "#ffffff" },
      socialLinks: { bgColor: "#000000", textColor: "#ffffff" },
      languages: { bgColor: "#000000", textColor: "#ffffff" },
      skills: { bgColor: "#000000", textColor: "#ffffff" },
      projects: { bgColor: "#ffffff", textColor: "#333333" },
      education: { bgColor: "#ffffff", textColor: "#333333" },
      certificates: { bgColor: "#ffffff", textColor: "#333333" },
    },
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
    const blob = await pdf(<TemplatePDF resumeData={resumeData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template01.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const socialIcons = {
    github: <Github className="h-5 w-5" />,
    linkedin: <Linkedin className="h-5 w-5" />,
    twitter: <Twitter className="h-5 w-5" />,
    website: <Globe className="h-5 w-5" />,
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceDroppableId = source.droppableId;
    const destDroppableId = destination.droppableId;

    const sidebarSections = resumeData.sectionOrder.filter((section) =>
      ["about", "contact", "socialLinks", "languages", "skills"].includes(section) && resumeData.sectionVisibility[section]
    );
    const contentSections = resumeData.sectionOrder.filter((section) =>
      ["projects", "education", "certificates"].includes(section) && resumeData.sectionVisibility[section]
    );

    let sourceSections = sourceDroppableId === "sidebar" ? sidebarSections : contentSections;
    let destSections = destDroppableId === "sidebar" ? sidebarSections : contentSections;

    // Prevent dragging between sidebar and content
    if (sourceDroppableId !== destDroppableId) return;

    const newSections = Array.from(sourceSections);
    const [reorderedItem] = newSections.splice(source.index, 1);
    newSections.splice(destination.index, 0, reorderedItem);

    // Reconstruct the full sectionOrder with updated order within the respective droppable
    const updatedSectionOrder = resumeData.sectionOrder.map((section) => {
      if (sourceDroppableId === "sidebar" && ["about", "contact", "socialLinks", "languages", "skills"].includes(section)) {
        return newSections.shift() || section;
      } else if (sourceDroppableId === "content" && ["projects", "education", "certificates"].includes(section)) {
        return newSections.shift() || section;
      }
      return section;
    });

    setResumeData((prev) => ({ ...prev, sectionOrder: updatedSectionOrder }));
  };

  // Filter sections for each droppable area
  const sidebarSections = resumeData.sectionOrder.filter((section) =>
    ["about", "contact", "socialLinks", "languages", "skills"].includes(section) && resumeData.sectionVisibility[section]
  );
  const contentSections = resumeData.sectionOrder.filter((section) =>
    ["projects", "education", "certificates"].includes(section) && resumeData.sectionVisibility[section]
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4">
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
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Show About:</label>
              <input
                type="checkbox"
                checked={resumeData.sectionVisibility.about}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionVisibility: { ...prev.sectionVisibility, about: e.target.checked },
                }))}
                className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Show Contact:</label>
              <input
                type="checkbox"
                checked={resumeData.sectionVisibility.contact}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionVisibility: { ...prev.sectionVisibility, contact: e.target.checked },
                }))}
                className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Show Social Links:</label>
              <input
                type="checkbox"
                checked={resumeData.sectionVisibility.socialLinks}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionVisibility: { ...prev.sectionVisibility, socialLinks: e.target.checked },
                }))}
                className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Show Languages:</label>
              <input
                type="checkbox"
                checked={resumeData.sectionVisibility.languages}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionVisibility: { ...prev.sectionVisibility, languages: e.target.checked },
                }))}
                className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Show Skills:</label>
              <input
                type="checkbox"
                checked={resumeData.sectionVisibility.skills}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionVisibility: { ...prev.sectionVisibility, skills: e.target.checked },
                }))}
                className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Show Projects:</label>
              <input
                type="checkbox"
                checked={resumeData.sectionVisibility.projects}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionVisibility: { ...prev.sectionVisibility, projects: e.target.checked },
                }))}
                className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Show Education:</label>
              <input
                type="checkbox"
                checked={resumeData.sectionVisibility.education}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionVisibility: { ...prev.sectionVisibility, education: e.target.checked },
                }))}
                className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Show Certificates:</label>
              <input
                type="checkbox"
                checked={resumeData.sectionVisibility.certificates}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionVisibility: { ...prev.sectionVisibility, certificates: e.target.checked },
                }))}
                className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">About BG Color:</label>
              <Input
                type="color"
                value={resumeData.sectionStyles.about.bgColor}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionStyles: { ...prev.sectionStyles, about: { ...prev.sectionStyles.about, bgColor: e.target.value } },
                }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">About Text Color:</label>
              <Input
                type="color"
                value={resumeData.sectionStyles.about.textColor}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionStyles: { ...prev.sectionStyles, about: { ...prev.sectionStyles.about, textColor: e.target.value } },
                }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Contact BG Color:</label>
              <Input
                type="color"
                value={resumeData.sectionStyles.contact.bgColor}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionStyles: { ...prev.sectionStyles, contact: { ...prev.sectionStyles.contact, bgColor: e.target.value } },
                }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Contact Text Color:</label>
              <Input
                type="color"
                value={resumeData.sectionStyles.contact.textColor}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionStyles: { ...prev.sectionStyles, contact: { ...prev.sectionStyles.contact, textColor: e.target.value } },
                }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Social Links BG Color:</label>
              <Input
                type="color"
                value={resumeData.sectionStyles.socialLinks.bgColor}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionStyles: { ...prev.sectionStyles, socialLinks: { ...prev.sectionStyles.socialLinks, bgColor: e.target.value } },
                }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Social Links Text Color:</label>
              <Input
                type="color"
                value={resumeData.sectionStyles.socialLinks.textColor}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionStyles: { ...prev.sectionStyles, socialLinks: { ...prev.sectionStyles.socialLinks, textColor: e.target.value } },
                }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Languages BG Color:</label>
              <Input
                type="color"
                value={resumeData.sectionStyles.languages.bgColor}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionStyles: { ...prev.sectionStyles, languages: { ...prev.sectionStyles.languages, bgColor: e.target.value } },
                }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Languages Text Color:</label>
              <Input
                type="color"
                value={resumeData.sectionStyles.languages.textColor}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionStyles: { ...prev.sectionStyles, languages: { ...prev.sectionStyles.languages, textColor: e.target.value } },
                }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Skills BG Color:</label>
              <Input
                type="color"
                value={resumeData.sectionStyles.skills.bgColor}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionStyles: { ...prev.sectionStyles, skills: { ...prev.sectionStyles.skills, bgColor: e.target.value } },
                }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Skills Text Color:</label>
              <Input
                type="color"
                value={resumeData.sectionStyles.skills.textColor}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionStyles: { ...prev.sectionStyles, skills: { ...prev.sectionStyles.skills, textColor: e.target.value } },
                }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Projects BG Color:</label>
              <Input
                type="color"
                value={resumeData.sectionStyles.projects.bgColor}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionStyles: { ...prev.sectionStyles, projects: { ...prev.sectionStyles.projects, bgColor: e.target.value } },
                }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Projects Text Color:</label>
              <Input
                type="color"
                value={resumeData.sectionStyles.projects.textColor}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionStyles: { ...prev.sectionStyles, projects: { ...prev.sectionStyles.projects, textColor: e.target.value } },
                }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Education BG Color:</label>
              <Input
                type="color"
                value={resumeData.sectionStyles.education.bgColor}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionStyles: { ...prev.sectionStyles, education: { ...prev.sectionStyles.education, bgColor: e.target.value } },
                }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Education Text Color:</label>
              <Input
                type="color"
                value={resumeData.sectionStyles.education.textColor}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionStyles: { ...prev.sectionStyles, education: { ...prev.sectionStyles.education, textColor: e.target.value } },
                }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Certificates BG Color:</label>
              <Input
                type="color"
                value={resumeData.sectionStyles.certificates.bgColor}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionStyles: { ...prev.sectionStyles, certificates: { ...prev.sectionStyles.certificates, bgColor: e.target.value } },
                }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Certificates Text Color:</label>
              <Input
                type="color"
                value={resumeData.sectionStyles.certificates.textColor}
                onChange={(e) => setResumeData((prev) => ({
                  ...prev,
                  sectionStyles: { ...prev.sectionStyles, certificates: { ...prev.sectionStyles.certificates, textColor: e.target.value } },
                }))}
                className="w-12 h-10 p-1 rounded"
              />
            </div>
          </div>
          <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>

        {/* Resume Content with Drag-and-Drop */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ minWidth: "100%" }}>
            {/* Header Section (unchanged) */}
            <div
              style={{
                backgroundColor: resumeData.primaryColor,
                padding: "25px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                margin: 0,
              }}
            >
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white/40 flex-shrink-0">
                <label className="cursor-pointer absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity text-white text-sm">
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <img src={resumeData.profileImage} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <Input
                  value={resumeData.name}
                  onChange={(e) => setResumeData((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-transparent border-none text-4xl font-bold w-full mb-2"
                  style={{ color: resumeData.headerTextColor, wordBreak: "break-word", maxWidth: "100%" }}
                  placeholder="Your Name"
                />
                <Input
                  value={resumeData.title}
                  onChange={(e) => setResumeData((prev) => ({ ...prev, title: e.target.value }))}
                  className="bg-transparent border-none text-xl w-full"
                  style={{ color: resumeData.headerTextColor, wordBreak: "break-word", maxWidth: "100%" }}
                  placeholder="Your Role"
                />
              </div>
            </div>

            {/* Two-Column Layout with Drag-and-Drop */}
            <div className="flex" style={{ minHeight: "calc(100vh - 200px)" }}>
              {/* Sidebar (Left Column, 35%) */}
              <Droppable droppableId="sidebar" direction="vertical">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="p-6"
                    style={{
                      flex: "0 0 35%",
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
                            className="mb-8 cursor-move"
                            style={{
                              ...provided.draggableProps.style,
                              backgroundColor: resumeData.sectionStyles[section].bgColor,
                              color: resumeData.sectionStyles[section].textColor,
                            }}
                          >
                            {section === "about" && (
                              <>
                                <h2 className="text-xl font-semibold mb-3 border-b-2 border-white/30 pb-2">About Me</h2>
                                <Textarea
                                  value={resumeData.about}
                                  onChange={(e) => setResumeData((prev) => ({ ...prev, about: e.target.value }))}
                                  className="bg-transparent border-none resize-none w-full"
                                  style={{ color: resumeData.sectionStyles[section].textColor }}
                                  rows={4}
                                />
                              </>
                            )}
                            {section === "contact" && (
                              <>
                                <h2 className="text-xl font-semibold mb-3 border-b-2 border-white/30 pb-2">Contact</h2>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5" style={{ color: resumeData.sectionStyles[section].textColor }} />
                                    <Input
                                      value={resumeData.phone}
                                      onChange={(e) => setResumeData((prev) => ({ ...prev, phone: e.target.value }))}
                                      className="bg-transparent border-none"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                    />
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5" style={{ color: resumeData.sectionStyles[section].textColor }} />
                                    <Input
                                      value={resumeData.email}
                                      onChange={(e) => setResumeData((prev) => ({ ...prev, email: e.target.value }))}
                                      className="bg-transparent border-none"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                    />
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5" style={{ color: resumeData.sectionStyles[section].textColor }} />
                                    <Input
                                      value={resumeData.address}
                                      onChange={(e) => setResumeData((prev) => ({ ...prev, address: e.target.value }))}
                                      className="bg-transparent border-none"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                            {section === "socialLinks" && (
                              <>
                                <div className="flex justify-between items-center mb-3">
                                  <h2 className="text-xl font-semibold border-b-2 border-white/30 pb-2">Social Links</h2>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => addItem("socialLinks", { platform: "github", url: "" })}
                                    className="text-white"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                {resumeData.socialLinks.map((link, index) => (
                                  <div key={index} className="flex items-center gap-2 mb-3">
                                    {socialIcons[link.platform]}
                                    <select
                                      value={link.platform}
                                      onChange={(e) => {
                                        const newLinks = [...resumeData.socialLinks];
                                        newLinks[index] = { ...link, platform: e.target.value };
                                        setResumeData((prev) => ({ ...prev, socialLinks: newLinks }));
                                      }}
                                      className="bg-black text-white border border-white/30 rounded px-2 py-1"
                                    >
                                      <option value="github">GitHub</option>
                                      <option value="linkedin">LinkedIn</option>
                                      <option value="twitter">Twitter</option>
                                      <option value="website">Website</option>
                                    </select>
                                    <Input
                                      value={link.url}
                                      onChange={(e) => {
                                        const newLinks = [...resumeData.socialLinks];
                                        newLinks[index] = { ...link, url: e.target.value };
                                        setResumeData((prev) => ({ ...prev, socialLinks: newLinks }));
                                      }}
                                      className="bg-transparent border-none flex-1"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                      placeholder="URL"
                                    />
                                    {resumeData.socialLinks.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem("socialLinks", index)}
                                        className="text-white"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </>
                            )}
                            {section === "languages" && (
                              <>
                                <div className="flex justify-between items-center mb-3">
                                  <h2 className="text-xl font-semibold border-b-2 border-white/30 pb-2">Languages</h2>
                                  <Button variant="ghost" size="icon" onClick={() => addItem("languages", "")} className="text-white">
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                {resumeData.languages.map((language, index) => (
                                  <div key={index} className="flex items-center gap-2 mb-2">
                                    <Input
                                      value={language}
                                      onChange={(e) => {
                                        const newLanguages = [...resumeData.languages];
                                        newLanguages[index] = e.target.value;
                                        setResumeData((prev) => ({ ...prev, languages: newLanguages }));
                                      }}
                                      className="bg-transparent border-none flex-1"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                    />
                                    {resumeData.languages.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem("languages", index)}
                                        className="text-white"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </>
                            )}
                            {section === "skills" && (
                              <>
                                <div className="flex justify-between items-center mb-3">
                                  <h2 className="text-xl font-semibold border-b-2 border-white/30 pb-2">Skills</h2>
                                  <Button variant="ghost" size="icon" onClick={() => addItem("skills", "")} className="text-white">
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
                                        className="text-white"
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

              {/* Content (Right Column, 65%) */}
              <Droppable droppableId="content" direction="vertical">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="p-6"
                    style={{
                      flex: "0 0 65%",
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
                            className="mb-8 cursor-move"
                            style={{
                              ...provided.draggableProps.style,
                              backgroundColor: resumeData.sectionStyles[section].bgColor,
                              color: resumeData.sectionStyles[section].textColor,
                            }}
                          >
                            {section === "projects" && (
                              <>
                                <div className="flex justify-between items-center mb-4">
                                  <h2
                                    style={{ color: resumeData.primaryColor, borderBottomColor: resumeData.primaryColor }}
                                    className="text-xl font-semibold border-b-2 pb-2"
                                  >
                                    Projects
                                  </h2>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => addItem("projects", { name: "", description: "", technologies: "" })}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                {resumeData.projects.map((project, index) => (
                                  <div key={index} className="mb-6 relative">
                                    {resumeData.projects.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem("projects", index)}
                                        className="absolute right-0 top-0"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Input
                                      value={project.name}
                                      onChange={(e) => {
                                        const newProjects = [...resumeData.projects];
                                        newProjects[index] = { ...project, name: e.target.value };
                                        setResumeData((prev) => ({ ...prev, projects: newProjects }));
                                      }}
                                      className="font-semibold text-lg mb-2"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                      placeholder="Project Name"
                                    />
                                    <Textarea
                                      value={project.description}
                                      onChange={(e) => {
                                        const newProjects = [...resumeData.projects];
                                        newProjects[index] = { ...project, description: e.target.value };
                                        setResumeData((prev) => ({ ...prev, projects: newProjects }));
                                      }}
                                      className="mb-2 resize-none"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                      placeholder="Description"
                                      rows={3}
                                    />
                                    <Input
                                      value={project.technologies}
                                      onChange={(e) => {
                                        const newProjects = [...resumeData.projects];
                                        newProjects[index] = { ...project, technologies: e.target.value };
                                        setResumeData((prev) => ({ ...prev, projects: newProjects }));
                                      }}
                                      className="text-gray-600"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                      placeholder="Technologies (e.g., React, Node.js)"
                                    />
                                  </div>
                                ))}
                              </>
                            )}
                            {section === "education" && (
                              <>
                                <div className="flex justify-between items-center mb-4">
                                  <h2
                                    style={{ color: resumeData.primaryColor, borderBottomColor: resumeData.primaryColor }}
                                    className="text-xl font-semibold border-b-2 pb-2"
                                  >
                                    Education
                                  </h2>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => addItem("education", { university: "", degree: "", period: "" })}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                {resumeData.education.map((edu, index) => (
                                  <div key={index} className="mb-6 relative">
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
                                      className="font-semibold text-lg mb-2"
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
                                      className="text-gray-600"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                      placeholder="Period (e.g., 2014 - 2018)"
                                    />
                                  </div>
                                ))}
                              </>
                            )}
                            {section === "certificates" && (
                              <>
                                <div className="flex justify-between items-center mb-4">
                                  <h2
                                    style={{ color: resumeData.primaryColor, borderBottomColor: resumeData.primaryColor }}
                                    className="text-xl font-semibold border-b-2 pb-2"
                                  >
                                    Certificates
                                  </h2>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => addItem("certificates", { name: "", issuer: "", year: "" })}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                {resumeData.certificates.map((cert, index) => (
                                  <div key={index} className="mb-6 relative">
                                    {resumeData.certificates.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem("certificates", index)}
                                        className="absolute right-0 top-0"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Input
                                      value={cert.name}
                                      onChange={(e) => {
                                        const newCertificates = [...resumeData.certificates];
                                        newCertificates[index] = { ...cert, name: e.target.value };
                                        setResumeData((prev) => ({ ...prev, certificates: newCertificates }));
                                      }}
                                      className="font-semibold text-lg mb-2"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                      placeholder="Certificate Name"
                                    />
                                    <Input
                                      value={cert.issuer}
                                      onChange={(e) => {
                                        const newCertificates = [...resumeData.certificates];
                                        newCertificates[index] = { ...cert, issuer: e.target.value };
                                        setResumeData((prev) => ({ ...prev, certificates: newCertificates }));
                                      }}
                                      className="mb-2"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                      placeholder="Issuer"
                                    />
                                    <Input
                                      value={cert.year}
                                      onChange={(e) => {
                                        const newCertificates = [...resumeData.certificates];
                                        newCertificates[index] = { ...cert, year: e.target.value };
                                        setResumeData((prev) => ({ ...prev, certificates: newCertificates }));
                                      }}
                                      className="text-gray-600"
                                      style={{ color: resumeData.sectionStyles[section].textColor }}
                                      placeholder="Year"
                                    />
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
    </div>
  );
}

export default Template01;