import { Schema, model, Document, Types } from "mongoose";

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  name: string;
  planName?: string;
  cost?: number;
  billingCycle?: "monthly" | "yearly";
  renewalDate?: Date;
  active: boolean;
  notes?: string;
  createdAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    planName: { type: String, default: "" },
    cost: { type: Number, default: 0 },
    billingCycle: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    renewalDate: { type: Date },
    active: { type: Boolean, default: true },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

export default model<ISubscription>("Subscription", subscriptionSchema);
