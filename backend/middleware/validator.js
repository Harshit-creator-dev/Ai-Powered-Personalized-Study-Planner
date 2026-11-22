/**
 * Input Validation Middleware for Study Plan Requirements
 */
const validatePlanInput = (req, res, next) => {
  const { subjects, planningStartDate, planningEndDate, availableHoursPerDay } = req.body;

  const errors = [];

  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    errors.push('At least one subject must be specified.');
  } else {
    subjects.forEach((subj, idx) => {
      if (!subj.name || typeof subj.name !== 'string' || subj.name.trim() === '') {
        errors.push(`Subject at position ${idx + 1} must have a valid non-empty name.`);
      }
    });
  }

  if (!planningStartDate || !planningEndDate) {
    errors.push('Both planning start date and end date are mandatory.');
  } else {
    const sDate = new Date(planningStartDate);
    const eDate = new Date(planningEndDate);
    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
      errors.push('Start date and end date must be valid dates in YYYY-MM-DD format.');
    } else if (sDate > eDate) {
      errors.push('Planning start date cannot be later than planning end date.');
    }
  }

  if (availableHoursPerDay === undefined || availableHoursPerDay === null) {
    errors.push('Available study hours per day is required.');
  } else {
    const hours = Number(availableHoursPerDay);
    if (isNaN(hours) || hours <= 0 || hours > 16) {
      errors.push('Available study hours per day must be a realistic number between 1 and 16 hours.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for study plan requirements.',
      errors,
    });
  }

  next();
};

module.exports = {
  validatePlanInput,
};
