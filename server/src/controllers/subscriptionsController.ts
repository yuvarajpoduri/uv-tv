import { Response } from "express";
import Subscription from "../models/Subscription.js";
import { AuthRequest } from "../middleware/auth.js";

export async function getSubscriptions(req: AuthRequest, res: Response) {
  const subs = await Subscription.find({ userId: req.userId }).sort({ name: 1 });
  res.json(subs);
}

export async function addSubscription(req: AuthRequest, res: Response) {
  const { name, planName, cost, billingCycle, renewalDate, active, notes } = req.body;
  if (!name) {
    res.status(400).json({ message: "Subscription name is required" });
    return;
  }

  const sub = await Subscription.create({
    userId: req.userId,
    name,
    planName,
    cost: cost || 0,
    billingCycle: billingCycle || "monthly",
    renewalDate,
    active: active !== undefined ? active : true,
    notes
  });

  res.status(201).json(sub);
}

export async function updateSubscription(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const sub = await Subscription.findOne({ _id: id, userId: req.userId });
  if (!sub) {
    res.status(404).json({ message: "Subscription not found" });
    return;
  }

  const { name, planName, cost, billingCycle, renewalDate, active, notes } = req.body;
  if (name) sub.name = name;
  if (planName !== undefined) sub.planName = planName;
  if (cost !== undefined) sub.cost = cost;
  if (billingCycle) sub.billingCycle = billingCycle;
  if (renewalDate !== undefined) sub.renewalDate = renewalDate;
  if (active !== undefined) sub.active = active;
  if (notes !== undefined) sub.notes = notes;

  await sub.save();
  res.json(sub);
}

export async function deleteSubscription(req: AuthRequest, res: Response) {
  const { id } = req.params;
  await Subscription.findOneAndDelete({ _id: id, userId: req.userId });
  res.json({ message: "Subscription deleted" });
}
