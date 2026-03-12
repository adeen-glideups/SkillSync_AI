const {asyncHandler} = require('../../../shared/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../../shared/utils/response');
const service = require('../services/easyApplyService');

const getPrefill = asyncHandler(async (req, res) => {
  const jobId = parseInt(req.params.jobId);
  const data = await service.getPrefillData(req.user.userId, req.user.email, jobId);
  sendSuccess(res, data, 'Prefill data fetched successfully');
});

const saveContact = asyncHandler(async (req, res) => {
  const saved = await service.saveContactInfo(req.user.userId, req.body);
  sendSuccess(res, saved, 'Contact info saved successfully');
});

const submitApplication = asyncHandler(async (req, res) => {
  const jobId = parseInt(req.params.jobId);
  const result = await service.submitApplication(
    req.user.userId,
    req.user.email,
    jobId,
    req.body
  );
  sendCreated(res, result, 'Application submitted successfully');
});

const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await service.getUserApplications(req.user.userId);
  sendSuccess(res, { applications }, 'Applications fetched successfully');
});

module.exports = { getPrefill, saveContact, submitApplication, getMyApplications };
