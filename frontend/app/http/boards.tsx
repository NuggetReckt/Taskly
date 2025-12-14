import {client} from "@/app/http/client";
import {BoardData} from "@/app/components/board";

export async function fetchBoards(): Promise<BoardData[]> {
    try {
        const response = await client.get("boards");
        const boardsList = response.data['boards'];

        return boardsList.map((item: any) => ({
            id: item.id,
            title: item.title,
            owner: "user " + item.owner_id,
            owner_id: item.owner_id,
            description: item.description
        }));
    } catch (error) {
        console.error("Error fetching boards:", error);
        throw error;
    }
}

export async function fetchMemberBoards(userId: number): Promise<BoardData[]> {
    try {
        const response = await client.get("boards/" + userId);
        const boardsList = response.data['boards'];

        return boardsList.map((item: any) => ({
            id: item.id,
            title: item.title,
            owner: "user " + item.owner_id,
            owner_id: item.owner_id,
            description: item.description
        }));
    } catch (error) {
        console.error("Error fetching boards:", error);
        throw error;
    }
}

export async function fetchUserBoards(userId: number): Promise<BoardData[]> {
    try {
        const response = await client.get("user/" + userId + "/boards");
        const boardsList = response.data['boards'];

        return boardsList.map((item: any) => ({
            id: item.id,
            title: item.title,
            owner: "user " + item.owner_id,
            owner_id: item.owner_id,
            description: item.description
        }));
    } catch (error) {
        console.error("Error fetching boards:", error);
        throw error;
    }
}
