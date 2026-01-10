export interface LabelData {
    name: string;
    color: string;
}

export default function Label(data: LabelData) {
    return (
        <div className="label" style={{backgroundColor: data.color}}>
            <span className="label-text">{data.name}</span>
        </div>
    );
}