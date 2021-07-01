export const renderTags = (tags) => {
    let renderedTags = "";
    tags.forEach(tag => {
        if (tags[0] === tag) { renderedTags = tag; }
        else { renderedTags = renderedTags + ", " + tag; }
    });
    return renderedTags;
}

export const renderDateSpan = (depatureDate, arrivalDate) => {
    const renderedDepatureDate = new Date(depatureDate);
    const renderedArrivalDate = new Date(arrivalDate);
    return `${renderedDepatureDate.getDate()}.${renderedDepatureDate.getMonth()}.${renderedDepatureDate.getFullYear()} bis ${renderedArrivalDate.getDate()}.${renderedArrivalDate.getMonth()}.${renderedArrivalDate.getFullYear()}`;
}

export const renderTimestamp = (timestamp) => {
    const renderedTimestamp = new Date(timestamp);
    return `${renderedTimestamp.getDate()}.${renderedTimestamp.getMonth() + 1}.${renderedTimestamp.getFullYear()}`;
}
