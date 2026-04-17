import { Router, type IRouter } from "express";
import healthRouter from "./health";
import channelsRouter from "./channels";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(channelsRouter);
router.use(usersRouter);

export default router;
