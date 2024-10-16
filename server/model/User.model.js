const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    socketId: { type: String},
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

userSchema.virtual('id').get(function () {
  return this._id;
});

module.exports = mongoose.model("User", userSchema);
