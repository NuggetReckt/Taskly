import {client} from "@/app/http/client";
import {BoardData} from "@/app/components/board";
import {getBoardMembers, getBoardMembersAsUsers, getUserById} from "@/app/http/users";
import {BoardCardData, BoardLabelData, BoardMemberData, BoardViewData} from "@/app/components/boardView";
import {User} from "@/app/components/user";
import {ListData} from "@/app/components/list";


export async function fetchBoards(): Promise<BoardData[]> {
    try {
        const response = await client.get("boards");
        const boardsList = response.data['boards'];

        return Promise.all(boardsList.map(async (item: any) => ({
            id: item.id,
            title: item.title,
            owner: await getUserById(item.owner_id),
            members: await getBoardMembersAsUsers(item.id)
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
            members: await getBoardMembersAsUsers(item.id)
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
            members: await getBoardMembersAsUsers(item.id)
        })));
    } catch (error) {
        console.error("Error fetching boards:", error);
        throw error;
    }
}

export async function createBoard(ownerId: number, title: string, description: string): Promise<any> {
    try {
        const response = await client.post("board", {
            owner_id: ownerId,
            title: title,
            description: description
        });
        return response.data;
    } catch (error) {
        console.error("Error creating board:", error);
        throw error;
    }
}

export async function fetchBoardDetails(boardId: number): Promise<BoardViewData> {
    try {
        const response = await client.get("board/" + boardId);
        const board = response.data;

        const owner: User = await getUserById(board['owner_id']);
        let members: BoardMemberData[] = await getBoardMembers(boardId);
        let labels: BoardLabelData[] = board['labels'].map((label: any): BoardLabelData => {
            return {
                name: label.name, color: label.color
            }
        });
        let lists: ListData[] = board['lists'].map((list: any): ListData => {
            const cards = list.cards.map((card: any): BoardCardData => {
                const assignees: BoardMemberData[] = [];
                const labels: BoardLabelData[] = card.labels.map((label: any): BoardLabelData => {
                    return {
                        name: label.name, color: label.color
                    }
                });
                return {
                    assignees: assignees, desc: card.desc, labels: labels, title: card.description
                }
            });
            return {
                cards: cards, pos: list.position, title: list.title
            }
        });

        return {
            id: board['id'],
            title: board['title'],
            description: board['description'],
            owner: owner,
            members: members,
            lists: lists,
            labels: labels
        };
    } catch (error) {
        console.error("Error fetching boards:", error);
        throw error;
    }
}
