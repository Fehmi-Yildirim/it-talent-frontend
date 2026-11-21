let activeRequests = 0
const listeners = new Set<(loading: boolean) => void>()

function notify() {
    const loading = activeRequests > 0

    listeners.forEach((listener) => listener(loading))
}

export const apiLoading = {
    start() {
        activeRequests += 1
        notify()
    },

    finish() {
        activeRequests = Math.max(0, activeRequests - 1)
        notify()
    },

    subscribe(listener: (loading: boolean) => void) {
        listeners.add(listener)

        return () => {
            listeners.delete(listener)
        }
    },
}