import React from 'react';
import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import Template01 from '../pages/Templets_01';
import Template02 from '../pages/Templets_02';
import Template03 from '../pages/Templets_03';
import Template04 from '../pages/Templets_04';
import Template05 from '../pages/Templets_05';
import Template06 from '../pages/Templets_06';

// Create styles outside of the component to avoid recreation
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff'
  }
});

// Helper function to get the correct template component
export const getTemplateComponent = (templateId, resumeData) => {
  // Ensure resumeData has all required fields
  const enhancedResumeData = {
    ...resumeData,
    templateId: templateId || 'template01',
    sectionVisibility: resumeData.sectionVisibility || {},
    sectionStyles: resumeData.sectionStyles || {},
    sectionOrder: resumeData.sectionOrder || []
  };
  // Create a Map of template components with correct mapping
  const templates = new Map([
    ['Templets_01', Template01],
    ['Templets_02', Template02],
    ['Templets_03', Template03],
    ['Templets_04', Template04],
    ['Templets_05', Template05],
    ['Templets_06', Template06],
    // Backwards compatibility
    ['template01', Template01],
    ['template02', Template02],
    ['template03', Template03],
    ['template04', Template04],
    ['template05', Template05],
    ['template06', Template06]
  ]);

  // Log for debugging
  console.log("Available templates:", [...templates.keys()]);
  console.log("Requested template:", templateId);

  const SelectedTemplate = templates.get(templateId) || Template01;
  if (!templates.has(templateId)) {
    console.warn(`Template ${templateId} not found, falling back to Template01`);
  
  // Create the PDF document structure
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <SelectedTemplate resumeData={enhancedResumeData} />
      </Page>
    </Document>
  );
};

// Generate PDF blob from resume data
export const generatePDFBlob = async (resumeData) => {
  if (!resumeData) {
    console.error("No resume data provided to generatePDFBlob");
    throw new Error("No resume data provided");
  }
  
  try {
    // Ensure the resumeData has all required fields
    const completeResumeData = {
      templateId: resumeData.templateId || 'template01',
      name: resumeData.name || '',
      title: resumeData.title || '',
      email: resumeData.email || '',
      phone: resumeData.phone || '',
      address: resumeData.address || '',
      photo: resumeData.photo || '',
      sectionVisibility: resumeData.sectionVisibility || {},
      sectionStyles: resumeData.sectionStyles || {},
      sectionOrder: resumeData.sectionOrder || [],
      ...resumeData
    };
    
    console.log("Generating PDF for template:", completeResumeData.templateId);
    const pdfComponent = getTemplateComponent(completeResumeData.templateId, completeResumeData);
    
    // Create PDF with error handling
    const blob = await pdf(pdfComponent).toBlob();
    if (!blob) {
      throw new Error("Failed to generate PDF blob");
    }
    
    return blob;
  } catch (error) {
    console.error("Error in generatePDFBlob:", error);
    throw error;
  }
};
