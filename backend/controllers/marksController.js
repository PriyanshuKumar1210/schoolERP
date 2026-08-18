const Exam = require('../models/Exam');
const Marks = require('../models/Marks');
const Student = require('../models/Student');
const Notice = require('../models/Notice');

// Create Exam
exports.createExam = async (req, res) => {
  try {
    const { name, classId, subjectId, date, totalMarks = 100, passingMarks = 35 } = req.body;

    if (req.user.role === 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teachers are not allowed to create assessments/exams.' });
    }

    const exam = await Exam.create({
      schoolId: req.user.schoolId,
      name,
      classId,
      subjectId,
      date,
      totalMarks,
      passingMarks,
    });



    res.status(201).json({
      message: 'Exam created successfully',
      exam,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Exams
exports.getAllExams = async (req, res) => {
  try {
    const { classId, page = 1, limit = 10 } = req.query;
    let query = { schoolId: req.user.schoolId };

    if (classId) query.classId = classId;

    const exams = await Exam.find(query)
      .populate('classId', 'standard division studentCount')
      .populate('subjectId', 'name code')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ date: -1 });

    const validExams = [];
    for (const ex of exams) {
      if (!ex.classId) {
        // Orphaned exam (class was deleted), clean up in background
        Exam.findByIdAndDelete(ex._id)
          .then(() => {
            const Marks = require('../models/Marks');
            const Notice = require('../models/Notice');
            return Promise.all([
              Marks.deleteMany({ examId: ex._id }),
              Notice.deleteMany({ examId: ex._id })
            ]);
          })
          .catch(err => console.error("Error deleting orphaned exam:", err));
      } else {
        validExams.push(ex);
      }
    }

    const total = await Exam.countDocuments(query);

    res.json({
      exams: validExams,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Enter Marks
exports.enterMarks = async (req, res) => {
  try {
    const { examId, studentId, subjectId, marks, outOfMarks, passStatus, remarks } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (req.user.role === 'teacher') {
      const Teacher = require('../models/Teacher');
      const teacher = await Teacher.findById(req.user.userId);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher profile not found' });
      }
      const isAssigned = teacher.subjectClassAssignments && teacher.subjectClassAssignments.some(
        a => a.subjectId.toString() === subjectId.toString() && a.classId.toString() === exam.classId.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({ message: 'Access denied. You are not assigned to teach this subject in this class.' });
      }
    }

    let existingMarks = await Marks.findOne({
      examId,
      studentId,
      subjectId,
      schoolId: req.user.schoolId,
    });

    const percentage = ((marks / outOfMarks) * 100).toFixed(2);

    if (existingMarks) {
      existingMarks.marks = marks;
      existingMarks.percentage = percentage;
      existingMarks.passStatus = passStatus;
      existingMarks.remarks = remarks;
      await existingMarks.save();
      return res.json({ message: 'Marks updated', marks: existingMarks });
    }

    const newMarks = await Marks.create({
      schoolId: req.user.schoolId,
      examId,
      studentId,
      subjectId,
      marks,
      outOfMarks,
      percentage,
      passStatus,
      remarks,
      enteredBy: req.user.userId,
      enteredByModel: req.user.role === 'teacher' ? 'Teacher' : 'User',
    });

    res.status(201).json({
      message: 'Marks entered successfully',
      marks: newMarks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk Enter Marks
exports.bulkEnterMarks = async (req, res) => {
  try {
    const { examId, subjectId, marksData } = req.body;

    if (!Array.isArray(marksData)) {
      return res.status(400).json({ message: 'Marks data must be an array' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (req.user.role === 'teacher') {
      const Teacher = require('../models/Teacher');
      const teacher = await Teacher.findById(req.user.userId);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher profile not found' });
      }
      const isAssigned = teacher.subjectClassAssignments && teacher.subjectClassAssignments.some(
        a => a.subjectId.toString() === subjectId.toString() && a.classId.toString() === exam.classId.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({ message: 'Access denied. You are not assigned to teach this subject in this class.' });
      }
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < marksData.length; i++) {
      try {
        const { studentId, marks, outOfMarks, passStatus, remarks } = marksData[i];

        let existingMarks = await Marks.findOne({
          examId,
          studentId,
          subjectId,
          schoolId: req.user.schoolId,
        });

        const percentage = ((marks / outOfMarks) * 100).toFixed(2);

        if (existingMarks) {
          existingMarks.marks = marks;
          existingMarks.percentage = percentage;
          existingMarks.passStatus = passStatus;
          existingMarks.remarks = remarks;
          await existingMarks.save();
        } else {
          existingMarks = await Marks.create({
            schoolId: req.user.schoolId,
            examId,
            studentId,
            subjectId,
            marks,
            outOfMarks,
            percentage,
            passStatus,
            remarks,
            enteredBy: req.user.userId,
            enteredByModel: req.user.role === 'teacher' ? 'Teacher' : 'User',
          });
        }

        results.push(existingMarks);
      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }

    res.json({
      message: 'Marks entered successfully',
      entered: results.length,
      errors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Student Marks
exports.getStudentMarks = async (req, res) => {
  try {
    const { studentId } = req.params;

    const marks = await Marks.find({
      studentId,
      schoolId: req.user.schoolId,
    })
      .populate('examId', 'name date')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 });

    res.json({ marks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Exam Result
exports.getExamResult = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (req.user.role === 'teacher') {
      const Teacher = require('../models/Teacher');
      const teacher = await Teacher.findById(req.user.userId);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher profile not found' });
      }

      // Check if class teacher of this exam's class
      const isClassTeacher = teacher.isClassTeacher && teacher.classTeacherOf && teacher.classTeacherOf.toString() === exam.classId.toString();

      // Check if assigned subject teacher
      const isAssigned = teacher.subjectClassAssignments && teacher.subjectClassAssignments.some(
        a => a.subjectId.toString() === exam.subjectId.toString() && a.classId.toString() === exam.classId.toString()
      );

      if (!isClassTeacher && !isAssigned) {
        return res.status(403).json({ message: 'Access denied. You are not authorized to view results for this exam.' });
      }
    }

    const results = await Marks.find({ examId, schoolId: req.user.schoolId })
      .populate('studentId', 'name email rollNumber')
      .populate('subjectId', 'name')
      .sort({ marks: -1 });

    const totalStudents = results.length;
    const topScore = results.length > 0 ? Math.max(...results.map(r => r.marks)) : 0;
    const averageScore = results.length > 0 ? (results.reduce((sum, r) => sum + r.marks, 0) / totalStudents).toFixed(2) : 0;
    const passedCount = results.filter(r => r.marks >= r.outOfMarks * 0.35).length;

    res.json({
      results,
      summary: {
        totalStudents,
        topScore,
        averageScore,
        passedCount,
        failedCount: totalStudents - passedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Toppers List
exports.getToppers = async (req, res) => {
  try {
    const { classId, examId, limit = 10 } = req.query;

    let query = { schoolId: req.user.schoolId };
    if (examId) query.examId = examId;

    const toppers = await Marks.find(query)
      .populate('studentId', 'name email rollNumber classId')
      .sort({ percentage: -1 })
      .limit(parseInt(limit));

    res.json({ toppers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Exam
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, schoolId: req.user.schoolId });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (req.user.role === 'teacher') {
      const Teacher = require('../models/Teacher');
      const teacher = await Teacher.findById(req.user.userId);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher profile not found' });
      }
      const isAssigned = teacher.subjectClassAssignments && teacher.subjectClassAssignments.some(
        a => a.subjectId.toString() === exam.subjectId.toString() && a.classId.toString() === exam.classId.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({ message: 'Access denied. You are not assigned to teach this subject in this class.' });
      }
    }

    const updatedExam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ message: 'Exam updated successfully', exam: updatedExam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Exam
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, schoolId: req.user.schoolId });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (req.user.role === 'teacher') {
      const Teacher = require('../models/Teacher');
      const teacher = await Teacher.findById(req.user.userId);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher profile not found' });
      }
      const isAssigned = teacher.subjectClassAssignments && teacher.subjectClassAssignments.some(
        a => a.subjectId.toString() === exam.subjectId.toString() && a.classId.toString() === exam.classId.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({ message: 'Access denied. You are not assigned to teach this subject in this class.' });
      }
    }

    await Exam.findByIdAndDelete(req.params.id);
    // Delete all marks associated with this exam
    await Marks.deleteMany({ examId: req.params.id });
    // Delete the auto-created notice linked to this exam (if any)
    await Notice.deleteMany({ examId: req.params.id, schoolId: req.user.schoolId });
    res.json({ message: 'Exam and its marks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
