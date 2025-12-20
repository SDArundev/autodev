/**
 * POST /create endpoint - Create a new feature
 */

import type { Request, Response } from "express";
import {
  FeatureLoader,
  type Feature,
} from "../../../services/feature-loader.js";
import { validatePath, PathNotAllowedError } from "../../../lib/security.js";
import { getErrorMessage, logError } from "../common.js";

export function createCreateHandler(featureLoader: FeatureLoader) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectPath, feature } = req.body as {
        projectPath: string;
        feature: Partial<Feature>;
      };

      if (!projectPath || !feature) {
        res
          .status(400)
          .json({
            success: false,
            error: "projectPath and feature are required",
          });
        return;
      }

      // Validate path is within ALLOWED_ROOT_DIRECTORY
      try {
        validatePath(projectPath);
      } catch (error) {
        if (error instanceof PathNotAllowedError) {
          res.status(403).json({
            success: false,
            error: error.message,
          });
          return;
        }
        throw error;
      }

      const created = await featureLoader.create(projectPath, feature);
      res.json({ success: true, feature: created });
    } catch (error) {
      logError(error, "Create feature failed");
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  };
}
