/**
 * POST /update endpoint - Update a feature
 */

import type { Request, Response } from "express";
import {
  FeatureLoader,
  type Feature,
} from "../../../services/feature-loader.js";
import { getErrorMessage, logError } from "../common.js";
import { validatePath, PathNotAllowedError } from "../../../lib/security.js";

export function createUpdateHandler(featureLoader: FeatureLoader) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectPath, featureId, updates } = req.body as {
        projectPath: string;
        featureId: string;
        updates: Partial<Feature>;
      };

      if (!projectPath || !featureId || !updates) {
        res.status(400).json({
          success: false,
          error: "projectPath, featureId, and updates are required",
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

      const updated = await featureLoader.update(
        projectPath,
        featureId,
        updates
      );
      res.json({ success: true, feature: updated });
    } catch (error) {
      logError(error, "Update feature failed");
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  };
}
