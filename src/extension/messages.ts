/** Message type for content script: request listing data from current page DOM */
export const MESSAGE_PARSE_LISTING = "FLATFLOW_PARSE_LISTING";
/** Message type for background: fetch image URLs and return data URLs */
export const MESSAGE_FETCH_IMAGES = "FLATFLOW_FETCH_IMAGES";
/** Message from background to side panel: close the panel (toggle off) */
export const MESSAGE_CLOSE_SIDE_PANEL = "FLATFLOW_CLOSE_SIDE_PANEL";
/** Message from side panel to background: panel was closed by user (e.g. X button) */
export const MESSAGE_PANEL_CLOSED = "FLATFLOW_PANEL_CLOSED";
