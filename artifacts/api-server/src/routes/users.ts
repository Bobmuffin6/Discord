import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"] as string | undefined;
  const userId = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  req.userName = (req.headers["x-user-name"] as string) || "Anonymous";
  next();
};

router.get("/users/me", requireAuth, async (req: any, res): Promise<void> => {
  const user = await db.select().from(usersTable).where(eq(usersTable.id, req.userId)).then((r: any[]) => r[0]);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    clerkId: user.clerkId,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
  });
});

router.post("/users/me/sync", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId;
  const name = req.userName;

  const [user] = await db.insert(usersTable).values({
    id: userId,
    clerkId: userId,
    name,
    email: "",
    avatar: null,
  }).onConflictDoUpdate({
    target: usersTable.clerkId,
    set: { name },
  }).returning();

  res.json({
    id: user.id,
    clerkId: user.clerkId,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
  });
});

export default router;
