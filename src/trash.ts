import AsyncStorage from "@react-native-async-storage/async-storage"
import { createActorContext } from "@xstate/react"
import { assign, fromPromise, setup } from "xstate"

export interface Log {
	id: string
	date: Date
	type: "general" | "plastic" | "metal" | "paper" | "glass" | "other"
	note?: string
}

const loadLogs = fromPromise(async (): Promise<Log[]> => {
	const value = await AsyncStorage.getItem("logs")
	if (!value) {
		return []
	}

	const parsed = JSON.parse(value) as Array<Omit<Log, "date"> & { date: string }>

	return parsed.map((item) => ({
		...item,
		date: new Date(item.date),
	}))
})

const trashMachine = setup({
	types: {} as {
		context: { logs: Log[] }
		events: { type: "update"; item: Log } | { type: "delete"; id: string }
	},
	actors: {
		loadLogs,
	},
	actions: {
		persistLogs({ context: { logs } }) {
			AsyncStorage.setItem("logs", JSON.stringify(logs))
		},
	},
}).createMachine({
	/** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDWALAdAGwHt0IBLAOygGIICywdyA3Aga3rU10OPKgSYIBjdMhK0A2gAYAulOmJQABwKwSo2gpAAPRAEYATAHYchwwBYAbLoDMuyQYumAnABoQAT0Rn9OJwA5rM10LAFY-EIsLa2tJCwBfOLcObHwiUgpKMFRUAlQcRTwRADNcgFscZK403n4yZmF1Mjk5TWVVRs0dBGtDJxxYiz8nfSMQ6zC-MzdPBFDfEKd-SUNAkJCzQISkjBTuCEhKAFdFCBEwFqQQNrUxMk69MZw1p1NJZ+HI6cR9ST7JSWsQwCg2Cfn0fi2IEqqWIB32eDAyHOMlaKhuGkuXTMbxw3n01kG+he9l0Yy+CB+fwBQIJflB4ISiRAZAI+3gl0qqPat3uCF6JnMVls9n0jl65IAtLogr5rP4nLFvE4zH54kzoXteFz0XdMd9bE9JGYnNZ9CqIrEnBZJetcXK-HTlhFdH4jZCNWlINqOnqKaYTAsjJJ9HYXpNydLjMEzCszCF8XSiYZGXEgA */
	id: "trash",
	context: {
		logs: [],
	},
	initial: "loading",
	states: {
		loading: {
			invoke: {
				src: "loadLogs",
				onDone: {
					target: "loaded",
					actions: assign({
						logs: ({ event }) => event.output,
					}),
				},
				onError: {
					target: "loaded",
				},
			},
		},
		loaded: {
			on: {
				update: {
					actions: [
						assign({
							logs: ({ context: { logs }, event: { item } }) => {
								const copy = logs.slice(0)

								const existingItemIndex = copy.findIndex((i) => i.id === item.id)
								if (existingItemIndex === -1) {
									copy.push(item)
								} else {
									copy[existingItemIndex] = item
								}

								return copy.sort((a, b) => b.date.valueOf() - a.date.valueOf())
							},
						}),
						"persistLogs",
					],
				},

				delete: {
					actions: [
						assign({
							logs: ({ context: { logs }, event: { id } }) => {
								const existingItemIndex = logs.findIndex((i) => i.id === id)
								if (existingItemIndex === -1) {
									return logs
								}

								const copy = logs.slice(0)
								copy.splice(existingItemIndex, 1)

								return copy
							},
						}),
						"persistLogs",
					],
				},
			},
		},
	},
})

export const {
	Provider: TrashMachineProvider,
	useSelector: useTrashMachineSelector,
	useActorRef: useTrashMachineActorRef,
} = createActorContext(trashMachine)
