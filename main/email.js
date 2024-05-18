function email() {
  let email = prompt("Please enter your email address", "youremail@example.com")
  if (email !== null || person !== "") {
    let jsonData = {
      read: readFilePaths,
      review: reviewFilePaths,
      write: writeFilePaths,
      notepad: notepadData,
    };
    const jsonString = JSON.stringify(jsonData, null, 2);
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    window.open('mailto:' + email + '?subject=' + `Demeter-${year}_${month}_${day}.json` + '&body=' + jsonString);
  }
}
