const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderModel", // Dynamically reference User or Lawyer
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["User", "Lawyer"], // Specify valid models
    },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    readBy: [
      {
        participantId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        participantModel: {
          type: String,
          required: true,
          enum: ["User", "Lawyer"],
        },
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;