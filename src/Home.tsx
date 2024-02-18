import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { FlatList, StyleSheet, Text, TouchableHighlight, View } from "react-native"
import { Log, useTrashMachineSelector } from "./trash"

export function HomeScreen({ navigation }: NativeStackScreenProps<ReactNavigation.RootParamList, "Home">) {
	const isLoading = useTrashMachineSelector((s) => s.matches("loading"))
	const logs = useTrashMachineSelector((s) => s.context.logs)

	if (isLoading) {
		return null
	}

	if (!logs.length) {
		return (
			<View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 10 }}>
				<Text style={{ textAlign: "center", fontSize: 32 }}>
					Begin by tapping "Create" in the top right corner
				</Text>
			</View>
		)
	}

	return (
		<FlatList
			data={logs}
			keyExtractor={keyExtractor}
			renderItem={({ item }) => (
				<TouchableHighlight
					underlayColor="rgba(0,0,0,.1)"
					style={styles.item}
					onPress={() => navigation.navigate("Edit", { id: item.id })}
				>
					<View>
						<Text style={styles.itemText}>Type: {capitalize(item.type)}</Text>
						<Text style={styles.itemText}>Date: {dateTimeFormatter.format(item.date)}</Text>
						{item.note && <Text style={styles.itemText}>Note: {item.note}</Text>}
					</View>
				</TouchableHighlight>
			)}
		/>
	)
}

const styles = StyleSheet.create({
	item: {
		borderBottomColor: "#CCC",
		borderBottomWidth: 1,
		paddingHorizontal: 20,
		paddingVertical: 10,
	},
	itemText: {
		fontSize: 18,
	},
})

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short" })

function keyExtractor(item: Log) {
	return item.id
}

function capitalize(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}
