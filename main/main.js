currentPath = "data/Demeter Instructions.pdf";
const readData = localStorage.getItem("read");
readFilePaths = readData ? JSON.parse(readData) : [];
const reviewData = localStorage.getItem("review");
reviewFilePaths = reviewData ? JSON.parse(reviewData) : [];
const writeData = localStorage.getItem("write");
writeFilePaths = writeData ? JSON.parse(writeData) : {};

var simplemde = new SimpleMDE({
  element: document.getElementById("notepadbox"),
  forceSync: true,
  autosave: {
    enabled: false,
  },
  toolbar: false,
});

notepadData = localStorage.getItem("notepad");

simplemde.value(notepadData);

notepaddisplayed = true;

textbox = document.querySelector("textarea");
firstTime = true;

async function readJSONFile() {
  try {
    const response = await fetch("output.json");
    if (!response.ok) {
      throw new Error("Failed to fetch the JSON file");
    }
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

reloadTree();

function createFileTreeElement(node, depth = 0) {
  const listItem = document.createElement("li");
  listItem.style.marginLeft = `${depth * 10}px`;

  if (/\.(pdf|docx?|txt)/i.test(node.path)) {
    listItem.style.cursor = "pointer";
    listItem.textContent = node.name;
    listItem.style.color = "#f2f2f2";
    listItem.style.fontWeight = "bold";
  } else {
    listItem.textContent = node.name + "/";
    listItem.style.color = "#bfbfbf";
    listItem.style.cursor = "pointer";
    if (node.path !== "data") {
      listItem.classList.add("closed-folder");
      listItem.style.fontWeight = "normal";
    } else {
      listItem.style.fontWeight = "bold";
    }
  }

  if (readFilePaths.includes(node.path)) {
    listItem.style.color = "#404040";
  }
  if (reviewFilePaths.includes(node.path)) {
    listItem.style.color = "#004fb3";
  }

  listItem.addEventListener("click", (event) => {
    toggleChildVisibility(listItem);
    loadFile(node.path);
    event.stopPropagation();
  });

  if (node.children.length > 0) {
    let children = node.children.slice();
    let fileChildren = [];
    let folderChildren = [];
    children.forEach((child) => {
      if (/\.(pdf|docx?|txt)/i.test(child.name)) {
        fileChildren.push(child);
      } else {
        folderChildren.push(child);
      }
    });
    fileChildren.sort((a, b) => a.name.localeCompare(b.name));
    folderChildren.sort((a, b) => a.name.localeCompare(b.name));

    const sortedChildren = fileChildren.concat(folderChildren);
    const childList = document.createElement("ul");
    childList.style.fontWeight = "normal";
    sortedChildren.forEach((child) => {
      const childElement = createFileTreeElement(child, depth + 1);
      childList.appendChild(childElement);
    });
    listItem.appendChild(childList);
  }
  return listItem;
}

function toggleChildVisibility(parentItem) {
  const childList = parentItem.querySelector("ul");
  if (childList) {
    const isChildVisible = childList.style.display === "block";
    childList.style.display = isChildVisible ? "none" : "block";
    parentItem.classList.toggle("closed-folder");
  }
}

function loadFile(path) {
  if (readFilePaths.includes(path)) {
    document.getElementById("readbox").checked = true;
  } else {
    document.getElementById("readbox").checked = false;
  }
  if (reviewFilePaths.includes(path)) {
    document.getElementById("reviewbox").checked = true;
  } else {
    document.getElementById("reviewbox").checked = false;
  }
  if (path in writeFilePaths) {
    textbox.value = writeFilePaths[path];
  } else {
    textbox.value = "";
  }

  const absoluteURL = window.location.origin + "/" + path;
  //window.location.href = absoluteURL;
  if (/\.(pdf|docx?|txt)/i.test(path)) {
    document.getElementById("viewer").children[0].src =
      `https://docs.google.com/gview?url=${absoluteURL}&embedded=true`.replace(
        "http://127.0.0.1:8080/",
        "https://demeter.toomwn.xyz/",
      ); //for live-server, obviously google cant access something being served locally, so this assumes it exists on the website
    document.getElementById("fileh3").innerHTML = path
      .split("/")
      .pop()
      .replace(".pdf", "")
      .replace(".PDF", "")
      .replace(".docx", "")
      .replace(".doc", "")
      .replace(".txt", "");
    currentPath = path;
  }
}

loadFile(currentPath);

function reloadTree() {
  readJSONFile().then((jsonData) => {
    const fileSystemDisplay = document.getElementById("filetree");
    try {
      fileSystemDisplay.removeChild(fileSystemDisplay.children[0]);
    } catch (err) {
      console.log(err);
    }
    const fileTreeElement = createFileTreeElement(jsonData);
    fileSystemDisplay.appendChild(fileTreeElement);
    if (firstTime) {
      const closedFolders = document.querySelectorAll(".closed-folder");
      closedFolders.forEach((folder) => {
        const childList = folder.querySelector("ul");
        if (childList) {
          childList.style.display = "none";
        }
      });
      firstTime = false;
    }
  });
}

function findElementByText(rootElement, searchText) {
  if (rootElement.textContent.includes(searchText)) {
    return rootElement;
  }

  for (let child of rootElement.children) {
    const foundElement = findElementByText(child, searchText);
    if (foundElement) {
      return foundElement;
    }
  }

  return null;
}

function markRead() {
  if (document.getElementById("readbox").checked) {
    readFilePaths.push(currentPath);
    localStorage.setItem("read", JSON.stringify(readFilePaths));
    xpathExpression = `//*[contains(text(), '${currentPath.split("/").pop()}')]`;
    element = document.evaluate(
      xpathExpression,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;
    if (!reviewFilePaths.includes(currentPath)) {
      element.style.color = "#404040";
    }
  } else {
    removeFromRead();
    localStorage.setItem("read", JSON.stringify(readFilePaths));
    xpathExpression = `//*[contains(text(), '${currentPath.split("/").pop()}')]`;
    element = document.evaluate(
      xpathExpression,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;
    if (!reviewFilePaths.includes(currentPath)) {
      element.style.color = "#f2f2f2";
    }
  }
}

textbox.addEventListener("input", function () {
  writeFilePaths[currentPath] = textbox.value;
  localStorage.setItem("write", JSON.stringify(writeFilePaths));
});

simplemde.codemirror.on("change", function(){
	notepadData = simplemde.value();
  localStorage.setItem("notepad", notepadData);
});

function download() {
  window.open(currentPath, "_blank");
}

function markReview() {
  if (document.getElementById("reviewbox").checked) {
    reviewFilePaths.push(currentPath);
    localStorage.setItem("review", JSON.stringify(reviewFilePaths));
    xpathExpression = `//*[contains(text(), '${currentPath.split("/").pop()}')]`;
    element = document.evaluate(
      xpathExpression,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;
    element.style.color = "#004fb3";
  } else {
    removeFromReview();
    localStorage.setItem("review", JSON.stringify(reviewFilePaths));
    xpathExpression = `//*[contains(text(), '${currentPath.split("/").pop()}')]`;
    element = document.evaluate(
      xpathExpression,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;
    if (!readFilePaths.includes(currentPath)) {
      element.style.color = "#f2f2f2";
    } else {
      element.style.color = "#404040";
    }
  }
}

function removeFromRead() {
  if (readFilePaths.indexOf(currentPath) !== -1) {
    readFilePaths.splice(readFilePaths.indexOf(currentPath), 1);
    removeFromRead();
  }
}

function removeFromReview() {
  if (reviewFilePaths.indexOf(currentPath) !== -1) {
    reviewFilePaths.splice(reviewFilePaths.indexOf(currentPath), 1);
    removeFromReview();
  }
}

function clearRead() {
  if (
    confirm(
      "Are you sure?\nThis will irreversibly remove any memory of any files marked as read in the local storage.\n\nPress OK to confirm.",
    )
  ) {
    readFilePaths.forEach((path) => {
      xpathExpression = `//*[contains(text(), '${path.split("/").pop()}')]`;
      element = document.evaluate(
        xpathExpression,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      ).singleNodeValue;
      element.style.color = "#f2f2f2";
    });
    readFilePaths = [];
    localStorage.setItem("read", JSON.stringify(readFilePaths));
    //reloadTree();
  }
  document.getElementById("readclearbox").checked = false;
  document.getElementById("readbox").checked = false;
}

function clearReview() {
  if (
    confirm(
      "Are you sure?\nThis will irreversibly remove any memory of any files marked for review in the local storage.\n\nPress OK to confirm.",
    )
  ) {
    reviewFilePaths.forEach((path) => {
      xpathExpression = `//*[contains(text(), '${path.split("/").pop()}')]`;
      element = document.evaluate(
        xpathExpression,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      ).singleNodeValue;
      if (!readFilePaths.includes(path)) {
        element.style.color = "#f2f2f2";
      } else {
        element.style.color = "#404040";
      }
    });
    reviewFilePaths = [];
    localStorage.setItem("review", JSON.stringify(reviewFilePaths));
    //reloadTree();
  }
  document.getElementById("reviewclearbox").checked = false;
  document.getElementById("reviewbox").checked = false;
}

function clearWrite() {
  if (
    confirm(
      "Are you sure?\nThis will irreversibly remove any memory of any file notes in the local storage.\n\nPress OK to confirm.",
    )
  ) {
    writeFilePaths = {};
    localStorage.setItem("write", JSON.stringify(writeFilePaths));
  }
  document.getElementById("writeclearbox").checked = false;
  document.getElementById("notes").value = "";
}

function toggleOpen(element) {
  grandparentElement = element.parentElement.parentElement;
  if (grandparentElement.tagName !== "DIV") {
    if (grandparentElement.classList.contains("closed-folder")) {
      toggleChildVisibility(grandparentElement);
    }
    toggleOpen(grandparentElement);
  }
}

function openRead() {
  readFilePaths.forEach((path) => {
    xpathExpression = `//*[contains(text(), '${path.split("/").pop()}')]`;
    element = document.evaluate(
      xpathExpression,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;
    toggleOpen(element);
  });
  document.getElementById("openreadbox").checked = false;
}

function openReview() {
  reviewFilePaths.forEach((path) => {
    xpathExpression = `//*[contains(text(), '${path.split("/").pop()}')]`;
    element = document.evaluate(
      xpathExpression,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;
    toggleOpen(element);
  });
  document.getElementById("openreviewbox").checked = false;
}

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
document.getElementById("elapsedbox").style.display = "none";
function startCountdown() {
  document.getElementById("elapsed").innerHTML = ``;
  document.getElementById("copy").style.display = "none";
  document.getElementById("elapsedbox").style.display = "inline";
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
  } else {
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

function resetCountdown() {
  stopCountdown();
  countdownSeconds = 0;
  setCountdown = 0;
  duration = 0;
  updateCountdown();
  stopped = false;
  document.getElementById("elapsed").innerHTML = ``;
  document.getElementById("copy").style.display = "none";
  document.getElementById("elapsedbox").style.display = "inline";
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

function save() {
  let jsonData = {
    read: readFilePaths,
    review: reviewFilePaths,
    write: writeFilePaths,
    notepad: notepadData,
  };
  const jsonString = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const link = document.createElement("a");
  link.download = "data.json";
  link.href = URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function togglenotepad() {
  page = document.getElementById("whole");
  box = document.getElementById("notepad");
  if(notepaddisplayed) {
    box.style.display = "none";
    page.style.backdropFilter = "";
    page.style.zIndex = "0";
    page.style.display = "none"
    notepaddisplayed = false;

  } else {
    box.style.display = "inline";
    page.style.display = "inline";
    page.style.backdropFilter = "blur(4px)";
    page.style.zIndex = "1";
    box.style.zIndex = "2";
    notepaddisplayed = true;
  }
}

togglenotepad()

document.body.addEventListener('keydown', function(e) {
  if (e.key == "Escape") {
   if(notepaddisplayed){
     togglenotepad();
   } 
  }
});

document.getElementById("fileInput").addEventListener("change", function (event) {
  const fileInput = event.target;

  if (fileInput.files.length > 0) {
    const selectedFile = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const fileContent = e.target.result;
      let jsonData = JSON.parse(fileContent);

      console.log(jsonData);
      readFilePaths = jsonData.read;
      reviewFilePaths = jsonData.review;
      writeFilePaths = jsonData.write;
      notepadData = jsonData.notepad;
      localStorage.setItem("read", JSON.stringify(readFilePaths));
      localStorage.setItem("review", JSON.stringify(reviewFilePaths));
      localStorage.setItem("write", JSON.stringify(writeFilePaths));
      localStorage.setItem("notepad", notepadData);
      simplemde.value(notepadData);

      loadFile(currentPath);
    };

    reader.readAsText(selectedFile);
  }
  });
