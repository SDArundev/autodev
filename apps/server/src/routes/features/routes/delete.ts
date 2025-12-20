/**
 * POST /delete endpoint - Delete a feature
 */

import type { Request, Response } from "express";
import { FeatureLoader } from "../../../services/feature-loader.js";
import { getErrorMessage, logError } from "../common.js";
import { validatePath, PathNotAllowedError } from "../../../lib/security.js";

export function createDeleteHandler(featureLoader: FeatureLoader) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectPath, featureId } = req.body as {
        projectPath: string;
        featureId: string;
      };

      if (!projectPath || !featureId) {
        res
          .status(400)
          .json({
            success: false,
            error: "projectPath and featureId are required",
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

      const success = await featureLoader.delete(projectPath, featureId);
      res.json({ success });
    } catch (error) {
      logError(error, "Delete feature failed");
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  };
}
