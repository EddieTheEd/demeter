const readData = localStorage.getItem("read");
readFilePaths = readData ? JSON.parse(readData) : [];
const reviewData = localStorage.getItem("review");
reviewFilePaths = reviewData ? JSON.parse(reviewData) : [];
const writeData = localStorage.getItem("write");
writeFilePaths = writeData ? JSON.parse(writeData) : {};

textbox = document.querySelector("textarea");

// important filetree variables
root = "data";
currentPath = root + "/Demeter Instructions.docx";

storageroot = "https://demeter-data.netlify.app/"

const pathhistorydata = localStorage.getItem("history");
pathhistory = pathhistorydata ? JSON.parse(pathhistorydata) : [root];

if (pathhistory !=== [root]) {
  root = pathhistory[pathhistory.length - 1];
]

// takes in main data, and path of a directory. Then returns the object corresponding to that path, to be used to generate the filetree.
function narrowData(node, targetPath) {
    if (node.path === targetPath) {
        return node;
    }
    if (node.children && node.children.length > 0) {
        for (let i = 0; i < node.children.length; i++) {
            const found = narrowData(node.children[i], targetPath);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

async function readJSONFile() {
  try {
    const response = await fetch(storageroot + "output.json");
    if (!response.ok) {
      throw new Error("Failed to fetch the JSON file");
    }
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

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
    if (node.path !== root) {
      listItem.classList.add("closed-folder");
      listItem.style.fontWeight = "normal";
    } else {
      listItem.style.fontWeight = "bold";
    }
    listItem.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      root = node.path;
      pathhistory.push(root);
      reloadTree();
      event.stopPropagation();
    });
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

function toggleOpen(element) {
  grandparentElement = element.parentElement.parentElement;
  if (grandparentElement.tagName !== "DIV") {
    if (grandparentElement.classList.contains("closed-folder")) {
      toggleChildVisibility(grandparentElement);
    }
    toggleOpen(grandparentElement);
  }
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

  const absoluteURL = storageroot + "/" + path; //newurl
  //window.location.href = absoluteURL;
  if (/\.(pdf|docx?|txt)/i.test(path)) {
    document.getElementById("viewer").children[0].src =
      `https://docs.google.com/gview?url=${absoluteURL}&embedded=true`; //for live-server, obviously google cant access something being served locally, so this assumes it exists on the website. Replace "https://demeter.toomwn.xyz/" with where you're hosting your version of demeter, and make sure the liveserver is set correctly
    document.getElementById("fileh3").innerHTML = path
      .split("/")
      .pop()
    currentPath = path;
  }
}

loadFile(currentPath);

function goBack() {
  pathhistory.pop();
  root = pathhistory[pathhistory.length - 1];
  reloadTree();
}

function reloadTree() {
  readJSONFile().then((jsonData) => {
    const fileSystemDisplay = document.getElementById("filetree");
    try {
      fileSystemDisplay.removeChild(fileSystemDisplay.children[0]);
      fileSystemDisplay.removeChild(fileSystemDisplay.children[1]);
    } catch (err) {
      console.log(err);
    }
    const fileTreeElement = createFileTreeElement(narrowData(jsonData, root));
    fileSystemDisplay.appendChild(fileTreeElement);
    const closedFolders = document.querySelectorAll(".closed-folder");
    closedFolders.forEach((folder) => {
      const childList = folder.querySelector("ul");
      if (childList) {
        childList.style.display = "none";
      }
    });
    backButton = document.createElement("button");
    backButton.textContent = "↵";
    backButton.id = "backbutton"
    if (pathhistory.length > 1) {
      backButton.style.display = "block";
    }
    else {
      backButton.style.display = "none";
    }
    backButton.onclick = goBack;
    fileTreeElement.appendChild(backButton);
    fileTreeElement.children[1].parentNode.insertBefore(fileTreeElement.children[1], fileTreeElement.children[0]);
  });
  localStorage.setItem("history", JSON.stringify(pathhistory));
}

reloadTree();

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
    try {
      toggleOpen(element);
    }
    catch(err) { // this element doesn't exist in the current focus of the filetree
      console.log(err);
    }
  });
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
    try {
      toggleOpen(element);
    }
    catch(err) { // this element doesn't exist in the current focus of the filetree
      console.log(err);
    }
  });
}

function openDownload() {
  window.open(storageroot + currentPath, "_blank"); //newurl
  document.getElementById("opendownloadbox").checked = false;
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
  // get current date and time, save as variable
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const formattedDate = `${year}_${month}_${day}`;
  link.download = `Demeter-${formattedDate}.json`;
  link.href = URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

document.getElementById("fileInput").addEventListener("change", function (event) {
  const fileInput = event.target;

  if (fileInput.files.length > 0) {
    const selectedFile = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const fileContent = e.target.result;
      let jsonData = JSON.parse(fileContent);

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
