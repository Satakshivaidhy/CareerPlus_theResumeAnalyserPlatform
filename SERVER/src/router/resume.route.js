import express from "express";
import multer from "multer";
import parseResume from "../utils/parseResume.js";
import matchJD from "../utils/matchJD.js";
import Resume from "../models/resume.model.js";
import { AuthProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file limit
});

// Wrapper to handle multer errors before auth checks
const handleUpload = (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Resume file exceeds 10MB limit" });
      }
      return res.status(400).json({ message: err.message || "File upload error" });
    }
    next();
  });
};

// Drain/parse the multipart stream first with handleUpload, then check AuthProtect
router.post("/upload", handleUpload, AuthProtect, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const jobDescription = req.body.job_description || "";
    const parsedResume = await parseResume(req.file);
    const matchResult = jobDescription
      ? await matchJD(parsedResume, jobDescription)
      : null;

    const userId = req.user?._id;
    let savedRecordId = null;
    if (userId) {
      try {
        const score = matchResult?.match_score || 0;
        const savedRecord = await Resume.create({
          userId,
          jobDescription: jobDescription.trim() || "General Resume Analysis",
          candidateName: parsedResume.name || "",
          experience: parsedResume.experience || [],
          projects: parsedResume.projects || [],
          metrics: {
            skillRelevance: score,
            projectDepth: score,
            experienceScore: score,
            structureScore: score,
          },
          finalStrengthScore: score,
          extractedSkills: parsedResume.skills || [],
          missingSkills: matchResult?.missing_keywords || [],
          weakTopics: [],
          analysisReport: matchResult?.summary || "",
        });
        savedRecordId = savedRecord._id;
      } catch (dbError) {
        console.warn("⚠️ Could not persist resume to MongoDB:", dbError.message);
      }
    }

    return res.json({
      parsedResume,
      matchResult,
      savedRecordId,
    });
  } catch (error) {
    console.error("Resume route error:", error);
    return res.status(500).json({
      message: "Resume processing failed",
      error: error.message,
    });
  }
});

export default router;
