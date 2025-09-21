import { mongoose } from "mongoose";

const taskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  endAt: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return !this.createdAt || value > this.createdAt;
      },
      message: "Bitiş tarihi, oluşturulma tarihinden sonra olmalıdır.",
    },
  },
  priority: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Task", taskSchema);
