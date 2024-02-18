import "fast-text-encoding"
import { createId } from "@paralleldrive/cuid2"
import RNDateTimePicker from "@react-native-community/datetimepicker"
import { Picker } from "@react-native-picker/picker"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useCallback, useRef, useState } from "react"
import { StyleSheet, TouchableHighlight, Button, Text, TextInput, View, ScrollView } from "react-native"
import { Log, useTrashMachineActorRef, useTrashMachineSelector } from "./trash"

export function EditScreen({
	navigation,
	route: {
		params: { id },
	},
}: NativeStackScreenProps<ReactNavigation.RootParamList, "Edit">) {
	const trashActorRef = useTrashMachineActorRef()
	const item = useTrashMachineSelector((s) => s.context.logs.find((i) => i.id === id))
	const note = useRef(item?.note)
	const [type, setType] = useState<Log["type"]>("general")
	const [date, setDate] = useState(() => item?.date ?? new Date())
	const [dateTimePickerMode, setDateTimePickerMode] = useState<"date" | "time" | null>(null)

	const handleDateTimePickerChange = useCallback((_event: unknown, date?: Date) => {
		if (!date) {
			return
		}

		setDateTimePickerMode(null)
		setDate(date)
	}, [])

	return (
		<ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 15 }}>
			<Text style={styles.label}>Type</Text>
			<View style={styles.type}>
				<Picker selectedValue={type} onValueChange={(value) => setType(value)} mode="dropdown">
					<Picker.Item label="General" value="general" />
					<Picker.Item label="Paper" value="paper" />
					<Picker.Item label="Plastic" value="plastic" />
					<Picker.Item label="Glass" value="glass" />
					<Picker.Item label="Metal" value="metal" />
					<Picker.Item label="Other" value="other" />
				</Picker>
			</View>
			<Text style={styles.label}>Date</Text>
			<TouchableHighlight
				underlayColor="rgba(0,0,0,.3)"
				onPress={() => setDateTimePickerMode("date")}
				style={styles.dateTime}
			>
				<Text style={styles.dateTimeText}>{dateFormatter.format(date)}</Text>
			</TouchableHighlight>
			<Text style={styles.label}>Time</Text>
			<TouchableHighlight
				underlayColor="rgba(0,0,0,.3)"
				onPress={() => setDateTimePickerMode("time")}
				style={styles.dateTime}
			>
				<Text style={styles.dateTimeText}>{timeFormatter.format(date)}</Text>
			</TouchableHighlight>
			<Text style={styles.label}>Note</Text>
			<TextInput
				defaultValue={note.current}
				style={styles.textInput}
				onChangeText={(text) => (note.current = text)}
			/>
			<View style={{ marginTop: 10 }} />
			<Button
				title={id ? "Update Log" : "Create Log"}
				onPress={() => {
					trashActorRef.send({
						type: "update",
						item: {
							...item,

							date,
							type,
							id: item?.id ?? createId(),
							note: note.current,
						},
					})
					navigation.goBack()
				}}
			/>
			<View style={{ marginBottom: 10 }} />
			{id && (
				<Button
					color="#CC0000"
					title="Delete Log"
					onPress={() => {
						trashActorRef.send({ type: "delete", id })
						navigation.goBack()
					}}
				/>
			)}

			{dateTimePickerMode && (
				<RNDateTimePicker mode={dateTimePickerMode} value={date} onChange={handleDateTimePickerChange} />
			)}
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	label: {
		marginLeft: 10,
		fontSize: 16,
		marginTop: 10,
		marginBottom: 5,
	},

	type: {
		backgroundColor: "rgba(0,0,0,.1)",
		borderRadius: 10,
	},

	textInput: {
		backgroundColor: "rgba(0,0,0,.1)",
		paddingHorizontal: 18,
		paddingVertical: 14,
		borderRadius: 10,
		fontSize: 18,
	},

	dateTime: {
		backgroundColor: "rgba(0,0,0,.1)",
		paddingHorizontal: 18,
		paddingVertical: 14,
		borderRadius: 10,
	},
	dateTimeText: {
		fontSize: 18,
	},
})

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "full" })
const timeFormatter = new Intl.DateTimeFormat("en-US", { timeStyle: "short" })
