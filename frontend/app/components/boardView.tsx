import List, {ListData} from "@/app/components/list";
import {User} from "@/app/components/user";
import {LabelData} from "@/app/components/label";

export interface BoardMemberData {
    user: User;
    role: string;
}

export interface BoardViewData {
    id: number;
    title: string;
    description: string;
    owner: User;
    members: BoardMemberData[];
    lists: ListData[];
    labels: LabelData[];
}

export default function BoardView(data: BoardViewData) {
    const listItems = data.lists.map(list =>
        <li key={"list_" + list.pos} className="list-wrapper">
            <List pos={list.pos} title={list.title} cards={list.cards}/>
        </li>
    );
    //TODO: order lists by pos

    return (
        <div className="board-content">
            <div className="board-header">
                <h1>{data.title}</h1>
                <div className="header-tools">
                    <div className="tool-searchbar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                             className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </svg>
                        <input type="text" data-slot="input" placeholder="Search cards..."/>
                    </div>
                    <button data-slot="button" className="tool-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus size-5">
                            <path d="M5 12h14"></path>
                            <path d="M12 5v14"></path>
                        </svg>
                    </button>
                    <a href="/app" className="tool-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                             className="lucide lucide-house size-5">
                            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                            <path
                                d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        </svg>
                    </a>
                    <button data-slot="button" className="tool-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 16 16"
                             className="lucide lucide-house size-5">
                            <path fill="currentcolor" fillRule="evenodd"
                                  d="M5 1.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M1 4a4 4 0 1 1 8 0 4 4 0 0 1-8 0m11.25 4.75V11h1.5V8.75H16v-1.5h-2.25V5h-1.5v2.25H10v1.5zm-8.5 1.75a2.25 2.25 0 0 0-2.25 2.25V15H0v-2.25A3.75 3.75 0 0 1 3.75 9h2.5A3.75 3.75 0 0 1 10 12.75V15H8.5v-2.25a2.25 2.25 0 0 0-2.25-2.25z"
                                  clipRule="evenodd"></path>
                        </svg>
                    </button>
                    <button data-slot="button" className="tool-button">
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
            <div className="lists-wrapper">
                <ul className="lists">{listItems}</ul>
            </div>
        </div>
    );
}
