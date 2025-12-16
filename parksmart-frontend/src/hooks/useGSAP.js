import { useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';

// Use useLayoutEffect for animations to prevent flash of unstyled content
// but fallback to useEffect on server-side (though this is SPA)
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const useGSAP = (callback, config = []) => {
    const dependencies = Array.isArray(config) ? config : (config.dependencies || []);
    const scope = Array.isArray(config) ? null : config.scope;

    useIsomorphicLayoutEffect(() => {
        const ctx = gsap.context(callback, scope);

        return () => ctx.revert();
    }, dependencies);
};

export default useGSAP;
