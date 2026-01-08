import {client} from "@/app/http/client";
import {User} from "@/app/components/user";
import {BoardMemberData} from "@/app/components/boardView";

export async function getUserById(userId: number): Promise<User> {
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

export async function getBoardMembersAsUsers(boardId: number): Promise<User[]> {
    try {
        const response = await client.get("board/" + boardId + "/members");
        const membersList = response.data['members'];

        return Promise.all(membersList.map(async (item: any) => await getUserById(item.user_id)));
    } catch (error) {
        console.error("Error fetching board members:", error);
        throw error;
    }
}

export async function getBoardMembers(boardId: number): Promise<BoardMemberData[]> {
    try {
        const response = await client.get("board/" + boardId + "/members");
        const membersList = response.data['members'];

        return Promise.all(membersList.map(async (item: any): Promise<BoardMemberData> => {
            const user = await getUserById(item.user_id);
            return {
                user: user,
                role: item.role
            };
        }));
    } catch (error) {
        console.error("Error fetching board members:", error);
        throw error;
    }
}