import { Router, type IRouter } from "express";
import { db, channelsTable, messagesTable } from "@workspace/db";
import {
  CreateChannelBody,
  GetChannelParams,
  GetChannelMessagesParams,
  GetChannelMessagesQueryParams,
  SendMessageParams,
  SendMessageBody,
  GetChannelStatsParams,
} from "@workspace/api-zod";
import { eq, desc, count, sql } from "drizzle-orm";
import { broadcastToChannel } from "../lib/wsBroadcast";

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

router.get("/channels", async (_req, res): Promise<void> => {
  const channels = await db.select().from(channelsTable).orderBy(channelsTable.createdAt);
  res.json(channels.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    createdAt: c.createdAt,
  })));
});

router.post("/channels", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateChannelBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [channel] = await db.insert(channelsTable).values(parsed.data).returning();
  res.status(201).json({
    id: channel.id,
    name: channel.name,
    description: channel.description,
    createdAt: channel.createdAt,
  });
});

router.get("/channels/:id", async (req, res): Promise<void> => {
  const params = GetChannelParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [channel] = await db.select().from(channelsTable).where(eq(channelsTable.id, params.data.id));
  if (!channel) {
    res.status(404).json({ error: "Channel not found" });
    return;
  }
  res.json({
    id: channel.id,
    name: channel.name,
    description: channel.description,
    createdAt: channel.createdAt,
  });
});

router.get("/channels/:id/messages", async (req, res): Promise<void> => {
  const params = GetChannelMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const query = GetChannelMessagesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const limit = query.data.limit ?? 50;
  const before = query.data.before;

  const messages = await db
    .select()
    .from(messagesTable)
    .where(
      before != null
        ? sql`${messagesTable.channelId} = ${params.data.id} AND ${messagesTable.id} < ${before}`
        : eq(messagesTable.channelId, params.data.id)
    )
    .orderBy(desc(messagesTable.createdAt))
    .limit(limit);
  res.json(messages.reverse().map((m: any) => ({
    id: m.id,
    channelId: m.channelId,
    content: m.content,
    userId: m.userId,
    userName: m.userName,
    userAvatar: m.userAvatar,
    createdAt: m.createdAt,
  })));
});

router.post("/channels/:id/messages", requireAuth, async (req: any, res): Promise<void> => {
  const params = SendMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = SendMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [channel] = await db.select().from(channelsTable).where(eq(channelsTable.id, params.data.id));
  if (!channel) {
    res.status(404).json({ error: "Channel not found" });
    return;
  }

  const [message] = await db.insert(messagesTable).values({
    channelId: params.data.id,
    content: body.data.content,
    userId: req.userId,
    userName: req.userName,
    userAvatar: null,
  }).returning();

  const responseMsg = {
    id: message.id,
    channelId: message.channelId,
    content: message.content,
    userId: message.userId,
    userName: message.userName,
    userAvatar: message.userAvatar,
    createdAt: message.createdAt,
  };

  broadcastToChannel(params.data.id, { type: "new_message", message: responseMsg });

  res.status(201).json(responseMsg);
});

router.get("/channels/:id/stats", async (req, res): Promise<void> => {
  const params = GetChannelStatsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [totalMessagesResult] = await db.select({ count: count() }).from(messagesTable).where(eq(messagesTable.channelId, params.data.id));
  const [totalMembersResult] = await db.select({ count: sql<number>`count(distinct ${messagesTable.userId})` }).from(messagesTable).where(eq(messagesTable.channelId, params.data.id));
  const [recentResult] = await db.select({ count: count() }).from(messagesTable).where(
    sql`${messagesTable.channelId} = ${params.data.id} AND ${messagesTable.createdAt} > now() - interval '24 hours'`
  );

  res.json({
    totalMessages: Number(totalMessagesResult?.count ?? 0),
    totalMembers: Number(totalMembersResult?.count ?? 0),
    recentMessages: Number(recentResult?.count ?? 0),
  });
});

export default router;
