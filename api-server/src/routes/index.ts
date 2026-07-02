import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import botRouter from "./bot";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/bot", botRouter);

export default router;
