export interface LabelData {
    id?: number;
    name: string;
    color: string;
    min?: boolean;
}

export default function Label(data: LabelData) {
    if (data.min) return (
        <div className="label label-min" style={{backgroundColor: data.color}}>
        </div>
    )

    return (
        <div className="label" style={{backgroundColor: data.color}}>
            <span className="label-text">{data.name}</span>
        </div>
    );
}