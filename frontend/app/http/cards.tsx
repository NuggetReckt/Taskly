import {client} from "@/app/http/client";

export async function createCard(boardId: number, listId: number, title: string, desc: string, position: number): Promise<any> {
    try {
        const response = await client.post("board/" + boardId + "/card", {
            board_id: boardId,
            list_id: listId,
            title: title,
            position: position,
            description: desc
        });
        return response.data;
    } catch (error) {
        console.error("Error creating list:", error);
        throw error;
    }
}