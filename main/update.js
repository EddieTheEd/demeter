let updateDate = localStorage.getItem("update");
let updateString = "";
let allUpdates = "";

fetch('main/updates.json')
  .then(response => response.json())
  .then(data => {
    const updates = data.updates;

    let indexToUpdate = 0;

    if (updateDate !== null) {
      for (let i = 0; i < updates.length; i++) {
        if (updates[i].date === updateDate) {
          indexToUpdate = i;
          break;
        }
      }
    } else {
      localStorage.setItem("update", updates[0].date);
      indexToUpdate = updates.length;
    }

    if (indexToUpdate > 0) {
      localStorage.setItem("update", updates[0].date);
    }

    for (let i = 0; i <= indexToUpdate - 1; i++) {
      updateString += "<h3>" + updates[i].date + "</h3><p>" + updates[i].description + "</p>";
    }

    for (let i = 0; i <= updates.length - 1; i++) {
      allUpdates += "<h3>" + updates[i].date + "</h3><p>" + updates[i].description + "</p>";
    }

    if (updateString !== "") {
      openPopup(updateString);
    }
  })
  .catch(error => console.error('Error loading updates.json:', error));

function openPopup(content) {
  const popupWidth = 600;
  const popupHeight = 400;

  const left = (window.innerWidth - popupWidth) / 2;
  const top = (window.innerHeight - popupHeight) / 2;

  const popupWindow = window.open("", "_blank", "width=" + popupWidth + ",height=" + popupHeight + ",left=" + left + ",top=" + top);

  if (popupWindow) {
    const cssLink = popupWindow.document.createElement("link");
    cssLink.href = "main.css";
    cssLink.rel = "stylesheet";
    popupWindow.document.head.appendChild(cssLink);
    popupWindow.document.body.innerHTML = content;
  } else {
    console.error("Popup window blocked. Please allow popups for this site, to be notified of updates.");
  }
}

function updates() {
  openPopup(allUpdates);
}
