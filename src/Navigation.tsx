import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { HomeScreen } from "./Home"
import { EditScreen } from "./Edit"
import { Button } from "react-native"
import { useNavigation } from "@react-navigation/native"

type RootStackParamList = {
	Home: undefined
	Edit: {
		id?: string
	}
}

declare global {
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function Navigation() {
	return (
		<Stack.Navigator initialRouteName="Home">
			<Stack.Screen
				name="Home"
				component={HomeScreen}
				options={{
					title: "Trash Log",
					headerRight: () => {
						const navigation = useNavigation()
						return (
							<Button
								title="Create"
								onPress={() => {
									navigation.navigate({
										name: "Edit",
										params: {},
									})
								}}
							/>
						)
					},
				}}
			/>
			<Stack.Screen
				name="Edit"
				component={EditScreen}
				options={({
					route: {
						params: { id },
					},
				}) => ({
					title: `${id ? "Edit" : "Create"} Log`,
				})}
			/>
		</Stack.Navigator>
	)
}
