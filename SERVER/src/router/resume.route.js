import express from "express";
import multer from "multer";
import parseResume from "../utils/parseResume.js";
import matchJD from "../utils/matchJD.js";
import Resume from "../models/resume.model.js";
import { AuthProtect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", AuthProtect, upload.single("resume"), async (req, res) => {
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
          jobDescription,
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
    console.error(error);
    return res.status(500).json({
      message: "Resume processing failed",
      error: error.message,
    });
  }
});

export default router;
