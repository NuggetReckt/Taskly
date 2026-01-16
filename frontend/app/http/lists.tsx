import {client} from "@/app/http/client";

export async function createList(boardId: number, title: string, position: number): Promise<any> {
    try {
        const response = await client.post("list", {
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