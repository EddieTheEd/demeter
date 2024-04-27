let countdownInterval;
let countdownSeconds;
let duration = 0;
let stopped = false;
let setCountdown = 0;

function addHour() {
  duration = duration + 3600;
  countdownSeconds = duration;
  updateCountdown();
}

function addThirty() {
  duration = duration + 1800;
  countdownSeconds = duration;
  updateCountdown();
}

function addTen() {
  duration = duration + 600;
  countdownSeconds = duration;
  updateCountdown();
}

function addFive() {
  duration = duration + 300;
  countdownSeconds = duration;
  updateCountdown();
}

function addMin() {
  duration = duration + 60;
  countdownSeconds = duration;
  updateCountdown();
}

function addFifty() {
  duration = duration + 3000;
  countdownSeconds = duration;
  updateCountdown();
}

function addHundred() {
  duration = duration + 6000;
  countdownSeconds = duration;
  updateCountdown();
}

document.getElementById("elapsedbox").style.display = "none";


function startCountdown() {
  document.getElementById("elapsed").innerHTML = ``;
  document.getElementById("copy").style.display = "none";
  document.getElementById("elapsedbox").style.display = "none";
  if (!stopped) {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    countdownSeconds = duration;
    updateCountdown();

    countdownInterval = setInterval(function () {
      if (countdownSeconds <= 0) {
        clearInterval(countdownInterval);
        alert("Countdown finished!");
        elapsedTime = duration - countdownSeconds;
        const hours = Math.floor(elapsedTime / 3600);
        const minutes = Math.floor((elapsedTime % 3600) / 60);
        const seconds = elapsedTime % 60;
        const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
        document.getElementById("elapsed").innerHTML =
          `Time elapsed: ${formattedTime}`;
        document.getElementById("copy").style.display = "inline";
        document.getElementById("elapsedbox").style.display = "flex";
      } else {
        countdownSeconds--;
        updateCountdown();
      }
    }, 1000);
  } 
  else {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    updateCountdown();

    countdownInterval = setInterval(function () {
      if (countdownSeconds <= 0) {
        clearInterval(countdownInterval);
        alert("Countdown finished!");
        stopCountdown();
      } else {
        countdownSeconds--;
        updateCountdown();
      }
      
    }, 1000);
    
  }
  document.getElementById("copy").style.display = "none";
  
}

function resetCountdown() {
  stopCountdown();
  countdownSeconds = 0;
  setCountdown = 0;
  duration = 0;
  updateCountdown();
  stopped = false;
  document.getElementById("elapsed").innerHTML = ``;
  document.getElementById("copy").style.display = "none";
  document.getElementById("elapsedbox").style.display = "none";
}

function stopCountdown() {
  setCountdown = countdownSeconds;
  clearInterval(countdownInterval);
  stopped = true;
  elapsedTime = duration - countdownSeconds;
  const hours = Math.floor(elapsedTime / 3600);
  const minutes = Math.floor((elapsedTime % 3600) / 60);
  const seconds = elapsedTime % 60;
  const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  document.getElementById("elapsed").innerHTML =
    `Time elapsed: ${formattedTime}`;
  document.getElementById("copy").style.display = "inline";
  document.getElementById("elapsedbox").style.display = "flex";
}

function updateCountdown() {
  const hours = Math.floor(countdownSeconds / 3600);
  const minutes = Math.floor((countdownSeconds % 3600) / 60);
  const seconds = countdownSeconds % 60;
  const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  document.getElementById("timer").innerText = formattedTime;
}

function padZero(number) {
  return number < 10 ? `0${number}` : number;
}

function copy() {
  elapsedTime = duration - countdownSeconds;
  const hours = Math.floor(elapsedTime / 3600);
  const minutes = Math.floor((elapsedTime % 3600) / 60);
  const seconds = elapsedTime % 60;
  const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  navigator.clipboard.writeText(`Time elapsed: ${formattedTime}`);
  alert("Copied to clipboard!");
}


