import * as React from "react"
import { useCallback } from "react"
import type { VisualElement } from "../../render/VisualElement"
import { isRefObject } from "../../utils/is-ref-object"
import { VisualState } from "./use-visual-state"
import { cancelMicrotask, microtask } from "../../frameloop/microtask"

/**
 * Creates a ref function that, when called, hydrates the provided
 * external ref and VisualElement.
 */
export function useMotionRef<Instance, RenderState>(
    visualState: VisualState<Instance, RenderState>,
    visualElement?: VisualElement<Instance> | null,
    externalRef?: React.Ref<Instance>
): React.Ref<Instance> {
    return useCallback(
        (instance: Instance) => {
            instance && visualState.mount && visualState.mount(instance)

            if (visualElement) {
                if (instance) {
                    visualElement.mount(instance)
                    cancelMicrotask(visualElement.unmount)
                } else {
                    /**
                     * Unmount via a microtask. This ensures we can cancel
                     * the unmount if the component remounts within the same
                     * event loop.
                     */
                    microtask.postRender(visualElement.unmount)
                }
            }

            if (externalRef) {
                if (typeof externalRef === "function") {
                    externalRef(instance)
                } else if (isRefObject(externalRef)) {
                    ;(externalRef as any).current = instance
                }
            }
        },
        /**
         * Only pass a new ref callback to React if we've received a visual element
         * factory. Otherwise we'll be mounting/remounting every time externalRef
         * or other dependencies change.
         */
        [visualElement]
    )
}
