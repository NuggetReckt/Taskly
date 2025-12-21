import {client} from "@/app/http/client";
import {BoardData} from "@/app/components/board";
import {User} from "@/app/components/user";

export async function fetchBoards(): Promise<BoardData[]> {
    try {
        const response = await client.get("boards");
        const boardsList = response.data['boards'];

        return Promise.all(boardsList.map(async (item: any) => ({
            id: item.id,
            title: item.title,
            owner: await getUserById(item.owner_id),
            members: await getBoardMembers(item.id)
        })));
    } catch (error) {
        console.error("Error fetching boards:", error);
        throw error;
    }
}

export async function fetchMemberBoards(userId: number): Promise<BoardData[]> {
    try {
        const response = await client.get("boards/" + userId);
        const boardsList = response.data['boards'];

        return Promise.all(boardsList.map(async (item: any) => ({
            id: item.id,
            title: item.title,
            owner: await getUserById(item.owner_id),
            members: await getBoardMembers(item.id)
        })));
    } catch (error) {
        console.error("Error fetching boards:", error);
        throw error;
    }
}

export async function fetchUserBoards(userId: number): Promise<BoardData[]> {
    try {
        const response = await client.get("user/" + userId + "/boards");
        const boardsList = response.data['boards'];

        return Promise.all(boardsList.map(async (item: any) => ({
            id: item.id,
            title: item.title,
            owner: await getUserById(item.owner_id),
            members: await getBoardMembers(item.id)
        })));
    } catch (error) {
        console.error("Error fetching boards:", error);
        throw error;
    }
}

async function getUserById(userId: number): Promise<User> {
    try {
        const response = await client.get("user/" + userId);
        const userData = response.data;

        return {
            id: userData.id,
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name
        };
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
}

async function getBoardMembers(boardId: number): Promise<User[]> {
    try {
        const response = await client.get("board/" + boardId + "/members");
        const membersList = response.data['members'];

        return Promise.all(membersList.map(async (item: any) => await getUserById(item.user_id)));
    } catch (error) {
        console.error("Error fetching board members:", error);
        throw error;
    }
}
