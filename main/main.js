currentPath = '';
const readData = localStorage.getItem('read');
readFilePaths = readData ? JSON.parse(readData) : [];
const reviewData = localStorage.getItem('review');
reviewFilePaths = reviewData ? JSON.parse(reviewData) : [];

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

readJSONFile().then((jsonData) => {
  const fileSystemDisplay = document.getElementById('filetree');
  const fileTreeElement = createFileTreeElement(jsonData);
  fileSystemDisplay.appendChild(fileTreeElement);
});


function createFileTreeElement(node, depth = 0) {
  const listItem = document.createElement('li');
  listItem.textContent = node.name;
  listItem.style.marginLeft = `${depth * 10}px`;
  if (readFilePaths.includes(node.path)){
    listItem.style.color = "#808080";
  }
  if (reviewFilePaths.includes(node.path)){
    listItem.style.color = "#004fb3";
  }
  listItem.addEventListener('click', () => {
    loadFile(node.path);
      
    event.stopPropagation();
  });

  if (node.children.length > 0) {
    const childList = document.createElement('ul');
    node.children.forEach(child => {
      const childElement = createFileTreeElement(child, depth + 1);
      childList.appendChild(childElement);
    });
    listItem.appendChild(childList);
  }

  return listItem;
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

  const absoluteURL = window.location.origin + '/' + path;
  //window.location.href = absoluteURL;
  if (/\.(pdf|docx?|txt)/i.test(path)) {
    document.getElementById("viewer").children[0].src = `https://docs.google.com/gview?url=${absoluteURL}&embedded=true`.replace("http://127.0.0.1:8080/", "https://demeter.toomwn.xyz/"); //for live-server, obviously google cant access something being served locally, so this assumes it exists on the website
    document.getElementById("fileh2").innerHTML = path.split('/').pop().replace(".pdf", "").replace(".PDF", "").replace(".docx", "").replace(".doc", "").replace(".txt", "");
    currentPath = path;
  }
  else {
    document.getElementById("viewer").children[0].src = ``;
  }
}

function reloadTree() {
  readJSONFile().then((jsonData) => {
    const fileSystemDisplay = document.getElementById('filetree');
    fileSystemDisplay.removeChild(fileSystemDisplay.children[0]);
    const fileTreeElement = createFileTreeElement(jsonData);
    fileSystemDisplay.appendChild(fileTreeElement);
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
