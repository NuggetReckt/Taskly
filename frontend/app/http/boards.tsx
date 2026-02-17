import {client} from "@/app/http/client";
import {BoardData} from "@/app/components/board";
import {getBoardMembers, getBoardMembersAsUsers, getUserById} from "@/app/http/users";
import {BoardMemberData, BoardViewData} from "@/app/components/boardView";
import {User} from "@/app/components/user";
import {ListData} from "@/app/components/list";
import {LabelData} from "@/app/components/label";
import {CardData} from "@/app/components/card";
import {BoardInviteData} from "@/app/components/inviteCard";


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

export async function fetchBoard(boardId: number): Promise<BoardData> {
    try {
        const response = await client.get("board/" + boardId);
        const board = response.data;

        return {
            id: board.id,
            title: board.title,
            owner: await getUserById(board.owner_id),
            members: await getBoardMembersAsUsers(board.id)
        };
    } catch (error) {
        console.error("Error fetching boards:", error);
        throw error;
    }
}

export async function fetchBoardDetails(boardId: number): Promise<BoardViewData> {
    try {
        const response = await client.get("board/" + boardId + "/details");
        const board = response.data;

        const owner: User = await getUserById(board['owner_id']);
        let members: BoardMemberData[] = await getBoardMembers(boardId);
        let labels: LabelData[] = board['labels'].map((label: any): LabelData => {
            return {
                id: label.id, name: label.name, color: label.color
            }
        });
        let lists: ListData[] = board['lists'].map((list: any): ListData => {
            const cards = list.cards.map((card: any): CardData => {
                const cardLabels: LabelData[] = card.labels.map((labelId: any): LabelData => {
                    const label = labels.find(l => l.id === labelId);
                    return {
                        id: labelId,
                        name: label?.name || "Unknown",
                        color: label?.color || "#000000"
                    }
                });
                const cardAssignees: BoardMemberData[] = card.assignees.map((assigneeId: any): BoardMemberData => {
                    let member = members.find(m => m.user.id == assigneeId);
                    if (!member && owner.id == assigneeId) {
                        member = {role: "admin", user: owner};
                    }
                    return member || {role: "member", user: {id: assigneeId, firstName: "Unknown", lastName: "User", email: ""}};
                });
                return {
                    id: card.id, pos: card.position, assignees: cardAssignees, desc: card.description, labels: cardLabels, title: card.title
                }
            });
            return {
                id: list['id'], boardId: board['id'], cards: cards, pos: list.position, title: list.title
            }
        });

        members.push({user: owner, role: "owner"});
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

export async function createLabel(boardId: number, name: string, color: string): Promise<any> {
    try {
        const response = await client.post(`board/${boardId}/label`, {
            name: name,
            color: color
        });
        return response.data;
    } catch (error) {
        console.error("Error creating label:", error);
        throw error;
    }
}

export async function fetchBoardInvite(code: string): Promise<BoardInviteData> {
    try {
        const response = await client.get(`board/invite/${code}`);
        return {
            id: response.data.id,
            code: response.data.code,
            role: response.data.role,
            boardId: response.data.board_id
        }
    } catch (error) {
        console.error("Error fetching invite:", error);
        throw error;
    }
}

export async function fetchBoardInvites(boardId: number): Promise<BoardInviteData[]> {
    try {
        const response = await client.get(`board/${boardId}/invites`);
        return response.data.map((invite: any): BoardInviteData => {
            return {
                id: invite['id'], code: invite['code'], boardId: invite['board_id'], role: invite['role']
            }
        });
    } catch (error) {
        console.error("Error fetching invite:", error);
        throw error;
    }
}

export async function createInvite(boardId: number, role: string): Promise<string> {
    try {
        const response = await client.post(`board/${boardId}/invite`, {
            role: role,
            board_id: boardId
        });
        return response.data['code'];
    } catch (error) {
        console.error("Error fetching invite:", error);
        throw error;
    }
}

export async function deleteInvite(boardId: number, inviteId: number): Promise<string> {
    try {
        const response = await client.delete(`board/${boardId}/invite/${inviteId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching invite:", error);
        throw error;
    }
}

export async function addMemberToBoard(boardId: number, userId: number, role: string): Promise<any> {
    try {
        const response = await client.put(`board/${boardId}/member`, {
            user_id: userId,
            role: role
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching invite:", error);
        throw error;
    }
}