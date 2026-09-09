import { projectService } from '../services/projectService.js';

export const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getProjects(req.query);
    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.user, req.body);
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.user, req.body);
    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const enrollLandInProject = async (req, res, next) => {
  try {
    const project = await projectService.enrollLandInProject(req.params.id, req.user, req.body);
    res.status(200).json({
      success: true,
      message: 'Land parcel enrolled into project successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMilestone = async (req, res, next) => {
  try {
    const project = await projectService.updateMilestone(
      req.params.id,
      Number(req.params.milestoneIndex),
      req.user,
      req.body
    );
    res.status(200).json({
      success: true,
      message: 'Project milestone updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectStats = async (req, res, next) => {
  try {
    const stats = await projectService.getProjectStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
