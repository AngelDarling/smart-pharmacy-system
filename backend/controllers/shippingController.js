import Shipment from "../models/Shipment.js";
import Order from "../models/Order.js";

function simulate(shipment) {
  const minutes = (Date.now() - new Date(shipment.createdAt).getTime()) / 60000;
  if (minutes < 2) {
    return { status: "pickup", timeline: shipment.timeline };
  }
  if (minutes < 5) {
    const tl = [...shipment.timeline];
    if (!tl.find((t) => t.status === "shipping")) tl.push({ status: "shipping", timestamp: new Date() });
    return { status: "shipping", timeline: tl };
  }
  const tl = [...shipment.timeline];
  if (!tl.find((t) => t.status === "shipping")) {
    tl.push({ status: "shipping", timestamp: new Date(new Date(shipment.createdAt).getTime() + 2 * 60000) });
  }
  if (!tl.find((t) => t.status === "delivered")) tl.push({ status: "delivered", timestamp: new Date() });
  return { status: "delivered", timeline: tl };
}

export async function trackShipment(req, res) {
  try {
    const { code } = req.params;
    let shipment = await Shipment.findOne({ shippingCode: code });
    if (!shipment) {
      // Fallback: support tracking by order code (ORD...)
      const order = await Order.findOne({ code }).select("shipment");
      if (!order || !order.shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      shipment = await Shipment.findById(order.shipment);
      if (!shipment) return res.status(404).json({ message: "Shipment not found" });
    }

    if (shipment.status !== "delivered") {
      const { status, timeline } = simulate(shipment);
      shipment.status = status;
      shipment.timeline = timeline;

      if (status === "delivered") {
        await Order.findByIdAndUpdate(shipment.orderId, { status: "completed" });
      }
      await shipment.save();
    }

    res.json(shipment);
  } catch (e) {
    console.error("Error tracking shipment:", e);
    res.status(500).json({ message: "Internal server error" });
  }
}


