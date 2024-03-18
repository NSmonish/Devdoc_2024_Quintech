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

app.get("/", (req, res) => {
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
    const existingUser = await collection.findOne({ name: data.name });
    if (existingUser) {
      res.send("User already exists. Please choose a different username.");
    } else {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);
      data.password = hashedPassword;
      const userData = await collection.insertMany(data);
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
    const user = await collection.findOne({ name: req.body.username });
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
app.get("/predict", (req, res) => {
  res.render("predict");
});
app.post("/predict", (req, res) => {
  // Extract data from the form submission

  const data = {
    day: req.body.day,
    time: req.body.time,
    mood: req.body.mood,
    activity: req.body.activity,
  };
  const args = Object.values(data);
  // Execute a Python script with the user input
  const pythonProcess = spawn("python", ["daily_tracker.py", ...args]);

  // Collect data from the Python script
  let dataFromPython = "";

  pythonProcess.stdout.on("data", (data) => {
    dataFromPython += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    // Send back response to the client
    res.send(`Result from Python script: ${dataFromPython}`);
  });
  pythonProcess.on("error", (err) => {
    console.error(`Error spawning Python process: ${err}`);
    // You may want to send an error response to the client if an error occurs
    // res.status(500).send("An error occurred while processing your request.");
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
