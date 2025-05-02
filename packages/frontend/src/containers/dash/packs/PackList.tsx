import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { IoAdd, IoEllipsisVertical, IoSearch } from "react-icons/io5";
import { Pack } from "../../../../../functions/src/types/pack";
import NewPackModal from "../../../components/dash/packs/NewPackModal";
import "./PackList.css";
import Page from "../../../_design/components/layout/Page";
import { useAppContext } from "../../../lib/contextLib";
import SidebarDash from "../../../components/SidebarDash";
import Container from "../../../_design/components/layout/Container";
import Text from "../../../_design/components/core/Text";
import Breadcrumbs from "../../../_design/components/navigation/Breadcrumbs";
import Table from "../../../_design/components/core/Table";
import Dropdown from "../../../_design/components/navigation/Dropdown";
import Button from "../../../_design/components/core/Button";
import Input from "../../../_design/components/form/Input";
import EditPackModal from "../../../modals/dash/EditPackModal";

export default function PackList() {
	const [packs, setPacks] = useState<Pack[]>();
	const [open, setOpen] = useState(false);

	const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>('asc');

	const [editPackId, setEditPackId] = useState<string | null>(null);

	function handleSort() {
		setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
	}

	const [searchParams, setSearchParams] = useState('');

	async function getData() {
		setPacks(null);
		try {
			const packs = await API.get("api", `/pack`, {});
			setPacks(packs);
		} catch (e) {
			console.log(e);
		}
	}

	useEffect(() => {
		getData();
	}, []);

	return (
			<Page title="Packs" useAuthContext={useAppContext} sidebar={<SidebarDash />}>
				<Container>
					<Breadcrumbs
						items={[
							{ label: "Dashboard", href: "/dash" },
							{ label: "Packs", href: "/dash/packs" },
						]}
					/>
					<Text variant="title" as="h1" noMarginBottom>Packs</Text>
					<Text variant="intro">A pack is a group of tasks, or questions, which can be added to a competition.</Text>

					<div className="flex flex-row mb-4 gap-4">
						<Input name="search" label="Search" icon={<IoSearch />} value={searchParams} onChange={(e) => setSearchParams(e.target.value)} />
						<Button preIcon={<IoAdd />} onClick={() => setOpen(true)}>Create pack</Button>
					</div>

					<Table loading={!packs}>
						<Table.Head>
						<Table.Row>
							<Table.HeadCell sortable onSort={handleSort} sortDirection={sortDir}>Name</Table.HeadCell>
							<Table.HeadCell>Description</Table.HeadCell>
							<Table.HeadCell>{''}</Table.HeadCell>
						</Table.Row>
						</Table.Head>

						<Table.Body>
							{
								packs?.sort((a, b) => sortDir == 'asc' ? a.name.toLowerCase().localeCompare(b.name.toLowerCase()) : b.name.toLowerCase().localeCompare(a.name.toLowerCase())).map((pack) => (
									<Table.Row>
										<Table.Cell>{pack.name}</Table.Cell>
										<Table.Cell>{pack.description}</Table.Cell>
										<Table.Cell align="center">
											<Dropdown
												items={[
													{ text: 'Edit', onClick: () => setEditPackId(pack.id) },
													{ text: 'Task editor', href: `/dash/packs/${pack.id}/edit` },
												]}
											>
												<Button variant="text"><IoEllipsisVertical /></Button>
											</Dropdown>
										</Table.Cell>
									</Table.Row>
								))
							}
						</Table.Body>
					</Table>

					{/* <Box
						sx={{
							display: "flex",
							mb: 1,
							gap: 1,
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
						}}>
						<Box sx={{ display: "flex", gap: 1 }}>
							<Button
								variant="outline"
								disabled={selected.length === 0}
								onClick={async () => {
									const confirmed = window.confirm(`Are you sure you want to delete ${selected.length} pack(s)?`);
									if (!confirmed) return;
									try {
										await Promise.all(
											selected.map(async (id) => {
												await API.del("api", `/pack/${id}`, {});
											})
										);
									} catch (e) {
										console.log(e);
									}
								}}>
								<IoTrashBin />
							</Button>
						</Box>
					</Box> */}
				</Container>
				<NewPackModal
					open={open}
					setOpen={setOpen}
				/>
				<EditPackModal
					isOpen={!!editPackId}
					onClose={() => { setEditPackId(null); getData(); }}
					packId={editPackId}
				/>
			</Page>
	);
}
