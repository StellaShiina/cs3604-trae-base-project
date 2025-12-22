# PostgreSQL Database Information Viewer

This Python script connects to your PostgreSQL database and displays comprehensive information about the database, including:

- Database version and basic information
- List of all tables with their sizes and row counts
- Active connections and recent queries
- Database size and connection details

## Configuration

The script is configured to connect to:
- **Host**: localhost
- **Port**: 5432
- **Database**: railway12306
- **Username**: postgres
- **Password**: postgres

## Installation

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

Or install psycopg2 directly:
```bash
pip install psycopg2-binary
```

## Usage

Run the script:
```bash
python database_info.py
```

## Features

- **Database Overview**: Shows PostgreSQL version, database name, size, and server information
- **Tables Information**: Lists all user tables with their schema, row count, and size
- **Connection Monitoring**: Displays active connections and recent queries
- **Error Handling**: Includes proper error handling and connection management

## Customization

You can modify the connection parameters in the `connect_to_database()` function if your PostgreSQL setup is different.