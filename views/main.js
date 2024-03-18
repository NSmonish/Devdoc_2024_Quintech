const fortuneCookie = document.querySelector("#cookie1");
const screen1 = document.querySelector(".screen1");
const screen2 = document.querySelector(".screen2");
const btnReset = document.querySelector("button");

const fortunePhrases = [
  "You have got this! Whatever challenge you are facing, you have the strength and resilience to overcome it.",

  "Believe in yourself! Your doubts may be loud, but your potential is even louder. Go for it!",

  "Every day is a new opportunity to learn and grow. Embrace the journey and keep moving forward.",

  "You are capable of amazing things. Do not let anyone tell you otherwise. Shine bright!",

  "Focus on the progress, not perfection. Every step you take gets you closer to your goals.",

  "You are braver than you believe, stronger than you seem, and smarter than you think.",

  "Mistakes are inevitable, but they don not define you. Learn from them and keep striving.",

  "Surround yourself with positive and supportive people who lift you up.",

  "Take care of yourself physically and mentally. A healthy you is a happy and successful you.",

  "Celebrate your victories, big and small. Acknowledge your achievements!",

  "Don not be afraid to step outside your comfort zone. Growth happens there.",

  "Remember, it is okay not to be okay sometimes. Reach out for help if you need it.",

  "Focus on the good things in your life. Gratitude attracts more positivity.",

  "You are worthy of love, happiness, and success. Never forget that.",
];

let item = 0;

fortuneCookie.addEventListener("click", openCookie);
btnReset.addEventListener("click", cookieReset);
document.addEventListener("keypress", handleEnter);

function openCookie() {
  screenToggle();
  document.querySelector(".fortune p").innerText = fortunePhrases[item];
}

function cookieReset(e) {
  screenToggle();
  item = Math.round(Math.random() * (fortunePhrases.length - 1));
}

function screenToggle() {
  screen1.classList.toggle("hide");
  screen2.classList.toggle("hide");
}

function handleEnter(event) {
  if (event.key == "Enter" && screen2.classList.contains("hide")) {
    openCookie();
  } else if (event.key == "Enter" && screen1.classList.contains("hide")) {
    cookieReset();
  }
}
