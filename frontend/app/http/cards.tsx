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
        console.error("Error creating card:", error);
        throw error;
    }
}

export async function removeCard(boardId: number, cardId: number): Promise<any> {
    try {
        const response = await client.delete(`board/${boardId}/card/${cardId}`);
        return response.data;
    } catch (error) {
        console.error("Error updating card:", error);
        throw error;
    }
}

export async function updateCard(boardId: number, cardId: number, title: string, desc: string, position: number): Promise<any> {
    try {
        const response = await client.put(`board/${boardId}/card/${cardId}`, {
            title: title,
            description: desc,
            position: position
        });
        return response.data;
    } catch (error) {
        console.error("Error updating card:", error);
        throw error;
    }
}

export async function moveCard(boardId: number, cardId: number, position: number, listId?: number): Promise<any> {
    try {
        const payload: { new_position: number; list_id?: number } = {new_position: position};
        if (listId !== undefined) {
            payload.list_id = listId;
        }
        const response = await client.put(`board/${boardId}/card/${cardId}/move`, payload);
        return response.data;
    } catch (error) {
        console.error("Error moving card:", error);
        throw error;
    }
}

export async function addCardLabel(boardId: number, cardId: number, labelId: number): Promise<any> {
    try {
        const response = await client.post(`board/${boardId}/card/${cardId}/label/${labelId}`);
        return response.data;
    } catch (error) {
        console.error("Error adding card label:", error);
        throw error;
    }
}

export async function removeCardLabel(boardId: number, cardId: number, labelId: number): Promise<any> {
    try {
        const response = await client.delete(`board/${boardId}/card/${cardId}/label/${labelId}`);
        return response.data;
    } catch (error) {
        console.error("Error removing card label:", error);
        throw error;
    }
}

export async function addCardAssignee(boardId: number, cardId: number, userId: number): Promise<any> {
    try {
        const response = await client.post(`board/${boardId}/card/${cardId}/assignee/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error adding card assignee:", error);
        throw error;
    }
}

export async function removeCardAssignee(boardId: number, cardId: number, userId: number): Promise<any> {
    try {
        const response = await client.delete(`board/${boardId}/card/${cardId}/assignee/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error removing card assignee:", error);
        throw error;
    }
}
