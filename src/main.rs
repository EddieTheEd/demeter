use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

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
            println!("File Structure:");
            print_file_structure(&file_structure, 0);
        }
        Err(err) => eprintln!("Error: {:?}", err),
    }
}
