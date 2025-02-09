import { Button, Card, CardActions, CardOverflow, FormControl, FormLabel, Input, Stack, Textarea } from "@mui/joy";
import { API } from "aws-amplify";

interface PackCardProps {
	id: string;
	pack: any;
	name: string;
	description: string;
	setPack: (pack: any) => void;
	setName: (name: string) => void;
	setDescription: (description: string) => void;
}

export default function PackCard({ name, description, id, pack, setPack, setName, setDescription }: PackCardProps) {
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
					<Stack spacing={1}>
						<FormLabel>Description</FormLabel>
						<FormControl sx={{ gap: 2 }}>
							<Textarea
								minRows={2}
								size="sm"
								placeholder="Description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
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
							const updatedPack = await API.put("api", `/pack/${id}`, {
								body: {
									name,
									description,
									ownerId: pack.ownerId,
								},
							});
							setPack(updatedPack);
						}}>
						Save
					</Button>
				</CardActions>
			</CardOverflow>
		</Card>
	);
}
