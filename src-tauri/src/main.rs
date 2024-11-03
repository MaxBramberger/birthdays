// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;

use std::fs::File;
use std::io::Write;
use rusqlite::params;
use serde::{Serialize};
use crate::db::initialize_database;

fn main() {
  tauri::Builder::default()
      .plugin(tauri_plugin_dialog::init())
      .invoke_handler(tauri::generate_handler![
        get_birthdays,
        add_birthday,
        update_birthday,
        delete_birthday,
        file_import,
        file_export
      ])
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
  let header = parse_file_content.lines().next().unwrap();
  let columns: Vec<&str> = header.split(';').collect();
  let mut first_name_index = -1;
  let mut last_name_index = -1;
  let mut birthday_index = -1;
  for index in 0..columns.len() {
    match columns[index].trim() {
      "first_name" => first_name_index = index as i32,
      "last_name" => last_name_index = index as i32,
      "birthday" => birthday_index = index as i32,
      _ => continue,
    }
  }

  for line in parse_file_content.lines().skip(1) {
    let fields: Vec<&str> = line.split(';').collect();
      birthdays.push(BirthdayIn {
        first_name: fields[first_name_index as usize].trim().to_string(),
        last_name: fields[last_name_index as usize].trim().to_string(),
        birthday: fields[birthday_index as usize].trim().to_string(),
      });
  }
  for birthday in birthdays {
    match add_birthday(birthday.first_name, birthday.last_name, birthday.birthday) {
      Ok(_) => (),
      Err(e) => println!("Failed to add birthday: {}", e),
    }
  }
}

#[tauri::command]
fn file_export(file_path: String) -> Result<(), String> {
  let birthdays =  match get_birthdays(){
    Ok(b) => b,
    Err(e) => panic!("Failed to get birthdays: {}", e),
  };

  let mut file = File::create(file_path).map_err(|e| e.to_string())?;
  let header = format!("first_name; last_name; birthday\n");
  file.write_all(header.as_bytes()).map_err(|e| e.to_string())?;
  for birthday in birthdays {
    let line = format!("{}; {}; {}\n", birthday.first_name, birthday.last_name, birthday.birthday);
    file.write_all(line.as_bytes()).map_err(|e| e.to_string())?;
  }
  Ok(())
}