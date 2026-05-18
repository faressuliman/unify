import { Router } from "express";
import ContactMessage from "../../DB/models/contactMessage.model.js";
import { asynchandler } from "../../utils/globalErrorHandling/index.js";

const contactRouter = Router();

contactRouter.post(
  "/",
  asynchandler(async (req, res, next) => {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return next(new Error("All fields are required", { cause: 400 }));
    }

    const newMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    return res.status(201).json({ message: "Message sent successfully", data: newMessage });
  })
);

export default contactRouter;
