export const fetchObstacles = async () => {
    const response = await fetch('/data/obstacles.json');
    return await response.json();
};

export const fetchNoFlyZones = async () => {
    const response = await fetch('/data/noFlyZones.json');
    return await response.json();
};

export const fetchAlerts = async () => {
    const response = await fetch('/data/alerts.json');
    if (!response.ok) {
        throw new Error('Failed to fetch alerts');
    }
    return await response.json();
};

// New API call for fetching annotations
export const fetchAnnotations = async () => {
    const response = await fetch('/data/annotations.json');
    if (!response.ok) {
        throw new Error('Failed to fetch annotations');
    }
    return await response.json();
};
