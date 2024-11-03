// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;

use rusqlite::params;
use serde::{Serialize};
use crate::db::initialize_database;

fn main() {
  tauri::Builder::default()
      .invoke_handler(tauri::generate_handler![get_birthdays, add_birthday, update_birthday, delete_birthday])
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

struct BirthdayIn {
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

#[tauri::command]
fn add_birthday(first_name: String, last_name: String, birthday: String) -> Result<(), String> {
  // Connect to the SQLite database
  let conn = initialize_database().map_err(|e| format!("Failed to connect to database: {}", e))?;

  // Insert the new birthday entry into the table
  conn.execute(
    "INSERT INTO birthdays (first_name, last_name, birthday) VALUES (?1, ?2, ?3)",
    params![first_name, last_name, birthday],
  ).map_err(|e| format!("Failed to insert birthday: {}", e))?;

  Ok(())
}

#[tauri::command]
fn update_birthday(first_name: String, last_name: String, birthday: String, id: i32) -> Result<(), String> {
  // Connect to the SQLite database
  let conn = initialize_database().map_err(|e| format!("Failed to connect to database: {}", e))?;

  // Insert the new birthday entry into the table
  conn.execute(
    "UPDATE birthdays SET first_name = ?1, last_name = ?2, birthday = ?3 WHERE id = ?4",
    params![first_name, last_name, birthday, id],
  ).map_err(|e| format!("Failed to update birthday: {}", e))?;

  Ok(())
}

#[tauri::command]
fn delete_birthday(id: i32) -> Result<(), String> {
  // Connect to the SQLite database
  let conn = initialize_database().map_err(|e| format!("Failed to connect to database: {}", e))?;

  // Insert the new birthday entry into the table
  conn.execute(
    "DELETE FROM birthdays WHERE id = ?1",
    params![id],
  ).map_err(|e| format!("Failed to update birthday: {}", e))?;

  Ok(())
}

#[tauri::command]
fn file_import(parse_file_content: String) {
  let mut birthdays = Vec::new();
  for line in parse_file_content.lines() {
    let fields: Vec<&str> = line.split(',').collect();
    if fields.len() == 3 {
      birthdays.push(BirthdayIn {
        first_name: fields[0].trim().to_string(),
        last_name: fields[1].trim().to_string(),
        birthday: fields[2].trim().to_string(),
      });
    }
  }
  for birthday in birthdays {
    match add_birthday(birthday.first_name, birthday.last_name, birthday.birthday) {
      Ok(_) => (),
      Err(e) => println!("Failed to add birthday: {}", e),
    }
  }
}