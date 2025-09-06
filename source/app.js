import React from 'react';
import {Text} from 'ink';
import Gradient from 'ink-gradient';

export default function App({name = 'Stranger'}) {
	return (
		<Gradient name="rainbow">
			<Text>
				Hello, <Text color="green">{name}</Text>
			</Text>
		</Gradient>
	);
}
