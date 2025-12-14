import psycopg
from psycopg.rows import dict_row


class DatabaseHandler:
    def __init__(self, user, password, host, database):
        self.user = user
        self.password = password
        self.host = host
        self.database = database
        self.client = None

    def connect(self):
        self.client = psycopg.connect(
            dbname=self.database,
            user=self.user,
            password=self.password,
            host=self.host,
            autocommit=True
        )

    def execute(self, query: str, params=None):
        if not self.is_connected():
            self.connect()
        cursor = self.client.cursor(row_factory=dict_row)

        cursor.execute(query, params)
        if cursor.description is not None:
            results = cursor.fetchall()
            return results
        else:
            return cursor.rowcount

    def update_table_values(self, table: str, id: int, fields: dict):
        cursor = self.client.cursor()
        set_parts = [f"{key} = %s" for key in fields.keys()]
        set_string = ", ".join(set_parts)
        sql = f"UPDATE {table} SET {set_string} WHERE id = %s"
        params = list(fields.values()) + [id]

        cursor.execute(sql, params)

    def disconnect(self):
        self.client.cursor().close()
        self.client.close()

    def is_connected(self):
        if self.client is None:
            return False
        return not self.client.closed or not self.client.broken
