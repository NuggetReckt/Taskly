export interface FeatureCardData {
    icon: any;
    title: string;
    description: string;
}

export function FeatureCard(data: FeatureCardData) {
    return (
        <div className={"feature-card-wrapper"}>
            <div className={"feature-card-icon"}>
                {data.icon}
            </div>
            <h2 className={"feature-card-title"}>{data.title}</h2>
            <p className={"feature-card-desc"}>{data.description}</p>
        </div>
    )
}