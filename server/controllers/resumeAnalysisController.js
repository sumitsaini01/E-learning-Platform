import fs from "fs/promises";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import { analyzeResumeWithAI } from "../services/aiResumeAnalyzerService.js";

const extractTextFromResume = async (file) => {
  if (!file) {
    throw new Error("Resume file is required");
  }

  if (file.mimetype === "application/pdf") {
    const buffer = await fs.readFile(file.path);

const parser = new PDFParse({
  data: buffer,
});

const data = await parser.getText();

return data.text;
  }

  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      path: file.path,
    });

    return result.value;
  }

  throw new Error("Only PDF and DOCX resumes are supported");
};

export const analyzeResume = async (req, res) => {
  try {
    const { targetRole } = req.body;

    if (!targetRole?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Target role is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    const resumeText = await extractTextFromResume(req.file);

    if (!resumeText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from resume",
      });
    }

    const aiAnalysis = await analyzeResumeWithAI({
      resumeText,
      targetRole: targetRole.trim(),
    });

    const analysis = await ResumeAnalysis.create({
      user: req.user._id,
      targetRole: targetRole.trim(),
      fileName: req.file.originalname,
      atsScore: aiAnalysis.atsScore,
      summary: aiAnalysis.summary,
      strengths: aiAnalysis.strengths,
      weaknesses: aiAnalysis.weaknesses,
      missingKeywords: aiAnalysis.missingKeywords,
      projectSuggestions: aiAnalysis.projectSuggestions,
      improvementTips: aiAnalysis.improvementTips,
    });

    await fs.unlink(req.file.path).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Resume analyzed successfully",
      analysis,
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      message: "Failed to analyze resume",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

export const getMyResumeAnalyses = async (req, res) => {
  try {
    const analyses = await ResumeAnalysis.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: analyses.length,
      analyses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume analyses",
    });
  }
};

export const deleteResumeAnalysis = async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOneAndDelete({
      _id: req.params.analysisId,
      user: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Resume analysis not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resume analysis deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete resume analysis",
    });
  }
};
