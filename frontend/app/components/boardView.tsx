import List, {ListData} from "@/app/components/list";
import {User, useUser} from "@/app/components/user";
import Label, {LabelData} from "@/app/components/label";
import React, {useState} from "react";
import {
    createInvite,
    createLabel,
    deleteBoard,
    deleteInvite,
    deleteLabel,
    fetchBoardInvites,
    removeBoardMember,
    transferBoardOwnership,
    updateBoard,
    updateBoardMemberRole,
    updateBoardStatus
} from "@/app/http/boards";
import {addCardAssignee, addCardLabel, createCard, moveCard, removeCardAssignee, removeCardLabel, updateCard} from "@/app/http/cards";
import {createList, moveList} from "@/app/http/lists";
import {CardData} from "@/app/components/card";
import MemberMedal from "@/app/components/memberMedal";
import {DndContext, DragEndEvent, KeyboardSensor, MouseSensor, PointerSensor, TouchSensor, useSensor, useSensors} from "@dnd-kit/core";
import InviteCard, {BoardInviteData} from "@/app/components/inviteCard";

export interface BoardMemberData {
    user: User;
    role: string;
}

export interface BoardViewData {
    id: number;
    title: string;
    description: string;
    boardStatus: "active" | "archived";
    owner: User;
    members: BoardMemberData[];
    lists: ListData[];
    labels: LabelData[];
}

export default function BoardView(data: BoardViewData) {
    const inviteRoleOptions = [
        {value: "viewer", label: "Viewer (Read-Only)"},
        {value: "editor", label: "Editor"},
        {value: "admin", label: "Administrator"}
    ];
    const user = useUser();
    const [currentListPos, setCurrentListPos] = useState(data.lists.length);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPlusModalOpen, setIsPlusModalOpen] = useState(false);
    const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isBoardEditModalOpen, setIsBoardEditModalOpen] = useState(false);
    const [newListTitle, setNewListTitle] = useState("");
    const [newLabelName, setNewLabelName] = useState("");
    const [newLabelColor, setNewLabelColor] = useState("#000000");
    const [newCardTitle, setNewCardTitle] = useState("");
    const [newCardDesc, setNewCardDesc] = useState("");
    const [newCardListId, setNewCardListId] = useState<number | null>(null);
    const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
    const [editingCardTitle, setEditingCardTitle] = useState("");
    const [editingCardDesc, setEditingCardDesc] = useState("");
    const [isLabelSelectorOpen, setIsLabelSelectorOpen] = useState(false);
    const [isAssigneeSelectorOpen, setIsAssigneeSelectorOpen] = useState(false);
    const [invites, setInvites] = useState<BoardInviteData[]>([]);
    const [inviteCreateRole, setInviteCreateRole] = useState("viewer");
    const [newComment, setNewComment] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editBoardTitle, setEditBoardTitle] = useState(data.title);
    const [editBoardDescription, setEditBoardDescription] = useState(data.description);
    const [editMembers, setEditMembers] = useState<BoardMemberData[]>(data.members.map(member => ({...member})));
    const [editLabels, setEditLabels] = useState<LabelData[]>(data.labels.map(label => ({...label})));
    const [newEditLabelName, setNewEditLabelName] = useState("");
    const [newEditLabelColor, setNewEditLabelColor] = useState("#000000");
    const [ownershipTransferUserId, setOwnershipTransferUserId] = useState<number | null>(null);
    const [boardStatus, setBoardStatus] = useState<"active" | "archived">(data.boardStatus);
    const [deletingBoard, setDeletingBoard] = useState(false);
    const [archivingBoard, setArchivingBoard] = useState(false);
    const [applyingBoardEdits, setApplyingBoardEdits] = useState(false);
    const [transferringOwnership, setTransferringOwnership] = useState(false);
    const isReadOnly = boardStatus === "archived";
    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 0.01
        }
    })
    const mouseSensor = useSensor(MouseSensor)
    const touchSensor = useSensor(TouchSensor)
    const keyboardSensor = useSensor(KeyboardSensor)

    const sensors = useSensors(
        mouseSensor,
        touchSensor,
        keyboardSensor,
        pointerSensor
    )

    const handleCreateListClick = () => {
        setIsModalOpen(true);
    };

    const handleShareClick = async () => {
        const result = await fetchBoardInvites(data.id);
        setInvites(result);
        const usedRoles = new Set(result.map(invite => invite.role.toLowerCase()));
        const firstAvailableRole = inviteRoleOptions.find(option => !usedRoles.has(option.value));
        setInviteCreateRole(firstAvailableRole?.value ?? "");
        setIsShareModalOpen(true)
    }

    const handleOpenBoardEditModal = () => {
        setEditBoardTitle(data.title);
        setEditBoardDescription(data.description);
        setEditMembers(data.members.map(member => ({...member})));
        setEditLabels(data.labels.map(label => ({...label})));
        setNewEditLabelName("");
        setNewEditLabelColor("#000000");
        setOwnershipTransferUserId(null);
        setError(null);
        setIsBoardEditModalOpen(true);
    }

    const handlePlusClick = () => {
        if (isPlusModalOpen) {
            setIsPlusModalOpen(false);
        } else {
            setIsPlusModalOpen(true);
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsPlusModalOpen(false);
        setIsLabelModalOpen(false);
        setIsCardModalOpen(false);
        setSelectedCard(null);
        setIsLabelSelectorOpen(false);
        setIsAssigneeSelectorOpen(false);
        setIsShareModalOpen(false);
        setIsBoardEditModalOpen(false);
        setError(null);
    };

    const handleCardClick = (card: CardData) => {
        setSelectedCard(card);
        setEditingCardTitle(card.title);
        setEditingCardDesc(card.desc);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleCreateInvitePermissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setInviteCreateRole(e.target.value);
    };

    const usedInviteRoles = new Set(invites.map(invite => invite.role.toLowerCase()));
    const availableInviteRoles = inviteRoleOptions.filter(option => !usedInviteRoles.has(option.value));
    const areAllInviteRolesUsed = availableInviteRoles.length === 0;

    const filteredLists = data.lists.map(list => ({
        ...list,
        cards: list.cards.filter(card =>
            card.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }));

    const onSaveCard = async () => {
        if (!selectedCard) return;
        if (isReadOnly) {
            setError("This board is archived and read-only.");
            return;
        }
        setCreating(true);
        try {
            await updateCard(data.id, selectedCard.id, editingCardTitle, editingCardDesc, selectedCard.pos);
            handleCloseModal();
            window.location.reload();
        } catch (err: any) {
            setError(err?.message ?? "Failed to update card");
        } finally {
            setCreating(false);
        }
    };

    const onAddLabelToCard = async (label: LabelData) => {
        if (!selectedCard || !label.id) return;
        if (isReadOnly) {
            setError("This board is archived and read-only.");
            return;
        }
        try {
            await addCardLabel(data.id, selectedCard.id, label.id);
            const updatedCard = {...selectedCard, labels: [...selectedCard.labels, label]};
            setSelectedCard(updatedCard);
            setIsLabelSelectorOpen(false);
        } catch (err: any) {
            setError(err?.message ?? "Failed to add label");
        }
    };

    const onRemoveLabelFromCard = async (labelId: number) => {
        if (!selectedCard) return;
        if (isReadOnly) {
            setError("This board is archived and read-only.");
            return;
        }
        try {
            await removeCardLabel(data.id, selectedCard.id, labelId);
            const updatedCard = {...selectedCard, labels: selectedCard.labels.filter(l => l.id !== labelId)};
            setSelectedCard(updatedCard);
        } catch (err: any) {
            setError(err?.message ?? "Failed to remove label");
        }
    };

    const onAddAssigneeToCard = async (member: BoardMemberData) => {
        if (!selectedCard) return;
        if (isReadOnly) {
            setError("This board is archived and read-only.");
            return;
        }
        try {
            await addCardAssignee(data.id, selectedCard.id, member.user.id);
            const updatedCard = {...selectedCard, assignees: [...selectedCard.assignees, member]};
            setSelectedCard(updatedCard);
            setIsAssigneeSelectorOpen(false);
        } catch (err: any) {
            setError(err?.message ?? "Failed to add assignee");
        }
    };

    const onRemoveAssigneeFromCard = async (userId: number) => {
        if (!selectedCard) return;
        if (isReadOnly) {
            setError("This board is archived and read-only.");
            return;
        }
        try {
            await removeCardAssignee(data.id, selectedCard.id, userId);
            const updatedCard = {...selectedCard, assignees: selectedCard.assignees.filter(a => a.user.id !== userId)};
            setSelectedCard(updatedCard);
        } catch (err: any) {
            setError(err?.message ?? "Failed to remove assignee");
        }
    };

    const onCreateLabel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newLabelName.trim()) return;
        if (isReadOnly) {
            setError("This board is archived and read-only.");
            return;
        }

        setCreating(true);
        setError(null);

        try {
            await createLabel(data.id, newLabelName.trim(), newLabelColor);
            handleCloseModal();
            window.location.reload(); /* TODO: TROUVER MEILLEUR MOYEN DE REFRESH LE BOARD */
        } catch (err: any) {
            setError(err?.message ?? "Failed to create label");
        } finally {
            setCreating(false);
        }
    };

    const onCreateCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newCardTitle.trim() || newCardListId === null) return;
        if (isReadOnly) {
            setError("This board is archived and read-only.");
            return;
        }

        setCreating(true);
        setError(null);

        try {
            const list = data.lists.find(l => l.id === newCardListId);
            const pos = list ? list.cards.length : 0;
            await createCard(data.id, newCardListId, newCardTitle.trim(), newCardDesc.trim(), pos);
            handleCloseModal();
            window.location.reload(); /* TODO: TROUVER MEILLEUR MOYEN DE REFRESH LE BOARD */
        } catch (err: any) {
            setError(err?.message ?? "Failed to create card");
        } finally {
            setCreating(false);
        }
    };

    const onCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newListTitle.trim()) return;
        if (isReadOnly) {
            setError("This board is archived and read-only.");
            return;
        }

        setCreating(true);
        setError(null);

        try {
            setCurrentListPos(data.lists.length)
            const result = await createList(data.id, newListTitle.trim(), currentListPos + 1);
            handleCloseModal();
            if (result && result.id) {
                setCurrentListPos(currentListPos + 1);
                window.location.reload(); /* TODO: TROUVER MEILLEUR MOYEN DE REFRESH LE BOARD */
            }
        } catch (err: any) {
            setError(err?.message ?? "Failed to create list");
        } finally {
            setCreating(false);
        }
    };

    const onCreateInvite = async () => {
        if (!user || inviteCreateRole === "" || areAllInviteRolesUsed) return;
        if (isReadOnly) {
            setError("This board is archived and read-only.");
            return;
        }

        try {
            const result = await createInvite(data.id, inviteCreateRole);
            if (result) {
                const nextInvites = await fetchBoardInvites(data.id);
                setInvites(nextInvites);
                const nextUsedRoles = new Set(nextInvites.map(invite => invite.role.toLowerCase()));
                const nextAvailableRole = inviteRoleOptions.find(option => !nextUsedRoles.has(option.value));
                setInviteCreateRole(nextAvailableRole?.value ?? "");
            }
        } catch (err: any) {
            setError(err?.message ?? "Failed to create invite");
        } finally {
            setCreating(false);
        }
    }

    const onDeleteInvite = async (inviteId: number) => {
        if (!user) return;
        if (isReadOnly) {
            setError("This board is archived and read-only.");
            return;
        }

        try {
            const result = await deleteInvite(data.id, inviteId);
            if (result) {
                console.log(result)
                const nextInvites = await fetchBoardInvites(data.id);
                setInvites(nextInvites);
                const nextUsedRoles = new Set(nextInvites.map(invite => invite.role.toLowerCase()));
                const nextAvailableRole = inviteRoleOptions.find(option => !nextUsedRoles.has(option.value));
                setInviteCreateRole(nextAvailableRole?.value ?? "");
            }
        } catch (err: any) {
            setError(err?.message ?? "Failed to create invite");
        } finally {
            setCreating(false);
        }
    }


    async function handleDragEnd(event: DragEndEvent) {
        if (isReadOnly) return;
        const {active, over} = event;
        if (!over) return;
        const activeData: any = active.data.current;
        const overData: any = over.data.current;
        if (!activeData || !overData) return;

        if (activeData.type === "list" && overData.type === "list") {
            if (activeData.listId === overData.listId || activeData.pos === overData.pos) return;
            await moveList(data.id, activeData.listId, overData.pos);
            window.location.reload(); /* TODO: TROUVER MEILLEUR MOYEN DE REFRESH LE BOARD */
            return;
        }

        if (activeData.type === "card") {
            let targetListId: number | undefined;
            let targetPos: number | undefined;
            if (overData.type === "card") {
                targetListId = overData.listId;
                targetPos = overData.pos;
            } else if (overData.type === "list") {
                targetListId = overData.listId;
                targetPos = overData.cardsCount ?? 0;
            }
            if (targetListId === undefined || targetPos === undefined) return;
            if (activeData.listId === targetListId && activeData.pos === targetPos) return;

            await moveCard(
                data.id,
                activeData.cardId,
                targetPos,
                activeData.listId === targetListId ? undefined : targetListId
            );
            window.location.reload(); /* TODO: TROUVER MEILLEUR MOYEN DE REFRESH LE BOARD */
        }
    }

    function getInvites(invites: BoardInviteData[]) {
        let items = invites.map(invite => (
            <li key={"invite_" + invite.id} className={"invite-card-wrapper"}>
                <InviteCard id={invite.id} boardId={invite.boardId} code={invite.code} role={invite.role}/>
                <button className="remove-btn" onClick={() => onDeleteInvite(invite.id)}>-
                </button>
            </li>
        ));
        return items;
    }

    const editableMembers = editMembers.filter(member => member.role !== "owner");
    const ownershipCandidates = editMembers.filter(member => member.user.id !== data.owner.id);

    const handleBoardMemberRoleChange = (userId: number, role: string) => {
        setEditMembers(prev => prev.map(member => member.user.id === userId ? {...member, role} : member));
    };

    const handleRemoveBoardMemberFromDraft = (userId: number) => {
        setEditMembers(prev => prev.filter(member => member.user.id !== userId));
    };

    const handleAddBoardLabelToDraft = () => {
        if (!newEditLabelName.trim()) return;
        setEditLabels(prev => [...prev, {name: newEditLabelName.trim(), color: newEditLabelColor}]);
        setNewEditLabelName("");
        setNewEditLabelColor("#000000");
    };

    const handleRemoveBoardLabelFromDraft = (index: number) => {
        setEditLabels(prev => prev.filter((_, labelIndex) => labelIndex !== index));
    };

    const onApplyBoardChanges = async () => {
        if (!editBoardTitle.trim()) {
            setError("Board title cannot be empty.");
            return;
        }
        if (isReadOnly) {
            setError("This board is archived and read-only.");
            return;
        }

        setApplyingBoardEdits(true);
        setError(null);
        try {
            await updateBoard(data.id, editBoardTitle.trim(), editBoardDescription.trim());

            const originalMembers = data.members.filter(member => member.role !== "owner");
            for (const member of editableMembers) {
                const initialMember = originalMembers.find(initial => initial.user.id === member.user.id);
                if (!initialMember) continue;
                if (initialMember.role !== member.role) {
                    await updateBoardMemberRole(data.id, member.user.id, member.role);
                }
            }
            for (const initialMember of originalMembers) {
                const stillPresent = editableMembers.some(member => member.user.id === initialMember.user.id);
                if (!stillPresent) {
                    await removeBoardMember(data.id, initialMember.user.id);
                }
            }

            const originalPersistedLabels = data.labels.filter(label => label.id);
            const editedPersistedLabels = editLabels.filter(label => label.id);
            const newLabels = editLabels.filter(label => !label.id);

            for (const label of originalPersistedLabels) {
                const stillPresent = editedPersistedLabels.some(edited => edited.id === label.id);
                if (!stillPresent && label.id) {
                    await deleteLabel(data.id, label.id);
                }
            }
            for (const label of newLabels) {
                await createLabel(data.id, label.name, label.color);
            }

            window.location.reload();
        } catch (err: any) {
            setError(err?.response?.data?.detail ?? err?.message ?? "Failed to apply board changes");
        } finally {
            setApplyingBoardEdits(false);
        }
    };

    const onTransferOwnership = async () => {
        if (ownershipTransferUserId === null) {
            setError("Select a member to transfer ownership.");
            return;
        }
        if (isReadOnly) {
            setError("This board is archived and read-only.");
            return;
        }

        const confirmed = window.confirm("Transfer ownership to the selected member?");
        if (!confirmed) return;

        setTransferringOwnership(true);
        setError(null);
        try {
            await transferBoardOwnership(data.id, ownershipTransferUserId);
            window.location.reload();
        } catch (err: any) {
            setError(err?.response?.data?.detail ?? err?.message ?? "Failed to transfer ownership");
        } finally {
            setTransferringOwnership(false);
        }
    };

    const onArchiveBoard = async () => {
        if (isReadOnly) {
            setError("This board is already archived.");
            return;
        }
        const confirmed = window.confirm("Archive this board? It will become read-only.");
        if (!confirmed) return;

        setArchivingBoard(true);
        setError(null);
        try {
            await updateBoardStatus(data.id, "archived");
            setBoardStatus("archived");
            window.location.reload();
        } catch (err: any) {
            setError(err?.response?.data?.detail ?? err?.message ?? "Failed to archive board");
        } finally {
            setArchivingBoard(false);
        }
    };

    const onDeleteBoard = async () => {
        const confirmed = window.confirm("Delete this board permanently?");
        if (!confirmed) return;

        setDeletingBoard(true);
        setError(null);
        try {
            await deleteBoard(data.id);
            window.location.href = "/app";
        } catch (err: any) {
            setError(err?.response?.data?.detail ?? err?.message ?? "Failed to delete board");
        } finally {
            setDeletingBoard(false);
        }
    };

    const listItems = filteredLists.sort((a, b) => a.pos - b.pos).map(list =>
        <li key={"list_" + list.id}>
            <List id={list.id} boardId={list.boardId} pos={list.pos} title={list.title} cards={list.cards}
                  onCardClick={handleCardClick} readOnly={isReadOnly}/>
        </li>
    );

    let createListLabel = "Create a new list";
    if (listItems.length === 0)
        createListLabel = "Create your first list";
    listItems.push(
        <li key={"list_create"} className="list-wrapper create-first-list">
            <button className="card-add-btn" onClick={handleCreateListClick} disabled={isReadOnly}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus size-4">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
                <span>{createListLabel}</span>
            </button>
        </li>
    )

    return (
        <div className="board-content">
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="auth-card">
                            <div className="modal-header">
                                <h1 className="auth-title">Create List</h1>
                                <button className="modal-close" onClick={handleCloseModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round" className="lucide lucide-x size-5">
                                        <path d="M18 6 6 18"></path>
                                        <path d="m6 6 12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            <form className="auth-form" onSubmit={onCreateList}>
                                <label className="auth-field">
                                    <span className="auth-label">List Title</span>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        value={newListTitle}
                                        onChange={(e) => setNewListTitle(e.target.value)}
                                        placeholder="My new list"
                                        required
                                        autoFocus
                                    />
                                </label>
                                {error && <p className="auth-error">{error}</p>}
                                <button className="auth-button" type="submit"
                                        disabled={creating || !newListTitle.trim()}>
                                    {creating ? "Creating..." : "Create List"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {isLabelModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="auth-card">
                            <div className="modal-header">
                                <h1 className="auth-title">Create Label</h1>
                                <button className="modal-close" onClick={handleCloseModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round" className="lucide lucide-x size-5">
                                        <path d="M18 6 6 18"></path>
                                        <path d="m6 6 12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            <form className="auth-form" onSubmit={onCreateLabel}>
                                <label className="auth-field">
                                    <span className="auth-label">Label Name</span>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        value={newLabelName}
                                        onChange={(e) => setNewLabelName(e.target.value)}
                                        placeholder="Label name"
                                        required
                                        autoFocus
                                    />
                                </label>
                                <label className="auth-field">
                                    <span className="auth-label">Label Color</span>
                                    <input
                                        className="auth-input"
                                        type="color"
                                        value={newLabelColor}
                                        onChange={(e) => setNewLabelColor(e.target.value)}
                                        required
                                    />
                                </label>
                                {error && <p className="auth-error">{error}</p>}
                                <button className="auth-button" type="submit"
                                        disabled={creating || !newLabelName.trim()}>
                                    {creating ? "Creating..." : "Create Label"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {isCardModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="auth-card">
                            <div className="modal-header">
                                <h1 className="auth-title">Create Card</h1>
                                <button className="modal-close" onClick={handleCloseModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round" className="lucide lucide-x size-5">
                                        <path d="M18 6 6 18"></path>
                                        <path d="m6 6 12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            <form className="auth-form" onSubmit={onCreateCard}>
                                <label className="auth-field">
                                    <span className="auth-label">Card Title</span>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        value={newCardTitle}
                                        onChange={(e) => setNewCardTitle(e.target.value)}
                                        placeholder="Card title"
                                        required
                                        autoFocus
                                    />
                                </label>
                                <label className="auth-field">
                                    <span className="auth-label">Description</span>
                                    <textarea
                                        className="auth-input"
                                        value={newCardDesc}
                                        onChange={(e) => setNewCardDesc(e.target.value)}
                                        placeholder="Card description"
                                    />
                                </label>
                                <label className="auth-field">
                                    <span className="auth-label">List</span>
                                    <select
                                        className="auth-input"
                                        value={newCardListId ?? ""}
                                        onChange={(e) => setNewCardListId(Number(e.target.value))}
                                        required
                                    >
                                        <option value="" disabled>Select a list</option>
                                        {data.lists.map(list => (
                                            <option key={list.id} value={list.id}>{list.title}</option>
                                        ))}
                                    </select>
                                </label>
                                {error && <p className="auth-error">{error}</p>}
                                <button className="auth-button" type="submit"
                                        disabled={creating || !newCardTitle.trim() || newCardListId === null}>
                                    {creating ? "Creating..." : "Create Card"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {isShareModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="auth-card">
                            <div className="modal-header">
                                <h1 className="auth-title">Share Board</h1>
                                <button className="modal-close" onClick={handleCloseModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round" className="lucide lucide-x size-5">
                                        <path d="M18 6 6 18"></path>
                                        <path d="m6 6 12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            <div className={"invites"}>
                                {invites.length === 0 &&
                                    (<div className={"no-invites"}><span>No invites. Create your first one with the button below.</span>
                                    </div>)
                                    ||
                                    (<ul className={"invites-list"}>
                                        {getInvites(invites)}
                                    </ul>)}
                                <div className={"invites-create-field"}>
                                    <div className={"invites-create-permission"}>
                                        <h2>Roles</h2>
                                        <select name="permissions" id="permissions" className={"invite-permission-select"}
                                                value={inviteCreateRole}
                                                onChange={handleCreateInvitePermissionChange}
                                                disabled={areAllInviteRolesUsed}>
                                            {availableInviteRoles.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                            {areAllInviteRolesUsed && (
                                                <option value="">All roles already invited</option>
                                            )}
                                        </select>
                                    </div>
                                    <button className={"create-invite-btn"} onClick={onCreateInvite}
                                            disabled={areAllInviteRolesUsed}>Create invite
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isBoardEditModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content board-edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="auth-card board-edit-card">
                            <div className="modal-header">
                                <h1 className="auth-title">Edit Board</h1>
                                <button className="modal-close" onClick={handleCloseModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round" className="lucide lucide-x size-5">
                                        <path d="M18 6 6 18"></path>
                                        <path d="m6 6 12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            <div className="board-edit-sections">
                                <section className="board-edit-section">
                                    <h2>Board Details</h2>
                                    <label className="auth-field">
                                        <span className="auth-label">Board Name</span>
                                        <input
                                            className="auth-input"
                                            type="text"
                                            value={editBoardTitle}
                                            onChange={(e) => setEditBoardTitle(e.target.value)}
                                            disabled={isReadOnly}
                                        />
                                    </label>
                                    <label className="auth-field">
                                        <span className="auth-label">Description</span>
                                        <textarea
                                            className="auth-input"
                                            value={editBoardDescription}
                                            onChange={(e) => setEditBoardDescription(e.target.value)}
                                            disabled={isReadOnly}
                                        />
                                    </label>
                                </section>

                                <div className={"flex justify-between gap-4"}>
                                    <section className="board-edit-section board-edit-section-members">
                                        <h2>Members</h2>
                                        <div className="board-edit-list">
                                            {editableMembers.length === 0 && <p className="auth-hint">No members.</p>}
                                            {editableMembers.map(member => (
                                                <div key={member.user.id} className="board-edit-row">
                                                    <MemberMedal member={member.user} size={"m"}/>
                                                    <div className="board-edit-row-actions">
                                                        <select
                                                            className="auth-input"
                                                            value={member.role}
                                                            onChange={(e) => handleBoardMemberRoleChange(member.user.id, e.target.value)}
                                                            disabled={isReadOnly}
                                                        >
                                                            <option value="admin">Administrator</option>
                                                            <option value="editor">Editor</option>
                                                            <option value="viewer">Viewer</option>
                                                        </select>
                                                        <button className="remove-btn board-edit-remove-btn"
                                                                onClick={() => handleRemoveBoardMemberFromDraft(member.user.id)}
                                                                disabled={isReadOnly}>
                                                            -
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="board-edit-section board-edit-section-labels">
                                        <h2>Labels</h2>
                                        <div className="board-edit-list">
                                            {editLabels.length === 0 && <p className="auth-hint">No labels.</p>}
                                            {editLabels.map((label, index) => (
                                                <div key={`edit_label_${label.id ?? "new"}_${index}`} className="board-edit-row">
                                                    <Label name={label.name} color={label.color}/>
                                                    <button className="remove-btn board-edit-remove-btn"
                                                            onClick={() => handleRemoveBoardLabelFromDraft(index)}
                                                            disabled={isReadOnly}>
                                                        -
                                                    </button>
                                                </div>
                                            ))}
                                            <div className="board-edit-add-label">
                                                <input
                                                    className="auth-input"
                                                    type="text"
                                                    placeholder="New label name"
                                                    value={newEditLabelName}
                                                    onChange={(e) => setNewEditLabelName(e.target.value)}
                                                    disabled={isReadOnly}
                                                />
                                                <input
                                                    className="auth-input"
                                                    type="color"
                                                    value={newEditLabelColor}
                                                    onChange={(e) => setNewEditLabelColor(e.target.value)}
                                                    disabled={isReadOnly}
                                                />
                                                <button className="auth-button" onClick={handleAddBoardLabelToDraft}
                                                        disabled={isReadOnly || !newEditLabelName.trim()}>
                                                    Add Label
                                                </button>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <section className="board-edit-section danger-zone">
                                    <h2>Danger Zone</h2>
                                    <div className="danger-row">
                                        <div>
                                            <h3>Transfer Ownership</h3>
                                            <p>Transfer this board to another member.</p>
                                        </div>
                                        <div className="danger-actions">
                                            <select
                                                className="auth-input"
                                                value={ownershipTransferUserId ?? ""}
                                                onChange={(e) => setOwnershipTransferUserId(Number(e.target.value))}
                                                disabled={isReadOnly || ownershipCandidates.length === 0 || transferringOwnership}
                                            >
                                                <option value="" disabled>Select member</option>
                                                {ownershipCandidates.map(member => (
                                                    <option key={`owner_candidate_${member.user.id}`} value={member.user.id}>
                                                        {member.user.firstName} {member.user.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                            <button className="auth-button btn-danger" onClick={onTransferOwnership}
                                                    disabled={isReadOnly || ownershipTransferUserId === null || transferringOwnership}>
                                                {transferringOwnership ? "Transferring..." : "Transfer Ownership"}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="danger-row">
                                        <div>
                                            <h3>Archive Board</h3>
                                            <p>Archived boards are read-only.</p>
                                        </div>
                                        <button className="auth-button btn-danger" onClick={onArchiveBoard}
                                                disabled={isReadOnly || archivingBoard}>
                                            {archivingBoard ? "Archiving..." : "Archive Board"}
                                        </button>
                                    </div>
                                    <div className="danger-row">
                                        <div>
                                            <h3>Delete Board</h3>
                                            <p>Permanently delete this board and all its data.</p>
                                        </div>
                                        <button className="auth-button btn-danger" onClick={onDeleteBoard} disabled={deletingBoard}>
                                            {deletingBoard ? "Deleting..." : "Delete Board"}
                                        </button>
                                    </div>
                                </section>
                            </div>
                            <div className="board-edit-footer">
                                {error && <p className="auth-error">{error}</p>}
                                <button className="auth-button" onClick={onApplyBoardChanges}
                                        disabled={isReadOnly || applyingBoardEdits || !editBoardTitle.trim()}>
                                    {applyingBoardEdits ? "Applying..." : "Apply Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="board-header">
                <h1>{data.title}{isReadOnly ? " (Archived)" : ""}</h1>
                <div className="header-tools">
                    <div className="tool-searchbar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                             className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </svg>
                        <input type="text" data-slot="input" placeholder="Search cards..." value={searchQuery}
                               onChange={handleSearchChange}/>
                    </div>
                    <button data-slot="button" className="tool-button" onClick={handlePlusClick} disabled={isReadOnly}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus size-5">
                            <path d="M5 12h14"></path>
                            <path d="M12 5v14"></path>
                        </svg>
                    </button>
                    {isPlusModalOpen && (
                        <div className="plus-modal">
                            <button onClick={() => {
                                setIsLabelModalOpen(true);
                                setIsPlusModalOpen(false);
                            }}>Create label
                            </button>
                            <button onClick={() => {
                                setIsModalOpen(true);
                                setIsPlusModalOpen(false);
                            }}>Create list
                            </button>
                            <button onClick={() => {
                                setIsCardModalOpen(true);
                                setIsPlusModalOpen(false);
                                if (data.lists.length > 0) setNewCardListId(data.lists[0].id);
                            }}>Create card
                            </button>
                        </div>
                    )}
                    <a href="/app" className="tool-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                             className="lucide lucide-house size-5">
                            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                            <path
                                d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        </svg>
                    </a>
                    <button data-slot="button" className="tool-button" onClick={handleShareClick} disabled={isReadOnly}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 16 16"
                             className="lucide lucide-house size-5">
                            <path fill="currentcolor" fillRule="evenodd"
                                  d="M5 1.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M1 4a4 4 0 1 1 8 0 4 4 0 0 1-8 0m11.25 4.75V11h1.5V8.75H16v-1.5h-2.25V5h-1.5v2.25H10v1.5zm-8.5 1.75a2.25 2.25 0 0 0-2.25 2.25V15H0v-2.25A3.75 3.75 0 0 1 3.75 9h2.5A3.75 3.75 0 0 1 10 12.75V15H8.5v-2.25a2.25 2.25 0 0 0-2.25-2.25z"
                                  clipRule="evenodd"></path>
                        </svg>
                    </button>
                    <button data-slot="button" className="tool-button" onClick={handleOpenBoardEditModal}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                             className="lucide lucide-settings size-5">
                            <path
                                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </div>
            </div>
            <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
                <div className="lists-wrapper">
                    <ul className="lists">{listItems}</ul>
                </div>
            </DndContext>
            {selectedCard && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content card-details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <input
                                className="modal-title-input"
                                value={editingCardTitle}
                                onChange={(e) => setEditingCardTitle(e.target.value)}
                            />
                            <button className="modal-close" onClick={handleCloseModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round" className="lucide lucide-x size-5">
                                    <path d="M18 6 6 18"></path>
                                    <path d="m6 6 12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-section">
                                <h3 className="section-title">Description</h3>
                                <textarea
                                    className="description-textarea"
                                    value={editingCardDesc}
                                    onChange={(e) => setEditingCardDesc(e.target.value)}
                                    placeholder="Add a description..."
                                />
                            </div>

                            <div className="modal-section">
                                <h3 className="section-title">Labels</h3>
                                <div className="labels-list">
                                    {selectedCard.labels.map(label => (
                                        <div key={label.id} className="label-item-wrapper">
                                            <Label name={label.name} color={label.color}/>
                                            <button className="remove-btn" onClick={() => label.id && onRemoveLabelFromCard(label.id)}
                                                    disabled={isReadOnly}>
                                                -
                                            </button>
                                        </div>
                                    ))}
                                    <div className="relative">
                                        <button className="add-btn" onClick={() => setIsLabelSelectorOpen(!isLabelSelectorOpen)}
                                                disabled={isReadOnly}>
                                            +
                                        </button>
                                        {isLabelSelectorOpen && (
                                            <div className="selector-dropdown">
                                                {data.labels.filter(l => !selectedCard.labels.find(sl => sl.id === l.id)).map(label => (
                                                    <div key={label.id} className="selector-item" onClick={() => onAddLabelToCard(label)}>
                                                        <Label name={label.name} color={label.color}/>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-section">
                                <h3 className="section-title">Assignees</h3>
                                <div className="assignees-list">
                                    {selectedCard.assignees.map(assignee => (
                                        <div key={assignee.user.id} className="assignee-item-wrapper">
                                            <MemberMedal member={assignee.user}/>
                                            <button className="remove-btn" onClick={() => onRemoveAssigneeFromCard(assignee.user.id)}
                                                    disabled={isReadOnly}>
                                                -
                                            </button>
                                        </div>
                                    ))}
                                    <div className="relative">
                                        <button className="add-btn" onClick={() => setIsAssigneeSelectorOpen(!isAssigneeSelectorOpen)}
                                                disabled={isReadOnly}>
                                            +
                                        </button>
                                        {isAssigneeSelectorOpen && (
                                            <div className="selector-dropdown">
                                                {data.members.filter(m => !selectedCard.assignees.find(sa => sa.user.id === m.user.id)).map(member => (
                                                    <div key={member.user.id} className="selector-item"
                                                         onClick={() => onAddAssigneeToCard(member)}>
                                                        <MemberMedal member={member.user}/>
                                                        <span>{member.user.firstName} {member.user.lastName}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-section">
                                <h3 className="section-title">Comments</h3>
                                <div className="comment-input-wrapper">
                                    <textarea
                                        className="comment-textarea"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Write a comment..."
                                    />
                                    <button className="auth-button" onClick={() => {/* Add comment logic if needed */
                                    }}>Add Comment
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            {error && <p className="auth-error">{error}</p>}
                            <button className="auth-button" onClick={onSaveCard} disabled={creating || isReadOnly}>
                                {creating ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
