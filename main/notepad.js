var simplemde = new SimpleMDE({
  element: document.getElementById("notepadbox"),
  forceSync: true,
  autosave: {
    enabled: false,
  },
  toolbar: false,
});

notepaddisplayed = true;

notepadData = localStorage.getItem("notepad");
simplemde.value(notepadData !== null ? notepadData : ""); // sets notepad value to either stored data or empty - seems not to be working?

simplemde.codemirror.on("change", function(){
	notepadData = simplemde.value();
  localStorage.setItem("notepad", notepadData);
});

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
