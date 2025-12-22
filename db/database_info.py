#!/usr/bin/env python3
"""
PostgreSQL Database Information Viewer
Connects to PostgreSQL and displays database information
"""

import psycopg2
from psycopg2 import sql
import os
from datetime import datetime

def connect_to_database():
    """Connect to PostgreSQL database using environment variables or defaults"""
    try:
        connection = psycopg2.connect(
            host="localhost",
            port="5432",
            database="railway12306",
            user="postgres",
            password="postgres"
        )
        return connection
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def get_database_info(connection):
    """Get basic database information"""
    try:
        cursor = connection.cursor()
        
        # Get database version
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        
        # Get current database name
        cursor.execute("SELECT current_database();")
        db_name = cursor.fetchone()[0]
        
        # Get database size
        cursor.execute("SELECT pg_database_size(current_database());")
        db_size_bytes = cursor.fetchone()[0]
        db_size_mb = db_size_bytes / (1024 * 1024)
        
        # Get connection info
        cursor.execute("SELECT inet_server_addr(), inet_server_port();")
        server_info = cursor.fetchone()
        
        return {
            'version': version,
            'database_name': db_name,
            'database_size_mb': round(db_size_mb, 2),
            'server_ip': server_info[0] if server_info[0] else 'localhost',
            'server_port': server_info[1]
        }
    except Exception as e:
        print(f"Error getting database info: {e}")
        return None

def get_tables_info(connection):
    """Get information about all tables in the database"""
    try:
        cursor = connection.cursor()
        
        cursor.execute("""
            SELECT 
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
            FROM pg_tables 
            WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
        """)
        
        tables = cursor.fetchall()
        
        tables_info = []
        for table in tables:
            schemaname, tablename, size_pretty, size_bytes = table
            
            # Get row count for each table
            try:
                cursor.execute(sql.SQL("SELECT COUNT(*) FROM {}.{}").format(
                    sql.Identifier(schemaname),
                    sql.Identifier(tablename)
                ))
                row_count = cursor.fetchone()[0]
            except:
                row_count = "N/A"
            
            tables_info.append({
                'schema': schemaname,
                'table_name': tablename,
                'size_pretty': size_pretty,
                'size_bytes': size_bytes,
                'row_count': row_count
            })
        
        return tables_info
    except Exception as e:
        print(f"Error getting tables info: {e}")
        return []

def get_active_connections(connection):
    """Get information about active connections"""
    try:
        cursor = connection.cursor()
        
        cursor.execute("""
            SELECT 
                count(*) as total_connections,
                count(*) FILTER (WHERE state = 'active') as active_connections,
                count(*) FILTER (WHERE state = 'idle') as idle_connections
            FROM pg_stat_activity 
            WHERE datname = current_database();
        """)
        
        conn_info = cursor.fetchone()
        
        cursor.execute("""
            SELECT 
                pid,
                usename,
                application_name,
                client_addr,
                state,
                query_start,
                query
            FROM pg_stat_activity 
            WHERE datname = current_database() AND state IS NOT NULL
            ORDER BY query_start DESC
            LIMIT 10;
        """)
        
        active_queries = cursor.fetchall()
        
        return {
            'total_connections': conn_info[0],
            'active_connections': conn_info[1],
            'idle_connections': conn_info[2],
            'recent_queries': active_queries
        }
    except Exception as e:
        print(f"Error getting connection info: {e}")
        return None

def display_database_info():
    """Main function to display all database information"""
    print("=" * 60)
    print("PostgreSQL Database Information Viewer")
    print("=" * 60)
    
    # Connect to database
    connection = connect_to_database()
    if not connection:
        print("Failed to connect to database. Please check your connection settings.")
        return
    
    try:
        # Get basic database info
        db_info = get_database_info(connection)
        if db_info:
            print(f"\n📊 Database Information:")
            print(f"   Database Name: {db_info['database_name']}")
            print(f"   PostgreSQL Version: {db_info['version'].split(',')[0]}")
            print(f"   Database Size: {db_info['database_size_mb']} MB")
            print(f"   Server: {db_info['server_ip']}:{db_info['server_port']}")
        
        # Get tables information
        tables_info = get_tables_info(connection)
        if tables_info:
            print(f"\n📋 Tables Information ({len(tables_info)} tables):")
            print("   " + "-" * 80)
            print("   {:<20} {:<30} {:<10} {:<15}".format("Schema", "Table Name", "Rows", "Size"))
            print("   " + "-" * 80)
            
            for table in tables_info:
                print("   {:<20} {:<30} {:<10} {:<15}".format(
                    table['schema'],
                    table['table_name'],
                    str(table['row_count']),
                    table['size_pretty']
                ))
        
        # Get connection information
        conn_info = get_active_connections(connection)
        if conn_info:
            print(f"\n🔗 Connection Information:")
            print(f"   Total Connections: {conn_info['total_connections']}")
            print(f"   Active Connections: {conn_info['active_connections']}")
            print(f"   Idle Connections: {conn_info['idle_connections']}")
            
            if conn_info['recent_queries']:
                print(f"\n   Recent Queries:")
                print("   " + "-" * 100)
                for query_info in conn_info['recent_queries']:
                    pid, usename, app_name, client_addr, state, query_start, query = query_info
                    print(f"   User: {usename or 'N/A'}")
                    print(f"   State: {state}")
                    print(f"   Started: {query_start}")
                    print(f"   Query: {query[:100]}{'...' if len(query) > 100 else ''}")
                    print("   " + "-" * 100)
        
        print(f"\n✅ Database connection successful!")
        print(f"⏰ Information retrieved at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
    except Exception as e:
        print(f"Error displaying database information: {e}")
    
    finally:
        if connection:
            connection.close()
            print(f"🔌 Database connection closed.")

if __name__ == "__main__":
    # Check if psycopg2 is installed
    try:
        import psycopg2
    except ImportError:
        print("psycopg2 is not installed. Installing...")
        os.system("pip install psycopg2-binary")
        print("Please run the script again after installation.")
        exit(1)
    
    display_database_info()