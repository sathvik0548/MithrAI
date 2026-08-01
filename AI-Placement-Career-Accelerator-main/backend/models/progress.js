import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    date: {
        type: Date,
        default: Date.now,
    },

    atsScore: {
        type: Number,
        default: 0,
    },

    interviewScore: {
        type: Number,
        default: 0,
    },

});

export default mongoose.model("Progress", progressSchema);