import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { IoAdd, IoEllipsisVertical, IoSearch } from "react-icons/io5";
import { Competition } from "../../../../../functions/src/types/competition";
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
import NewCompetitionModal from "../../../components/dash/competition/NewCompetitionModal";

export default function CompetitionList() {
	const [competitions, setCompetitions] = useState<Competition[]>();
	const [open, setOpen] = useState(false);

	const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>('asc');

	function handleSort() {
		setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
	}

	const [searchParams, setSearchParams] = useState('');

	useEffect(() => {
		async function onLoad() {
			try {
				const competitions = await API.get("api", `/competition`, {});
				setCompetitions(competitions);
			} catch (e) {
				console.log(e);
			}
		}
		onLoad();
	}, []);

	return (
			<Page title="Competitions" useAuthContext={useAppContext} sidebar={<SidebarDash />}>
				<Container>
					<Breadcrumbs
						items={[
							{ label: "Dashboard", href: "/dash" },
							{ label: "Competitions", href: "/dash/competitions" },
						]}
					/>
					<Text variant="title" as="h1" noMarginBottom>Competitions</Text>
					<Text variant="intro">A competition is a live event, where students compete to finish as many tasks as possible. You can assign students to teams or have them compete individually.</Text>

					<div className="flex flex-row mb-4 gap-4">
						<Input name="search" label="Search" icon={<IoSearch />} value={searchParams} onChange={(e) => setSearchParams(e.target.value)} />
						<Button preIcon={<IoAdd />} onClick={() => setOpen(true)}>Create competition</Button>
					</div>

					<Table loading={!competitions}>
						<Table.Head>
						<Table.Row>
							<Table.HeadCell sortable onSort={handleSort} sortDirection={sortDir}>Name</Table.HeadCell>
							<Table.HeadCell>Packs</Table.HeadCell>
							<Table.HeadCell>{''}</Table.HeadCell>
						</Table.Row>
						</Table.Head>

						<Table.Body>
							{
								competitions?.sort((a, b) => sortDir == 'asc' ? a.name.toLowerCase().localeCompare(b.name.toLowerCase()) : b.name.toLowerCase().localeCompare(a.name.toLowerCase())).map((competition) => (
									<Table.Row>
										<Table.Cell>{competition.name}</Table.Cell>
										<Table.Cell>{competition.packs.length} packs</Table.Cell>
										<Table.Cell align="center">
											<Dropdown
												items={[
													{ text: 'Edit', href: `/dash/competitions/${competition.id}` },
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
				</Container>
				<NewCompetitionModal
					open={open}
					setOpen={setOpen}
				/>
			</Page>
	);
}
