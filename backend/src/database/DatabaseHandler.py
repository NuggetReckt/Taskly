from typing import Union

import psycopg
from psycopg.rows import dict_row
from psycopg import sql


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

    def execute(self, query: str, params=None) -> Union[dict, int]:
        if not self.is_connected():
            self.connect()
        cursor = self.client.cursor(row_factory=dict_row)

        if params is not None and not isinstance(params, (list, tuple, dict)):
            params = (params,)

        cursor.execute(query, params)
        if cursor.description is not None:
            results = cursor.fetchall()
            return results
        else:
            return cursor.rowcount

    def update_table_values(self, table: str, id: int, fields: dict):
        cursor = self.client.cursor()
        set_parts = [
            sql.SQL("{} = %s").format(sql.Identifier(col))
            for col in fields.keys()
        ]
        set_clause = sql.SQL(", ").join(set_parts)
        query = sql.SQL("UPDATE {table} SET {set_clause} WHERE id = %s").format(
            table=sql.Identifier(table),
            set_clause=set_clause
        )
        params = list(fields.values()) + [id]
        cursor.execute(query, params)

    def disconnect(self):
        self.client.cursor().close()
        self.client.close()

    def is_connected(self):
        if self.client is None:
            return False
        return not self.client.closed or not self.client.broken
