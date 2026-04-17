import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import {
  useListChannels,
  useGetChannelMessages,
  useSendMessage,
  useCreateChannel,
  getGetChannelMessagesQueryKey,
  getListChannelsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Hash, LogOut, Plus, Send, Pencil, X, Check } from "lucide-react";

interface WSMessage {
  type: "new_message";
  message: {
    id: number;
    channelId: number;
    content: string;
    userId: string;
    userName: string;
    userAvatar: string | null;
    createdAt: string;
  };
}

function getWsUrl() {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws`;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = ["#5865F2", "#eb459e", "#57f287", "#e67e22", "#ed4245", "#fee75c"];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: colors[colorIndex], fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

function EditUsernameModal({
  currentName,
  onClose,
  onSave,
}: {
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [value, setValue] = useState(currentName);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) { setError("Name can't be empty"); return; }
    if (trimmed.length < 2) { setError("Name must be at least 2 characters"); return; }
    if (trimmed === currentName) { onClose(); return; }
    onSave(trimmed);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#313338] rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden border border-[#1e1f22]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#3f4147]">
          <h2 className="text-white font-bold text-lg">Edit Username</h2>
          <button onClick={onClose} className="text-[#949ba4] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-5">
          <label className="block text-xs font-semibold text-[#949ba4] uppercase tracking-wider mb-2">
            Display Name
          </label>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            maxLength={32}
            className="w-full bg-[#1e1f22] border border-[#3f4147] rounded-lg px-3 py-2.5 text-[#dbdee1] text-sm outline-none focus:border-[#5865F2] transition-colors placeholder:text-[#4e5058]"
            placeholder="Enter a display name..."
          />
          {error && <p className="text-[#ed4245] text-xs mt-2">{error}</p>}
          <p className="text-[#949ba4] text-xs mt-2">{value.trim().length}/32</p>
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#dbdee1] bg-transparent hover:bg-[#35373c] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!value.trim()}
            className="px-4 py-2 text-sm text-white bg-[#5865F2] hover:bg-[#4752c4] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
          >
            <Check size={14} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatApp() {
  const { user, signOut, updateName } = useAuth();
  const queryClient = useQueryClient();
  const [activeChannelId, setActiveChannelId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [showEditUsername, setShowEditUsername] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const createChannel = useCreateChannel({
    mutation: {
      onSuccess: () => {
        setNewChannelName("");
        setShowCreateChannel(false);
        queryClient.invalidateQueries({ queryKey: getListChannelsQueryKey() });
      },
    },
  });

  const { data: channels = [] } = useListChannels();
  const { data: messages = [], isLoading: messagesLoading } = useGetChannelMessages(
    activeChannelId ?? 0,
    undefined,
    {
      query: {
        enabled: !!activeChannelId,
      } as any,
    }
  );
  const sendMessage = useSendMessage();

  // Set default channel
  useEffect(() => {
    if (channels.length > 0 && activeChannelId === null) {
      setActiveChannelId(channels[0].id);
    }
  }, [channels]);

  // WebSocket connection
  useEffect(() => {
    if (!activeChannelId) return;
    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", channelId: activeChannelId }));
    };
    ws.onmessage = (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data);
        if (data.type === "new_message" && data.message.channelId === activeChannelId) {
          queryClient.setQueryData(
            getGetChannelMessagesQueryKey(activeChannelId, undefined),
            (old: any[] | undefined) => [...(old ?? []), data.message]
          );
        }
      } catch {
        // ignore
      }
    };
    return () => { ws.close(); wsRef.current = null; };
  }, [activeChannelId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim() || !activeChannelId) return;
    const content = messageText.trim();
    setMessageText("");
    sendMessage.mutate({ id: activeChannelId, data: { content } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateChannel = () => {
    const name = newChannelName.trim().toLowerCase().replace(/\s+/g, "-");
    if (!name) return;
    createChannel.mutate({ data: { name } });
  };

  const displayName = user?.name || "User";
  const activeChannel = channels.find((c) => c.id === activeChannelId);

  type MsgType = typeof messages[0];
  const groupedMessages: { date: string; messages: MsgType[] }[] = [];
  let currentDate = "";
  for (const msg of messages) {
    const dateStr = formatDate(String(msg.createdAt));
    if (dateStr !== currentDate) {
      currentDate = dateStr;
      groupedMessages.push({ date: dateStr, messages: [] });
    }
    groupedMessages[groupedMessages.length - 1].messages.push(msg);
  }

  return (
    <div className="flex h-dvh bg-[#313338] text-[#dbdee1] overflow-hidden">
      {showEditUsername && (
        <EditUsernameModal
          currentName={displayName}
          onClose={() => setShowEditUsername(false)}
          onSave={updateName}
        />
      )}

      {/* Server icon strip */}
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 flex-shrink-0">
        <div className="w-12 h-12 bg-[#5865F2] rounded-full flex items-center justify-center hover:rounded-2xl transition-all duration-200 cursor-pointer">
          <img src="/logo.svg" alt="Server" className="w-7 h-7" />
        </div>
        <div className="w-8 h-[2px] bg-[#3f4147] rounded-full my-1" />
      </div>

      {/* Channel list */}
      <div className="w-60 bg-[#2b2d31] flex flex-col flex-shrink-0">
        <div className="h-12 flex items-center px-4 border-b border-[#1e1f22] shadow-sm">
          <h1 className="font-bold text-white text-base flex-1 truncate">My Server</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-semibold text-[#949ba4] uppercase tracking-wider">
              Text Channels
            </span>
            <button
              onClick={() => setShowCreateChannel(!showCreateChannel)}
              className="text-[#949ba4] hover:text-[#dbdee1] transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {showCreateChannel && (
            <div className="mb-2 px-1">
              <input
                autoFocus
                type="text"
                placeholder="new-channel"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateChannel();
                  if (e.key === "Escape") { setShowCreateChannel(false); setNewChannelName(""); }
                }}
                className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm px-3 py-1.5 rounded border border-[#5865F2] outline-none placeholder:text-[#4e5058]"
              />
              <p className="text-[10px] text-[#949ba4] mt-1 px-1">Enter to create, Esc to cancel</p>
            </div>
          )}

          <div className="space-y-0.5">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannelId(channel.id)}
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-sm transition-colors text-left group ${
                  activeChannelId === channel.id
                    ? "bg-[#404249] text-white"
                    : "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"
                }`}
              >
                <Hash size={16} className="flex-shrink-0" />
                <span className="truncate">{channel.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User panel */}
        <div className="h-14 bg-[#232428] flex items-center px-2 gap-2 flex-shrink-0">
          <Avatar name={displayName} size={32} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 group">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <button
                onClick={() => setShowEditUsername(true)}
                title="Edit username"
                className="text-[#949ba4] hover:text-[#dbdee1] transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
              >
                <Pencil size={12} />
              </button>
            </div>
            <p className="text-xs text-[#23a55a]">Online</p>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="text-[#949ba4] hover:text-[#dbdee1] transition-colors p-1 rounded hover:bg-[#35373c]"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-12 flex items-center px-4 border-b border-[#1e1f22] shadow-sm flex-shrink-0 gap-2">
          {activeChannel ? (
            <>
              <Hash size={18} className="text-[#949ba4] flex-shrink-0" />
              <span className="font-bold text-white">{activeChannel.name}</span>
              {(activeChannel as any).description && (
                <>
                  <div className="w-px h-5 bg-[#3f4147] mx-1" />
                  <span className="text-[#949ba4] text-sm truncate">{(activeChannel as any).description}</span>
                </>
              )}
            </>
          ) : (
            <span className="text-[#949ba4] text-sm">Select a channel</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!activeChannelId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Hash size={48} className="text-[#3f4147] mx-auto mb-3" />
                <p className="text-[#949ba4] text-lg font-semibold">No channel selected</p>
                <p className="text-[#4e5058] text-sm mt-1">Pick a channel from the sidebar to start chatting</p>
              </div>
            </div>
          ) : messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-[#5865F2] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Hash size={48} className="text-[#3f4147] mx-auto mb-3" />
                <p className="text-[#949ba4] text-lg font-semibold">#{activeChannel?.name}</p>
                <p className="text-[#4e5058] text-sm mt-1">This is the start of #{activeChannel?.name}</p>
              </div>
            </div>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-[#3f4147]" />
                  <span className="text-xs font-semibold text-[#949ba4] whitespace-nowrap">{group.date}</span>
                  <div className="flex-1 h-px bg-[#3f4147]" />
                </div>
                {group.messages.map((msg, idx) => {
                  const prev = group.messages[idx - 1];
                  const isGrouped =
                    prev &&
                    prev.userId === msg.userId &&
                    new Date(String(msg.createdAt)).getTime() - new Date(String(prev.createdAt)).getTime() < 5 * 60 * 1000;

                  if (isGrouped) {
                    return (
                      <div
                        key={msg.id}
                        className="group flex items-start gap-4 hover:bg-[#2e3035] px-4 py-0.5 -mx-4 rounded"
                      >
                        <div className="w-10 flex-shrink-0 flex items-center justify-end">
                          <span className="text-[10px] text-[#949ba4] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {formatTime(String(msg.createdAt))}
                          </span>
                        </div>
                        <p className="text-[#dbdee1] leading-relaxed break-words flex-1">{msg.content}</p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className="flex items-start gap-4 hover:bg-[#2e3035] px-4 py-1 -mx-4 rounded mt-3 first:mt-0 group"
                    >
                      <Avatar name={msg.userName} size={40} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
                          <span className="font-semibold text-white text-sm">{msg.userName}</span>
                          <span className="text-[10px] text-[#949ba4]">{formatTime(String(msg.createdAt))}</span>
                        </div>
                        <p className="text-[#dbdee1] leading-relaxed break-words">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="px-4 pb-6 pt-2 flex-shrink-0">
          <div className="flex items-center bg-[#383a40] rounded-lg px-4 gap-3">
            <input
              ref={inputRef}
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                !activeChannelId
                  ? "Select a channel first..."
                  : `Message #${activeChannel?.name ?? ""}`
              }
              disabled={!activeChannelId}
              className="flex-1 bg-transparent py-3 text-[#dbdee1] placeholder:text-[#4e5058] outline-none text-sm disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!messageText.trim() || !activeChannelId}
              className="text-[#949ba4] hover:text-[#dbdee1] disabled:opacity-30 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
