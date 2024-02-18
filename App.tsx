import { NavigationContainer } from "@react-navigation/native"
import { Navigation } from "./src/Navigation"
import { TrashMachineProvider } from "./src/trash"

export default function App() {
	return (
		<TrashMachineProvider>
			<NavigationContainer>
				<Navigation />
			</NavigationContainer>
		</TrashMachineProvider>
	)
}
