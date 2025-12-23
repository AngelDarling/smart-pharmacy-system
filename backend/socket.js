import { Server } from "socket.io";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join", async ({ sessionId }) => {
      socket.join(sessionId);
      console.log(`User joined room: ${sessionId}`);
    });

    socket.on("admin_join", () => {
      socket.join("admins");
      console.log("Admin joined admin room");
    });

    socket.on("send_message", async ({ sessionId, text, senderId, senderType, customerName }) => {
      let conversation = await Conversation.findOne({ sessionId });
      
      // Lazy create conversation on first message
      if (!conversation) {
        const guestNumber = Math.floor(1000 + Math.random() * 9000);
        conversation = await Conversation.create({
          sessionId,
          customerName: customerName || `Khách hàng ${guestNumber}`,
          lastMessage: text,
          status: "open"
        });
        console.log(`Lazy created conversation: ${conversation.customerName} (${sessionId})`);
        // Notify admins that a new active conversation exists
        io.to("admins").emit("new_conversation", conversation);
      }

      // Re-open conversation if customer sends a new message to a closed chat
      if (senderType === "customer" && conversation.status === "closed") {
        conversation.status = "open";
      }

      const message = await Message.create({
        conversationId: conversation._id,
        senderId,
        senderType,
        text
      });

      conversation.lastMessage = text;
      if (senderType === "customer") {
        conversation.unreadCount += 1;
      } else {
        conversation.unreadCount = 0;
      }
      await conversation.save();

      // Emit to the specific user's room
      io.to(sessionId).emit("receive_message", message);
      
      // Notify admins
      io.to("admins").emit("admin_receive_message", { sessionId, message, conversation });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};
