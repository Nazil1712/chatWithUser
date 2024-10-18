const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: {
      type: String,
      default: new Date().getHours() + ":" + new Date().getMinutes(),
    },
  },
  {
    toJSON: {
      versionKey: false,
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
      },
    },
  }
);

messageSchema.virtual("id").get(function () {
  return this._id;
});

module.exports = mongoose.model("Message", messageSchema);
