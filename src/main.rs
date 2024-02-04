
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use std::io;

#[derive(Serialize)]
struct FileNode {
    name: String,
    path: PathBuf,
    children: Vec<FileNode>,
}

impl FileNode {
    fn new(name: &str, path: &Path) -> Self {
        FileNode {
            name: name.to_string(),
            path: path.to_path_buf(),
            children: Vec::new(),
        }
    }

    fn add_child(&mut self, child: FileNode) {
        self.children.push(child);
    }
}

fn build_file_structure(dir: &Path) -> std::io::Result<FileNode> {
    let mut root = FileNode::new(
        dir.file_name().unwrap().to_string_lossy().as_ref(),
        dir,
    );

    if dir.is_dir() {
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_dir() {
                let child = build_file_structure(&path)?;
                root.add_child(child);
            } else {
                let file_name = path.file_name().unwrap().to_string_lossy().to_string();
                root.add_child(FileNode::new(&file_name, &path));
            }
        }
    }

    Ok(root)
}

fn print_file_structure(node: &FileNode, depth: usize) {
    print!("{:width$}", "", width = depth * 4);
    println!("{}/", node.name);

    for child in &node.children {
        print_file_structure(child, depth + 1);
    }
}

fn copy_main_to_output(path: &str) -> io::Result<()> {
    let main_folder = Path::new(path);
    let output_folder = Path::new("output");

    // Create the output directory if it doesn't exist
    if !output_folder.exists() {
        fs::create_dir_all(&output_folder)?;
    }

    // Iterate over entries in the 'main' folder
    for entry in fs::read_dir(&main_folder)? {
        let entry = entry?;
        let entry_path = entry.path();

        // Use unwrap_or_else to handle StripPrefixError
        let relative_path = entry_path.strip_prefix(&main_folder)
            .unwrap_or_else(|e| panic!("Error stripping prefix: {:?}", e));

        // Create the corresponding path in the 'output' folder
        let output_path = output_folder.join(relative_path);

        if entry_path.is_file() {
            // Copy files
            fs::copy(&entry_path, &output_path)?;
        } else if entry_path.is_dir() {
            // Create corresponding directory in 'output'
            fs::create_dir_all(&output_path)?;
        }
        // Ignore other file types (symlinks, etc.)
    }

    Ok(())
}

fn copy_folder(src: &str) -> io::Result<()> {
    let src_path = std::path::Path::new(src);
    let dest_path = std::path::Path::new("output").join(src_path.file_name().unwrap());

    // Create destination directory
    fs::create_dir_all(&dest_path)?;

    // Iterate over entries in the source folder
    for entry in fs::read_dir(&src_path)? {
        let entry = entry?;
        let entry_path = entry.path();

        // Create the corresponding path in the destination folder
        let dest_entry_path = dest_path.join(entry_path.file_name().unwrap());

        if entry_path.is_file() {
            // Copy files
            fs::copy(&entry_path, &dest_entry_path)?;
        } else if entry_path.is_dir() {
            // Copy directories recursively
            copy_folder_recursive(&entry_path, &dest_entry_path)?;
        }
        // Ignore other file types (symlinks, etc.)
    }

    Ok(())
}

fn copy_folder_recursive(src: &std::path::Path, dest: &std::path::Path) -> io::Result<()> {
    // Create destination directory
    fs::create_dir_all(&dest)?;

    // Iterate over entries in the source folder
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let entry_path = entry.path();

        // Create the corresponding path in the destination folder
        let dest_entry_path = dest.join(entry_path.file_name().unwrap());

        if entry_path.is_file() {
            // Copy files
            fs::copy(&entry_path, &dest_entry_path)?;
        } else if entry_path.is_dir() {
            // Copy directories recursively
            copy_folder_recursive(&entry_path, &dest_entry_path)?;
        }
        // Ignore other file types (symlinks, etc.)
    }

    Ok(())
}

fn main() {
    let data_folder = Path::new("data");

    match build_file_structure(&data_folder) {
        Ok(file_structure) => {
            // Serialize to JSON only the children
            let json = serde_json::to_string_pretty(&file_structure).unwrap();

            // Specify the file path where you want to save the JSON
            let output_file = "output/output.json";

            // Create the output directory if it doesn't exist
            if let Some(parent_dir) = Path::new(output_file).parent() {
                if let Err(err) = fs::create_dir_all(parent_dir) {
                    eprintln!("Error creating output directory: {:?}", err);
                    return;
                }
            }

            // Write the JSON to the file
            if let Err(err) = fs::write(output_file, json.clone()) {
                eprintln!("Error writing to file {}: {:?}", output_file, err);
            } else {
                println!("JSON saved to {}", output_file);
            }

            // Print the file structure
            //println!("File Structure:");
            //print_file_structure(&file_structure, 0);
        }
        Err(err) => eprintln!("Error: {:?}", err),
    }
    
    match copy_main_to_output("main") {
        Ok(()) => println!("Main files copied successfully."),
        Err(err) => eprintln!("Error copying main files: {:?}", err),
    }
    if let Err(err) = copy_folder("testdata") {
        eprintln!("Error: {:?}", err);
    } else {
        println!("Folder copied successfully!");
    }
}
