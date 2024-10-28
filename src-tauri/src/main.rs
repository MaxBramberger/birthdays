// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
use serde::{Serialize};
use crate::db::initialize_database;

fn main() {
  tauri::Builder::default()
      .invoke_handler(tauri::generate_handler![get_birthdays])
      .run(tauri::generate_context!())
      .expect("error while running Tauri application");
}

#[derive(Serialize)]
struct Birthday {
  id: i32,
  first_name: String,
  last_name: String,
  birthday: String,
}

#[tauri::command]
fn get_birthdays() -> Result<Vec<Birthday>, String> {
  // Connect to the SQLite database
  let conn = initialize_database()
      .map_err(|e| format!("Failed to connect to database: {}", e))?;

  // Prepare the SQL query to select all rows from the birthdays table
  let mut stmt = conn
      .prepare("SELECT id, first_name, last_name, birthday FROM birthdays")
      .map_err(|e| format!("Failed to prepare statement: {}", e))?;

  // Execute the query and collect results
  let birthdays_iter = stmt
      .query_map([], |row| {
        Ok(Birthday {
          id: row.get(0)?,
          first_name: row.get(1)?,
          last_name: row.get(2)?,
          birthday: row.get(3)?,
        })
      })
      .map_err(|e| format!("Failed to query birthdays: {}", e))?;

  // Collect all rows into a vector
  let birthdays: Vec<Birthday> = birthdays_iter
      .filter_map(|res| res.ok())  // Handle any row errors
      .collect();

  Ok(birthdays)
}