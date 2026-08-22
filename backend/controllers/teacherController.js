const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Class = require('../models/Class');
const mongoose = require('mongoose');

// Accept the database _id used by the UI as well as the public teacher or
// employee ID. This keeps update/delete working for all teacher ID displays.
const getTeacherLookup = (id, schoolId) => {
  const identifier = String(id || '').trim();
  const identifiers = [
    { teacherId: identifier },
    { employeeId: identifier },
  ];

  if (mongoose.isValidObjectId(identifier)) {
    identifiers.unshift({ _id: identifier });
  }

  return { schoolId, $or: identifiers };
};

// Helper to resolve Class ID from typed standard and division
const resolveClassId = async (schoolId, standard, division) => {
  if (!standard || !division) return undefined;
  let cl = await Class.findOne({ schoolId, standard: String(standard).trim(), division: String(division).trim() });
  if (!cl) {
    cl = await Class.create({ schoolId, standard: String(standard).trim(), division: String(division).trim() });
  }
  return cl._id;
};

// Get All Teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const schoolId = req.user.schoolId;

    let query = { schoolId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const teachers = await Teacher.find(query)
      .populate('subjectIds', 'name')
      .populate('classIds', 'standard division')
      .populate('classTeacherOf', 'standard division')
      .populate({
        path: 'subjectClassAssignments.subjectId',
        select: 'name code'
      })
      .populate({
        path: 'subjectClassAssignments.classId',
        select: 'standard division'
      })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Teacher.countDocuments(query);

    res.json({
      teachers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Teacher by ID
exports.getTeacherById = async (req, res) => {
  try {
    let teacher = await Teacher.findOne(getTeacherLookup(req.params.id, req.user.schoolId))
      .populate('subjectIds', 'name code')
      .populate('classIds', 'standard division')
      .populate('schoolId')
      .populate({
        path: 'subjectClassAssignments.subjectId',
        select: 'name code'
      })
      .populate({
        path: 'subjectClassAssignments.classId',
        select: 'standard division'
      });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (req.user.role === 'teacher' && req.user.userId !== teacher._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Teacher
exports.createTeacher = async (req, res) => {
  try {
    const { name, email, password, phone, employeeId, ...rest } = req.body;

    // Check if teacher exists
    let teacher = await Teacher.findOne({ email,staffCode });
    if (teacher) {
      return res.status(400).json({ message: 'Teacher already exists' });
    }

    const { hashPassword, validatePasswordStrength } = require('../utils/password');
    if (!validatePasswordStrength(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters, contain 1 capital letter, 1 number, and 1 special character' });
    }
    const hashedPassword = await hashPassword(password);

    let classTeacherOf = req.body.classTeacherOf;
    if (req.body.isClassTeacher && req.body.classTeacherStandard && req.body.classTeacherDivision) {
      classTeacherOf = await resolveClassId(
        req.user.schoolId,
        req.body.classTeacherStandard,
        req.body.classTeacherDivision
      );
    }

    const School = require('../models/School');
    const schoolData = await School.findById(req.user.schoolId);
    const schoolCode = schoolData ? schoolData.schoolCode : '';
    const schoolName = schoolData ? schoolData.name : '';

    teacher = await Teacher.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'teacher',
      schoolId: req.user.schoolId,
      schoolCode,
      schoolName,
      employeeId: employeeId?.trim() || undefined,
      classTeacherOf,
      ...rest,
    });

    if (classTeacherOf) {
      await Class.findByIdAndUpdate(classTeacherOf, { classTeacherId: teacher._id });
    }

    if (req.body.assignedSubjectStandards) {
      const { redistributeTeacherAssignments } = require('../utils/assignmentHelper');
      await redistributeTeacherAssignments(req.user.schoolId);
      // Fetch the updated teacher record
      teacher = await Teacher.findById(teacher._id)
        .populate('subjectIds')
        .populate('classIds')
        .populate({
          path: 'subjectClassAssignments.subjectId',
          select: 'name code'
        })
        .populate({
          path: 'subjectClassAssignments.classId',
          select: 'standard division'
        });
    }

    res.status(201).json({
      message: 'Teacher created successfully',
      teacher,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const missingFields = Object.keys(error.errors).map(key => error.errors[key].message);
      return res.status(400).json({ message: `Validation Error: ${missingFields.join(', ')}` });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Database constraint duplicate error. Please ensure unique email/staffCode details.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update Teacher
exports.updateTeacher = async (req, res) => {
  try {
    // Do not allow form data to overwrite ownership or generated identifiers.
    delete req.body._id;
    delete req.body.teacherId;
    delete req.body.schoolId;
    delete req.body.role;
    const clearEmployeeId = req.body.employeeId !== undefined && !String(req.body.employeeId).trim();
    if (clearEmployeeId) {
      delete req.body.employeeId;
    } else if (req.body.employeeId !== undefined) {
      req.body.employeeId = req.body.employeeId.trim();
    }

    if (req.body.isClassTeacher !== undefined) {
      if (req.body.isClassTeacher && req.body.classTeacherStandard && req.body.classTeacherDivision) {
        req.body.classTeacherOf = await resolveClassId(
          req.user.schoolId,
          req.body.classTeacherStandard,
          req.body.classTeacherDivision
        );
      } else if (!req.body.isClassTeacher) {
        req.body.classTeacherOf = null;
      }
    }

    if (req.body.password) {
      const { hashPassword } = require('../utils/password');
      req.body.password = await hashPassword(req.body.password);
    } else {
      delete req.body.password;
    }

    const School = require('../models/School');
    const schoolData = await School.findById(req.user.schoolId);
    if (schoolData) {
      req.body.schoolCode = schoolData.schoolCode;
      req.body.schoolName = schoolData.name;
    }

    const update = clearEmployeeId
      ? { $set: req.body, $unset: { employeeId: 1 } }
      : req.body;

    let teacher = await Teacher.findOneAndUpdate(
      getTeacherLookup(req.params.id, req.user.schoolId),
      update,
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (teacher.classTeacherOf) {
      await Class.findByIdAndUpdate(teacher.classTeacherOf, { classTeacherId: teacher._id });
    }

    if (req.body.assignedSubjectStandards) {
      const { redistributeTeacherAssignments } = require('../utils/assignmentHelper');
      await redistributeTeacherAssignments(req.user.schoolId);
    }

    // Re-fetch populated teacher details
    teacher = await Teacher.findById(teacher._id)
      .populate('subjectIds')
      .populate('classIds')
      .populate('classTeacherOf')
      .populate({
        path: 'subjectClassAssignments.subjectId',
        select: 'name code'
      })
      .populate({
        path: 'subjectClassAssignments.classId',
        select: 'standard division'
      });

    res.json({
      message: 'Teacher updated successfully',
      teacher,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Teacher
exports.deleteTeacher = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only administrators can delete teachers.' });
    }

    const teacher = await Teacher.findOneAndDelete(
      getTeacherLookup(req.params.id, req.user.schoolId)
    );

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (teacher.classTeacherOf) {
      await Class.findByIdAndUpdate(teacher.classTeacherOf, { $unset: { classTeacherId: 1 } });
    }

    // Clean up uploaded documents in Cloudinary
    try {
      const { deleteCloudinaryFile } = require('../utils/cloudinaryHelper');
      if (teacher.photo) {
        await deleteCloudinaryFile(teacher.photo);
      }
      if (teacher.documents) {
        for (const key of Object.keys(teacher.documents)) {
          const docUrl = teacher.documents[key];
          if (docUrl) {
            await deleteCloudinaryFile(docUrl);
          }
        }
      }
    } catch (cldErr) {
      console.error('Cloudinary cleanup error during teacher delete:', cldErr);
    }

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign Subject to Teacher
exports.assignSubject = async (req, res) => {
  try {
    const { subjectId } = req.body;

    const teacher = await Teacher.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user.schoolId },
      { $addToSet: { subjectIds: subjectId } },
      { new: true }
    ).populate('subjectIds');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({
      message: 'Subject assigned successfully',
      teacher,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign Class to Teacher
exports.assignClass = async (req, res) => {
  try {
    const { classId } = req.body;

    const teacher = await Teacher.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user.schoolId },
      { $addToSet: { classIds: classId } },
      { new: true }
    ).populate('classIds');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({
      message: 'Class assigned successfully',
      teacher,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Make Class Teacher
exports.makeClassTeacher = async (req, res) => {
  try {
    const { classId } = req.body;

    const teacher = await Teacher.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user.schoolId },
      {
        isClassTeacher: true,
        classTeacherOf: classId,
      },
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({
      message: 'Class teacher assigned successfully',
      teacher,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
