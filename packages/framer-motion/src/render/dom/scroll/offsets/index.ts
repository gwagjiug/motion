import { defaultOffset, interpolate } from "motion-dom"
import { clamp } from "motion-utils"
import { ScrollInfo, ScrollInfoOptions } from "../types"
import { calcInset } from "./inset"
import { resolveOffset } from "./offset"
import { ScrollOffset } from "./presets"

const point = { x: 0, y: 0 }

function getTargetSize(target: Element) {
    return "getBBox" in target && target.tagName !== "svg"
        ? (target as SVGGraphicsElement).getBBox()
        : { width: target.clientWidth, height: target.clientHeight }
}

export function resolveOffsets(
    container: HTMLElement,
    info: ScrollInfo,
    options: ScrollInfoOptions
) {
    const { offset: offsetDefinition = ScrollOffset.All } = options
    const { target = container, axis = "y" } = options
    const lengthLabel = axis === "y" ? "height" : "width"

    const inset = target !== container ? calcInset(target, container) : point

    /**
     * Measure the target and container. If they're the same thing then we
     * use the container's scrollWidth/Height as the target, from there
     * all other calculations can remain the same.
     */
    const targetSize =
        target === container
            ? { width: container.scrollWidth, height: container.scrollHeight }
            : getTargetSize(target)

    const containerSize = {
        width: container.clientWidth,
        height: container.clientHeight,
    }

    /**
     * Reset the length of the resolved offset array rather than creating a new one.
     * TODO: More reusable data structures for targetSize/containerSize would also be good.
     */
    info[axis].offset.length = 0

    /**
     * Populate the offset array by resolving the user's offset definition into
     * a list of pixel scroll offets.
     */
    let hasChanged = !info[axis].interpolate

    const numOffsets = offsetDefinition.length
    for (let i = 0; i < numOffsets; i++) {
        const offset = resolveOffset(
            offsetDefinition[i],
            containerSize[lengthLabel],
            targetSize[lengthLabel],
            inset[axis]
        )

        if (!hasChanged && offset !== info[axis].interpolatorOffsets![i]) {
            hasChanged = true
        }

        info[axis].offset[i] = offset
    }

    /**
     * If the pixel scroll offsets have changed, create a new interpolator function
     * to map scroll value into a progress.
     */
    if (hasChanged) {
        info[axis].interpolate = interpolate(
            info[axis].offset,
            defaultOffset(offsetDefinition),
            { clamp: false }
        )

        info[axis].interpolatorOffsets = [...info[axis].offset]
    }

    info[axis].progress = clamp(
        0,
        1,
        info[axis].interpolate!(info[axis].current)
    )
}
