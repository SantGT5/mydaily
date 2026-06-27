/**
 * Single source of truth for layout dimensions.
 *
 * The header height is referenced by the header itself, by the sticky offsets
 * and heights of the sidebar and table of contents, and by the scroll offset
 * used for anchored headings. Change it here and everything stays in sync.
 */
export const HEADER_HEIGHT = "4rem"
export const SIDEBAR_WIDTH = "16rem"
export const TOC_WIDTH = "15rem"
export const CONTENT_MAX_WIDTH = "48rem"

/** Height available below the sticky header, for sticky sidebar/TOC columns. */
export const BELOW_HEADER_HEIGHT = `calc(100dvh - ${HEADER_HEIGHT})`

/**
 * Vertical offset (in px) that keeps anchored headings clear of the sticky
 * header. Slightly larger than the header so there's a small gap above the
 * heading. Used both as `scrollMarginTop` and as the scroll-spy top margin.
 */
export const SCROLL_OFFSET = 80
export const SCROLL_MARGIN_TOP = `${SCROLL_OFFSET}px`
