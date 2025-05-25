import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { firstName, lastName, email, message } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    try {
      // Create nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Email options
      const mailOptions = {
        from: `Email: ${email}`,
        to: `"ETHIO-CPRMS Contact" <${process.env.EMAIL_USER}>`, // Your support email
        replyTo: email, // User's email for replies
        subject: `New Contact Form Submission from ${firstName} ${lastName}`,
        text: `
          Name: ${firstName} ${lastName}
          Email: ${email}
          Message: ${message}
        `,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong> ${message}</p>
        `,
      };

      // Send email
      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res
        .status(500)
        .json({ error: "Failed to send message. Please try again." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
