import Progress from "../models/Progress.js";

export const markLessonComplete = async (req, res) => {
  try {
    const { lessonId } = req.body;

    let progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId,
    });

    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: req.params.courseId,
        completedLessons: [lessonId],
      });
    } else {
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
        await progress.save();
      }
    }

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update progress",
    });
  }
};

export const getProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId,
    });

    const totalLessons = 10; // temporary (later dynamic)
    const completed = progress?.completedLessons.length || 0;
    const percentage = (completed / totalLessons) * 100;

    res.status(200).json({
      success: true,
      progress,
      percentage, //send to frontend
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch progress",
    });
  }
};
