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
  console.log(jsonData);
  const fileSystemDisplay = document.getElementById('filetree');
  const fileTreeElement = createFileTreeElement(jsonData);
  fileSystemDisplay.appendChild(fileTreeElement);
});


function createFileTreeElement(node, depth = 0) {
  const listItem = document.createElement('li');
  listItem.textContent = node.name;
  listItem.style.marginLeft = `${depth * 20}px`;
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
  const absoluteURL = window.location.origin + '/' + path;
  //window.location.href = absoluteURL;
  document.getElementById("viewer").children[0].src = `https://docs.google.com/gview?url=${absoluteURL}&embedded=true`;
  document.getElementById("fileh2").innerHTML = path.replace(".pdf", "").replace(".PDF", "").replace(".doc", "").replace(".docx", "")
}
