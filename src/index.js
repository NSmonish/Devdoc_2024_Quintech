const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/profile", (req, res) => {
  res.render("profile");
});

app.get("/assesments", (req, res) => {
  res.render("assesments");
});

app.get("/community", (req, res) => {
  res.render("community");
});

app.get("/home", (req, res) => {
  res.render("home");
});
app.get("/selfhelp", (req, res) => {
  res.render("selfhelp");
});
app.get("/therapy", (req, res) => {
  res.render("therapy");
});

app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.username,
    password: req.body.password,
  };
  try {
    const existingUser = await collection.UserModel.findOne({
      name: data.name,
    });
    if (existingUser) {
      res.send("User already exists. Please choose a different username.");
    } else {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);
      data.password = hashedPassword;
      const userData = await collection.UserModel.insertMany(data);
      console.log(userData);
      res.redirect("/");
    }
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await collection.UserModel.findOne({
      name: req.body.username,
    });
    if (!user) {
      res.send("Username not found");
    } else {
      const isPasswordMatch = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (isPasswordMatch) {
        res.render("home");
      } else {
        res.send("Wrong password");
      }
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/assesments", (req, res) => {
  const data = {
    day: req.body.day,
    time: req.body.time,
    mood: req.body.mood,
    activity: req.body.activity,
  };
  const args = Object.values(data);
  const pythonProcess = spawn("python", ["daily_tracker.py", ...args]);
  let dataFromPython = "";

  pythonProcess.stdout.on("data", (data) => {
    dataFromPython += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    res.send(`Result from Python script: ${dataFromPython}`);
  });
  pythonProcess.on("error", (err) => {
    console.error(`Error spawning Python process: ${err}`);
  });
});

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sankararthy99@gmail.com",
    pass: "pass",
  },
});

function generateGoogleMeetLink() {
  const meetLink = `https://meet.google.com/${generateRandomString()}`;
  return meetLink;
}

function generateRandomString(length = 10) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return randomString;
}

app.post("/therapy", async (req, res) => {
  const { name, date, slot } = req.body;

  if (!name || !date || !slot) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const existingEntry = await collection.TherapistModel.findOne({
      name,
      date,
      slot,
    });

    if (existingEntry) {
      console.log(
        `Therapist ${name} is not available on ${date} at slot ${slot}. Please choose another slot.`
      );
      return res.status(409).json({ message: "Slot unavailable" });
    } else {
      const newTherapist = new collection.TherapistModel({
        name,
        date,
        slot,
        availability: false,
        email_id: "arthy.2022@vitstudent.ac.in",
      });

      await newTherapist.save();

      const meetLink = generateGoogleMeetLink();

      const therapistEmail = await collection.TherapistModel.findOne({
        name,
        date,
        slot,
      }).select("email_id");

      const mailOptions = {
        from: "sankararthy99@gmail.com",
        to: therapistEmail,
        subject: "Appointment Booking Confirmation",
        text: `Dear Therapist,

Your appointment has been successfully booked for ${date} at slot ${slot}.
Please join the Google Meet using the following link:
${meetLink}

Best regards,
Your App`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });

      console.log(
        `Therapist ${name} is available on ${date} at slot ${slot}. Booking confirmed!`
      );
      return res.status(201).json({ message: "Booking successful!" });
    }
  } catch (error) {
    console.error("Error booking therapist:", error);
    return res
      .status(500)
      .json({ message: error.message || "Error booking therapist" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
