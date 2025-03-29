import { Button, Card, CardActions, CardOverflow, FormControl, FormLabel, Input, Stack } from "@mui/joy";
import { API } from "aws-amplify";
import { Class } from "../../../../../functions/src/types/class";

interface ClassCardProps {
	orgId: string;
	name: string;
	setName: (name: string) => void;
	clazz: Class;
	setClass: (clazz: Class) => void;
}

export default function ClassCard({ orgId, name, setName, clazz, setClass }: ClassCardProps) {
	return (
		<Card sx={{ flexGrow: "1" }}>
			<Stack
				direction="row"
				spacing={1}
				sx={{ my: 1 }}>
				<Stack
					spacing={2}
					sx={{ width: "100%" }}>
					<Stack spacing={1}>
						<FormLabel>Name</FormLabel>
						<FormControl sx={{ gap: 2 }}>
							<Input
								size="sm"
								placeholder="Name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</FormControl>
					</Stack>
				</Stack>
			</Stack>
			<CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
				<CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
					<Button
						size="sm"
						variant="solid"
						onClick={async () => {
							const updatedClass = await API.put("api", `/organisation/${orgId}/class/${clazz.id}`, {
								body: {
									name,
									students: clazz.students,
								},
							});
							setClass(updatedClass);
						}}>
						Save
					</Button>
				</CardActions>
			</CardOverflow>
		</Card>
	);
}
