import { documentService } from '../services/documentService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';

export const documentController = {
  getUserDocuments: asyncHandler(async (req, res) => {
    const documents = await documentService.getUserDocuments(req.user.id, req.user.role, req.query);
    return sendSuccess(res, 'Vault documents retrieved successfully', documents);
  }),

  uploadDocument: asyncHandler(async (req, res) => {
    const newDoc = await documentService.uploadDocument(req.user, req.body);
    return sendCreated(res, 'Document uploaded and digitally verified in vault', newDoc);
  }),

  getDocumentById: asyncHandler(async (req, res) => {
    const doc = await documentService.getDocumentById(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, 'Document details retrieved successfully', doc);
  }),

  deleteDocument: asyncHandler(async (req, res) => {
    const result = await documentService.deleteDocument(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, result.message, result);
  }),

  verifyDocument: asyncHandler(async (req, res) => {
    const doc = await documentService.verifyDocument(
      req.params.id,
      req.user,
      req.body.status,
      req.body.verificationNotes
    );
    return sendSuccess(res, `Document status updated to ${req.body.status}`, doc);
  }),

  getVaultStats: asyncHandler(async (req, res) => {
    const stats = await documentService.getVaultStats(req.user.id, req.user.role);
    return sendSuccess(res, 'Vault statistics retrieved successfully', stats);
  }),
};

export default documentController;
