import { Router } from "express";
import ctrl from "../controllers/user";
import { isAuthenticated, upload } from "../middlewares";

const router = Router();

router.get("/me", isAuthenticated, ctrl.getMe);

router.get("/tokens", isAuthenticated, ctrl.getTokens);

router.put(
  "/update",
  isAuthenticated,
  upload.single("avatar"),
  ctrl.updateUser
);

router.delete("/delete", isAuthenticated, ctrl.deleteUser);

export default router;
