import {client} from "@/app/http/client";
import {ListData} from "@/app/components/list";

export async function createList(boardId: number, title: string, position: number): Promise<any> {
    try {
        const response = await client.post("board/" + boardId + "/list", {
            board_id: boardId,
            title: title,
            position: position
        });
        return response.data;
    } catch (error) {
        console.error("Error creating list:", error);
        throw error;
    }
}

export async function fetchBoardLists(boardId: number): Promise<any> {
    try {
        const response = await client.get("board/" + boardId + "/lists");
        return response.data;
    } catch (error) {
        console.error("Error retrieving lists:", error);
        throw error;
    }
}

export async function fetchBoardList(boardId: number, listId: number): Promise<any> {
    try {
        const response = await client.get("board/" + boardId + "/list/" + listId);
        return response.data;
    } catch (error) {
        console.error("Error retrieving list:", error);
        throw error;
    }
}

export async function deleteList(boardId: number, listId: number): Promise<any> {
    try {
        const response = await client.delete("board/" + boardId + "/list/" + listId);
        return response.data;
    } catch (error) {
        console.error("Error deleting list:", error);
    }
}