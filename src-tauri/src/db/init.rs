use directories::ProjectDirs;
use rusqlite::{params, Connection, Result};
use std::fs;
use std::path::PathBuf;

pub fn initialize_database() -> Result<Connection> {
    // Get the user data directory for the application
    let db_path = get_database_path();

    // Ensure the parent directory exists
    if let Some(parent_dir) = db_path.parent() {
        match fs::create_dir_all(parent_dir){
            Err(why) => println!("! {:?}", why.kind()),
            _ => {}
        };
    }

    // Connect to the SQLite database, which will create the file if it doesn't exist
    let conn = Connection::open(db_path)?;

    // Create a sample table if it doesn’t already exist
    conn.execute(
        "CREATE TABLE IF NOT EXISTS birthdays (
            id INTEGER PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            birthday DATE NOT NULL
        )",
        [],
    )?;

    Ok(conn)
}

// Helper function to get the path to the database file
pub fn get_database_path() -> PathBuf {
    // Retrieve the project directories for app-specific data
    let proj_dirs = ProjectDirs::from("", "", "BirthdayDB")
        .expect("Could not determine project directory");

    // Get the path to the local data directory and append the database filename
    let db_dir = proj_dirs.data_local_dir();
    db_dir.join("birthday.db")
}