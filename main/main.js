currentPath = 'data/Demeter Instructions.pdf';
const readData = localStorage.getItem('read');
readFilePaths = readData ? JSON.parse(readData) : [];
const reviewData = localStorage.getItem('review');
reviewFilePaths = reviewData ? JSON.parse(reviewData) : [];
const writeData = localStorage.getItem('write');
writeFilePaths = writeData ? JSON.parse(writeData) : {};
textbox = document.querySelector('textarea');

async function readJSONFile() {
  try {
    const response = await fetch('output.json');
    if (!response.ok) {
        throw new Error('Failed to fetch the JSON file');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

reloadTree();


function createFileTreeElement(node, depth = 0) {
  const listItem = document.createElement('li');
  listItem.style.marginLeft = `${depth * 10}px`;

  if (/\.(pdf|docx?|txt)/i.test(node.path)) {
    listItem.style.cursor = "pointer";
    listItem.textContent = node.name; 
    listItem.style.color = "#f2f2f2";
    listItem.style.fontWeight = "bold";

  } else {
    listItem.textContent = node.name + "/"; 
    listItem.style.color = "#bfbfbf";
    if (node.path !== "data") {
      listItem.classList.add('closed-folder');
      listItem.style.fontWeight = "normal";
    } else {
      listItem.style.fontWeight = "bold";
    }
  }

  if (readFilePaths.includes(node.path)){
    listItem.style.color = "#404040";
  }
  if (reviewFilePaths.includes(node.path)){
    listItem.style.color = "#004fb3";
  }

  listItem.addEventListener('click', (event) => {
    toggleChildVisibility(listItem);
    loadFile(node.path);
    event.stopPropagation();
  });
/*
const extensionsPriority = [".pdf", ".docx", ".doc", ".txt"];
const getFilePriority = (file) => {
  const extension = file.match("/\.[^/.]+$/");
  return extensionsPriority.indexOf(extension) !== -1 ? extensionsPriority.indexOf(extension) : Infinity;
};
const priorityA = getFilePriority(a);
const priorityB = getFilePriority(b);
if (priorityA !== priorityB) {
  return priorityA - priorityB;
}
const nameA = a.replace(/\.[^/.]+$/, "");
const nameB = b.replace(/\.[^/.]+$/, "");
return nameA.localeCompare(nameB);

 */

  if (node.children.length > 0) {
    let children = node.children.slice();
    let fileChildren = [];
    let folderChildren = [];
    children.forEach(child => {
      if (/\.(pdf|docx?|txt)/i.test(child.name)){
        fileChildren.push(child);
      } else {
        folderChildren.push(child);
      }
    });
    fileChildren.sort((a,b) => a.name.localeCompare(b.name));
    folderChildren.sort((a,b) => a.name.localeCompare(b.name));

    const sortedChildren = fileChildren.concat(folderChildren);
    const childList = document.createElement('ul');
    childList.style.fontWeight = "normal";
    sortedChildren.forEach(child => {
      const childElement = createFileTreeElement(child, depth + 1);
      childList.appendChild(childElement);
    });
    listItem.appendChild(childList);
  }
  return listItem;
}

function toggleChildVisibility(parentItem) {
  const childList = parentItem.querySelector('ul');
  if (childList) {
    const isChildVisible = childList.style.display === 'block';
    childList.style.display = isChildVisible ? 'none' : 'block';
    parentItem.classList.toggle('closed-folder');
  }
}

function loadFile(path) {
  if (readFilePaths.includes(path)){
    document.getElementById("readbox").checked = true;
  } else {
    document.getElementById("readbox").checked = false;
  }
  if (reviewFilePaths.includes(path)){
    document.getElementById("reviewbox").checked = true;
  } else {
    document.getElementById("reviewbox").checked = false;
  }
  if (path in writeFilePaths){
    textbox.value = writeFilePaths[path];
  } else {
    textbox.value = '';
  }


  const absoluteURL = window.location.origin + '/' + path;
  //window.location.href = absoluteURL;
  if (/\.(pdf|docx?|txt)/i.test(path)) {
    document.getElementById("viewer").children[0].src = `https://docs.google.com/gview?url=${absoluteURL}&embedded=true`.replace("http://127.0.0.1:8080/", "https://demeter.toomwn.xyz/"); //for live-server, obviously google cant access something being served locally, so this assumes it exists on the website
    document.getElementById("fileh3").innerHTML = path.split('/').pop().replace(".pdf", "").replace(".PDF", "").replace(".docx", "").replace(".doc", "").replace(".txt", "");
    currentPath = path;
  }

}

loadFile(currentPath);

function reloadTree() {
  readJSONFile().then((jsonData) => {
    const fileSystemDisplay = document.getElementById('filetree');
    try {
      fileSystemDisplay.removeChild(fileSystemDisplay.children[0]);
    }
    catch(err){
      console.log(err);
    }
    const fileTreeElement = createFileTreeElement(jsonData);
    fileSystemDisplay.appendChild(fileTreeElement);
    const closedFolders = document.querySelectorAll('.closed-folder');
    closedFolders.forEach((folder) => {
      const childList = folder.querySelector('ul');
      if (childList) {
        childList.style.display = 'none';
      }

    });
  });
}

function markRead() {
  if (document.getElementById("readbox").checked) {
    readFilePaths.push(currentPath);
    localStorage.setItem('read', JSON.stringify(readFilePaths));
    reloadTree(); 
  } else {
    removeFromRead();
    localStorage.setItem('read', JSON.stringify(readFilePaths));
    reloadTree(); 
  }
}


textbox.addEventListener('input', function() {
  writeFilePaths[currentPath] = textbox.value;
  localStorage.setItem('write', JSON.stringify(writeFilePaths));
});

function download() {
  window.open(currentPath, '_blank');
}

function markReview() {
  if (document.getElementById("reviewbox").checked) {
    reviewFilePaths.push(currentPath);
    localStorage.setItem('review', JSON.stringify(reviewFilePaths));
    reloadTree(); 
  } else {
    removeFromReview();
    localStorage.setItem('review', JSON.stringify(reviewFilePaths));
    reloadTree(); 
  }
}

function removeFromRead() {
  if (readFilePaths.indexOf(currentPath)!==-1) {
    readFilePaths.splice(readFilePaths.indexOf(currentPath), 1);
    removeFromRead();
  }
}

function removeFromReview() {
  if (reviewFilePaths.indexOf(currentPath)!==-1) {
    reviewFilePaths.splice(reviewFilePaths.indexOf(currentPath), 1);
    removeFromReview();
  }
}

function clearRead() {
  if(confirm("Are you sure?\nThis will irreversibly remove any memory of any files marked as read in the local storage.\n\nPress OK to confirm.")){
    readFilePaths = [];
    localStorage.setItem('read', JSON.stringify(readFilePaths));
    reloadTree(); 
  } 
  document.getElementById("readclearbox").checked = false;
  document.getElementById("readbox").checked = false;

}

function clearReview() {
  if(confirm("Are you sure?\nThis will irreversibly remove any memory of any files marked for review in the local storage.\n\nPress OK to confirm.")){
    reviewFilePaths = [];
    localStorage.setItem('review', JSON.stringify(reviewFilePaths));
    reloadTree(); 
  } 
  document.getElementById("reviewclearbox").checked = false;
  document.getElementById("reviewbox").checked = false;
}

function clearWrite() {
  if(confirm("Are you sure?\nThis will irreversibly remove any memory of any file notes in the local storage.\n\nPress OK to confirm.")){
    writeFilePaths = {};
    localStorage.setItem('write', JSON.stringify(writeFilePaths));
    reloadTree(); 
  } 
  document.getElementById("writeclearbox").checked = false;
  document.getElementById("notes").value = "";
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

function addMin() {
  duration = duration + 60;
  countdownSeconds = duration;
  updateCountdown();
}

function startCountdown() {
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
}

function resetCountdown() {
  stopCountdown();
  countdownSeconds = 0;
  setCountdown = 0;
  duration = 0;
  updateCountdown();
  stopped = false;
}

function updateCountdown() {
  const hours = Math.floor(countdownSeconds / 3600);
  const minutes = Math.floor((countdownSeconds % 3600) / 60);
  const seconds = countdownSeconds % 60;
  const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  document.getElementById('timer').innerText = formattedTime;
}

function padZero(number) {
  return number < 10 ? `0${number}` : number;
}

function save() {
  let jsonData = { 
    read: readFilePaths,
    review: reviewFilePaths,
    write: writeFilePaths
  }
  const jsonString = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  link.download = 'data.json';
  link.href = URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

document.getElementById('fileInput').addEventListener('change', function(event) {
  const fileInput = event.target;
  
  if (fileInput.files.length > 0) {
    const selectedFile = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
      const fileContent = e.target.result;
      let jsonData = JSON.parse(fileContent);

      console.log(jsonData); 
      readFilePaths = jsonData.read
      reviewFilePaths = jsonData.review
      writeFilePaths = jsonData.write
      localStorage.setItem('read', JSON.stringify(readFilePaths));
      localStorage.setItem('review', JSON.stringify(reviewFilePaths));
      localStorage.setItem('write', JSON.stringify(writeFilePaths)); 
      reloadTree();
      loadFile(currentPath);
    };

    reader.readAsText(selectedFile);
  }
});
