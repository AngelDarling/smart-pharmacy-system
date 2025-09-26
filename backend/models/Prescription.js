import mongoose from "mongoose";

const prescriptionItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true },
    note: { type: String }
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    doctorName: { type: String },
    diagnosis: { type: String },
    date: { type: Date, default: Date.now },
    fileUrl: { type: String },
    items: { type: [prescriptionItemSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);


